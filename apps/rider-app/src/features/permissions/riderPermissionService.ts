import {
    PermissionsAndroid,
    Platform,
} from 'react-native';
import {
    RIDER_PERMISSION_STATUS,
    type RiderPermissions,
    type RiderPermissionStatus,
} from './riderPermissions';

const {
    ACCESS_COARSE_LOCATION,
    ACCESS_FINE_LOCATION,
    POST_NOTIFICATIONS,
} = PermissionsAndroid.PERMISSIONS;

const {
    GRANTED,
    NEVER_ASK_AGAIN,
} = PermissionsAndroid.RESULTS;

function getAndroidApiLevel() {
    if (typeof Platform.Version === 'number') {
        return Platform.Version;
    }

    return Number.parseInt(Platform.Version, 10);
}

async function checkLocationPermission(): Promise<RiderPermissionStatus> {
    if (Platform.OS !== 'android') {
        return RIDER_PERMISSION_STATUS.granted;
    }

    const [hasFineLocation, hasCoarseLocation] = await Promise.all([
        PermissionsAndroid.check(ACCESS_FINE_LOCATION),
        PermissionsAndroid.check(ACCESS_COARSE_LOCATION),
    ]);

    if (hasFineLocation) {
        return RIDER_PERMISSION_STATUS.granted;
    }

    if (hasCoarseLocation) {
        return RIDER_PERMISSION_STATUS.approximate;
    }

    return RIDER_PERMISSION_STATUS.denied;
}

async function requestLocationPermission(): Promise<RiderPermissionStatus> {
    if (Platform.OS !== 'android') {
        return RIDER_PERMISSION_STATUS.granted;
    }

    const result = await PermissionsAndroid.requestMultiple([
        ACCESS_FINE_LOCATION,
        ACCESS_COARSE_LOCATION,
    ]);

    const fineLocationResult = result[ACCESS_FINE_LOCATION];
    const coarseLocationResult = result[ACCESS_COARSE_LOCATION];

    if (fineLocationResult === GRANTED) {
        return RIDER_PERMISSION_STATUS.granted;
    }

    if (coarseLocationResult === GRANTED) {
        return RIDER_PERMISSION_STATUS.approximate;
    }

    if (
        fineLocationResult === NEVER_ASK_AGAIN ||
        coarseLocationResult === NEVER_ASK_AGAIN
    ) {
        return RIDER_PERMISSION_STATUS.blocked;
    }

    return RIDER_PERMISSION_STATUS.denied;
}

async function checkNotificationPermission(): Promise<RiderPermissionStatus> {
    if (
        Platform.OS !== 'android' ||
        getAndroidApiLevel() < 33
    ) {
        return RIDER_PERMISSION_STATUS.granted;
    }

    const isGranted = await PermissionsAndroid.check(
        POST_NOTIFICATIONS,
    );

    return isGranted
        ? RIDER_PERMISSION_STATUS.granted
        : RIDER_PERMISSION_STATUS.denied;
}

async function requestNotificationPermission(): Promise<RiderPermissionStatus> {
    if (
        Platform.OS !== 'android' ||
        getAndroidApiLevel() < 33
    ) {
        return RIDER_PERMISSION_STATUS.granted;
    }

    const result = await PermissionsAndroid.request(
        POST_NOTIFICATIONS,
    );

    if (result === GRANTED) {
        return RIDER_PERMISSION_STATUS.granted;
    }

    if (result === NEVER_ASK_AGAIN) {
        return RIDER_PERMISSION_STATUS.blocked;
    }

    return RIDER_PERMISSION_STATUS.denied;
}

export const riderPermissionService = {
    async check(): Promise<RiderPermissions> {
        const [location, notifications] = await Promise.all([
            checkLocationPermission(),
            checkNotificationPermission(),
        ]);

        return {
            location,
            notifications,
        };
    },

    async requestRequired(
        currentPermissions: RiderPermissions,
    ): Promise<RiderPermissions> {
        const location =
            currentPermissions.location ===
                RIDER_PERMISSION_STATUS.granted
                ? currentPermissions.location
                : await requestLocationPermission();

        const notifications =
            currentPermissions.notifications ===
                RIDER_PERMISSION_STATUS.granted
                ? currentPermissions.notifications
                : await requestNotificationPermission();

        return {
            location,
            notifications,
        };
    },
};