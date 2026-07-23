import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RiderLocation } from '../src/features/location/riderLocation';
import {
    createMockLocationUploadClient,
} from '../src/features/location-upload/locationUploadClient';
import {
    LOCATION_UPLOAD_RESULT,
    processLocationUploadQueue,
} from '../src/features/location-upload/locationUploadProcessor';
import {
    locationUploadQueue,
} from '../src/features/location-upload/locationUploadQueue';

jest.mock(
    '@react-native-async-storage/async-storage',
    () => ({
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    }),
);

const mockedAsyncStorage =
    jest.mocked(AsyncStorage);

const location: RiderLocation = {
    latitude: 35.8562,
    longitude: 128.5504,
    accuracyMeters: 5,
    speedMetersPerSecond: 0,
    capturedAtMillis: 1784500000000,
};

let storedValue: string | null;

beforeEach(() => {
    jest.clearAllMocks();
    storedValue = null;

    mockedAsyncStorage.getItem
        .mockImplementation(async () => storedValue);

    mockedAsyncStorage.setItem
        .mockImplementation(
            async (_key, value) => {
                storedValue = value;
            },
        );

    mockedAsyncStorage.removeItem
        .mockImplementation(async () => {
            storedValue = null;
        });
});

test('전송 성공 시 위치를 큐에서 제거한다', async () => {
    await locationUploadQueue.enqueue(
        location,
    );

    const result =
        await processLocationUploadQueue(
            createMockLocationUploadClient(),
        );

    expect(result.result).toBe(
        LOCATION_UPLOAD_RESULT.uploaded,
    );

    expect(result.uploadedCount).toBe(1);

    expect(
        await locationUploadQueue.getAll(),
    ).toEqual([]);
});

test('전송 실패 시 위치를 큐에 유지한다', async () => {
    await locationUploadQueue.enqueue(
        location,
    );

    const result =
        await processLocationUploadQueue(
            createMockLocationUploadClient({
                shouldFail: true,
            }),
        );

    const queue =
        await locationUploadQueue.getAll();

    expect(result.result).toBe(
        LOCATION_UPLOAD_RESULT.failed,
    );

    expect(queue).toHaveLength(1);
    expect(queue[0].attemptCount).toBe(1);
});

test('남아 있는 위치를 다음 시도에서 전송한다', async () => {
    await locationUploadQueue.enqueue(
        location,
    );

    await processLocationUploadQueue(
        createMockLocationUploadClient({
            shouldFail: true,
        }),
    );

    const result =
        await processLocationUploadQueue(
            createMockLocationUploadClient(),
        );

    expect(result.result).toBe(
        LOCATION_UPLOAD_RESULT.uploaded,
    );

    expect(
        await locationUploadQueue.getAll(),
    ).toEqual([]);
});