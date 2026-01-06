import { StyleSheet } from 'react-native';
import colors from './colors';

export const typography = {
    h1: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600',
        color: colors.textPrimary,
        letterSpacing: -0.3,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    h4: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.textPrimary,
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.textSecondary,
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
        color: colors.textLight,
        lineHeight: 16,
    },
    button: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textWhite,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 999,
};

export const shadows = {
    small: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
};

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        ...shadows.small,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    spaceBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

export default {
    typography,
    spacing,
    borderRadius,
    shadows,
    globalStyles,
};
