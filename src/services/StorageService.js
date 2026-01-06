import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication } from '../models/Medication';
import { MedicationLog } from '../models/MedicationLog';
import NotificationService from './NotificationService';

const KEYS = {
    MEDICATIONS: '@medtenance_medications',
    LOGS: '@medtenance_logs',
    SETTINGS: '@medtenance_settings',
};

class StorageService {
    // Medications
    async saveMedications(medications) {
        try {
            const jsonValue = JSON.stringify(medications.map(med => med.toJSON()));
            await AsyncStorage.setItem(KEYS.MEDICATIONS, jsonValue);
            return true;
        } catch (error) {
            console.error('Error saving medications:', error);
            return false;
        }
    }

    async getMedications() {
        try {
            const jsonValue = await AsyncStorage.getItem(KEYS.MEDICATIONS);
            if (jsonValue != null) {
                const data = JSON.parse(jsonValue);
                return data.map(med => Medication.fromJSON(med));
            }
            return [];
        } catch (error) {
            console.error('Error loading medications:', error);
            return [];
        }
    }

    async addMedication(medication) {
        try {
            const medications = await this.getMedications();
            medications.push(medication);
            await this.saveMedications(medications);
            // Don't await scheduling to keep UI responsive
            NotificationService.scheduleAllMedications(medications).catch(e => console.error(e));
            return true;
        } catch (error) {
            console.error('Error adding medication:', error);
            return false;
        }
    }

    async updateMedication(updatedMedication) {
        try {
            const medications = await this.getMedications();
            const index = medications.findIndex(med => med.id === updatedMedication.id);
            if (index !== -1) {
                medications[index] = updatedMedication;
                await this.saveMedications(medications);
                // Don't await scheduling to keep UI responsive
                NotificationService.scheduleAllMedications(medications).catch(e => console.error(e));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating medication:', error);
            return false;
        }
    }

    async deleteMedication(medicationId) {
        try {
            const medications = await this.getMedications();
            const filtered = medications.filter(med => med.id !== medicationId);
            await this.saveMedications(filtered);
            // Don't await scheduling to keep UI responsive
            NotificationService.scheduleAllMedications(filtered).catch(e => console.error(e));
            return true;
        } catch (error) {
            console.error('Error deleting medication:', error);
            return false;
        }
    }

    // Medication Logs
    async saveLogs(logs) {
        try {
            const jsonValue = JSON.stringify(logs.map(log => log.toJSON()));
            await AsyncStorage.setItem(KEYS.LOGS, jsonValue);
            return true;
        } catch (error) {
            console.error('Error saving logs:', error);
            return false;
        }
    }

    async getLogs() {
        try {
            const jsonValue = await AsyncStorage.getItem(KEYS.LOGS);
            if (jsonValue != null) {
                const data = JSON.parse(jsonValue);
                return data.map(log => MedicationLog.fromJSON(log));
            }
            return [];
        } catch (error) {
            console.error('Error loading logs:', error);
            return [];
        }
    }

    async addLog(log) {
        try {
            const logs = await this.getLogs();
            logs.push(log);
            await this.saveLogs(logs);
            return true;
        } catch (error) {
            console.error('Error adding log:', error);
            return false;
        }
    }

    async getLogsByDate(date) {
        try {
            const logs = await this.getLogs();
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);

            return logs.filter(log => {
                const logDate = new Date(log.scheduledTime);
                logDate.setHours(0, 0, 0, 0);
                return logDate.getTime() === targetDate.getTime();
            });
        } catch (error) {
            console.error('Error getting logs by date:', error);
            return [];
        }
    }

    async updateLog(updatedLog) {
        try {
            const logs = await this.getLogs();
            const index = logs.findIndex(log => log.id === updatedLog.id);
            if (index !== -1) {
                logs[index] = updatedLog;
                await this.saveLogs(logs);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating log:', error);
            return false;
        }
    }

    // Clear all data (for testing)
    async clearAllData() {
        try {
            await AsyncStorage.multiRemove([KEYS.MEDICATIONS, KEYS.LOGS, KEYS.SETTINGS]);
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    async refreshNotifications() {
        try {
            const medications = await this.getMedications();
            await NotificationService.scheduleAllMedications(medications);
        } catch (error) {
            console.error('Error refreshing notifications:', error);
        }
    }
}

export default new StorageService();
