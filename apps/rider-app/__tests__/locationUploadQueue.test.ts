import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RiderLocation } from '../src/features/location/riderLocation';
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

const firstLocation: RiderLocation = {
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

test('수집한 위치를 전송 큐에 저장한다', async () => {
    const item =
        await locationUploadQueue.enqueue(
            firstLocation,
        );

    const queue =
        await locationUploadQueue.getAll();

    expect(queue).toHaveLength(1);
    expect(queue[0]).toEqual(item);
    expect(item.attemptCount).toBe(0);
});

test('동일한 위치를 중복 저장하지 않는다', async () => {
    await locationUploadQueue.enqueue(
        firstLocation,
    );

    await locationUploadQueue.enqueue(
        firstLocation,
    );

    const queue =
        await locationUploadQueue.getAll();

    expect(queue).toHaveLength(1);
});

test('전송 시도 횟수와 시각을 기록한다', async () => {
    const item =
        await locationUploadQueue.enqueue(
            firstLocation,
        );

    await locationUploadQueue.markAttempt(
        [item.id],
        1784500005000,
    );

    const queue =
        await locationUploadQueue.getAll();

    expect(queue[0].attemptCount).toBe(1);

    expect(
        queue[0].lastAttemptAtMillis,
    ).toBe(1784500005000);
});

test('전송 완료된 위치를 큐에서 제거한다', async () => {
    const item =
        await locationUploadQueue.enqueue(
            firstLocation,
        );

    await locationUploadQueue.removeByIds([
        item.id,
    ]);

    expect(
        await locationUploadQueue.getAll(),
    ).toEqual([]);
});