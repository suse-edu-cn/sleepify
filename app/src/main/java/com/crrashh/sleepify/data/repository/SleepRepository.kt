package com.crrashh.sleepify.data.repository

import com.crrashh.sleepify.data.api.ApiService
import com.crrashh.sleepify.data.api.models.SleepConfig
import com.crrashh.sleepify.data.api.models.SleepStartResponse
import com.crrashh.sleepify.data.api.models.SleepStatusResponse

class SleepRepository(
    private val apiService: ApiService
) {
    suspend fun getSleepStatus(): Result<SleepStatusResponse> = runCatching {
        val response = apiService.getSleepStatus()
        if (response.code != 0) throw ApiException(response.code, response.message)
        response.data ?: throw ApiException(response.code, "响应数据为空")
    }

    suspend fun startSleep(): Result<SleepStartResponse> = runCatching {
        val response = apiService.startSleep()
        if (response.code != 0) throw ApiException(response.code, response.message)
        response.data ?: throw ApiException(response.code, "响应数据为空")
    }

    suspend fun getSleepConfig(): Result<SleepConfig> = runCatching {
        val response = apiService.getSleepConfig()
        if (response.code != 0) throw ApiException(response.code, response.message)
        response.data ?: throw ApiException(response.code, "响应数据为空")
    }

    suspend fun updateSleepConfig(config: SleepConfig): Result<SleepConfig> = runCatching {
        val response = apiService.updateSleepConfig(config)
        if (response.code != 0) throw ApiException(response.code, response.message)
        response.data ?: throw ApiException(response.code, "响应数据为空")
    }
}
