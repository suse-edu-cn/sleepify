package com.crrashh.sleepify.data.api.models

import com.google.gson.annotations.SerializedName

data class SleepStatusResponse(
    val status: Int,
    @SerializedName("start_time") val startTime: String? = null,
    @SerializedName("planned_end_time") val plannedEndTime: String? = null
)
