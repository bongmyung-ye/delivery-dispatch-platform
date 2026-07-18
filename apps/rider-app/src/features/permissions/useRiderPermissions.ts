import {
    AppState,
    type AppStateStatus,
} from 'react-native';
import {
    useCallback,
    useEffect,
    useState,
} from 'react';
import { riderPermissionService } from './riderPermissionService';
import {
    hasRequiredRiderPermissions,
    INITIAL_RIDER_PERMISSIONS,
    RIDER_PERMISSION_STATUS,
    type RiderPermissions,
} from './riderPermissions';

function getPermissionMessage(
    permissions: RiderPermissions,
) {
    if (
        permissions.location ===
        RIDER_PERMISSION_STATUS.approximate
    ) {
        return '운행을 시작하려면 정확한 위치 권한이 필요합니다.';
    }

    if (
        permissions.location ===
        RIDER_PERMISSION_STATUS.blocked
    ) {
        return '앱 설정에서 정확한 위치 권한을 허용해 주세요.';
    }

    if (
        permissions.notifications ===
        RIDER_PERMISSION_STATUS.blocked
    ) {
        return '앱 설정에서 알림 권한을 허용해 주세요.';
    }

    if (
        permissions.location !==
        RIDER_PERMISSION_STATUS.granted
    ) {
        return '운행을 시작하려면 위치 권한이 필요합니다.';
    }

    if (
        permissions.notifications !==
        RIDER_PERMISSION_STATUS.granted
    ) {
        return '운행을 시작하려면 알림 권한이 필요합니다.';
    }

    return null;
}

export function useRiderPermissions() {
    const [permissions, setPermissions] =
        useState<RiderPermissions>(
            INITIAL_RIDER_PERMISSIONS,
        );
    const [isChecking, setIsChecking] = useState(true);
    const [isRequesting, setIsRequesting] = useState(false);
    const [permissionMessage, setPermissionMessage] =
        useState<string | null>(null);

    const refreshPermissions = useCallback(async () => {
        setIsChecking(true);

        try {
            const nextPermissions =
                await riderPermissionService.check();

            setPermissions(nextPermissions);
            setPermissionMessage(
                getPermissionMessage(nextPermissions),
            );

            return nextPermissions;
        } catch {
            setPermissionMessage(
                '권한 상태를 확인하지 못했습니다.',
            );

            return null;
        } finally {
            setIsChecking(false);
        }
    }, []);

    useEffect(() => {
        refreshPermissions();

        const subscription = AppState.addEventListener(
            'change',
            (nextState: AppStateStatus) => {
                if (nextState === 'active') {
                    refreshPermissions();
                }
            },
        );

        return () => {
            subscription.remove();
        };
    }, [refreshPermissions]);

    const requestRequiredPermissions =
        useCallback(async () => {
            if (isChecking || isRequesting) {
                return false;
            }

            setIsRequesting(true);
            setPermissionMessage(null);

            try {
                const nextPermissions =
                    await riderPermissionService.requestRequired(
                        permissions,
                    );

                setPermissions(nextPermissions);

                const hasRequiredPermissions =
                    hasRequiredRiderPermissions(
                        nextPermissions,
                    );

                if (!hasRequiredPermissions) {
                    setPermissionMessage(
                        getPermissionMessage(
                            nextPermissions,
                        ),
                    );
                }

                return hasRequiredPermissions;
            } catch {
                setPermissionMessage(
                    '권한 요청을 완료하지 못했습니다.',
                );

                return false;
            } finally {
                setIsRequesting(false);
            }
        }, [
            isChecking,
            isRequesting,
            permissions,
        ]);

    return {
        permissions,
        permissionMessage,
        hasRequiredPermissions:
            hasRequiredRiderPermissions(permissions),
        isChecking,
        isRequesting,
        refreshPermissions,
        requestRequiredPermissions,
    };
}