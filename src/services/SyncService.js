
import { db, auth, signInAnonymous } from './firebaseConfig';
import { collection, doc, setDoc, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
import StorageService from './StorageService';
import { Medication } from '../models/Medication';
import { MedicationLog } from '../models/MedicationLog';

class SyncService {
    constructor() {
        this.isConnected = false;
        this.userId = null;
        this.isSyncing = false;
    }

    async initialize() {
        // Listen for network state
        NetInfo.addEventListener(state => {
            const wasConnected = this.isConnected;
            this.isConnected = state.isConnected && state.isInternetReachable;

            if (!wasConnected && this.isConnected) {
                console.log('Online: Triggering sync...');
                this.sync();
            }
        });

        // Initialize user
        const user = await signInAnonymous();
        if (user) {
            this.userId = user.uid;
            this.sync();
        }
    }

    async sync() {
        if (!this.isConnected || !this.userId || this.isSyncing) return;

        try {
            this.isSyncing = true;
            console.log('Starting sync...');

            // 1. Sync UP (Local -> Cloud)
            await this.syncUp();

            // 2. Sync DOWN (Cloud -> Local)
            await this.syncDown();

            console.log('Sync completed.');
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    async syncUp() {
        if (!db || !this.userId) return;

        // Get all local data
        const medications = await StorageService.getMedications();
        const logs = await StorageService.getLogs();

        const batch = writeBatch(db);
        const userRef = doc(db, 'users', this.userId);

        // Sync Medications
        for (const med of medications) {
            const medRef = doc(userRef, 'medications', med.id);
            // Convert to plain object and add timestamp
            const data = { ...med.toJSON(), syncedAt: Timestamp.now() };
            batch.set(medRef, data);
        }

        // Sync Logs
        for (const log of logs) {
            const logRef = doc(userRef, 'logs', log.id);
            const data = { ...log.toJSON(), syncedAt: Timestamp.now() };
            batch.set(logRef, data);
        }

        await batch.commit();
        console.log('Sync UP finished');
    }

    async syncDown() {
        if (!db || !this.userId) return;

        const userRef = doc(db, 'users', this.userId);

        // Fetch Medications from Cloud
        const medsSnapshot = await getDocs(collection(userRef, 'medications'));
        const remoteMeds = [];
        medsSnapshot.forEach(doc => {
            remoteMeds.push(doc.data());
        });

        // Fetch Logs from Cloud
        const logsSnapshot = await getDocs(collection(userRef, 'logs'));
        const remoteLogs = [];
        logsSnapshot.forEach(doc => {
            remoteLogs.push(doc.data());
        });

        if (remoteMeds.length > 0 || remoteLogs.length > 0) {
            const localMeds = await StorageService.getMedications();
            let medsChanged = false;

            remoteMeds.forEach(rMed => {
                if (!localMeds.find(l => l.id === rMed.id)) {
                    localMeds.push(Medication.fromJSON(rMed));
                    medsChanged = true;
                }
            });

            if (medsChanged) {
                await StorageService.saveMedications(localMeds);
                // Note: Ideally we would trigger a UI refresh here.
                // For now, next time the user loads the screen it will be there.
                // Or we can add a listener pattern later.
            }

            const localLogs = await StorageService.getLogs();
            let logsChanged = false;
            remoteLogs.forEach(rLog => {
                if (!localLogs.find(l => l.id === rLog.id)) {
                    localLogs.push(MedicationLog.fromJSON(rLog));
                    logsChanged = true;
                }
            });

            if (logsChanged) {
                await StorageService.saveLogs(localLogs);
            }
        }
    }
}

export default new SyncService();
