package com.crrashh.sleepify.data.api.models

import com.google.gson.annotations.SerializedName

data class UserInfoResponse(
    val id: String,
    val number: String,
    @SerializedName("class") val className: String,
    val qq: String,
    val points: Int
)
