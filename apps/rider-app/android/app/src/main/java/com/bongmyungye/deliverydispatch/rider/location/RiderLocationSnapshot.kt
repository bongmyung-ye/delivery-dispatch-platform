package com.bongmyungye.deliverydispatch.rider.location

data class RiderLocationSnapshot(
    val latitude: Double,
    val longitude: Double,
    val accuracyMeters: Double,
    val speedMetersPerSecond: Double?,
    val capturedAtMillis: Long,
)