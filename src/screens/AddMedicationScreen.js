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

    // Scheduling State
    const [frequencyType, setFrequencyType] = useState(existingMedication?.frequencyType || 'daily');
    const [selectedDays, setSelectedDays] = useState(existingMedication?.selectedDays || []);
    const [intervalDays, setIntervalDays] = useState(existingMedication?.intervalDays?.toString() || '1');

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

        if (frequencyType === 'specific_days' && selectedDays.length === 0) {
            Alert.alert('Error', 'Please select at least one day');
            return;
        }

        if (frequencyType === 'interval' && (!intervalDays || isNaN(parseInt(intervalDays)) || parseInt(intervalDays) < 1)) {
            Alert.alert('Error', 'Please enter a valid interval (days)');
            return;
        }

        const medication = new Medication({
            id: existingMedication?.id,
            name: name.trim(),
            dosage: dosage.trim(),
            times: times.filter(t => t.trim()),
            notes: notes.trim(),
            frequencyType,
            selectedDays,
            intervalDays: parseInt(intervalDays) || 1,
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

    const toggleDay = (dayIndex) => {
        if (selectedDays.includes(dayIndex)) {
            setSelectedDays(selectedDays.filter(d => d !== dayIndex));
        } else {
            setSelectedDays([...selectedDays, dayIndex].sort());
        }
    };

    const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

                {/* Frequency Selection */}
                <View style={styles.section}>
                    <Text style={styles.label}>Frequency</Text>
                    <View style={styles.frequencyContainer}>
                        {['daily', 'specific_days', 'interval'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.frequencyOption,
                                    frequencyType === type && styles.frequencyOptionSelected,
                                ]}
                                onPress={() => setFrequencyType(type)}
                            >
                                <Text
                                    style={[
                                        styles.frequencyText,
                                        frequencyType === type && styles.frequencyTextSelected,
                                    ]}
                                >
                                    {type === 'daily' ? 'Daily' : type === 'specific_days' ? 'Specific Days' : 'Interval'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {frequencyType === 'specific_days' && (
                        <View style={styles.daysContainer}>
                            {DAYS.map((day, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.dayButton,
                                        selectedDays.includes(index) && styles.dayButtonSelected,
                                    ]}
                                    onPress={() => toggleDay(index)}
                                >
                                    <Text
                                        style={[
                                            styles.dayText,
                                            selectedDays.includes(index) && styles.dayTextSelected,
                                        ]}
                                    >
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {frequencyType === 'interval' && (
                        <View style={styles.intervalContainer}>
                            <Text style={styles.intervalLabel}>Every</Text>
                            <TextInput
                                style={styles.intervalInput}
                                value={intervalDays}
                                onChangeText={setIntervalDays}
                                keyboardType="number-pad"
                            />
                            <Text style={styles.intervalLabel}>days</Text>
                        </View>
                    )}
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
    frequencyContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    frequencyOption: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.round,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
    },
    frequencyOptionSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    frequencyText: {
        ...typography.caption,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    frequencyTextSelected: {
        color: '#FFFFFF',
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.md,
    },
    dayButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    dayButtonSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    dayText: {
        ...typography.caption,
        fontWeight: 'bold',
        color: colors.textSecondary,
    },
    dayTextSelected: {
        color: '#FFFFFF',
    },
    intervalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
    },
    intervalLabel: {
        ...typography.body,
        marginHorizontal: spacing.sm,
    },
    intervalInput: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        ...typography.body,
        borderWidth: 1,
        borderColor: colors.border,
        width: 60,
        textAlign: 'center',
    },
});

export default AddMedicationScreen;
