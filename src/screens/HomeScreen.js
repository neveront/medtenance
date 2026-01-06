import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Header from '../components/Header';
import MedicationCard from '../components/MedicationCard';
import AdherenceChart from '../components/AdherenceChart';
import StorageService from '../services/StorageService';
import { MedicationLog } from '../models/MedicationLog';
import colors from '../theme/colors';
import { typography, spacing } from '../theme/styles';
import { globalStyles } from '../theme/styles';

const HomeScreen = () => {
    const [todayMedications, setTodayMedications] = useState([]);
    const [weeklyAdherence, setWeeklyAdherence] = useState([85, 90, 75, 100, 95, 80, 90]);

    useFocusEffect(
        useCallback(() => {
            loadTodayMedications();
            calculateWeeklyAdherence();
        }, [])
    );

    const loadTodayMedications = async () => {
        const medications = await StorageService.getMedications();
        const logs = await StorageService.getLogsByDate(new Date());
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0-6 Sun-Sat

        // Create medication schedule for today
        const schedule = [];
        medications.forEach(med => {
            // Check if medication is scheduled for today
            let isScheduledToday = false;

            if (!med.isActive) return;

            if (med.frequencyType === 'daily' || med.frequency === 'daily' || med.frequency === 'twice_daily') {
                isScheduledToday = true;
            } else if (med.frequencyType === 'specific_days') {
                if (med.selectedDays && med.selectedDays.includes(dayOfWeek)) {
                    isScheduledToday = true;
                }
            } else if (med.frequencyType === 'interval') {
                const startDate = new Date(med.startDate);
                startDate.setHours(0, 0, 0, 0);
                const todayMidnight = new Date();
                todayMidnight.setHours(0, 0, 0, 0);

                const diffTime = todayMidnight.getTime() - startDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays >= 0 && (diffDays % med.intervalDays === 0)) {
                    isScheduledToday = true;
                }
            }

            if (isScheduledToday) {
                med.times.forEach(time => {
                    // Correctly match log by checking medicationId and approximate time matching
                    const existingLog = logs.find(log => {
                        if (log.medicationId !== med.id) return false;
                        const logDate = new Date(log.scheduledTime);
                        const [h, m] = time.split(':');
                        return logDate.getHours() === parseInt(h) && logDate.getMinutes() === parseInt(m);
                    });

                    schedule.push({
                        medication: med,
                        time: time,
                        status: existingLog ? existingLog.status : 'pending',
                        logId: existingLog ? existingLog.id : null,
                    });
                });
            }
        });

        // Sort by time
        schedule.sort((a, b) => a.time.localeCompare(b.time));
        setTodayMedications(schedule);
    };

    const calculateWeeklyAdherence = async () => {
        const logs = await StorageService.getLogs();
        const medications = await StorageService.getMedications();
        const today = new Date();
        const weekData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            // 1. Calculate Total Scheduled for this date
            let totalScheduledCount = 0;
            medications.forEach(med => {
                if (med.isScheduledForDate(date)) {
                    totalScheduledCount += med.times.length;
                }
            });

            // 2. Calculate Taken Count for this date
            const dayLogs = logs.filter(log => {
                const logDate = new Date(log.scheduledTime);
                logDate.setHours(0, 0, 0, 0);
                return logDate.getTime() === date.getTime() && log.status === 'taken';
            });

            const takenCount = dayLogs.length;

            if (totalScheduledCount > 0) {
                const percentage = Math.round((takenCount / totalScheduledCount) * 100);
                weekData.push(percentage);
            } else {
                weekData.push(0);
            }
        }

        setWeeklyAdherence(weekData);
    };

    const handleMarkTaken = async (item) => {
        if (item.status === 'taken') return;

        const now = new Date();
        const [hours, minutes] = item.time.split(':');
        const scheduledTime = new Date();
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const log = new MedicationLog({
            medicationId: item.medication.id,
            medicationName: `${item.medication.name} ${item.medication.dosage}`,
            scheduledTime: scheduledTime,
            takenTime: now,
            status: 'taken',
        });

        await StorageService.addLog(log);
        loadTodayMedications();
        calculateWeeklyAdherence();
    };

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <Header />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Today</Text>
                    {todayMedications.length > 0 ? (
                        todayMedications.map((item, index) => (
                            <MedicationCard
                                key={`${item.medication.id}-${item.time}-${index}`}
                                medication={item.medication}
                                time={item.time}
                                status={item.status}
                                onMarkTaken={() => handleMarkTaken(item)}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No medications scheduled for today</Text>
                            <Text style={styles.emptySubtext}>Add medications to get started</Text>
                        </View>
                    )}
                </View>

                <AdherenceChart weeklyData={weeklyAdherence} />

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
    },
    section: {
        marginTop: spacing.md,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.md,
    },
    emptyState: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    emptySubtext: {
        ...typography.bodySmall,
        color: colors.textLight,
    },
    bottomPadding: {
        height: spacing.xl,
    },
});

export default HomeScreen;
