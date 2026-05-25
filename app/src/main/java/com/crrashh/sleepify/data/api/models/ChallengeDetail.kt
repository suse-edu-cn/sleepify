package com.crrashh.sleepify.data.api.models

import com.google.gson.annotations.SerializedName

data class ChallengeDetail(
    val id: String,
    val name: String,
    val description: String?,
    @SerializedName("is_onetime") val isOnetime: Boolean,
    val points: Int,
    val duration: Int,
    @SerializedName("is_repeatable") val isRepeatable: Boolean,
    @SerializedName("is_include_weekends") val isIncludeWeekends: Boolean,
    @SerializedName("end_time") val endTime: String?,
    val status: String
)
