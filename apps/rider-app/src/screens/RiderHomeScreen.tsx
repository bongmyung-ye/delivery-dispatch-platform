import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusBadge } from '../components/StatusBadge';
import { colors, radius, spacing } from '../theme/tokens';

const summaryItems = [
    {
        label: '배차',
        value: '0건',
    },
    {
        label: '완료',
        value: '0건',
    },
    {
        label: '예상 수입',
        value: '0원',
    },
];

export function RiderHomeScreen() {
    const [isOnDuty, setIsOnDuty] = useState(false);

    const statusLabel = isOnDuty ? '운행 중' : '운행 대기';
    const statusTone = isOnDuty ? 'active' : 'inactive';

    return (
        <SafeAreaView
            edges={['top', 'left', 'right']}
            style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                testID="rider-home-screen">
                <View style={styles.header}>
                    <View>
                        <Text style={styles.appName}>Dispatch Rider</Text>
                        <Text style={styles.headerDescription}>
                            오늘도 안전하게 운행하세요.
                        </Text>
                    </View>

                    <StatusBadge label={statusLabel} tone={statusTone} />
                </View>

                <View style={styles.accountCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarLabel}>D</Text>
                    </View>

                    <View style={styles.accountContent}>
                        <Text style={styles.accountName}>기사 계정</Text>
                        <Text style={styles.accountArea}>대구 달서구</Text>
                    </View>
                </View>

                <View>
                    <Text style={styles.sectionTitle}>오늘 운행</Text>

                    <View style={styles.summaryRow}>
                        {summaryItems.map(item => (
                            <View key={item.label} style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>{item.label}</Text>
                                <Text style={styles.summaryValue}>{item.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.dispatchCard}>
                    <View style={styles.dispatchHeader}>
                        <View style={styles.dispatchIcon}>
                            <Text style={styles.dispatchIconLabel}>D</Text>
                        </View>

                        <View style={styles.dispatchHeaderText}>
                            <Text style={styles.dispatchTitle}>
                                {isOnDuty ? '배차 요청 대기 중' : '현재 운행을 쉬고 있습니다'}
                            </Text>
                            <Text style={styles.dispatchDescription}>
                                {isOnDuty
                                    ? '새로운 주문이 들어오면 바로 알려드릴게요.'
                                    : '운행을 시작하면 주변 배차 요청을 받을 수 있습니다.'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.systemStatus}>
                        <View style={styles.systemStatusItem}>
                            <Text style={styles.systemStatusLabel}>위치 전송</Text>
                            <Text style={styles.systemStatusValue}>준비됨</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.systemStatusItem}>
                            <Text style={styles.systemStatusLabel}>배차 알림</Text>
                            <Text style={styles.systemStatusValue}>허용됨</Text>
                        </View>
                    </View>

                    <PrimaryButton
                        onPress={() => setIsOnDuty(current => !current)}
                        testID="duty-toggle-button"
                        title={isOnDuty ? '운행 종료' : '운행 시작'}
                    />
                </View>

                <View style={styles.noticeCard}>
                    <Text style={styles.noticeTitle}>운행 전 확인</Text>
                    <Text style={styles.noticeDescription}>
                        위치 권한과 배터리 사용 설정을 확인하면 백그라운드에서도 배차
                        상태를 안정적으로 유지할 수 있습니다.
                    </Text>
                </View>

                <Text style={styles.syncText}>마지막 동기화 · 방금 전</Text>
            </ScrollView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: colors.background,
        flex: 1,
    },
    content: {
        gap: spacing.xxl,
        padding: spacing.xl,
        paddingBottom: spacing.xxxl,
    },
    header: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    appName: {
        color: colors.textPrimary,
        fontSize: 22,
        fontWeight: '800',
    },
    headerDescription: {
        color: colors.textSecondary,
        fontSize: 14,
        marginTop: spacing.xs,
    },
    accountCard: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius.lg,
        borderWidth: 1,
        flexDirection: 'row',
        padding: spacing.lg,
    },
    avatar: {
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        height: 48,
        justifyContent: 'center',
        width: 48,
    },
    avatarLabel: {
        color: colors.surface,
        fontSize: 20,
        fontWeight: '800',
    },
    accountContent: {
        marginLeft: spacing.md,
    },
    accountName: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    accountArea: {
        color: colors.textSecondary,
        fontSize: 14,
        marginTop: spacing.xs,
    },
    sectionTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '800',
        marginBottom: spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    summaryCard: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius.md,
        borderWidth: 1,
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
    },
    summaryLabel: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    summaryValue: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '800',
        marginTop: spacing.sm,
    },
    dispatchCard: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.xl,
        padding: spacing.xl,
    },
    dispatchHeader: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    dispatchIcon: {
        alignItems: 'center',
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.md,
        height: 52,
        justifyContent: 'center',
        width: 52,
    },
    dispatchIconLabel: {
        color: colors.primary,
        fontSize: 20,
        fontWeight: '900',
    },
    dispatchHeaderText: {
        flex: 1,
        marginLeft: spacing.md,
    },
    dispatchTitle: {
        color: colors.textPrimary,
        fontSize: 17,
        fontWeight: '800',
    },
    dispatchDescription: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        marginTop: spacing.xs,
    },
    systemStatus: {
        alignItems: 'center',
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.md,
        flexDirection: 'row',
        paddingVertical: spacing.md,
    },
    systemStatusItem: {
        alignItems: 'center',
        flex: 1,
    },
    systemStatusLabel: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    systemStatusValue: {
        color: colors.success,
        fontSize: 14,
        fontWeight: '700',
        marginTop: spacing.xs,
    },
    divider: {
        backgroundColor: colors.border,
        height: 32,
        width: 1,
    },
    noticeCard: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius.md,
        borderWidth: 1,
        padding: spacing.lg,
    },
    noticeTitle: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '700',
    },
    noticeDescription: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 21,
        marginTop: spacing.sm,
    },
    syncText: {
        color: colors.textSecondary,
        fontSize: 12,
        textAlign: 'center',
    },
});