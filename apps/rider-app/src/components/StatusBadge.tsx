import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

type StatusBadgeProps = {
    label: string;
    tone: 'active' | 'inactive';
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
    const isActive = tone === 'active';

    return (
        <View
            style={[
                styles.container,
                isActive ? styles.activeContainer : styles.inactiveContainer,
            ]}>
            <View
                style={[
                    styles.indicator,
                    isActive ? styles.activeIndicator : styles.inactiveIndicator,
                ]}
            />
            <Text
                style={[
                    styles.label,
                    isActive ? styles.activeLabel : styles.inactiveLabel,
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
});