import React from 'react';
import { Text } from 'react-native';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { DUTY_STATUS } from '../src/features/duty-status/dutyStatus';
import { dutyStatusStorage } from '../src/features/duty-status/dutyStatusStorage';

jest.mock(
  'react-native-safe-area-context',
  () => mockSafeAreaContext,
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

const mockedDutyStatusStorage =
  jest.mocked(dutyStatusStorage);

beforeEach(() => {
  jest.clearAllMocks();

  mockedDutyStatusStorage.get.mockResolvedValue(
    DUTY_STATUS.offDuty,
  );

  mockedDutyStatusStorage.set.mockResolvedValue();
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
    throw new Error('기사 앱 렌더러를 생성하지 못했습니다.');
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

test('저장된 운행 상태를 복원한다', async () => {
  mockedDutyStatusStorage.get.mockResolvedValue(
    DUTY_STATUS.onDuty,
  );

  const renderer = await renderApp();
  const renderedText = getRenderedText(renderer);

  expect(mockedDutyStatusStorage.get).toHaveBeenCalledTimes(1);
  expect(renderedText).toContain('운행 중');
  expect(renderedText).toContain('운행 종료');
});

test('운행 시작 상태를 저장하고 화면에 반영한다', async () => {
  const renderer = await renderApp();

  const dutyButton = renderer.root.findByProps({
    testID: 'duty-toggle-button',
  });

  await ReactTestRenderer.act(async () => {
    await dutyButton.props.onPress();
  });

  const renderedText = getRenderedText(renderer);

  expect(mockedDutyStatusStorage.set).toHaveBeenCalledWith(
    DUTY_STATUS.onDuty,
  );

  expect(renderedText).toContain('운행 중');
  expect(renderedText).toContain('운행 종료');
});