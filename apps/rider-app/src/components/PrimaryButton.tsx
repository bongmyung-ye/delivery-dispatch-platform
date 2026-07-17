import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

type PrimaryButtonProps = {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    testID?: string;
};

export function PrimaryButton({
    title,
    onPress,
    disabled = false,
    testID,
}: PrimaryButtonProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={onPress}
            testID={testID}
            style={({ pressed }) => [
                styles.button,
                pressed && !disabled && styles.buttonPressed,
                disabled && styles.buttonDisabled,
            ]}>
            <Text style={styles.label}>{title}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        justifyContent: 'center',
        minHeight: 52,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    buttonPressed: {
        backgroundColor: colors.primaryPressed,
    },
    buttonDisabled: {
        backgroundColor: colors.primaryDisabled,
    },
    label: {
        color: colors.surface,
        fontSize: 16,
        fontWeight: '700',
    },
});