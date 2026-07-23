import {
    useCallback,
    useEffect,
    useRef,
} from 'react';
import type {
    RiderLocation,
} from '../location/riderLocation';
import type {
    LocationUploadClient,
} from './locationUploadClient';
import {
    createLocationUploadItem,
} from './locationUploadItem';
import {
    processLocationUploadQueue,
} from './locationUploadProcessor';
import {
    locationUploadQueue,
} from './locationUploadQueue';
import {
    locationUploadRuntimeClient,
} from './locationUploadRuntimeClient';

const UPLOAD_RETRY_INTERVAL_MILLIS =
    15_000;

type UseLocationUploadOptions = {
    isOnDuty: boolean;
    location: RiderLocation | null;
    client?: LocationUploadClient;
};

export function useLocationUpload({
    isOnDuty,
    location,
    client = locationUploadRuntimeClient,
}: UseLocationUploadOptions) {
    const lastQueuedIdRef =
        useRef<string | null>(null);

    const isProcessingRef =
        useRef(false);

    const processQueue =
        useCallback(async () => {
            if (isProcessingRef.current) {
                return null;
            }

            isProcessingRef.current = true;

            try {
                return await processLocationUploadQueue(
                    client,
                );
            } finally {
                isProcessingRef.current = false;
            }
        }, [client]);

    useEffect(() => {
        if (
            !isOnDuty ||
            location === null
        ) {
            return;
        }

        const currentLocation = location;

        const locationId =
            createLocationUploadItem(
                currentLocation,
            ).id;

        if (
            lastQueuedIdRef.current === locationId
        ) {
            return;
        }

        let isCancelled = false;

        async function enqueueLocation() {
            try {
                await locationUploadQueue.enqueue(
                    currentLocation,
                );

                lastQueuedIdRef.current = locationId;

                if (!isCancelled) {
                    await processQueue();
                }
            } catch {
                return;
            }
        }

        enqueueLocation();

        return () => {
            isCancelled = true;
        };
    }, [
        isOnDuty,
        location,
        processQueue,
    ]);

    useEffect(() => {
        if (!isOnDuty) {
            lastQueuedIdRef.current = null;
            return;
        }

        processQueue();

        const retryTimer = setInterval(
            () => {
                processQueue();
            },
            UPLOAD_RETRY_INTERVAL_MILLIS,
        );

        return () => {
            clearInterval(retryTimer);

            processQueue();
        };
    }, [
        isOnDuty,
        processQueue,
    ]);

    return {
        processQueue,
    };
}