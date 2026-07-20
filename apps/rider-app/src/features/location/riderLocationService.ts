import NativeRiderForegroundService from '../../../specs/NativeRiderForegroundService';
import {
    parseRiderLocation,
    type RiderLocation,
} from './riderLocation';

export const riderLocationService = {
    async getLatest(): Promise<RiderLocation | null> {
        const nativeLocation =
            await NativeRiderForegroundService
                .getLatestLocation();

        return parseRiderLocation(nativeLocation);
    },
};