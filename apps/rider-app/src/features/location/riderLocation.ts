export const RIDER_LOCATION_STATUS = {
    idle: 'idle',
    waiting: 'waiting',
    available: 'available',
    error: 'error',
} as const;

export type RiderLocationStatus =
    (typeof RIDER_LOCATION_STATUS)[keyof typeof RIDER_LOCATION_STATUS];

export type RiderLocation = {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    speedMetersPerSecond: number | null;
    capturedAtMillis: number;
};

function isFiniteNumber(
    value: unknown,
): value is number {
    return (
        typeof value === 'number' &&
        Number.isFinite(value)
    );
}

export function parseRiderLocation(
    value: unknown,
): RiderLocation | null {
    if (
        typeof value !== 'object' ||
        value === null
    ) {
        return null;
    }

    const location =
        value as Record<string, unknown>;

    if (
        !isFiniteNumber(location.latitude) ||
        !isFiniteNumber(location.longitude) ||
        !isFiniteNumber(location.accuracyMeters) ||
        !isFiniteNumber(location.capturedAtMillis)
    ) {
        return null;
    }

    if (
        location.latitude < -90 ||
        location.latitude > 90 ||
        location.longitude < -180 ||
        location.longitude > 180 ||
        location.accuracyMeters < 0 ||
        location.capturedAtMillis <= 0
    ) {
        return null;
    }

    const speed = location.speedMetersPerSecond;

    if (
        speed !== null &&
        (
            !isFiniteNumber(speed) ||
            speed < 0
        )
    ) {
        return null;
    }

    return {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracyMeters: location.accuracyMeters,
        speedMetersPerSecond: speed,
        capturedAtMillis: location.capturedAtMillis,
    };
}