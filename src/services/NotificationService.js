import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

class NotificationService {

    async requestPermissions() {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    }

    // Called to refresh/top-up notifications (e.g. on app launch)
    async rescheduleNotifications(medications) {
        return this.scheduleAllMedications(medications);
    }

    async cancelMedicationReminders(medicationId) {
        // Cancel all notifications associated with this medication ID
        await Notifications.cancelAllScheduledNotificationsAsync();
        // The calling code (StorageService) should trigger a "reschedule all"
    }

    async scheduleAllMedications(medications) {
        await Notifications.cancelAllScheduledNotificationsAsync();

        for (const med of medications) {
            if (med.isActive) {
                await this.scheduleMedicationReminders(med);
            }
        }
    }

    async scheduleMedicationReminders(med) {
        if (!med.isActive) return;

        const timeSlots = med.times;
        const frequencyType = med.frequencyType || 'daily';

        for (const timeStr of timeSlots) {
            const [hourStr, minuteStr] = timeStr.split(':');
            const hour = parseInt(hourStr, 10);
            const minute = parseInt(minuteStr, 10);

            if (isNaN(hour) || isNaN(minute)) continue;

            const content = {
                title: 'Medication Reminder',
                body: `It's time to take your ${med.name} ${med.dosage}`,
                data: { medicationId: med.id },
                sound: true,
                ...(Platform.OS === 'android' && { channelId: 'default' }),
            };

            // Strategy: Unroll schedule
            const SCHEDULE_DAYS = 14;
            let datesToSchedule = [];

            if (frequencyType === 'daily') {
                let current = new Date();
                current.setHours(hour, minute, 0, 0);
                if (current <= new Date()) {
                    current.setDate(current.getDate() + 1);
                }
                for (let i = 0; i < SCHEDULE_DAYS; i++) {
                    datesToSchedule.push(new Date(current));
                    current.setDate(current.getDate() + 1);
                }
            } else if (frequencyType === 'specific_days') {
                const days = med.selectedDays || [];
                let current = new Date();
                current.setHours(hour, minute, 0, 0);
                for (let i = 0; i < SCHEDULE_DAYS; i++) {
                    if (current > new Date() && days.includes(current.getDay())) {
                        datesToSchedule.push(new Date(current));
                    }
                    current.setDate(current.getDate() + 1);
                }
            } else if (frequencyType === 'interval') {
                const interval = med.intervalDays || 1;
                let current = new Date(med.startDate);
                current.setHours(hour, minute, 0, 0);
                const now = new Date();
                while (current <= now) {
                    current.setDate(current.getDate() + interval);
                }
                for (let i = 0; i < SCHEDULE_DAYS; i++) {
                    datesToSchedule.push(new Date(current));
                    current.setDate(current.getDate() + interval);
                }
            }

            for (const date of datesToSchedule) {
                const now = new Date();
                const diff = date.getTime() - now.getTime();
                if (diff <= 0) continue;

                const seconds = Math.max(1, Math.floor(diff / 1000));

                await Notifications.scheduleNotificationAsync({
                    content,
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                        seconds,
                        repeats: false,
                    },
                });
            }
        }
    }
}

export default new NotificationService();
