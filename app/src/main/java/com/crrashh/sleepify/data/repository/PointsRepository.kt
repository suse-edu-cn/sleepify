package com.crrashh.sleepify.data.repository

import com.crrashh.sleepify.data.api.ApiService
import com.crrashh.sleepify.data.api.models.Challenge
import com.crrashh.sleepify.data.api.models.ChallengeDetail
import com.crrashh.sleepify.data.api.models.CurrentChallenge
import com.crrashh.sleepify.data.api.models.PointsHistoryItem

class PointsRepository(
    private val apiService: ApiService
) {
    suspend fun getCurrentChallenges(): Result<List<CurrentChallenge>> = runCatching {
        val response = apiService.getCurrentChallenges()
        if (response.code != 0) throw ApiException(response.code, response.message)
        response.data ?: throw ApiException(response.code, "响应数据为空")
    }

    suspend fun getHistory(): Result<List<PointsHistoryItem>> = runCatching {
        val response = apiService.getPointsHistory()
        if (response.code != 0) throw ApiException(response.code, response.message)
        response.data ?: throw ApiException(response.code, "响应数据为空")
    }

    suspend fun getChallenges(): Result<List<Challenge>> = runCatching {
        val response = apiService.getChallenges()
        if (response.code != 0) throw ApiException(response.code, response.message)
        response.data ?: throw ApiException(response.code, "响应数据为空")
    }

    suspend fun getChallengeDetail(id: String): Result<ChallengeDetail> = runCatching {
        val response = apiService.getChallengeDetail(id)
        if (response.code != 0) throw ApiException(response.code, response.message)
        response.data ?: throw ApiException(response.code, "响应数据为空")
    }

    suspend fun enrollChallenge(id: String): Result<Unit> = runCatching {
        val response = apiService.enrollChallenge(id)
        if (response.code != 0) throw ApiException(response.code, response.message)
    }
}
