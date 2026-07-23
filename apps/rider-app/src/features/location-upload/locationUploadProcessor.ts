import type {
    LocationUploadClient,
} from './locationUploadClient';
import {
    toLocationUploadPayload,
} from './locationUploadItem';
import {
    locationUploadQueue,
} from './locationUploadQueue';

const DEFAULT_BATCH_SIZE = 20;

export const LOCATION_UPLOAD_RESULT = {
    idle: 'idle',
    uploaded: 'uploaded',
    failed: 'failed',
} as const;

export type LocationUploadResult =
    (typeof LOCATION_UPLOAD_RESULT)[keyof typeof LOCATION_UPLOAD_RESULT];

export type LocationUploadProcessResult = {
    result: LocationUploadResult;
    attemptedCount: number;
    uploadedCount: number;
    remainingCount: number;
};

export async function processLocationUploadQueue(
    client: LocationUploadClient,
    batchSize = DEFAULT_BATCH_SIZE,
): Promise<LocationUploadProcessResult> {
    const queue =
        await locationUploadQueue.getAll();

    if (queue.length === 0) {
        return {
            result: LOCATION_UPLOAD_RESULT.idle,
            attemptedCount: 0,
            uploadedCount: 0,
            remainingCount: 0,
        };
    }

    const normalizedBatchSize =
        Math.max(1, Math.floor(batchSize));

    const batch = queue.slice(
        0,
        normalizedBatchSize,
    );

    const ids = batch.map(item => item.id);

    await locationUploadQueue.markAttempt(ids);

    try {
        await client.upload(
            batch.map(toLocationUploadPayload),
        );

        await locationUploadQueue.removeByIds(
            ids,
        );

        return {
            result:
                LOCATION_UPLOAD_RESULT.uploaded,
            attemptedCount: batch.length,
            uploadedCount: batch.length,
            remainingCount:
                Math.max(
                    queue.length - batch.length,
                    0,
                ),
        };
    } catch {
        return {
            result:
                LOCATION_UPLOAD_RESULT.failed,
            attemptedCount: batch.length,
            uploadedCount: 0,
            remainingCount: queue.length,
        };
    }
}