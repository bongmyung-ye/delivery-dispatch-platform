import React from 'react';
import {
    act,
    create,
    type ReactTestRenderer,
} from 'react-test-renderer';
import type {
    RiderLocation,
} from '../src/features/location/riderLocation';
import type {
    LocationUploadClient,
} from '../src/features/location-upload/locationUploadClient';
import {
    useLocationUpload,
} from '../src/features/location-upload/useLocationUpload';
import {
    locationUploadQueue,
} from '../src/features/location-upload/locationUploadQueue';
import {
    processLocationUploadQueue,
} from '../src/features/location-upload/locationUploadProcessor';

jest.mock(
    '../src/features/location-upload/locationUploadQueue',
    () => ({
        locationUploadQueue: {
            enqueue: jest.fn(),
        },
    }),
);

jest.mock(
    '../src/features/location-upload/locationUploadProcessor',
    () => ({
        processLocationUploadQueue: jest.fn(),
    }),
);

const mockedQueue =
    jest.mocked(locationUploadQueue);

const mockedProcessQueue =
    jest.mocked(processLocationUploadQueue);

const location: RiderLocation = {
    latitude: 35.8562,
    longitude: 128.5504,
    accuracyMeters: 5,
    speedMetersPerSecond: 0,
    capturedAtMillis: 1784500000000,
};

const client: LocationUploadClient = {
    upload: jest.fn(),
};

type TestComponentProps = {
    isOnDuty: boolean;
    location: RiderLocation | null;
};

function TestComponent({
    isOnDuty,
    location: currentLocation,
}: TestComponentProps) {
    useLocationUpload({
        isOnDuty,
        location: currentLocation,
        client,
    });

    return null;
}

async function flushPromises() {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
}

beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    mockedQueue.enqueue.mockResolvedValue({
        ...location,
        id: [
            location.capturedAtMillis,
            location.latitude.toFixed(6),
            location.longitude.toFixed(6),
        ].join(':'),
        queuedAtMillis: 1784500001000,
        attemptCount: 0,
        lastAttemptAtMillis: null,
    });

    mockedProcessQueue.mockResolvedValue({
        result: 'idle',
        attemptedCount: 0,
        uploadedCount: 0,
        remainingCount: 0,
    });
});

afterEach(() => {
    jest.useRealTimers();
});

test('운행 중 새 위치를 큐에 저장한다', async () => {
    let renderer: ReactTestRenderer;

    await act(async () => {
        renderer = create(
            <TestComponent
                isOnDuty
                location={location}
            />,
        );
    });

    await flushPromises();

    expect(
        mockedQueue.enqueue,
    ).toHaveBeenCalledWith(location);

    expect(
        mockedProcessQueue,
    ).toHaveBeenCalled();

    await act(async () => {
        renderer.unmount();
    });
});

test('같은 위치는 다시 큐에 저장하지 않는다', async () => {
    let renderer: ReactTestRenderer;

    await act(async () => {
        renderer = create(
            <TestComponent
                isOnDuty
                location={location}
            />,
        );
    });

    await flushPromises();

    await act(async () => {
        renderer.update(
            <TestComponent
                isOnDuty
                location={{ ...location }}
            />,
        );
    });

    await flushPromises();

    expect(
        mockedQueue.enqueue,
    ).toHaveBeenCalledTimes(1);

    await act(async () => {
        renderer.unmount();
    });
});

test('저장에 실패한 위치는 다음 갱신에서 다시 저장한다', async () => {
    mockedQueue.enqueue.mockRejectedValueOnce(
        new Error('위치 저장 실패'),
    );

    let renderer: ReactTestRenderer;

    await act(async () => {
        renderer = create(
            <TestComponent
                isOnDuty
                location={location}
            />,
        );
    });

    await flushPromises();

    await act(async () => {
        renderer.update(
            <TestComponent
                isOnDuty
                location={{ ...location }}
            />,
        );
    });

    await flushPromises();

    expect(
        mockedQueue.enqueue,
    ).toHaveBeenCalledTimes(2);

    await act(async () => {
        renderer.unmount();
    });
});

test('운행 대기 중에는 위치를 저장하지 않는다', async () => {
    let renderer: ReactTestRenderer;

    await act(async () => {
        renderer = create(
            <TestComponent
                isOnDuty={false}
                location={location}
            />,
        );
    });

    await flushPromises();

    expect(
        mockedQueue.enqueue,
    ).not.toHaveBeenCalled();

    await act(async () => {
        renderer.unmount();
    });
});

test('운행 중 일정 주기로 전송을 재시도한다', async () => {
    let renderer: ReactTestRenderer;

    await act(async () => {
        renderer = create(
            <TestComponent
                isOnDuty
                location={null}
            />,
        );
    });

    await flushPromises();

    mockedProcessQueue.mockClear();

    await act(async () => {
        jest.advanceTimersByTime(15_000);
    });

    await flushPromises();

    expect(
        mockedProcessQueue,
    ).toHaveBeenCalledTimes(1);

    await act(async () => {
        renderer.unmount();
    });
});

test('운행 종료 시 남은 큐 전송을 시도한다', async () => {
    let renderer: ReactTestRenderer;

    await act(async () => {
        renderer = create(
            <TestComponent
                isOnDuty
                location={null}
            />,
        );
    });

    await flushPromises();

    mockedProcessQueue.mockClear();

    await act(async () => {
        renderer.update(
            <TestComponent
                isOnDuty={false}
                location={null}
            />,
        );
    });

    await flushPromises();

    expect(
        mockedProcessQueue,
    ).toHaveBeenCalledTimes(1);

    await act(async () => {
        renderer.unmount();
    });
});