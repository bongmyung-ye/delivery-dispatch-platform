import NativeRiderForegroundService from '../../../specs/NativeRiderForegroundService';

export const riderForegroundService = {
    async start(): Promise<void> {
        const isStarted =
            await NativeRiderForegroundService.startService();

        if (!isStarted) {
            throw new Error(
                '기사 운행 서비스를 시작하지 못했습니다.',
            );
        }
    },

    async stop(): Promise<void> {
        await NativeRiderForegroundService.stopService();
    },
};