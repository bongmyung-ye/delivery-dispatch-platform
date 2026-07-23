import React from 'react';
import { Text } from 'react-native';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { DUTY_STATUS } from '../src/features/duty-status/dutyStatus';
import { dutyStatusStorage } from '../src/features/duty-status/dutyStatusStorage';
import { riderForegroundService } from '../src/features/foreground-service/riderForegroundService';
import {
  RIDER_LOCATION_STATUS,
  type RiderLocation,
} from '../src/features/location/riderLocation';
import { useRiderLocation } from '../src/features/location/useRiderLocation';
import {
  RIDER_PERMISSION_STATUS,
  type RiderPermissions,
} from '../src/features/permissions/riderPermissions';
import { useRiderPermissions } from '../src/features/permissions/useRiderPermissions';

jest.mock(
  'react-native-safe-area-context',
  () => mockSafeAreaContext,
);

jest.mock(
  '../specs/NativeRiderForegroundService',
  () => ({
    __esModule: true,
    default: {
      startService: jest.fn(),
      stopService: jest.fn(),
      getLatestLocation: jest.fn(),
    },
  }),
);

jest.mock(
  '../src/features/duty-status/dutyStatusStorage',
  () => ({
    dutyStatusStorage: {
      get: jest.fn(),
      set: jest.fn(),
    },
  }),
);

jest.mock(
  '../src/features/foreground-service/riderForegroundService',
  () => ({
    riderForegroundService: {
      start: jest.fn(),
      stop: jest.fn(),
    },
  }),
);

jest.mock(
  '../src/features/location/useRiderLocation',
  () => ({
    useRiderLocation: jest.fn(),
  }),
);

jest.mock(
  '../src/features/location-upload/useLocationUpload',
  () => ({
    useLocationUpload: jest.fn(() => ({
      processQueue: jest.fn(),
    })),
  }),
);

jest.mock(
  '../src/features/permissions/useRiderPermissions',
);

const mockedDutyStatusStorage =
  jest.mocked(dutyStatusStorage);

const mockedRiderForegroundService =
  jest.mocked(riderForegroundService);

const mockedUseRiderLocation =
  jest.mocked(useRiderLocation);

const mockedUseRiderPermissions =
  jest.mocked(useRiderPermissions);

const grantedPermissions: RiderPermissions = {
  location: RIDER_PERMISSION_STATUS.granted,
  notifications: RIDER_PERMISSION_STATUS.granted,
};

const deniedPermissions: RiderPermissions = {
  location: RIDER_PERMISSION_STATUS.denied,
  notifications: RIDER_PERMISSION_STATUS.denied,
};

const currentLocation: RiderLocation = {
  latitude: 35.8562,
  longitude: 128.5504,
  accuracyMeters: 8.6,
  speedMetersPerSecond: 5,
  capturedAtMillis: 1784500000000,
};

const refreshPermissions = jest.fn();
const requestRequiredPermissions = jest.fn();
const refreshLocation = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  mockedDutyStatusStorage.get.mockResolvedValue(
    DUTY_STATUS.offDuty,
  );

  mockedDutyStatusStorage.set.mockResolvedValue();

  mockedRiderForegroundService.start.mockResolvedValue();
  mockedRiderForegroundService.stop.mockResolvedValue();

  refreshPermissions.mockResolvedValue(
    grantedPermissions,
  );

  requestRequiredPermissions.mockResolvedValue(true);
  refreshLocation.mockResolvedValue(null);

  mockedUseRiderPermissions.mockReturnValue({
    permissions: grantedPermissions,
    permissionMessage: null,
    hasRequiredPermissions: true,
    isChecking: false,
    isRequesting: false,
    refreshPermissions,
    requestRequiredPermissions,
  });

  mockedUseRiderLocation.mockReturnValue({
    location: null,
    status: RIDER_LOCATION_STATUS.idle,
    message: null,
    refreshLocation,
  });
});

async function renderApp() {
  let renderer:
    | ReturnType<typeof ReactTestRenderer.create>
    | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);

    await Promise.resolve();
    await Promise.resolve();
  });

  if (!renderer) {
    throw new Error(
      '기사 앱 렌더러를 생성하지 못했습니다.',
    );
  }

  return renderer;
}

function getRenderedText(
  renderer: ReturnType<typeof ReactTestRenderer.create>,
) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => {
      const children = node.props.children;

      if (typeof children === 'string') {
        return [children];
      }

      if (Array.isArray(children)) {
        return children.filter(
          (child): child is string =>
            typeof child === 'string',
        );
      }

      return [];
    });
}

