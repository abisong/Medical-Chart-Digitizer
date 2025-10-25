
import type { PatientData } from '../types';
import { saveRecord } from './dbService';

const DEMO_DATA_POPULATED_KEY = 'demo-data-populated';

const syntheticData: Omit<PatientData, 'savedAt'>[] = [
    {
        personalInformation: { firstName: 'John', lastName: 'Smith', dateOfBirth: '1965-03-15', gender: 'Male', medicalRecordNumber: 'MRN-10001' },
        vitals: { bloodPressure: '130/85 mmHg', heartRate: '72 bpm', temperature: '98.6°F', respiratoryRate: '16 breaths/min' },
        allergies: [{ name: 'Penicillin', severity: 'Severe' }],
        medications: [{ name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' }, { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily' }],
        diagnosis: ['Hypertension', 'Hyperlipidemia'],
        notes: 'Patient presents for annual check-up. Vitals stable. Continue current medications.'
    },
    {
        personalInformation: { firstName: 'Emily', lastName: 'Jones', dateOfBirth: '1982-07-22', gender: 'Female', medicalRecordNumber: 'MRN-10002' },
        vitals: { bloodPressure: '118/78 mmHg', heartRate: '65 bpm', temperature: '98.7°F', respiratoryRate: '14 breaths/min' },
        allergies: [{ name: 'Pollen', severity: 'Mild' }],
        medications: [{ name: 'Albuterol Inhaler', dosage: '2 puffs', frequency: 'As needed for wheezing' }],
        diagnosis: ['Asthma'],
        notes: 'Follow-up for asthma management. Patient reports good symptom control.'
    },
    {
        personalInformation: { firstName: 'Michael', lastName: 'Williams', dateOfBirth: '1958-11-02', gender: 'Male', medicalRecordNumber: 'MRN-10003' },
        vitals: { bloodPressure: '140/90 mmHg', heartRate: '80 bpm', temperature: '98.5°F', respiratoryRate: '18 breaths/min' },
        allergies: [{ name: 'No Known Allergies', severity: 'Unknown' }],
        medications: [{ name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }, { name: 'Glibenclamide', dosage: '5mg', frequency: 'Once daily' }],
        diagnosis: ['Type 2 Diabetes Mellitus'],
        notes: 'Discussed diet and exercise modifications. A1C levels slightly elevated.'
    },
    {
        personalInformation: { firstName: 'Jessica', lastName: 'Brown', dateOfBirth: '1990-01-30', gender: 'Female', medicalRecordNumber: 'MRN-10004' },
        vitals: { bloodPressure: '122/80 mmHg', heartRate: '88 bpm', temperature: '99.0°F', respiratoryRate: '16 breaths/min' },
        allergies: [{ name: 'Sulfa Drugs', severity: 'Moderate' }],
        medications: [{ name: 'Sertraline', dosage: '50mg', frequency: 'Once daily' }],
        diagnosis: ['Anxiety', 'Depression'],
        notes: 'Patient reports feeling better on current medication. No side effects noted.'
    },
    {
        personalInformation: { firstName: 'David', lastName: 'Garcia', dateOfBirth: '1975-09-12', gender: 'Male', medicalRecordNumber: 'MRN-10005' },
        vitals: { bloodPressure: '125/82 mmHg', heartRate: '75 bpm', temperature: '98.6°F', respiratoryRate: '15 breaths/min' },
        allergies: [{ name: 'No Known Allergies', severity: 'Unknown' }],
        medications: [{ name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily' }],
        diagnosis: ['Gastroesophageal Reflux Disease (GERD)'],
        notes: 'Patient reports decreased heartburn with daily Omeprazole.'
    },
    {
        personalInformation: { firstName: 'Sarah', lastName: 'Miller', dateOfBirth: '1969-05-25', gender: 'Female', medicalRecordNumber: 'MRN-10006' },
        vitals: { bloodPressure: '135/88 mmHg', heartRate: '70 bpm', temperature: '98.4°F', respiratoryRate: '16 breaths/min' },
        allergies: [{ name: 'Ibuprofen', severity: 'Mild' }],
        medications: [{ name: 'Acetaminophen', dosage: '500mg', frequency: 'As needed for pain' }],
        diagnosis: ['Osteoarthritis'],
        notes: 'Patient c/o chronic knee pain. Discussed physical therapy options.'
    },
    {
        personalInformation: { firstName: 'James', lastName: 'Davis', dateOfBirth: '1988-08-08', gender: 'Male', medicalRecordNumber: 'MRN-10007' },
        vitals: { bloodPressure: '120/75 mmHg', heartRate: '68 bpm', temperature: '98.7°F', respiratoryRate: '14 breaths/min' },
        allergies: [{ name: 'Peanuts', severity: 'Severe' }],
        medications: [{ name: 'Epinephrine Auto-Injector', dosage: '0.3mg', frequency: 'Carry at all times' }],
        diagnosis: ['Peanut Allergy'],
        notes: 'Patient educated on avoiding peanuts and using EpiPen.'
    },
    {
        personalInformation: { firstName: 'Maria', lastName: 'Rodriguez', dateOfBirth: '1995-02-18', gender: 'Female', medicalRecordNumber: 'MRN-10008' },
        vitals: { bloodPressure: '110/70 mmHg', heartRate: '85 bpm', temperature: '98.8°F', respiratoryRate: '16 breaths/min' },
        allergies: [{ name: 'No Known Allergies', severity: 'Unknown' }],
        medications: [{ name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed for migraine' }],
        diagnosis: ['Migraine with Aura'],
        notes: 'Patient reports Sumatriptan is effective in aborting migraines.'
    },
    {
        personalInformation: { firstName: 'Robert', lastName: 'Martinez', dateOfBirth: '1971-12-01', gender: 'Male', medicalRecordNumber: 'MRN-10009' },
        vitals: { bloodPressure: '138/84 mmHg', heartRate: '78 bpm', temperature: '98.5°F', respiratoryRate: '17 breaths/min' },
        allergies: [{ name: 'Codeine', severity: 'Moderate' }],
        medications: [{ name: 'Hydrochlorothiazide', dosage: '25mg', frequency: 'Once daily' }],
        diagnosis: ['Hypertension'],
        notes: 'Blood pressure remains slightly elevated. Advised to monitor at home.'
    },
    {
        personalInformation: { firstName: 'Linda', lastName: 'Hernandez', dateOfBirth: '1955-04-10', gender: 'Female', medicalRecordNumber: 'MRN-10010' },
        vitals: { bloodPressure: '128/80 mmHg', heartRate: '72 bpm', temperature: '98.6°F', respiratoryRate: '16 breaths/min' },
        allergies: [{ name: 'No Known Allergies', severity: 'Unknown' }],
        medications: [{ name: 'Alendronate', dosage: '70mg', frequency: 'Once weekly' }],
        diagnosis: ['Osteoporosis'],
        notes: 'Reminder to take medication with a full glass of water and remain upright for 30 minutes.'
    },
    {
        personalInformation: { firstName: 'William', lastName: 'Lopez', dateOfBirth: '1992-06-07', gender: 'Male', medicalRecordNumber: 'MRN-10011' },
        vitals: { bloodPressure: '115/72 mmHg', heartRate: '60 bpm', temperature: '98.7°F', respiratoryRate: '12 breaths/min' },
        allergies: [{ name: 'Cat Dander', severity: 'Mild' }],
        medications: [{ name: 'Loratadine', dosage: '10mg', frequency: 'As needed for allergies' }],
        diagnosis: ['Allergic Rhinitis'],
        notes: 'Patient reports symptoms are seasonal and well-controlled with antihistamines.'
    },
    {
        personalInformation: { firstName: 'Elizabeth', lastName: 'Gonzalez', dateOfBirth: '1985-10-14', gender: 'Female', medicalRecordNumber: 'MRN-10012' },
        vitals: { bloodPressure: '120/78 mmHg', heartRate: '70 bpm', temperature: '98.6°F', respiratoryRate: '15 breaths/min' },
        allergies: [{ name: 'No Known Allergies', severity: 'Unknown' }],
        medications: [{ name: 'Levothyroxine', dosage: '50mcg', frequency: 'Once daily' }],
        diagnosis: ['Hypothyroidism'],
        notes: 'TSH levels within normal range on current dose. Continue medication.'
    },
    {
        personalInformation: { firstName: 'Richard', lastName: 'Wilson', dateOfBirth: '1963-01-20', gender: 'Male', medicalRecordNumber: 'MRN-10013' },
        vitals: { bloodPressure: '133/85 mmHg', heartRate: '74 bpm', temperature: '98.5°F', respiratoryRate: '16 breaths/min' },
        allergies: [{ name: 'No Known Allergies', severity: 'Unknown' }],
        medications: [{ name: 'Rosuvastatin', dosage: '10mg', frequency: 'Once daily' }],
        diagnosis: ['Hyperlipidemia'],
        notes: 'Lipid panel shows improvement. Continue statin therapy and lifestyle changes.'
    },
    {
        personalInformation: { firstName: 'Susan', lastName: 'Anderson', dateOfBirth: '1978-03-03', gender: 'Female', medicalRecordNumber: 'MRN-10014' },
        vitals: { bloodPressure: '105/65 mmHg', heartRate: '62 bpm', temperature: '98.8°F', respiratoryRate: '14 breaths/min' },
        allergies: [{ name: 'No Known Allergies', severity: 'Unknown' }],
        medications: [{ name: 'Ferrous Sulfate', dosage: '325mg', frequency: 'Once daily' }],
        diagnosis: ['Iron Deficiency Anemia'],
        notes: 'Patient reports less fatigue. Repeat CBC in 3 months.'
    },
    {
        personalInformation: { firstName: 'Joseph', lastName: 'Thomas', dateOfBirth: '1998-11-28', gender: 'Male', medicalRecordNumber: 'MRN-10015' },
        vitals: { bloodPressure: '120/80 mmHg', heartRate: '90 bpm', temperature: '98.9°F', respiratoryRate: '18 breaths/min' },
        allergies: [{ name: 'No Known Allergies', severity: 'Unknown' }],
        medications: [],
        diagnosis: ['Generalized Anxiety Disorder'],
        notes: 'Patient referred to cognitive behavioral therapy. Declined medication at this time.'
    },
    {
        personalInformation: { firstName: 'Karen', lastName: 'Taylor', dateOfBirth: '1960-08-19', gender: 'Female', medicalRecordNumber: 'MRN-10016' },
        vitals: { bloodPressure: '145/92 mmHg', heartRate: '82 bpm', temperature: '98.6°F', respiratoryRate: '16 breaths/min' },
        allergies: [{ name: 'Aspirin', severity: 'Moderate' }],
        medications: [{ name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' }, { name: 'Lisinopril', dosage: '20mg', frequency: 'Once daily' }],
        diagnosis: ['Hypertension', 'Chronic Kidney Disease Stage 2'],
        notes: 'BP not at goal. Increased Lisinopril dose. Monitor renal function.'
    },
    {
        personalInformation: { firstName: 'Charles', lastName: 'Moore', dateOfBirth: '1953-07-04', gender: 'Male', medicalRecordNumber: 'MRN-10017' },
        vitals: { bloodPressure: '130/80 mmHg', heartRate: '68 bpm', temperature: '98.5°F', respiratoryRate: '14 breaths/min' },
        allergies: [{ name: 'No Known Allergies', severity: 'Unknown' }],
        medications: [{ name: 'Tamsulosin', dosage: '0.4mg', frequency: 'Once daily' }],
        diagnosis: ['Benign Prostatic Hyperplasia (BPH)'],
        notes: 'Patient reports improvement in urinary symptoms.'
    },
    {
        personalInformation: { firstName: 'Nancy', lastName: 'Jackson', dateOfBirth: '1949-12-30', gender: 'Female', medicalRecordNumber: 'MRN-10018' },
        vitals: { bloodPressure: '128/78 mmHg', heartRate: '70 bpm', temperature: '98.6°F', respiratoryRate: '16 breaths/min' },
        allergies: [{ name: 'No Known Allergies', severity: 'Unknown' }],
        medications: [{ name: 'Warfarin', dosage: '5mg', frequency: 'Once daily' }],
        diagnosis: ['Atrial Fibrillation'],
        notes: 'INR is therapeutic at 2.5. Continue current dose and monitor weekly.'
    },
    {
        personalInformation: { firstName: 'Daniel', lastName: 'White', dateOfBirth: '2001-04-21', gender: 'Male', medicalRecordNumber: 'MRN-10019' },
        vitals: { bloodPressure: '124/76 mmHg', heartRate: '70 bpm', temperature: '99.2°F', respiratoryRate: '16 breaths/min' },
        allergies: [{ name: 'No Known Allergies', severity: 'Unknown' }],
        medications: [{ name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily for 10 days' }],
        diagnosis: ['Acute Otitis Media'],
        notes: 'Patient presents with right ear pain. Examination confirms infection.'
    },
    {
        personalInformation: { firstName: 'Patricia', lastName: 'Harris', dateOfBirth: '1973-02-14', gender: 'Female', medicalRecordNumber: 'MRN-10020' },
        vitals: { bloodPressure: '122/82 mmHg', heartRate: '77 bpm', temperature: '98.7°F', respiratoryRate: '15 breaths/min' },
        allergies: [{ name: 'Shellfish', severity: 'Severe' }],
        medications: [{ name: 'Fluticasone Nasal Spray', dosage: '2 sprays per nostril', frequency: 'Once daily' }],
        diagnosis: ['Chronic Sinusitis'],
        notes: 'Patient finds nasal spray helps with congestion. Continue use.'
    }
];


const createPlaceholderImage = (name: string, mrn: string): Promise<Blob> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#f8fafc'; // slate-50
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#1e293b'; // slate-800
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Patient Chart (DEMO)', canvas.width / 2, 50);

            ctx.font = '16px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`Name: ${name}`, 30, 100);
            ctx.fillText(`MRN: ${mrn}`, 30, 130);
            
            ctx.strokeStyle = '#94a3b8'; // slate-400
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(30, 160);
            ctx.lineTo(370, 160);
            ctx.stroke();
            
            ctx.fillText('Notes:', 30, 190);
            ctx.font = '14px "Courier New", monospace';
            ctx.fillText('This is a synthetic patient record', 30, 220);
            ctx.fillText('generated for demonstration purposes.', 30, 240);
            ctx.fillText('The associated image is a placeholder.', 30, 260);

        }
        canvas.toBlob(blob => {
            if (blob) {
                resolve(blob);
            }
        }, 'image/png');
    });
};


export const populateDemoData = async () => {
    try {
        const isPopulated = localStorage.getItem(DEMO_DATA_POPULATED_KEY);
        if (isPopulated) {
            return;
        }

        console.log("Populating application with 20 demo patient records...");

        const populationPromises = syntheticData.map(async (patient, index) => {
            const fullName = `${patient.personalInformation.firstName} ${patient.personalInformation.lastName}`;
            const mrn = patient.personalInformation.medicalRecordNumber;
            const imageBlob = await createPlaceholderImage(fullName, mrn);

            const recordToSave: PatientData = {
                ...patient,
                // Create staggered timestamps to make the list look more realistic
                savedAt: new Date(Date.now() - index * 60 * 60 * 1000).toISOString(),
            };

            await saveRecord(recordToSave, imageBlob);
        });

        await Promise.all(populationPromises);

        localStorage.setItem(DEMO_DATA_POPULATED_KEY, 'true');
        console.log("Demo data population complete.");
    } catch (error) {
        console.error("Error populating demo data:", error);
        // If it fails, we don't want to block the app, but we also don't want to keep trying.
        localStorage.setItem(DEMO_DATA_POPULATED_KEY, 'true'); // Mark as attempted
    }
};
