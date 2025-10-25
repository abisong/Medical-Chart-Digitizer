
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { PatientDataTable } from './components/PatientDataTable';
import { Loader } from './components/Loader';
import { digitizeMedicalChart, generateClinicalSummary, generateBillingCodes } from './services/geminiService';
import { saveRecord, getAllRecords, deleteRecord } from './services/dbService';
import type { PatientData, StoredPatientData, MedicalCodes, User } from './types';
import { CameraCapture } from './components/CameraCapture';
import { CameraIcon } from './components/icons/CameraIcon';
import { DocumentArchive } from './components/DocumentArchive';
import * as authService from './services/authService';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';

const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2l4.45.222a1 1 0 01.815 1.588l-3.328 3.014.99 4.545a1 1 0 01-1.482 1.054L12 15.54l-3.59 2.051a1 1 0 01-1.482-1.054l.99-4.545L4.602 9.01a1 1 0 01.815-1.588l4.45-.222L11.033 2.744A1 1 0 0112 2z" clipRule="evenodd" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>;
const ButtonUploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [page, setPage] = useState<'login' | 'register'>('login');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
  const [medicalCodes, setMedicalCodes] = useState<MedicalCodes | null>(null);
  const [isCodingLoading, setIsCodingLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedRecords, setSavedRecords] = useState<StoredPatientData[]>([]);
  const [isRecordSaved, setIsRecordSaved] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    authService.setupDemoAccounts();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const fetchRecords = async () => {
        try {
          const recordsFromDb = await getAllRecords();
          setSavedRecords(recordsFromDb);
        } catch (e) {
          console.error("Failed to load records from IndexedDB", e);
          setError("Could not load saved records from the database.");
        }
      };
      fetchRecords();
    }
  }, [currentUser]);
  
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);


  const handleFileSelect = (file: File) => {
    setImageFile(file);
    setPatientData(null);
    setError(null);
    setIsRecordSaved(false);
    setMedicalCodes(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const resetState = () => {
    setImageFile(null);
    setImageUrl(null);
    setPatientData(null);
    setError(null);
    setIsLoading(false);
    setIsSummaryLoading(false);
    setIsRecordSaved(false);
    setMedicalCodes(null);
    setIsCodingLoading(false);
  };

  const handleDigitize = useCallback(async () => {
    if (!imageFile) {
      setError('Please select an image file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPatientData(null);
    setIsRecordSaved(false);
    setMedicalCodes(null);

    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
      });

      const mimeType = imageFile.type;
      const data = await digitizeMedicalChart(base64Image, mimeType);
      setPatientData(data);

    } catch (err) {
      console.error(err);
      setError('Failed to digitize the document. The AI model may be unable to process this image. Please try another one.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  const handleGenerateSummary = async () => {
    if (!patientData) return;
    setIsSummaryLoading(true);
    setError(null);
    try {
        const summaryText = await generateClinicalSummary(patientData);
        setPatientData(prev => prev ? { ...prev, summary: summaryText } : null);
    } catch (err) {
        console.error("Failed to generate summary:", err);
        setError("An error occurred while generating the summary.");
    } finally {
        setIsSummaryLoading(false);
    }
  };

  const handleGenerateCodes = async () => {
    if (!patientData) return;
    setIsCodingLoading(true);
    setError(null);
    try {
        const codes = await generateBillingCodes(patientData);
        setMedicalCodes(codes);
    } catch (err) {
        console.error("Failed to generate billing codes:", err);
        setError("An error occurred while generating billing codes.");
    } finally {
        setIsCodingLoading(false);
    }
  };


  const handleSaveRecord = async () => {
    if (!patientData) return;

    let imageToSave: File | Blob | undefined = imageFile;
    if (!imageToSave && patientData.savedAt) {
        const existingRecord = savedRecords.find(r => r.savedAt === patientData.savedAt);
        imageToSave = existingRecord?.imageBlob;
    }

    if (!imageToSave) {
        setError("Could not find the image associated with this record to save.");
        return;
    }

    const recordToSave: PatientData = {
      ...patientData,
      savedAt: patientData.savedAt || new Date().toISOString(),
    };
    
    try {
      await saveRecord(recordToSave, imageToSave);
      const allRecords = await getAllRecords();
      setSavedRecords(allRecords);
      setPatientData(recordToSave);
      setIsRecordSaved(true);
    } catch(e) {
      console.error("Failed to save record to IndexedDB", e);
      setError("An error occurred while saving the record.");
    }
  };

  const handleDeleteRecord = async (recordSavedAt: string) => {
    if (window.confirm(`Are you sure you want to delete this record? This action cannot be undone.`)) {
        try {
            await deleteRecord(recordSavedAt);
            const recordsAfterDeletion = await getAllRecords();
            setSavedRecords(recordsAfterDeletion);
            if (patientData?.savedAt === recordSavedAt) {
                resetState();
            }
        } catch(e) {
            console.error("Failed to delete record from IndexedDB", e);
            setError("An error occurred while deleting the record.");
        }
    }
  };
  
  const handleViewRecord = (record: StoredPatientData) => {
    setPatientData(record);
    setImageFile(null); 
    setMedicalCodes(null);
    
    if (record.imageBlob) {
        const objectUrl = URL.createObjectURL(record.imageBlob);
        setImageUrl(objectUrl);
    } else {
        setImageUrl(null);
    }

    setError(null);
    setIsLoading(false);
    setIsRecordSaved(true);
    mainContentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handlePhotoTaken = (imageBlob: Blob) => {
    const imageFile = new File([imageBlob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
    handleFileSelect(imageFile);
    setIsCameraOpen(false);
  };
  
  const handleLogout = () => {
      authService.logout();
      setCurrentUser(null);
      // Reset app state on logout
      setSavedRecords([]);
      resetState();
  };

  const filteredRecords = savedRecords.filter(record => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;

    const { personalInformation, vitals, allergies, medications, diagnosis, notes } = record;
    
    const searchableText = [
      personalInformation.firstName,
      personalInformation.lastName,
      personalInformation.medicalRecordNumber,
      personalInformation.dateOfBirth,
      personalInformation.gender,
      vitals?.bloodPressure,
      vitals?.heartRate,
      vitals?.temperature,
      vitals?.respiratoryRate,
      ...allergies.map(a => `${a.name} ${a.severity}`),
      ...medications.map(m => `${m.name} ${m.dosage} ${m.frequency}`),
      ...diagnosis,
      notes
    ].filter(Boolean).join(' ').toLowerCase();

    return searchableText.includes(query);
  }).sort((a, b) => new Date(b.savedAt!).getTime() - new Date(a.savedAt!).getTime());
  
  if (!currentUser) {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            {page === 'login' ? (
                <Login onLogin={setCurrentUser} onNavigateToRegister={() => setPage('register')} />
            ) : (
                <Register onRegister={setCurrentUser} onNavigateToLogin={() => setPage('login')} />
            )}
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
       {isCameraOpen && (
        <CameraCapture 
            onPhotoTaken={handlePhotoTaken} 
            onClose={() => setIsCameraOpen(false)} 
        />
      )}
      <Header user={currentUser} onLogout={handleLogout} />
      <main className="container mx-auto p-4 md:p-8">
        <div ref={mainContentRef} className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Digitize Patient Chart</h2>
          <p className="text-slate-500 mb-6">Upload or photograph a medical document to extract, review, and summarize patient information.</p>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                 <div>
                    <h3 className="text-lg font-semibold text-slate-600 mb-3">1. Provide Document Image</h3>
                    <FileUpload onFileSelect={handleFileSelect} imageUrl={imageUrl} ref={fileInputRef} />
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center justify-center bg-white text-slate-700 border border-slate-300 font-semibold py-3 px-6 rounded-lg shadow-sm hover:bg-slate-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          title="Upload a document image from your device"
                      >
                          <ButtonUploadIcon />
                          Upload File
                      </button>
                      <button
                          onClick={() => setIsCameraOpen(true)}
                          className="w-full flex items-center justify-center bg-white text-slate-700 border border-slate-300 font-semibold py-3 px-6 rounded-lg shadow-sm hover:bg-slate-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          title="Use your device's camera to take a photo"
                      >
                          <CameraIcon />
                          Take Picture
                      </button>
                    </div>
                 </div>
              </div>

              <div className="space-y-6 pt-10">
                <h3 className="text-lg font-semibold text-slate-600 mb-3">2. Process & Review</h3>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={handleDigitize}
                    disabled={!imageFile || isLoading}
                    className="w-full sm:flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="Analyze the image with AI to extract patient data"
                  >
                    {isLoading ? 'Processing...' : 'Digitize Chart'}
                  </button>
                  { (imageFile || patientData || error || imageUrl) && (
                      <button
                          onClick={resetState}
                          className="w-full sm:w-auto bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg hover:bg-slate-300 transition-all duration-300"
                          title="Clear the current form and image"
                      >
                          Reset
                      </button>
                  )}
                </div>
                {error && (
                  <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg mt-4">
                    <h3 className="font-semibold">Error</h3>
                    <p>{error}</p>
                  </div>
                )}
              </div>
            </div>

            {isLoading && <div className="flex justify-center p-8"><Loader text="Analyzing Document..."/></div>}
            
            {patientData && (
              <div className="space-y-6 border-t-2 border-slate-200 pt-6 animate-fade-in">
                <PatientDataTable data={patientData} setData={setPatientData} />

                <div className="border-t border-slate-200 pt-4 space-y-4">
                    <h3 className="font-bold text-lg text-slate-800">Clinical Summary</h3>
                    {isSummaryLoading ? (
                        <div className="flex justify-center p-4"><Loader text="Generating Summary..." /></div>
                    ) : patientData.summary ? (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-slate-700 text-sm whitespace-pre-wrap">{patientData.summary}</div>
                    ) : (
                         <p className="text-sm text-slate-500">No summary generated yet.</p>
                    )}
                    <button onClick={handleGenerateSummary} disabled={isSummaryLoading} className="w-full flex items-center justify-center bg-white text-slate-700 border border-slate-300 font-semibold py-3 px-6 rounded-lg shadow-sm hover:bg-slate-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed" title="Generate an AI-powered clinical summary of the patient data">
                        <SparklesIcon /> {isSummaryLoading ? 'Generating...' : patientData.summary ? 'Regenerate Summary' : 'Generate Summary'}
                    </button>
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-4">
                    <h3 className="font-bold text-lg text-slate-800">Medical Coding Assistance</h3>
                    {isCodingLoading ? (
                        <div className="flex justify-center p-4"><Loader text="Suggesting Codes..." /></div>
                    ) : medicalCodes ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-2">ICD-10 Codes (Diagnosis)</h4>
                                {medicalCodes.icd10Codes.length > 0 ? (
                                    <ul className="space-y-2">
                                        {medicalCodes.icd10Codes.map(code => (
                                            <li key={code.code}>
                                                <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-xs">{code.code}</span> - <span className="text-slate-600">{code.description}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-slate-500">No relevant codes found.</p>}
                            </div>
                             <div>
                                <h4 className="font-semibold text-slate-700 mb-2">CPT Codes (Procedure)</h4>
                                {medicalCodes.cptCodes.length > 0 ? (
                                     <ul className="space-y-2">
                                        {medicalCodes.cptCodes.map(code => (
                                            <li key={code.code}>
                                                <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-xs">{code.code}</span> - <span className="text-slate-600">{code.description}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-slate-500">No relevant codes found.</p>}
                            </div>
                        </div>
                    ) : (
                         <p className="text-sm text-slate-500">Generate suggested billing codes based on the patient's chart.</p>
                    )}
                    <button onClick={handleGenerateCodes} disabled={isCodingLoading} className="w-full flex items-center justify-center bg-white text-slate-700 border border-slate-300 font-semibold py-3 px-6 rounded-lg shadow-sm hover:bg-slate-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed" title="Get AI suggestions for relevant ICD-10 and CPT billing codes">
                        <SparklesIcon /> {isCodingLoading ? 'Generating...' : medicalCodes ? 'Regenerate Codes' : 'Suggest Billing Codes'}
                    </button>
                </div>
                
                <div className="border-t border-slate-200 pt-4">
                    <button onClick={handleSaveRecord} className="w-full flex items-center justify-center bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300" title="Save the current patient data to your local device">
                      <SaveIcon /> {isRecordSaved ? 'Update Record' : 'Save Record'}
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {savedRecords.length > 0 && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200 mt-8">
                <h2 className="text-2xl font-bold text-slate-700 mb-4">Saved Records</h2>
                 <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search records by any criteria..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        aria-label="Search saved records"
                    />
                </div>
                <div className="space-y-3">
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record, index) => (
                          <div key={record.savedAt || index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 animate-fade-in">
                              <div>
                                  <p className="font-semibold text-slate-800">{record.personalInformation.firstName} {record.personalInformation.lastName}</p>
                                  <p className="text-sm text-slate-500">MRN: {record.personalInformation.medicalRecordNumber}</p>
                                  {record.savedAt && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        Saved: {new Date(record.savedAt).toLocaleString()}
                                    </p>
                                  )}
                              </div>
                              <div className="flex items-center space-x-2">
                                  <button onClick={() => handleViewRecord(record)} className="text-sm bg-blue-100 text-blue-700 font-semibold py-1 px-3 rounded-md hover:bg-blue-200 transition-colors" title="Load this record for viewing and editing">View</button>
                                  <button
                                    onClick={() => {
                                      if (record.savedAt) {
                                        handleDeleteRecord(record.savedAt);
                                      }
                                    }}
                                    disabled={!record.savedAt}
                                    className="text-sm bg-red-100 text-red-700 font-semibold py-1 px-3 rounded-md hover:bg-red-200 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                    title="Permanently delete this record"
                                  >
                                    Delete
                                  </button>
                              </div>
                          </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-slate-500">
                        <p>No records match your search.</p>
                      </div>
                    )}
                </div>
            </div>
        )}

        {filteredRecords.length > 0 && (
            <DocumentArchive records={filteredRecords} onViewRecord={handleViewRecord} />
        )}

        <footer className="text-center mt-8 text-sm text-slate-500">
            <p>Powered by Google Gemini API. For demonstration purposes only.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
