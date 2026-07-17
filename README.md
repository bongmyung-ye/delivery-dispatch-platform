# Delivery Dispatch Platform

배달대행 기사 앱과 관제 시스템을 단계적으로 개발하는 프로젝트입니다.

기사 앱은 React Native와 TypeScript를 기반으로 구성하며, 백그라운드 위치 추적처럼 Android 시스템과 직접 맞닿는 기능은 Kotlin으로 구현할 예정입니다.

## 프로젝트 구성

```text
apps/
└─ rider-app/    기사용 Android 앱
```

추후 관제 웹, 상점 주문 접수 웹, 주문·배차·위치·정산 서버를 추가할 예정입니다.

## 개발 환경

- Node.js 22.23.1
- React Native 0.86.0
- TypeScript 5
- JDK 17
- Android SDK Platform 35
- Android Emulator API 35

Windows에서는 React Native 네이티브 빌드 경로가 길어지지 않도록 저장소를 짧은 경로에 두는 것을 권장합니다.

```text
C:\dev\dispatch
```

## 기사 앱 실행

기사 앱 폴더로 이동합니다.

```powershell
cd apps\rider-app
nvm use 22.23.1
npm ci
```

Metro 개발 서버를 실행합니다.

```powershell
npm start
```

다른 터미널에서 Android 앱을 빌드하고 실행합니다.

```powershell
npm run android
```

## 검사

```powershell
npm run lint
npx tsc --noEmit
npm test -- --runInBand
```

Android 디버그 APK만 빌드할 때는 JDK 17이 적용된 상태에서 다음 명령을 실행합니다.

```powershell
cd android
.\gradlew.bat app:assembleDebug
```

생성된 APK는 다음 경로에서 확인할 수 있습니다.

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

## 개발 원칙

- 기능 단위로 이슈와 작업 브랜치를 관리
- 구현 후 타입 검사, 테스트, Android 빌드를 확인
- 운행 상태와 주문 상태가 유실되지 않도록 안정성을 우선
- 검증이 끝난 변경 사항만 기본 브랜치에 병합
