import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import {
    DEFAULT_DUTY_STATUS,
    isDutyStatus,
    type DutyStatus,
} from './dutyStatus';

const storage = createAsyncStorage('dispatch-rider');
const DUTY_STATUS_KEY = 'duty-status';

export const dutyStatusStorage = {
    async get(): Promise<DutyStatus> {
        const storedStatus = await storage.getItem(
            DUTY_STATUS_KEY,
        );

        return isDutyStatus(storedStatus)
            ? storedStatus
            : DEFAULT_DUTY_STATUS;
    },

    async set(status: DutyStatus): Promise<void> {
        await storage.setItem(DUTY_STATUS_KEY, status);

        const storedStatus = await storage.getItem(
            DUTY_STATUS_KEY,
        );

        if (storedStatus !== status) {
            throw new Error(
                '운행 상태가 기기에 정상적으로 저장되지 않았습니다.',
            );
        }
    },
};