test('저장된 운행 상태를 복원하고 서비스를 시작한다', async () => {
  mockedDutyStatusStorage.get.mockResolvedValue(
    DUTY_STATUS.onDuty,
  );

  const renderer = await renderApp();
  const renderedText = getRenderedText(renderer);

  expect(
    mockedDutyStatusStorage.get,
  ).toHaveBeenCalledTimes(1);

  expect(
    mockedRiderForegroundService.start,
  ).toHaveBeenCalledTimes(1);

  expect(renderedText).toContain('운행 중');
  expect(renderedText).toContain('운행 종료');
});

test('권한이 허용된 상태에서 운행과 서비스를 시작한다', async () => {
  const renderer = await renderApp();

  const dutyButton = renderer.root.findByProps({
    testID: 'duty-toggle-button',
  });

  await ReactTestRenderer.act(async () => {
    await dutyButton.props.onPress();
  });

  expect(
    requestRequiredPermissions,
  ).not.toHaveBeenCalled();

  expect(
    mockedRiderForegroundService.start,
  ).toHaveBeenCalledTimes(1);

  expect(
    mockedDutyStatusStorage.set,
  ).toHaveBeenCalledWith(
    DUTY_STATUS.onDuty,
  );
});

test('권한 요청이 거부되면 운행과 서비스를 시작하지 않는다', async () => {
  requestRequiredPermissions.mockResolvedValue(false);

  mockedUseRiderPermissions.mockReturnValue({
    permissions: deniedPermissions,
    permissionMessage:
      '운행을 시작하려면 위치 권한이 필요합니다.',
    hasRequiredPermissions: false,
    isChecking: false,
    isRequesting: false,
    refreshPermissions,
    requestRequiredPermissions,
  });

  const renderer = await renderApp();

  const dutyButton = renderer.root.findByProps({
    testID: 'duty-toggle-button',
  });

  await ReactTestRenderer.act(async () => {
    await dutyButton.props.onPress();
  });

  expect(
    requestRequiredPermissions,
  ).toHaveBeenCalledTimes(1);

  expect(
    mockedRiderForegroundService.start,
  ).not.toHaveBeenCalled();

  expect(
    mockedDutyStatusStorage.set,
  ).not.toHaveBeenCalled();
});

test('권한 요청이 허용되면 운행과 서비스를 시작한다', async () => {
  requestRequiredPermissions.mockResolvedValue(true);

  mockedUseRiderPermissions.mockReturnValue({
    permissions: deniedPermissions,
    permissionMessage:
      '운행을 시작하려면 위치 권한이 필요합니다.',
    hasRequiredPermissions: false,
    isChecking: false,
    isRequesting: false,
    refreshPermissions,
    requestRequiredPermissions,
  });

  const renderer = await renderApp();

  const dutyButton = renderer.root.findByProps({
    testID: 'duty-toggle-button',
  });

  await ReactTestRenderer.act(async () => {
    await dutyButton.props.onPress();
  });

  expect(
    requestRequiredPermissions,
  ).toHaveBeenCalledTimes(1);

  expect(
    mockedRiderForegroundService.start,
  ).toHaveBeenCalledTimes(1);

  expect(
    mockedDutyStatusStorage.set,
  ).toHaveBeenCalledWith(
    DUTY_STATUS.onDuty,
  );
});

test('운행을 종료하면 서비스와 저장 상태를 함께 종료한다', async () => {
  mockedDutyStatusStorage.get.mockResolvedValue(
    DUTY_STATUS.onDuty,
  );

  const renderer = await renderApp();

  const dutyButton = renderer.root.findByProps({
    testID: 'duty-toggle-button',
  });

  await ReactTestRenderer.act(async () => {
    await dutyButton.props.onPress();
  });

  expect(
    mockedRiderForegroundService.stop,
  ).toHaveBeenCalledTimes(1);

  expect(
    mockedDutyStatusStorage.set,
  ).toHaveBeenCalledWith(
    DUTY_STATUS.offDuty,
  );

  const renderedText = getRenderedText(renderer);

  expect(renderedText).toContain('운행 대기');
  expect(renderedText).toContain('운행 시작');
});

test('운행 중 최신 GPS 상태를 표시한다', async () => {
  mockedDutyStatusStorage.get.mockResolvedValue(
    DUTY_STATUS.onDuty,
  );

  mockedUseRiderLocation.mockReturnValue({
    location: currentLocation,
    status: RIDER_LOCATION_STATUS.available,
    message: null,
    refreshLocation,
  });

  const renderer = await renderApp();
  const renderedText = getRenderedText(renderer);

  expect(renderedText).toContain('수집 중');
  expect(renderedText).toContain('9m');
  expect(renderedText).toContain('18km/h');
});