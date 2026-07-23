import type { RiderLocation } from '../location/riderLocation';

export type LocationUploadItem = RiderLocation & {
    id: string;
    queuedAtMillis: number;
    attemptCount: number;
    lastAttemptAtMillis: number | null;
};

export type LocationUploadPayload = RiderLocation & {
    id: string;
};

function isFiniteNumber(
    value: unknown,
): value is number {
    return (
        typeof value === 'number' &&
        Number.isFinite(value)
    );
}

function isNullableFiniteNumber(
    value: unknown,
): value is number | null {
    return (
        value === null ||
        isFiniteNumber(value)
    );
}

function createLocationId(
    location: RiderLocation,
) {
    const latitude =
        location.latitude.toFixed(6);

    const longitude =
        location.longitude.toFixed(6);

    return [
        location.capturedAtMillis,
        latitude,
        longitude,
    ].join(':');
}

export function createLocationUploadItem(
    location: RiderLocation,
    queuedAtMillis = Date.now(),
): LocationUploadItem {
    return {
        id: createLocationId(location),
        latitude: location.latitude,
        longitude: location.longitude,
        accuracyMeters: location.accuracyMeters,
        speedMetersPerSecond:
            location.speedMetersPerSecond,
        capturedAtMillis:
            location.capturedAtMillis,
        queuedAtMillis,
        attemptCount: 0,
        lastAttemptAtMillis: null,
    };
}

export function toLocationUploadPayload(
    item: LocationUploadItem,
): LocationUploadPayload {
    return {
        id: item.id,
        latitude: item.latitude,
        longitude: item.longitude,
        accuracyMeters: item.accuracyMeters,
        speedMetersPerSecond:
            item.speedMetersPerSecond,
        capturedAtMillis:
            item.capturedAtMillis,
    };
}

export function parseLocationUploadItem(
    value: unknown,
): LocationUploadItem | null {
    if (
        typeof value !== 'object' ||
        value === null
    ) {
        return null;
    }

    const item =
        value as Record<string, unknown>;

    if (
        typeof item.id !== 'string' ||
        item.id.length === 0 ||
        !isFiniteNumber(item.latitude) ||
        !isFiniteNumber(item.longitude) ||
        !isFiniteNumber(item.accuracyMeters) ||
        !isNullableFiniteNumber(
            item.speedMetersPerSecond,
        ) ||
        !isFiniteNumber(item.capturedAtMillis) ||
        !isFiniteNumber(item.queuedAtMillis) ||
        !isFiniteNumber(item.attemptCount) ||
        !isNullableFiniteNumber(
            item.lastAttemptAtMillis,
        )
    ) {
        return null;
    }

    if (
        item.latitude < -90 ||
        item.latitude > 90 ||
        item.longitude < -180 ||
        item.longitude > 180 ||
        item.accuracyMeters < 0 ||
        (
            item.speedMetersPerSecond !== null &&
            item.speedMetersPerSecond < 0
        ) ||
        item.capturedAtMillis <= 0 ||
        item.queuedAtMillis <= 0 ||
        item.attemptCount < 0 ||
        !Number.isInteger(item.attemptCount) ||
        (
            item.lastAttemptAtMillis !== null &&
            item.lastAttemptAtMillis <= 0
        )
    ) {
        return null;
    }

    return {
        id: item.id,
        latitude: item.latitude,
        longitude: item.longitude,
        accuracyMeters: item.accuracyMeters,
        speedMetersPerSecond:
            item.speedMetersPerSecond,
        capturedAtMillis:
            item.capturedAtMillis,
        queuedAtMillis: item.queuedAtMillis,
        attemptCount: item.attemptCount,
        lastAttemptAtMillis:
            item.lastAttemptAtMillis,
    };
}

export function parseLocationUploadItems(
    value: unknown,
): LocationUploadItem[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map(parseLocationUploadItem)
        .filter(
            (
                item,
            ): item is LocationUploadItem =>
                item !== null,
        );
}