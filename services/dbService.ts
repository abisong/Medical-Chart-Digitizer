
import type { PatientData, StoredPatientData } from '../types';

const DB_NAME = 'MedicalChartDB';
const STORE_NAME = 'patientRecords';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const getDb = (): Promise<IDBDatabase> => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'savedAt' });
      }
    };
  });
  return dbPromise;
};

export const saveRecord = async (record: PatientData, imageFileOrBlob: File | Blob): Promise<void> => {
  const db = await getDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const recordToStore: Omit<StoredPatientData, 'imageBlob'> & { imageBlob: File | Blob } = { ...record, imageBlob: imageFileOrBlob };
  store.put(recordToStore);

  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getAllRecords = async (): Promise<StoredPatientData[]> => {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            resolve(request.result as StoredPatientData[]);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const deleteRecord = async (savedAt: string): Promise<void> => {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(savedAt);

     return new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};
