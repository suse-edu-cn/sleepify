package com.crrashh.sleepify.data.repository

import com.crrashh.sleepify.data.api.ApiService
import com.crrashh.sleepify.data.api.models.UserInfoResponse

class UserRepository(
    private val apiService: ApiService
) {
    suspend fun getUserInfo(): Result<UserInfoResponse> = runCatching {
        val response = apiService.getUserInfo()
        if (response.code != 0) throw ApiException(response.code, response.message)
        response.data ?: throw ApiException(response.code, "响应数据为空")
    }
}
