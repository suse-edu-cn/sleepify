package com.crrashh.sleepify.data.api.models

import com.google.gson.annotations.SerializedName

data class CurrentChallenge(
    val id: String,
    val name: String,
    @SerializedName("is_onetime") val isOnetime: Boolean,
    val points: Double,
    val duration: Int,
    @SerializedName("start_date") val startDate: String?,
    @SerializedName("end_date") val endDate: String?,
    @SerializedName("completed_date") val completedDate: String?,
    val status: String
)
