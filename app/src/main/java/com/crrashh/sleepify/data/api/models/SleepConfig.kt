package com.crrashh.sleepify.data.api.models

data class SleepConfig(
    val enabled: Boolean,
    val time: String,
    val frequency: String,
    val days: List<Int>
)
