import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { typography, spacing, borderRadius, shadows } from '../theme/styles';

const MedicationCard = ({ medication, time, status = 'pending', onMarkTaken }) => {
    const getStatusIcon = () => {
        switch (status) {
            case 'taken':
                return { name: 'checkmark-circle', color: colors.taken };
            case 'missed':
                return { name: 'close-circle', color: colors.missed };
            default:
                return { name: 'ellipse-outline', color: colors.pending };
        }
    };

    const statusIcon = getStatusIcon();

    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <TouchableOpacity
                    style={styles.statusButton}
                    onPress={onMarkTaken}
                    disabled={status === 'taken'}
                >
                    <Ionicons
                        name={statusIcon.name}
                        size={32}
                        color={statusIcon.color}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.middleSection}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <Text style={styles.dosage}>{medication.dosage}</Text>
            </View>

            <View style={styles.rightSection}>
                <Text style={styles.time}>{time}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.small,
    },
    leftSection: {
        marginRight: spacing.md,
    },
    statusButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    middleSection: {
        flex: 1,
    },
    medicationName: {
        ...typography.h4,
        marginBottom: 2,
    },
    dosage: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    rightSection: {
        alignItems: 'flex-end',
    },
    time: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '600',
    },
});

export default MedicationCard;
