package com.crrashh.sleepify.data.api.models

import com.google.gson.annotations.SerializedName

data class PointsRankingItem(
    val id: String,
    val name: String,
    @SerializedName("class_name") val className: String,
    val points: Int
)
