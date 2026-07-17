export const DUTY_STATUS = {
    offDuty: 'offDuty',
    onDuty: 'onDuty',
} as const;

export type DutyStatus =
    (typeof DUTY_STATUS)[keyof typeof DUTY_STATUS];

export const DEFAULT_DUTY_STATUS: DutyStatus =
    DUTY_STATUS.offDuty;

export function isDutyStatus(
    value: string | null,
): value is DutyStatus {
    return (
        value === DUTY_STATUS.offDuty ||
        value === DUTY_STATUS.onDuty
    );
}