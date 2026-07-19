import {
    useCallback,
    useEffect,
    useState,
} from 'react';
import {
    DEFAULT_DUTY_STATUS,
    DUTY_STATUS,
    type DutyStatus,
} from './dutyStatus';
import { dutyStatusStorage } from './dutyStatusStorage';
import { riderForegroundService } from '../foreground-service/riderForegroundService';

export function useDutyStatus() {
    const [status, setStatus] = useState<DutyStatus>(
        DEFAULT_DUTY_STATUS,
    );
    const [isRestoring, setIsRestoring] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function restoreDutyStatus() {
            try {
                const storedStatus =
                    await dutyStatusStorage.get();

                if (storedStatus === DUTY_STATUS.onDuty) {
                    try {
                        await riderForegroundService.start();
                    } catch {
                        await dutyStatusStorage
                            .set(DUTY_STATUS.offDuty)
                            .catch(() => undefined);

                        if (isMounted) {
                            setStatus(DUTY_STATUS.offDuty);
                        }

                        return;
                    }
                } else {
                    await riderForegroundService.stop();
                }

                if (isMounted) {
                    setStatus(storedStatus);
                }
            } catch {
                await riderForegroundService
                    .stop()
                    .catch(() => undefined);

                if (isMounted) {
                    setStatus(DEFAULT_DUTY_STATUS);
                }
            } finally {
                if (isMounted) {
                    setIsRestoring(false);
                }
            }
        }

        restoreDutyStatus();

        return () => {
            isMounted = false;
        };
    }, []);

    const toggleDutyStatus = useCallback(async () => {
        if (isRestoring || isSaving) {
            return;
        }

        setIsSaving(true);

        try {
            if (status === DUTY_STATUS.onDuty) {
                await riderForegroundService.stop();

                try {
                    await dutyStatusStorage.set(
                        DUTY_STATUS.offDuty,
                    );
                } catch (error) {
                    await riderForegroundService
                        .start()
                        .catch(() => undefined);

                    throw error;
                }

                setStatus(DUTY_STATUS.offDuty);
                return;
            }

            await riderForegroundService.start();

            try {
                await dutyStatusStorage.set(
                    DUTY_STATUS.onDuty,
                );
            } catch (error) {
                await riderForegroundService
                    .stop()
                    .catch(() => undefined);

                throw error;
            }

            setStatus(DUTY_STATUS.onDuty);
        } catch {
            setStatus(status);
        } finally {
            setIsSaving(false);
        }
    }, [
        isRestoring,
        isSaving,
        status,
    ]);

    return {
        isOnDuty: status === DUTY_STATUS.onDuty,
        isRestoring,
        isSaving,
        toggleDutyStatus,
    };
}