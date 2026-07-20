import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import {
    StatusBadge,
    type StatusBadgeTone,
} from '../components/StatusBadge';
import { useDutyStatus } from '../features/duty-status/useDutyStatus';
import {
    RIDER_LOCATION_STATUS,
    type RiderLocationStatus,
} from '../features/location/riderLocation';
import { useRiderLocation } from '../features/location/useRiderLocation';
import {
    RIDER_PERMISSION_STATUS,
    type RiderPermissionStatus,
} from '../features/permissions/riderPermissions';
import { useRiderPermissions } from '../features/permissions/useRiderPermissions';
import { colors, radius, spacing } from '../theme/tokens';

type IndicatorTone =
    | 'granted'
    | 'warning'
    | 'neutral';

type StatusIndicator = {
    label: string;
    tone: IndicatorTone;
};

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

function getLocationPermissionIndicator(
    status: RiderPermissionStatus,
): StatusIndicator {
    switch (status) {
        case RIDER_PERMISSION_STATUS.granted:
            return {
                label: '정확한 위치',
                tone: 'granted',
            };
        case RIDER_PERMISSION_STATUS.approximate:
            return {
                label: '근사 위치',
                tone: 'warning',
            };
        case RIDER_PERMISSION_STATUS.blocked:
            return {
                label: '설정 필요',
                tone: 'warning',
            };
        case RIDER_PERMISSION_STATUS.denied:
            return {
                label: '권한 필요',
                tone: 'warning',
            };
        default:
            return {
                label: '확인 중',
                tone: 'neutral',
            };
    }
}

function getNotificationPermissionIndicator(
    status: RiderPermissionStatus,
): StatusIndicator {
    switch (status) {
        case RIDER_PERMISSION_STATUS.granted:
            return {
                label: '허용됨',
                tone: 'granted',
            };
        case RIDER_PERMISSION_STATUS.blocked:
            return {
                label: '설정 필요',
                tone: 'warning',
            };
        case RIDER_PERMISSION_STATUS.denied:
        case RIDER_PERMISSION_STATUS.approximate:
            return {
                label: '권한 필요',
                tone: 'warning',
            };
        default:
            return {
                label: '확인 중',
                tone: 'neutral',
            };
    }
}

function getLocationTrackingIndicator(
    status: RiderLocationStatus,
): StatusIndicator {
    switch (status) {
        case RIDER_LOCATION_STATUS.available:
            return {
                label: '수집 중',
                tone: 'granted',
            };
        case RIDER_LOCATION_STATUS.waiting:
            return {
                label: '수신 대기',
                tone: 'warning',
            };
        case RIDER_LOCATION_STATUS.error:
            return {
                label: '확인 필요',
                tone: 'warning',
            };
        default:
            return {
                label: '운행 대기',
                tone: 'neutral',
            };
    }
}

