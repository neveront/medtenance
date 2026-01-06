import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import Header from '../components/Header';
import StorageService from '../services/StorageService';
import colors from '../theme/colors';
import { typography, spacing, borderRadius, shadows } from '../theme/styles';
import { globalStyles } from '../theme/styles';

const RecordScreen = () => {
    const [logs, setLogs] = useState([]);
    const [showQR, setShowQR] = useState(false);
    const [adherenceStats, setAdherenceStats] = useState({
        total: 0,
        taken: 0,
        missed: 0,
        percentage: 0,
    });

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        const allLogs = await StorageService.getLogs();

        // Get last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentLogs = allLogs.filter(log =>
            new Date(log.scheduledTime) >= thirtyDaysAgo
        );

        setLogs(recentLogs);

        // Calculate stats
        const taken = recentLogs.filter(log => log.status === 'taken').length;
        const missed = recentLogs.filter(log => log.status === 'missed').length;
        const total = recentLogs.length;
        const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;

        setAdherenceStats({ total, taken, missed, percentage });
    };

    const generateQRData = () => {
        const data = {
            app: 'Medtenance',
            adherence: adherenceStats,
            recentLogs: logs.slice(0, 10).map(log => ({
                medication: log.medicationName,
                scheduled: log.scheduledTime,
                taken: log.takenTime,
                status: log.status,
            })),
        };
        return JSON.stringify(data);
    };

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <Header title="Record" showProfile={false} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: colors.primaryLight }]}>
                        <Text style={styles.statValue}>{adherenceStats.percentage}%</Text>
                        <Text style={styles.statLabel}>Adherence Rate</Text>
                    </View>

                    <View style={styles.statRow}>
                        <View style={[styles.statCardSmall, { backgroundColor: colors.successLight }]}>
                            <Text style={styles.statValueSmall}>{adherenceStats.taken}</Text>
                            <Text style={styles.statLabelSmall}>Taken</Text>
                        </View>

                        <View style={[styles.statCardSmall, { backgroundColor: colors.errorLight }]}>
                            <Text style={styles.statValueSmall}>{adherenceStats.missed}</Text>
                            <Text style={styles.statLabelSmall}>Missed</Text>
                        </View>
                    </View>
                </View>

                {/* QR Code Section */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.qrButton}
                        onPress={() => setShowQR(!showQR)}
                    >
                        <Ionicons name="qr-code" size={24} color={colors.primary} />
                        <Text style={styles.qrButtonText}>
                            {showQR ? 'Hide QR Code' : 'Generate QR Code for Doctor'}
                        </Text>
                    </TouchableOpacity>

                    {showQR && (
                        <View style={styles.qrContainer}>
                            <QRCode
                                value={generateQRData()}
                                size={200}
                                backgroundColor={colors.background}
                                color={colors.textPrimary}
                            />
                            <Text style={styles.qrHint}>
                                Scan this code to share your medication history
                            </Text>
                        </View>
                    )}
                </View>

                {/* Recent History */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent History (Last 30 Days)</Text>
                    {logs.length > 0 ? (
                        logs.slice(0, 20).map((log) => (
                            <View key={log.id} style={styles.logItem}>
                                <View style={styles.logIcon}>
                                    <Ionicons
                                        name={log.status === 'taken' ? 'checkmark-circle' : 'close-circle'}
                                        size={24}
                                        color={log.status === 'taken' ? colors.taken : colors.missed}
                                    />
                                </View>
                                <View style={styles.logInfo}>
                                    <Text style={styles.logMedication}>{log.medicationName}</Text>
                                    <Text style={styles.logTime}>
                                        {new Date(log.scheduledTime).toLocaleString()}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: log.status === 'taken' ? colors.successLight : colors.errorLight }
                                ]}>
                                    <Text style={styles.statusText}>
                                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No records yet</Text>
                        </View>
                    )}
                </View>

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
    statsContainer: {
        marginTop: spacing.md,
    },
    statCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        marginBottom: spacing.md,
        ...shadows.medium,
    },
    statValue: {
        ...typography.h1,
        color: colors.textWhite,
        fontSize: 48,
        fontWeight: '700',
    },
    statLabel: {
        ...typography.body,
        color: colors.textWhite,
        marginTop: spacing.xs,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCardSmall: {
        flex: 1,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        marginHorizontal: spacing.xs,
        ...shadows.small,
    },
    statValueSmall: {
        ...typography.h2,
        color: colors.textWhite,
        fontWeight: '700',
    },
    statLabelSmall: {
        ...typography.bodySmall,
        color: colors.textWhite,
        marginTop: spacing.xs,
    },
    section: {
        marginTop: spacing.lg,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.md,
    },
    qrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 2,
        borderColor: colors.primary,
        borderStyle: 'dashed',
    },
    qrButtonText: {
        ...typography.body,
        color: colors.primary,
        marginLeft: spacing.sm,
        fontWeight: '600',
    },
    qrContainer: {
        alignItems: 'center',
        marginTop: spacing.md,
        padding: spacing.lg,
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        ...shadows.small,
    },
    qrHint: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    logItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.small,
    },
    logIcon: {
        marginRight: spacing.md,
    },
    logInfo: {
        flex: 1,
    },
    logMedication: {
        ...typography.body,
        fontWeight: '600',
        marginBottom: 2,
    },
    logTime: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        ...typography.caption,
        color: colors.textWhite,
        fontWeight: '600',
    },
    emptyState: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    bottomPadding: {
        height: spacing.xl,
    },
});

export default RecordScreen;
