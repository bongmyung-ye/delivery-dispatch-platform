import type {
    LocationUploadPayload,
} from './locationUploadItem';

export interface LocationUploadClient {
    upload(
        locations: readonly LocationUploadPayload[],
    ): Promise<void>;
}

type MockLocationUploadClientOptions = {
    shouldFail?: boolean;
    delayMillis?: number;
};

function wait(delayMillis: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, delayMillis);
    });
}

export function createMockLocationUploadClient(
    options: MockLocationUploadClientOptions = {},
): LocationUploadClient {
    const {
        shouldFail = false,
        delayMillis = 0,
    } = options;

    return {
        async upload() {
            if (delayMillis > 0) {
                await wait(delayMillis);
            }

            if (shouldFail) {
                throw new Error(
                    'Mock 위치 전송에 실패했습니다.',
                );
            }
        },
    };
}