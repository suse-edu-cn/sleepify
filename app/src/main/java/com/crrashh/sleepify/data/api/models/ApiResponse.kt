package com.crrashh.sleepify.data.api.models

data class ApiResponse<T>(
    val code: Int,
    val message: String,
    val data: T?
)
