import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import colors from '../theme/colors';
import { typography, spacing, borderRadius, shadows } from '../theme/styles';

const screenWidth = Dimensions.get('window').width;

const AdherenceChart = ({ weeklyData = [85, 90, 75, 100, 95, 80, 90] }) => {
    const chartConfig = {
        backgroundColor: colors.backgroundSecondary,
        backgroundGradientFrom: colors.backgroundSecondary,
        backgroundGradientTo: colors.backgroundSecondary,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(139, 127, 214, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
        style: {
            borderRadius: borderRadius.md,
        },
        propsForBackgroundLines: {
            strokeDasharray: [1, 4],
            stroke: colors.chartGrid,
            strokeWidth: 1,
        },
        barPercentage: 0.7,
    };

    const data = {
        labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        datasets: [
            {
                data: weeklyData,
            },
        ],
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Adherence</Text>
            <View style={styles.chartContainer}>
                <BarChart
                    data={data}
                    width={screenWidth - spacing.md * 4}
                    height={200}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    fromZero={true}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginTop: spacing.md,
        ...shadows.small,
    },
    title: {
        ...typography.h3,
        marginBottom: spacing.md,
    },
    chartContainer: {
        alignItems: 'center',
    },
    chart: {
        borderRadius: borderRadius.md,
    },
});

export default AdherenceChart;
