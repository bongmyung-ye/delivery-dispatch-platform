package com.bongmyungye.deliverydispatch.rider.foreground

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import com.bongmyungye.deliverydispatch.rider.MainActivity
import com.bongmyungye.deliverydispatch.rider.R
import com.bongmyungye.deliverydispatch.rider.location.RiderLocationTracker

class RiderForegroundService : Service() {

    private lateinit var locationTracker: RiderLocationTracker

    override fun onCreate() {
        super.onCreate()

        createNotificationChannel()

        locationTracker =
            RiderLocationTracker(this) { exception ->
                Log.e(
                    TAG,
                    "Location tracking stopped unexpectedly.",
                    exception,
                )

                stopForegroundService()
            }
    }

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int,
    ): Int {
        if (intent?.action == ACTION_STOP) {
            stopForegroundService()
            return START_NOT_STICKY
        }

        if (!hasRequiredPermissions()) {
            Log.w(
                TAG,
                "Foreground service permissions are not granted.",
            )

            stopSelf(startId)
            return START_NOT_STICKY
        }

        return try {
            ServiceCompat.startForeground(
                this,
                NOTIFICATION_ID,
                createNotification(),
                if (
                    Build.VERSION.SDK_INT >=
                    Build.VERSION_CODES.R
                ) {
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
                } else {
                    0
                },
            )

            if (!locationTracker.start()) {
                Log.w(
                    TAG,
                    "Location tracking could not be started.",
                )

                stopForegroundService()
                return START_NOT_STICKY
            }

            START_NOT_STICKY
        } catch (exception: RuntimeException) {
            Log.e(
                TAG,
                "Failed to start rider foreground service.",
                exception,
            )

            locationTracker.stop()
            stopForegroundService()
            START_NOT_STICKY
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        locationTracker.stop()
        stopForeground(STOP_FOREGROUND_REMOVE)

        super.onDestroy()
    }

    private fun hasRequiredPermissions(): Boolean {
        val hasFineLocation =
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION,
            ) == PackageManager.PERMISSION_GRANTED

        val hasNotifications =
            Build.VERSION.SDK_INT <
                Build.VERSION_CODES.TIRAMISU ||
                ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS,
                ) == PackageManager.PERMISSION_GRANTED

        return hasFineLocation && hasNotifications
    }

    private fun createNotification() =
        NotificationCompat.Builder(
            this,
            NOTIFICATION_CHANNEL_ID,
        )
            .setSmallIcon(
                R.drawable.ic_stat_rider_location,
            )
            .setContentTitle(
                getString(
                    R.string.rider_service_notification_title,
                ),
            )
            .setContentText(
                getString(
                    R.string.rider_service_notification_text,
                ),
            )
            .setContentIntent(createContentIntent())
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOnlyAlertOnce(true)
            .setOngoing(true)
            .build()

    private fun createContentIntent(): PendingIntent {
        val intent =
            Intent(this, MainActivity::class.java).apply {
                flags =
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP
            }

        return PendingIntent.getActivity(
            this,
            CONTENT_INTENT_REQUEST_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or
                PendingIntent.FLAG_IMMUTABLE,
        )
    }

    private fun createNotificationChannel() {
        if (
            Build.VERSION.SDK_INT <
            Build.VERSION_CODES.O
        ) {
            return
        }

        val channel =
            NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                getString(
                    R.string.rider_service_channel_name,
                ),
                NotificationManager.IMPORTANCE_LOW,
            ).apply {
                description =
                    getString(
                        R.string
                            .rider_service_channel_description,
                    )

                setShowBadge(false)
            }

        getSystemService(
            NotificationManager::class.java,
        ).createNotificationChannel(channel)
    }

    private fun stopForegroundService() {
        if (::locationTracker.isInitialized) {
            locationTracker.stop()
        }

        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    companion object {
        private const val TAG =
            "RiderForegroundService"

        private const val NOTIFICATION_CHANNEL_ID =
            "rider_duty_status"

        private const val NOTIFICATION_ID = 41001

        private const val CONTENT_INTENT_REQUEST_CODE =
            41002

        private const val ACTION_START =
            "com.bongmyungye.deliverydispatch.rider.action.START_DUTY_SERVICE"

        private const val ACTION_STOP =
            "com.bongmyungye.deliverydispatch.rider.action.STOP_DUTY_SERVICE"

        fun createStartIntent(context: Context) =
            Intent(
                context,
                RiderForegroundService::class.java,
            ).setAction(ACTION_START)

        fun createStopIntent(context: Context) =
            Intent(
                context,
                RiderForegroundService::class.java,
            ).setAction(ACTION_STOP)
    }
}