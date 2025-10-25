
export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface Allergy {
  name: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Unknown';
}

export interface BillingCode {
  code: string;
  description: string;
}

export interface MedicalCodes {
  icd10Codes: BillingCode[];
  cptCodes: BillingCode[];
}

export interface PatientData {
  savedAt?: string;
  personalInformation: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    medicalRecordNumber: string;
  };
  vitals?: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    respiratoryRate: string;
  };
  allergies: Allergy[];
  medications: Medication[];
  diagnosis: string[];
  notes?: string;
  summary?: string;
}

export interface StoredPatientData extends PatientData {
  imageBlob: Blob;
}

export type Role = 'Administrator' | 'Doctor' | 'Nurse' | 'Biller';

export interface User {
  name: string;
  email: string;
  password_plaintext: string; // NOTE: Storing plaintext for demo purposes. In a real app, this would be a secure hash.
  role: Role;
}
