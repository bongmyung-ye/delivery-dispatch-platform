import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RiderLocation } from '../location/riderLocation';
import {
    createLocationUploadItem,
    parseLocationUploadItems,
    type LocationUploadItem,
} from './locationUploadItem';

const STORAGE_KEY =
    '@delivery-dispatch/location-upload-queue:v1';

const MAX_QUEUE_LENGTH = 500;

let operationChain: Promise<void> =
    Promise.resolve();

function runExclusive<T>(
    operation: () => Promise<T>,
): Promise<T> {
    const result =
        operationChain.then(
            operation,
            operation,
        );

    operationChain = result.then(
        () => undefined,
        () => undefined,
    );

    return result;
}

async function readQueue() {
    const storedValue =
        await AsyncStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
        return [];
    }

    try {
        return parseLocationUploadItems(
            JSON.parse(storedValue),
        );
    } catch {
        return [];
    }
}

async function writeQueue(
    queue: LocationUploadItem[],
) {
    if (queue.length === 0) {
        await AsyncStorage.removeItem(STORAGE_KEY);
        return;
    }

    await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(queue),
    );
}

export const locationUploadQueue = {
    async getAll(): Promise<LocationUploadItem[]> {
        return runExclusive(readQueue);
    },

    async enqueue(
        location: RiderLocation,
    ): Promise<LocationUploadItem> {
        return runExclusive(async () => {
            const queue = await readQueue();

            const nextItem =
                createLocationUploadItem(location);

            const existingItem = queue.find(
                item => item.id === nextItem.id,
            );

            if (existingItem) {
                return existingItem;
            }

            const nextQueue = [
                ...queue,
                nextItem,
            ].slice(-MAX_QUEUE_LENGTH);

            await writeQueue(nextQueue);

            return nextItem;
        });
    },

    async markAttempt(
        ids: readonly string[],
        attemptedAtMillis = Date.now(),
    ): Promise<void> {
        if (ids.length === 0) {
            return;
        }

        await runExclusive(async () => {
            const idSet = new Set(ids);
            const queue = await readQueue();

            const nextQueue = queue.map(item => {
                if (!idSet.has(item.id)) {
                    return item;
                }

                return {
                    ...item,
                    attemptCount:
                        item.attemptCount + 1,
                    lastAttemptAtMillis:
                        attemptedAtMillis,
                };
            });

            await writeQueue(nextQueue);
        });
    },

    async removeByIds(
        ids: readonly string[],
    ): Promise<void> {
        if (ids.length === 0) {
            return;
        }

        await runExclusive(async () => {
            const idSet = new Set(ids);
            const queue = await readQueue();

            const nextQueue = queue.filter(
                item => !idSet.has(item.id),
            );

            await writeQueue(nextQueue);
        });
    },

    async clear(): Promise<void> {
        await runExclusive(async () => {
            await AsyncStorage.removeItem(
                STORAGE_KEY,
            );
        });
    },
};