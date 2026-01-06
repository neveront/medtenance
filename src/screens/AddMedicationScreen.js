import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Medication } from '../models/Medication';
import StorageService from '../services/StorageService';
import colors from '../theme/colors';
import { typography, spacing, borderRadius, shadows } from '../theme/styles';
import { globalStyles } from '../theme/styles';

const AddMedicationScreen = ({ navigation, route }) => {
    const existingMedication = route?.params?.medication;

    const [name, setName] = useState(existingMedication?.name || '');
    const [dosage, setDosage] = useState(existingMedication?.dosage || '');
    const [times, setTimes] = useState(existingMedication?.times || ['08:00']);
    const [notes, setNotes] = useState(existingMedication?.notes || '');

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter medication name');
            return;
        }
        if (!dosage.trim()) {
            Alert.alert('Error', 'Please enter dosage');
            return;
        }
        if (times.length === 0 || times.some(t => !t.trim())) {
            Alert.alert('Error', 'Please enter at least one valid time');
            return;
        }

        const medication = new Medication({
            id: existingMedication?.id,
            name: name.trim(),
            dosage: dosage.trim(),
            times: times.filter(t => t.trim()),
            notes: notes.trim(),
        });

        if (existingMedication) {
            await StorageService.updateMedication(medication);
        } else {
            await StorageService.addMedication(medication);
        }

        navigation.goBack();
    };

    const addTimeSlot = () => {
        setTimes([...times, '12:00']);
    };

    const removeTimeSlot = (index) => {
        if (times.length > 1) {
            const newTimes = times.filter((_, i) => i !== index);
            setTimes(newTimes);
        }
    };

    const updateTime = (index, value) => {
        const newTimes = [...times];
        newTimes[index] = value;
        setTimes(newTimes);
    };

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {existingMedication ? 'Edit Medication' : 'Add Medication'}
                </Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.label}>Medication Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g., Aspirin"
                        placeholderTextColor={colors.textLight}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Dosage *</Text>
                    <TextInput
                        style={styles.input}
                        value={dosage}
                        onChangeText={setDosage}
                        placeholder="e.g., 100mg"
                        placeholderTextColor={colors.textLight}
                    />
                </View>

                <View style={styles.section}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Times *</Text>
                        <TouchableOpacity onPress={addTimeSlot} style={styles.addButton}>
                            <Ionicons name="add-circle" size={24} color={colors.primary} />
                            <Text style={styles.addButtonText}>Add Time</Text>
                        </TouchableOpacity>
                    </View>
                    {times.map((time, index) => (
                        <View key={index} style={styles.timeRow}>
                            <TextInput
                                style={[styles.input, styles.timeInput]}
                                value={time}
                                onChangeText={(value) => updateTime(index, value)}
                                placeholder="HH:MM (e.g., 08:00)"
                                placeholderTextColor={colors.textLight}
                            />
                            {times.length > 1 && (
                                <TouchableOpacity onPress={() => removeTimeSlot(index)}>
                                    <Ionicons name="close-circle" size={24} color={colors.error} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Notes (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Additional notes..."
                        placeholderTextColor={colors.textLight}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    headerTitle: {
        ...typography.h3,
    },
    saveButton: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '600',
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
    },
    section: {
        marginTop: spacing.lg,
    },
    label: {
        ...typography.body,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        ...typography.body,
        borderWidth: 1,
        borderColor: colors.border,
    },
    textArea: {
        height: 100,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    timeInput: {
        flex: 1,
        marginRight: spacing.sm,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButtonText: {
        ...typography.body,
        color: colors.primary,
        marginLeft: spacing.xs,
    },
    bottomPadding: {
        height: spacing.xl,
    },
});

export default AddMedicationScreen;
