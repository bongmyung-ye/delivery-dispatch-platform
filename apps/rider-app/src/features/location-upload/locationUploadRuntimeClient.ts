import type {
    LocationUploadClient,
} from './locationUploadClient';

export const locationUploadRuntimeClient:
    LocationUploadClient = {
    async upload() {
        throw new Error(
            '위치 전송 API가 아직 연결되지 않았습니다.',
        );
    },
};