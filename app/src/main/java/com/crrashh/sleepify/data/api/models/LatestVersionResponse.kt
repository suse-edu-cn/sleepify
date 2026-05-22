package com.crrashh.sleepify.data.api.models

import com.google.gson.annotations.SerializedName

data class LatestVersionResponse(
    val version: String,
    @SerializedName("versionCode") val versionCode: Int,
    val content: String,
    val url: String
)
