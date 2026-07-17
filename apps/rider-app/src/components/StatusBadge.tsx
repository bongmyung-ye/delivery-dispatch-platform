import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

export type StatusBadgeTone =
    | 'active'
    | 'inactive'
    | 'neutral';

type StatusBadgeProps = {
    label: string;
    tone: StatusBadgeTone;
};

export function StatusBadge({
    label,
    tone,
}: StatusBadgeProps) {
    return (
        <View
            style={[
                styles.container,
                containerStyles[tone],
            ]}>
            <View
                style={[
                    styles.indicator,
                    indicatorStyles[tone],
                ]}
            />

            <Text
                style={[
                    styles.label,
                    labelStyles[tone],
                ]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        borderRadius: radius.pill,
        flexDirection: 'row',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    activeContainer: {
        backgroundColor: colors.successSoft,
    },
    inactiveContainer: {
        backgroundColor: colors.warningSoft,
    },
    neutralContainer: {
        backgroundColor: colors.neutralSoft,
    },
    indicator: {
        borderRadius: radius.pill,
        height: 8,
        width: 8,
    },
    activeIndicator: {
        backgroundColor: colors.success,
    },
    inactiveIndicator: {
        backgroundColor: colors.warning,
    },
    neutralIndicator: {
        backgroundColor: colors.neutral,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
    },
    activeLabel: {
        color: colors.success,
    },
    inactiveLabel: {
        color: colors.warning,
    },
    neutralLabel: {
        color: colors.neutral,
    },
});

const containerStyles = {
    active: styles.activeContainer,
    inactive: styles.inactiveContainer,
    neutral: styles.neutralContainer,
};

const indicatorStyles = {
    active: styles.activeIndicator,
    inactive: styles.inactiveIndicator,
    neutral: styles.neutralIndicator,
};

const labelStyles = {
    active: styles.activeLabel,
    inactive: styles.inactiveLabel,
    neutral: styles.neutralLabel,
};