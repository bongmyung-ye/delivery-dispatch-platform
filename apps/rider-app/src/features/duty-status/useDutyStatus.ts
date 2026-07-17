import { useCallback, useEffect, useState } from 'react';
import {
    DEFAULT_DUTY_STATUS,
    DUTY_STATUS,
    type DutyStatus,
} from './dutyStatus';
import { dutyStatusStorage } from './dutyStatusStorage';

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
                const storedStatus = await dutyStatusStorage.get();

                if (isMounted) {
                    setStatus(storedStatus);
                }
            } catch {
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

        const nextStatus =
            status === DUTY_STATUS.onDuty
                ? DUTY_STATUS.offDuty
                : DUTY_STATUS.onDuty;

        setIsSaving(true);

        try {
            await dutyStatusStorage.set(nextStatus);
            setStatus(nextStatus);
        } catch {
            return;
        } finally {
            setIsSaving(false);
        }
    }, [isRestoring, isSaving, status]);

    return {
        isOnDuty: status === DUTY_STATUS.onDuty,
        isRestoring,
        isSaving,
        toggleDutyStatus,
    };
}