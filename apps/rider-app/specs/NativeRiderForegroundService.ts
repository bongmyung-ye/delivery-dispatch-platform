import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type NativeRiderLocation = {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    speedMetersPerSecond: number | null;
    capturedAtMillis: number;
};

export interface Spec extends TurboModule {
    startService(): Promise<boolean>;
    stopService(): Promise<boolean>;
    getLatestLocation(): Promise<NativeRiderLocation | null>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
    'NativeRiderForegroundService',
);