import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        loadTodayMedications();
        calculateWeeklyAdherence();
    }, []);

    const loadTodayMedications = async () => {
        const medications = await StorageService.getMedications();
        const logs = await StorageService.getLogsByDate(new Date());

        // Create medication schedule for today
        const schedule = [];
        medications.forEach(med => {
            med.times.forEach(time => {
                const existingLog = logs.find(
                    log => log.medicationId === med.id && log.scheduledTime.includes(time)
                );

                schedule.push({
                    medication: med,
                    time: time,
                    status: existingLog ? existingLog.status : 'pending',
                    logId: existingLog ? existingLog.id : null,
                });
            });
        });

        // Sort by time
        schedule.sort((a, b) => a.time.localeCompare(b.time));
        setTodayMedications(schedule);
    };

    const calculateWeeklyAdherence = async () => {
        const logs = await StorageService.getLogs();
        const today = new Date();
        const weekData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const dayLogs = logs.filter(log => {
                const logDate = new Date(log.scheduledTime);
                logDate.setHours(0, 0, 0, 0);
                return logDate.getTime() === date.getTime();
            });

            if (dayLogs.length > 0) {
                const takenCount = dayLogs.filter(log => log.status === 'taken').length;
                const percentage = Math.round((takenCount / dayLogs.length) * 100);
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
