import {
    parseRiderLocation,
    type RiderLocation,
} from '../src/features/location/riderLocation';

test('정상적인 네이티브 위치를 변환한다', () => {
    const nativeLocation = {
        latitude: 35.8562,
        longitude: 128.5504,
        accuracyMeters: 8.5,
        speedMetersPerSecond: 3.2,
        capturedAtMillis: 1784500000000,
    };

    const expectedLocation: RiderLocation = {
        latitude: 35.8562,
        longitude: 128.5504,
        accuracyMeters: 8.5,
        speedMetersPerSecond: 3.2,
        capturedAtMillis: 1784500000000,
    };

    expect(
        parseRiderLocation(nativeLocation),
    ).toEqual(expectedLocation);
});

test('속도가 없는 위치를 변환한다', () => {
    const location = parseRiderLocation({
        latitude: 35.8562,
        longitude: 128.5504,
        accuracyMeters: 12,
        speedMetersPerSecond: null,
        capturedAtMillis: 1784500000000,
    });

    expect(
        location?.speedMetersPerSecond,
    ).toBeNull();
});

test('범위를 벗어난 위치를 거부한다', () => {
    expect(
        parseRiderLocation({
            latitude: 120,
            longitude: 128.5504,
            accuracyMeters: 12,
            speedMetersPerSecond: null,
            capturedAtMillis: 1784500000000,
        }),
    ).toBeNull();
});

test('잘못된 정확도와 속도를 거부한다', () => {
    expect(
        parseRiderLocation({
            latitude: 35.8562,
            longitude: 128.5504,
            accuracyMeters: -1,
            speedMetersPerSecond: -3,
            capturedAtMillis: 1784500000000,
        }),
    ).toBeNull();
});