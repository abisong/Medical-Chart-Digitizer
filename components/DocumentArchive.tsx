
import React, { useState, useEffect } from 'react';
import type { StoredPatientData } from '../types';

interface DocumentArchiveProps {
  records: StoredPatientData[];
  onViewRecord: (record: StoredPatientData) => void;
}

const DocumentArchiveItem: React.FC<{ record: StoredPatientData; onViewRecord: (record: StoredPatientData) => void }> = ({ record, onViewRecord }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        let url: string | null = null;
        if (record.imageBlob) {
            url = URL.createObjectURL(record.imageBlob);
            setImageUrl(url);
        }

        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [record.imageBlob]);

    if (!imageUrl) {
        return (
            <div className="w-full h-40 bg-slate-200 rounded-lg animate-pulse"></div>
        );
    }

    return (
        <button
            onClick={() => onViewRecord(record)}
            className="group relative w-full h-40 bg-slate-200 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label={`View document for ${record.personalInformation.firstName} ${record.personalInformation.lastName}`}
            title={`View document for ${record.personalInformation.firstName} ${record.personalInformation.lastName}`}
        >
            <img src={imageUrl} alt={`Document for ${record.personalInformation.firstName}`} className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent group-hover:from-black/80 transition-all duration-300 flex flex-col justify-end p-2">
                <p className="text-white font-semibold text-sm truncate">{record.personalInformation.firstName} {record.personalInformation.lastName}</p>
                <p className="text-slate-300 text-xs">MRN: {record.personalInformation.medicalRecordNumber}</p>
            </div>
        </button>
    );
};


export const DocumentArchive: React.FC<DocumentArchiveProps> = ({ records, onViewRecord }) => {
    if (!records || records.length === 0) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200 mt-8">
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Document Archive</h2>
            <p className="text-slate-500 mb-6">A visual archive of all saved original documents. Click a document to view its details.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {records.map((record) => (
                     record.savedAt && <DocumentArchiveItem key={record.savedAt} record={record} onViewRecord={onViewRecord} />
                ))}
            </div>
        </div>
    );
};
