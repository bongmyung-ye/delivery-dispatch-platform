package com.bongmyungye.deliverydispatch.rider.location

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.os.Looper
import android.util.Log
import androidx.core.content.ContextCompat
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority

class RiderLocationTracker(
    context: Context,
    private val onTrackingError: (Exception) -> Unit,
) {

    private val applicationContext =
        context.applicationContext

    private val fusedLocationClient =
        LocationServices.getFusedLocationProviderClient(
            applicationContext,
        )

    private val locationRequest =
        LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            UPDATE_INTERVAL_MILLIS,
        )
            .setMinUpdateIntervalMillis(
                MIN_UPDATE_INTERVAL_MILLIS,
            )
            .setMinUpdateDistanceMeters(
                MIN_UPDATE_DISTANCE_METERS,
            )
            .setWaitForAccurateLocation(false)
            .build()

    private val locationCallback =
        object : LocationCallback() {
            override fun onLocationResult(
                locationResult: LocationResult,
            ) {
                val location =
                    locationResult.lastLocation ?: return

                RiderLocationStore.update(location)
            }
        }

    @Volatile
    private var isTracking = false

    @SuppressLint("MissingPermission")
    fun start(): Boolean {
        if (isTracking) {
            return true
        }

        if (!hasFineLocationPermission()) {
            Log.w(
                TAG,
                "Fine location permission is not granted.",
            )
            return false
        }

        return try {
            RiderLocationStore.clear()
            isTracking = true

            fusedLocationClient
                .requestLocationUpdates(
                    locationRequest,
                    locationCallback,
                    Looper.getMainLooper(),
                )
                .addOnFailureListener { exception ->
                    isTracking = false

                    Log.e(
                        TAG,
                        "Failed to request location updates.",
                        exception,
                    )

                    onTrackingError(exception)
                }

            true
        } catch (exception: SecurityException) {
            isTracking = false

            Log.e(
                TAG,
                "Location permission was revoked.",
                exception,
            )

            onTrackingError(exception)
            false
        } catch (exception: RuntimeException) {
            isTracking = false

            Log.e(
                TAG,
                "Failed to start location tracking.",
                exception,
            )

            onTrackingError(exception)
            false
        }
    }

    fun stop() {
        if (!isTracking) {
            return
        }

        isTracking = false

        fusedLocationClient
            .removeLocationUpdates(locationCallback)
            .addOnFailureListener { exception ->
                Log.e(
                    TAG,
                    "Failed to remove location updates.",
                    exception,
                )
            }
    }

    private fun hasFineLocationPermission(): Boolean =
        ContextCompat.checkSelfPermission(
            applicationContext,
            Manifest.permission.ACCESS_FINE_LOCATION,
        ) == PackageManager.PERMISSION_GRANTED

    companion object {
        private const val TAG = "RiderLocationTracker"

        private const val UPDATE_INTERVAL_MILLIS =
            10_000L

        private const val MIN_UPDATE_INTERVAL_MILLIS =
            5_000L

        private const val MIN_UPDATE_DISTANCE_METERS =
            10f
    }
}