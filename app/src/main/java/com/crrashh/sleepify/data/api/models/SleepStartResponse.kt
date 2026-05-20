package com.crrashh.sleepify.data.api.models

import com.google.gson.annotations.SerializedName

data class SleepStartResponse(
    @SerializedName("start_time") val startTime: String,
    @SerializedName("planned_end_time") val plannedEndTime: String
)
