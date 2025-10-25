
import React from 'react';
import type { PatientData } from '../types';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

interface EditablePatientDataTableProps {
  data: PatientData;
  setData: React.Dispatch<React.SetStateAction<PatientData | null>>;
}

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm" />
    </div>
);

export const PatientDataTable: React.FC<EditablePatientDataTableProps> = ({ data, setData }) => {

  const handlePersonalInfoChange = (field: string, value: string) => {
    setData(prev => prev ? { ...prev, personalInformation: { ...prev.personalInformation, [field]: value } } : null);
  };

  const handleVitalsChange = (field: string, value: string) => {
    setData(prev => prev ? { ...prev, vitals: { ...(prev.vitals || {}), [field]: value } } : null);
  };
  
  const handleArrayChange = <T extends keyof PatientData>(arrayName: T, index: number, field: string, value: string) => {
    setData(prev => {
      if (!prev) return null;
      const newArray = [...(prev[arrayName] as any[])];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = <T extends keyof PatientData>(arrayName: T, newItem: any) => {
    setData(prev => prev ? { ...prev, [arrayName]: [...(prev[arrayName] as any[]), newItem] } : null);
  };

  const removeArrayItem = <T extends keyof PatientData>(arrayName: T, index: number) => {
    setData(prev => {
        if (!prev) return null;
        const newArray = (prev[arrayName] as any[]).filter((_, i) => i !== index);
        return { ...prev, [arrayName]: newArray };
    });
  };
  
  if (!data) return null;

  return (
    <div className="w-full space-y-6 text-left">
        <Section title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="First Name" value={data.personalInformation.firstName} onChange={e => handlePersonalInfoChange('firstName', e.target.value)} />
                <InputField label="Last Name" value={data.personalInformation.lastName} onChange={e => handlePersonalInfoChange('lastName', e.target.value)} />
                <InputField label="Date of Birth" value={data.personalInformation.dateOfBirth} onChange={e => handlePersonalInfoChange('dateOfBirth', e.target.value)} type="date" />
                <InputField label="Gender" value={data.personalInformation.gender} onChange={e => handlePersonalInfoChange('gender', e.target.value)} />
                <InputField label="Medical Record Number" value={data.personalInformation.medicalRecordNumber} onChange={e => handlePersonalInfoChange('medicalRecordNumber', e.target.value)} />
            </div>
        </Section>
        
        <Section title="Vitals">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Blood Pressure" value={data.vitals?.bloodPressure || ''} onChange={e => handleVitalsChange('bloodPressure', e.target.value)} />
                <InputField label="Heart Rate" value={data.vitals?.heartRate || ''} onChange={e => handleVitalsChange('heartRate', e.target.value)} />
                <InputField label="Temperature" value={data.vitals?.temperature || ''} onChange={e => handleVitalsChange('temperature', e.target.value)} />
                <InputField label="Respiratory Rate" value={data.vitals?.respiratoryRate || ''} onChange={e => handleVitalsChange('respiratoryRate', e.target.value)} />
            </div>
        </Section>
        
        <Section title="Medications" onAddItem={() => addArrayItem('medications', { name: '', dosage: '', frequency: '' })}>
            {data.medications.map((med, index) => (
                <div key={index} className="grid grid-cols-3 md:grid-cols-4 gap-2 items-end p-2 rounded-md bg-slate-50 border">
                    <InputField aria-label={`Medication ${index + 1} Name`} label="Name" value={med.name} onChange={e => handleArrayChange('medications', index, 'name', e.target.value)} />
                    <InputField aria-label={`Medication ${index + 1} Dosage`} label="Dosage" value={med.dosage} onChange={e => handleArrayChange('medications', index, 'dosage', e.target.value)} />
                    <InputField aria-label={`Medication ${index + 1} Frequency`} label="Frequency" value={med.frequency} onChange={e => handleArrayChange('medications', index, 'frequency', e.target.value)} />
                    <button aria-label={`Remove Medication ${index + 1}`} title="Remove this medication" onClick={() => removeArrayItem('medications', index)} className="h-10 text-red-600 hover:text-red-800 flex items-center justify-center"><TrashIcon /></button>
                </div>
            ))}
             {data.medications.length === 0 && <p className="text-sm text-slate-400">No medications listed.</p>}
        </Section>

        <Section title="Allergies" onAddItem={() => addArrayItem('allergies', { name: '', severity: 'Unknown' })}>
            {data.allergies.map((allergy, index) => (
                 <div key={index} className="grid grid-cols-2 md:grid-cols-3 gap-2 items-end p-2 rounded-md bg-slate-50 border">
                    <InputField aria-label={`Allergy ${index + 1} Name`} label="Name" value={allergy.name} onChange={e => handleArrayChange('allergies', index, 'name', e.target.value)} />
                    <div>
                        <label htmlFor={`allergy-severity-${index}`} className="block text-sm font-medium text-slate-600 mb-1">Severity</label>
                        <select id={`allergy-severity-${index}`} value={allergy.severity} onChange={e => handleArrayChange('allergies', index, 'severity', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm h-10">
                            <option>Unknown</option>
                            <option>Mild</option>
                            <option>Moderate</option>
                            <option>Severe</option>
                        </select>
                    </div>
                    <button aria-label={`Remove Allergy ${index + 1}`} title="Remove this allergy" onClick={() => removeArrayItem('allergies', index)} className="h-10 text-red-600 hover:text-red-800 flex items-center justify-center"><TrashIcon /></button>
                </div>
            ))}
            {data.allergies.length === 0 && <p className="text-sm text-slate-400">No allergies listed.</p>}
        </Section>
        
        <Section title="Diagnosis" onAddItem={() => addArrayItem('diagnosis', '')}>
            {data.diagnosis.map((diag, index) => (
                 <div key={index} className="flex gap-2 items-end">
                    <InputField aria-label={`Diagnosis ${index + 1}`} label={`Diagnosis #${index+1}`} value={diag} onChange={e => {
                        const newDiagnosis = [...data.diagnosis];
                        newDiagnosis[index] = e.target.value;
                        setData(prev => prev ? { ...prev, diagnosis: newDiagnosis } : null);
                    }} />
                    <button aria-label={`Remove Diagnosis ${index + 1}`} title="Remove this diagnosis" onClick={() => removeArrayItem('diagnosis', index)} className="h-10 text-red-600 hover:text-red-800 flex items-center justify-center mb-1"><TrashIcon /></button>
                </div>
            ))}
             {data.diagnosis.length === 0 && <p className="text-sm text-slate-400">No diagnoses listed.</p>}
        </Section>

        <Section title="Notes">
            <textarea
                value={data.notes || ''}
                onChange={e => setData(prev => prev ? { ...prev, notes: e.target.value } : null)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm"
                placeholder="Enter any additional notes..."
            />
        </Section>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode; onAddItem?: () => void }> = ({ title, children, onAddItem }) => (
    <div className="border-t border-slate-200 pt-4">
        <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-slate-800">{title}</h3>
            {onAddItem && (
                <button onClick={onAddItem} className="flex items-center space-x-1 text-sm bg-blue-100 text-blue-700 font-semibold py-1 px-3 rounded-md hover:bg-blue-200 transition-colors" title={`Add a new ${title.slice(0, -1).toLowerCase()}`}>
                    <PlusIcon />
                    <span>Add</span>
                </button>
            )}
        </div>
        <div className="space-y-4">{children}</div>
    </div>
);
