import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { typography, spacing, borderRadius } from '../theme/styles';

const Header = ({ title = 'Medtenance', showProfile = true }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {showProfile && (
                <View style={styles.profileIcon}>
                    <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    title: {
        ...typography.h2,
        color: colors.primary,
        fontWeight: '700',
    },
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Header;
