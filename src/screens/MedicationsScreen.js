import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import StorageService from '../services/StorageService';
import colors from '../theme/colors';
import { typography, spacing, borderRadius, shadows } from '../theme/styles';
import { globalStyles } from '../theme/styles';

const MedicationsScreen = ({ navigation }) => {
    const [medications, setMedications] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadMedications();
        });

        loadMedications();
        return unsubscribe;
    }, [navigation]);

    const loadMedications = async () => {
        const meds = await StorageService.getMedications();
        setMedications(meds.filter(med => med.isActive));
    };

    const handleAddMedication = () => {
        navigation.navigate('AddMedication');
    };

    const handleEditMedication = (medication) => {
        navigation.navigate('AddMedication', { medication });
    };

    const handleDeleteMedication = async (medicationId) => {
        await StorageService.deleteMedication(medicationId);
        loadMedications();
    };

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <Header title="Medications" showProfile={false} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {medications.length > 0 ? (
                    medications.map((medication) => (
                        <View key={medication.id} style={styles.medicationItem}>
                            <TouchableOpacity
                                style={styles.medicationContent}
                                onPress={() => handleEditMedication(medication)}
                            >
                                <View style={styles.iconContainer}>
                                    <Ionicons name="medical" size={24} color={colors.primary} />
                                </View>
                                <View style={styles.medicationInfo}>
                                    <Text style={styles.medicationName}>{medication.name}</Text>
                                    <Text style={styles.medicationDosage}>{medication.dosage}</Text>
                                    <Text style={styles.medicationTimes}>
                                        {medication.times.join(', ')}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="medical-outline" size={64} color={colors.textLight} />
                        <Text style={styles.emptyText}>No medications yet</Text>
                        <Text style={styles.emptySubtext}>Tap the + button to add your first medication</Text>
                    </View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={handleAddMedication}>
                <Ionicons name="add" size={32} color={colors.textWhite} />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
    },
    medicationItem: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
        ...shadows.small,
    },
    medicationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    medicationInfo: {
        flex: 1,
    },
    medicationName: {
        ...typography.h4,
        marginBottom: 2,
    },
    medicationDosage: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    medicationTimes: {
        ...typography.bodySmall,
        color: colors.primary,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.xxl * 2,
    },
    emptyText: {
        ...typography.h3,
        color: colors.textSecondary,
        marginTop: spacing.md,
    },
    emptySubtext: {
        ...typography.body,
        color: colors.textLight,
        marginTop: spacing.xs,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
    },
    fab: {
        position: 'absolute',
        right: spacing.md,
        bottom: spacing.xl,
        width: 64,
        height: 64,
        borderRadius: borderRadius.round,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.large,
    },
    bottomPadding: {
        height: 100,
    },
});

export default MedicationsScreen;
