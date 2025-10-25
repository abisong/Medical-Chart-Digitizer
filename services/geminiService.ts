
import { GoogleGenAI, Type } from "@google/genai";
import type { PatientData, MedicalCodes } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const patientDataSchema = {
    type: Type.OBJECT,
    properties: {
        personalInformation: {
            type: Type.OBJECT,
            properties: {
                firstName: { type: Type.STRING, description: "Patient's first name." },
                lastName: { type: Type.STRING, description: "Patient's last name." },
                dateOfBirth: { type: Type.STRING, description: "Patient's date of birth (e.g., YYYY-MM-DD)." },
                gender: { type: Type.STRING, description: "Patient's gender." },
                medicalRecordNumber: { type: Type.STRING, description: "Patient's Medical Record Number (MRN)." },
            },
            required: ["firstName", "lastName", "dateOfBirth", "gender", "medicalRecordNumber"]
        },
        vitals: {
            type: Type.OBJECT,
            properties: {
                bloodPressure: { type: Type.STRING, description: "Blood pressure (e.g., 120/80 mmHg)." },
                heartRate: { type: Type.STRING, description: "Heart rate (e.g., 72 bpm)." },
                temperature: { type: Type.STRING, description: "Body temperature (e.g., 98.6°F or 37°C)." },
                respiratoryRate: { type: Type.STRING, description: "Respiratory rate (e.g., 16 breaths/min)." },
            },
        },
        allergies: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the substance the patient is allergic to." },
                    severity: { type: Type.STRING, description: "Severity of the allergy (Mild, Moderate, Severe, Unknown)." },
                },
                required: ["name", "severity"]
            }
        },
        medications: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the medication." },
                    dosage: { type: Type.STRING, description: "Dosage of the medication (e.g., 500mg)." },
                    frequency: { type: Type.STRING, description: "How often the medication is taken (e.g., twice daily)." },
                },
                required: ["name", "dosage", "frequency"]
            }
        },
        diagnosis: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of current diagnoses."
        },
        notes: {
            type: Type.STRING,
            description: "Any other relevant notes or comments from the document."
        }
    },
    required: ["personalInformation", "allergies", "medications", "diagnosis"]
};


export const digitizeMedicalChart = async (base64Image: string, mimeType: string): Promise<PatientData> => {
    const prompt = `
    You are an expert medical data entry system. Analyze the provided image of a patient's medical document.
    Extract all relevant information and format it as a JSON object according to the provided schema.
    The document may be handwritten or typed. If a piece of information is not present in the document, use an empty string "" for string fields, or an empty array [] for array fields.
    Do not invent any information that is not present in the document.
    `;
  
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };
  
    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: patientDataSchema,
        }
    });
  
    const jsonString = response.text;
    
    try {
        const parsedData = JSON.parse(jsonString);
        return parsedData as PatientData;
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonString);
        throw new Error("Could not parse the data from the AI model.");
    }
  };

export const generateClinicalSummary = async (patientData: PatientData): Promise<string> => {
    const prompt = `
    Based on the following patient data JSON object, please provide a concise and professional clinical summary.
    This summary should be suitable for a doctor to quickly understand the patient's current status.
    Highlight the most critical information, such as primary diagnoses, key medications, and severe allergies.
    Present the summary in a clear, narrative format.

    Patient Data:
    ${JSON.stringify(patientData, null, 2)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
};

const medicalCodesSchema = {
    type: Type.OBJECT,
    properties: {
        icd10Codes: {
            type: Type.ARRAY,
            description: "List of suggested ICD-10-CM (diagnosis) codes.",
            items: {
                type: Type.OBJECT,
                properties: {
                    code: { type: Type.STRING, description: "The ICD-10-CM code (e.g., 'I10')." },
                    description: { type: Type.STRING, description: "The description for the ICD-10-CM code (e.g., 'Essential (primary) hypertension')." },
                },
                required: ["code", "description"]
            }
        },
        cptCodes: {
            type: Type.ARRAY,
            description: "List of suggested CPT (procedure) codes.",
            items: {
                type: Type.OBJECT,
                properties: {
                    code: { type: Type.STRING, description: "The CPT code (e.g., '99213')." },
                    description: { type: Type.STRING, description: "The description for the CPT code (e.g., 'Office or other outpatient visit for the evaluation and management of an established patient')." },
                },
                required: ["code", "description"]
            }
        },
    },
    required: ["icd10Codes", "cptCodes"]
};

export const generateBillingCodes = async (patientData: PatientData): Promise<MedicalCodes> => {
    const relevantInfo = `
    Diagnoses:
    ${patientData.diagnosis.join(', ')}

    Notes:
    ${patientData.notes || 'No additional notes.'}
    `;

    const prompt = `
    You are an expert medical coder. Based on the patient's diagnoses and clinical notes provided below, suggest appropriate medical billing codes.
    Provide relevant ICD-10-CM codes for the diagnoses and any plausible CPT codes for services that might have been rendered (like an office visit).
    Format the output as a JSON object according to the provided schema. If no relevant codes can be determined, return empty arrays for the code lists.

    Patient Information:
    ${relevantInfo}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: medicalCodesSchema,
        }
    });

    const jsonString = response.text;

    try {
        const parsedData = JSON.parse(jsonString);
        return parsedData as MedicalCodes;
    } catch (e) {
        console.error("Failed to parse JSON response for billing codes:", jsonString);
        throw new Error("Could not parse the billing codes from the AI model.");
    }
};