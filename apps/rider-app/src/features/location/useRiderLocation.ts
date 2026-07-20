import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    RIDER_LOCATION_STATUS,
    type RiderLocation,
    type RiderLocationStatus,
} from './riderLocation';
import { riderLocationService } from './riderLocationService';

const LOCATION_REFRESH_INTERVAL_MILLIS =
    5_000;

export function useRiderLocation(
    isOnDuty: boolean,
) {
    const [location, setLocation] =
        useState<RiderLocation | null>(null);

    const [status, setStatus] =
        useState<RiderLocationStatus>(
            RIDER_LOCATION_STATUS.idle,
        );

    const [message, setMessage] =
        useState<string | null>(null);

    const isRefreshingRef = useRef(false);

    const refreshLocation =
        useCallback(async () => {
            if (
                !isOnDuty ||
                isRefreshingRef.current
            ) {
                return null;
            }

            isRefreshingRef.current = true;

            try {
                const nextLocation =
                    await riderLocationService.getLatest();

                setLocation(nextLocation);

                if (nextLocation) {
                    setStatus(
                        RIDER_LOCATION_STATUS.available,
                    );
                    setMessage(null);
                } else {
                    setStatus(
                        RIDER_LOCATION_STATUS.waiting,
                    );
                    setMessage(
                        'GPS 위치를 기다리는 중입니다.',
                    );
                }

                return nextLocation;
            } catch {
                setStatus(RIDER_LOCATION_STATUS.error);
                setMessage(
                    '현재 위치를 확인하지 못했습니다.',
                );

                return null;
            } finally {
                isRefreshingRef.current = false;
            }
        }, [isOnDuty]);

    useEffect(() => {
        if (!isOnDuty) {
            setLocation(null);
            setStatus(RIDER_LOCATION_STATUS.idle);
            setMessage(null);
            return;
        }

        setStatus(RIDER_LOCATION_STATUS.waiting);
        setMessage(
            'GPS 위치를 기다리는 중입니다.',
        );

        refreshLocation();

        const refreshTimer = setInterval(
            () => {
                refreshLocation();
            },
            LOCATION_REFRESH_INTERVAL_MILLIS,
        );

        return () => {
            clearInterval(refreshTimer);
            isRefreshingRef.current = false;
        };
    }, [isOnDuty, refreshLocation]);

    return {
        location,
        status,
        message,
        refreshLocation,
    };
}