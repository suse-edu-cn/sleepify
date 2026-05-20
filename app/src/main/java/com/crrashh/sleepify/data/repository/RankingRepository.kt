package com.crrashh.sleepify.data.repository

import com.crrashh.sleepify.data.api.ApiService
import com.crrashh.sleepify.data.api.models.PointsRankingItem
import com.crrashh.sleepify.data.api.models.SleepRankingItem

class RankingRepository(
    private val apiService: ApiService
) {
    suspend fun getSleepRanking(): Result<List<SleepRankingItem>> = runCatching {
        val response = apiService.getSleepRanking()
        if (response.code != 0) throw ApiException(response.code, response.message)
        response.data ?: throw ApiException(response.code, "响应数据为空")
    }

    suspend fun getPointsRanking(): Result<List<PointsRankingItem>> = runCatching {
        val response = apiService.getPointsRanking()
        if (response.code != 0) throw ApiException(response.code, response.message)
        response.data ?: throw ApiException(response.code, "响应数据为空")
    }
}
