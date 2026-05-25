package com.crrashh.sleepify.data.api.models

import com.google.gson.annotations.SerializedName

data class PointsHistoryItem(
    val change: Int,
    val reason: String,
    val operator: String?,
    @SerializedName("record_date") val recordDate: String
)
