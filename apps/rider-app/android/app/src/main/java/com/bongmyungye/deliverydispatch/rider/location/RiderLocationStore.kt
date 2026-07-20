package com.bongmyungye.deliverydispatch.rider.location

import android.location.Location
import java.util.concurrent.atomic.AtomicReference

object RiderLocationStore {

    private val latestLocation =
        AtomicReference<RiderLocationSnapshot?>(null)

    fun update(location: Location) {
        latestLocation.set(
            RiderLocationSnapshot(
                latitude = location.latitude,
                longitude = location.longitude,
                accuracyMeters = location.accuracy.toDouble(),
                speedMetersPerSecond =
                    if (location.hasSpeed()) {
                        location.speed
                            .coerceAtLeast(0f)
                            .toDouble()
                    } else {
                        null
                    },
                capturedAtMillis = location.time,
            ),
        )
    }

    fun getLatest(): RiderLocationSnapshot? =
        latestLocation.get()

    fun clear() {
        latestLocation.set(null)
    }
}