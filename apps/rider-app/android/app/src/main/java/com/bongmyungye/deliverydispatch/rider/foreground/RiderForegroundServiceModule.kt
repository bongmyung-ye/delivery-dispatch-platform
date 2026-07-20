package com.bongmyungye.deliverydispatch.rider.foreground

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import com.bongmyungye.deliverydispatch.rider.location.RiderLocationStore
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext

class RiderForegroundServiceModule(
    reactContext: ReactApplicationContext,
) : NativeRiderForegroundServiceSpec(reactContext) {

    override fun getName(): String = NAME

    override fun startService(promise: Promise) {
        if (!hasRequiredPermissions()) {
            promise.reject(
                ERROR_MISSING_PERMISSIONS,
                "위치와 알림 권한이 없어 기사 운행 서비스를 시작할 수 없습니다.",
            )
            return
        }

        try {
            val intent =
                RiderForegroundService.createStartIntent(
                    reactApplicationContext,
                )

            ContextCompat.startForegroundService(
                reactApplicationContext,
                intent,
            )

            promise.resolve(true)
        } catch (exception: Exception) {
            promise.reject(
                ERROR_START_SERVICE,
                "기사 운행 서비스를 시작하지 못했습니다.",
                exception,
            )
        }
    }

    override fun stopService(promise: Promise) {
        try {
            val isStopped =
                reactApplicationContext.stopService(
                    RiderForegroundService.createStopIntent(
                        reactApplicationContext,
                    ),
                )

            promise.resolve(isStopped)
        } catch (exception: Exception) {
            promise.reject(
                ERROR_STOP_SERVICE,
                "기사 운행 서비스를 종료하지 못했습니다.",
                exception,
            )
        }
    }

    override fun getLatestLocation(promise: Promise) {
        val location = RiderLocationStore.getLatest()

        if (location == null) {
            promise.resolve(null)
            return
        }

        val result =
            Arguments.createMap().apply {
                putDouble(
                    "latitude",
                    location.latitude,
                )
                putDouble(
                    "longitude",
                    location.longitude,
                )
                putDouble(
                    "accuracyMeters",
                    location.accuracyMeters,
                )

                if (
                    location.speedMetersPerSecond == null
                ) {
                    putNull("speedMetersPerSecond")
                } else {
                    putDouble(
                        "speedMetersPerSecond",
                        location.speedMetersPerSecond,
                    )
                }

                putDouble(
                    "capturedAtMillis",
                    location.capturedAtMillis.toDouble(),
                )
            }

        promise.resolve(result)
    }

    private fun hasRequiredPermissions(): Boolean {
        val hasFineLocation =
            ContextCompat.checkSelfPermission(
                reactApplicationContext,
                Manifest.permission.ACCESS_FINE_LOCATION,
            ) == PackageManager.PERMISSION_GRANTED

        val hasNotifications =
            Build.VERSION.SDK_INT <
                Build.VERSION_CODES.TIRAMISU ||
                ContextCompat.checkSelfPermission(
                    reactApplicationContext,
                    Manifest.permission.POST_NOTIFICATIONS,
                ) == PackageManager.PERMISSION_GRANTED

        return hasFineLocation && hasNotifications
    }

    companion object {
        const val NAME =
            "NativeRiderForegroundService"

        private const val ERROR_MISSING_PERMISSIONS =
            "E_RIDER_SERVICE_PERMISSION"

        private const val ERROR_START_SERVICE =
            "E_RIDER_SERVICE_START"

        private const val ERROR_STOP_SERVICE =
            "E_RIDER_SERVICE_STOP"
    }
}