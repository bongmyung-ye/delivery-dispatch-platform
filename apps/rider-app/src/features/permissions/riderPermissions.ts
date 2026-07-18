export const RIDER_PERMISSION_STATUS = {
    checking: 'checking',
    granted: 'granted',
    approximate: 'approximate',
    denied: 'denied',
    blocked: 'blocked',
} as const;

export type RiderPermissionStatus =
    (typeof RIDER_PERMISSION_STATUS)[keyof typeof RIDER_PERMISSION_STATUS];

export type RiderPermissions = {
    location: RiderPermissionStatus;
    notifications: RiderPermissionStatus;
};

export const INITIAL_RIDER_PERMISSIONS: RiderPermissions = {
    location: RIDER_PERMISSION_STATUS.checking,
    notifications: RIDER_PERMISSION_STATUS.checking,
};

export function hasRequiredRiderPermissions(
    permissions: RiderPermissions,
) {
    return (
        permissions.location === RIDER_PERMISSION_STATUS.granted &&
        permissions.notifications === RIDER_PERMISSION_STATUS.granted
    );
}