function formatCapturedAt(
    capturedAtMillis: number,
) {
    const capturedAt = new Date(capturedAtMillis);

    const hours = String(
        capturedAt.getHours(),
    ).padStart(2, '0');

    const minutes = String(
        capturedAt.getMinutes(),
    ).padStart(2, '0');

    const seconds = String(
        capturedAt.getSeconds(),
    ).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

export function RiderHomeScreen() {
    const {
        isOnDuty,
        isRestoring,
        isSaving,
        toggleDutyStatus,
    } = useDutyStatus();

    const {
        permissions,
        permissionMessage,
        hasRequiredPermissions,
        isChecking,
        isRequesting,
        requestRequiredPermissions,
    } = useRiderPermissions();

    const {
        location,
        status: locationStatus,
        message: locationMessage,
    } = useRiderLocation(isOnDuty);

    const locationPermission =
        getLocationPermissionIndicator(
            permissions.location,
        );

    const notificationPermission =
        getNotificationPermissionIndicator(
            permissions.notifications,
        );

    const locationTracking =
        getLocationTrackingIndicator(
            locationStatus,
        );

    const isDutyStatusBusy =
        isRestoring || isSaving;

    const isPermissionBusy =
        isChecking || isRequesting;

    const isDutyActionBusy =
        isDutyStatusBusy ||
        (!isOnDuty && isPermissionBusy);

    const statusLabel = isRestoring
        ? '상태 확인 중'
        : isOnDuty
            ? '운행 중'
            : '운행 대기';

    const statusTone: StatusBadgeTone =
        isRestoring
            ? 'neutral'
            : isOnDuty
                ? 'active'
                : 'inactive';

    const dispatchTitle = isRestoring
        ? '운행 상태를 확인하고 있습니다'
        : isOnDuty
            ? '배차 요청 대기 중'
            : '현재 운행을 쉬고 있습니다';

    const dispatchDescription = isRestoring
        ? '저장된 운행 상태를 불러오는 중입니다.'
        : isOnDuty
            ? '새로운 주문이 들어오면 바로 알려드릴게요.'
            : '운행을 시작하면 주변 배차 요청을 받을 수 있습니다.';

    const dutyButtonTitle = isRestoring
        ? '운행 상태 확인 중'
        : isSaving
            ? '상태 저장 중'
            : !isOnDuty && isChecking
                ? '권한 확인 중'
                : !isOnDuty && isRequesting
                    ? '권한 요청 중'
                    : isOnDuty
                        ? '운행 종료'
                        : '운행 시작';

    const locationAccuracy = location
        ? `${Math.round(location.accuracyMeters)}m`
        : '-';

    const locationSpeed =
        location?.speedMetersPerSecond === null ||
            location?.speedMetersPerSecond === undefined
            ? '-'
            : `${Math.round(
                location.speedMetersPerSecond * 3.6,
            )}km/h`;

    const locationDescription = location
        ? `최근 수신 ${formatCapturedAt(
            location.capturedAtMillis,
        )}`
        : locationMessage ??
        '운행을 시작하면 GPS 위치 수집이 시작됩니다.';

    async function handleDutyToggle() {
        if (isOnDuty) {
            await toggleDutyStatus();
            return;
        }

        if (hasRequiredPermissions) {
            await toggleDutyStatus();
            return;
        }

        const isGranted =
            await requestRequiredPermissions();

        if (isGranted) {
            await toggleDutyStatus();
        }
    }

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
                        <Text style={styles.appName}>
                            Dispatch Rider
                        </Text>

                        <Text style={styles.headerDescription}>
                            오늘도 안전하게 운행하세요.
                        </Text>
                    </View>

                    <StatusBadge
                        label={statusLabel}
                        tone={statusTone}
                    />
                </View>

                <View style={styles.accountCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarLabel}>
                            D
                        </Text>
                    </View>

                    <View style={styles.accountContent}>
                        <Text style={styles.accountName}>
                            기사 계정
                        </Text>

                        <Text style={styles.accountArea}>
                            대구 달서구
                        </Text>
                    </View>
                </View>

                <View>
                    <Text style={styles.sectionTitle}>
                        오늘 운행
                    </Text>

                    <View style={styles.summaryRow}>
                        {summaryItems.map(item => (
                            <View
                                key={item.label}
                                style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>
                                    {item.label}
                                </Text>

                                <Text style={styles.summaryValue}>
                                    {item.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.dispatchCard}>
                    <View style={styles.dispatchHeader}>
                        <View style={styles.dispatchIcon}>
                            <Text style={styles.dispatchIconLabel}>
                                D
                            </Text>
                        </View>

                        <View style={styles.dispatchHeaderText}>
                            <Text style={styles.dispatchTitle}>
                                {dispatchTitle}
                            </Text>

                            <Text style={styles.dispatchDescription}>
                                {dispatchDescription}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.systemStatus}>
                        <View style={styles.systemStatusItem}>
                            <Text style={styles.systemStatusLabel}>
                                위치 권한
                            </Text>

                            <Text
                                style={[
                                    styles.systemStatusValue,
                                    indicatorValueStyles[
                                    locationPermission.tone
                                    ],
                                ]}
                                testID="location-permission-status">
                                {locationPermission.label}
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.systemStatusItem}>
                            <Text style={styles.systemStatusLabel}>
                                알림 권한
                            </Text>

                            <Text
                                style={[
                                    styles.systemStatusValue,
                                    indicatorValueStyles[
                                    notificationPermission.tone
                                    ],
                                ]}
                                testID="notification-permission-status">
                                {notificationPermission.label}
                            </Text>
                        </View>
                    </View>

                    {permissionMessage ? (
                        <View style={styles.permissionNotice}>
                            <Text style={styles.permissionNoticeText}>
                                {permissionMessage}
                            </Text>
                        </View>
                    ) : null}

                    <PrimaryButton
                        disabled={isDutyActionBusy}
                        onPress={handleDutyToggle}
                        testID="duty-toggle-button"
                        title={dutyButtonTitle}
                    />
                </View>

                <View style={styles.locationCard}>
                    <View style={styles.locationHeader}>
                        <Text style={styles.locationTitle}>
                            GPS 위치
                        </Text>

                        <Text
                            style={[
                                styles.locationStatus,
                                indicatorValueStyles[
                                locationTracking.tone
                                ],
                            ]}
                            testID="gps-tracking-status">
                            {locationTracking.label}
                        </Text>
                    </View>

                    <View style={styles.locationMetrics}>
                        <View style={styles.locationMetricItem}>
                            <Text style={styles.locationMetricLabel}>
                                정확도
                            </Text>

                            <Text
                                style={styles.locationMetricValue}
                                testID="gps-accuracy">
                                {locationAccuracy}
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.locationMetricItem}>
                            <Text style={styles.locationMetricLabel}>
                                속도
                            </Text>

                            <Text
                                style={styles.locationMetricValue}
                                testID="gps-speed">
                                {locationSpeed}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.locationDescription}>
                        {locationDescription}
                    </Text>
                </View>

                <View style={styles.noticeCard}>
                    <Text style={styles.noticeTitle}>
                        운행 전 확인
                    </Text>

                    <Text style={styles.noticeDescription}>
                        위치 권한과 알림 권한을 허용하면 운행 중 배차
                        요청과 위치 상태를 안정적으로 확인할 수 있습니다.
                    </Text>
                </View>

                <Text style={styles.syncText}>
                    마지막 동기화 · 방금 전
                </Text>
            </ScrollView>
        </SafeAreaView>
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
        fontSize: 14,
        fontWeight: '700',
        marginTop: spacing.xs,
    },
    systemStatusGranted: {
        color: colors.success,
    },
    systemStatusWarning: {
        color: colors.warning,
    },
    systemStatusNeutral: {
        color: colors.neutral,
    },
    divider: {
        backgroundColor: colors.border,
        height: 32,
        width: 1,
    },
    permissionNotice: {
        backgroundColor: colors.warningSoft,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    permissionNoticeText: {
        color: colors.warning,
        fontSize: 13,
        lineHeight: 19,
    },
    locationCard: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius.md,
        borderWidth: 1,
        gap: spacing.lg,
        padding: spacing.lg,
    },
    locationHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    locationTitle: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '700',
    },
    locationStatus: {
        fontSize: 13,
        fontWeight: '700',
    },
    locationMetrics: {
        alignItems: 'center',
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.md,
        flexDirection: 'row',
        paddingVertical: spacing.md,
    },
    locationMetricItem: {
        alignItems: 'center',
        flex: 1,
    },
    locationMetricLabel: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    locationMetricValue: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '800',
        marginTop: spacing.xs,
    },
    locationDescription: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 19,
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

const indicatorValueStyles = {
    granted: styles.systemStatusGranted,
    warning: styles.systemStatusWarning,
    neutral: styles.systemStatusNeutral,
};