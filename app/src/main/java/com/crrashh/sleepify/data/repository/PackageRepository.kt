package com.crrashh.sleepify.data.repository

import com.crrashh.sleepify.BuildConfig
import com.crrashh.sleepify.data.api.ApiService
import com.crrashh.sleepify.data.api.models.LatestVersionResponse

class PackageRepository(
    private val apiService: ApiService
) {
    suspend fun getLatestVersion(): Result<LatestVersionResponse?> = runCatching {
        val response = apiService.getLatestVersion()
        if (response.code != 0) return@runCatching null
        val data = response.data ?: return@runCatching null
        if (data.versionCode > BuildConfig.VERSION_CODE) data else null
    }
}
