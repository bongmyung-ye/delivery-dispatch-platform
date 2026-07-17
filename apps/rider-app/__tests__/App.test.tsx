import React from 'react';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

test('기사 앱 기본 화면을 렌더링한다', async () => {
  let renderer: ReturnType<typeof ReactTestRenderer.create> | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  expect(
    renderer?.root.findByProps({
      testID: 'rider-home-screen',
    }),
  ).toBeTruthy();

  expect(
    renderer?.root.findByProps({
      testID: 'duty-toggle-button',
    }),
  ).toBeTruthy();
});