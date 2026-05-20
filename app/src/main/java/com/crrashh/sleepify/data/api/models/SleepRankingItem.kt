package com.crrashh.sleepify.data.api.models

import com.google.gson.annotations.SerializedName

data class SleepRankingItem(
    val id: String,
    val name: String,
    @SerializedName("class_name") val className: String,
    @SerializedName("weekly_sleep_days") val weeklySleepDays: Int,
    @SerializedName("monthly_sleep_days") val monthlySleepDays: Int,
    @SerializedName("max_continuous_days") val maxContinuousDays: Int,
    @SerializedName("last_sleep") val lastSleep: String
)
