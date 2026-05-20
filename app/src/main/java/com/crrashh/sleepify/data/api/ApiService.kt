package com.crrashh.sleepify.data.api

import com.crrashh.sleepify.data.api.models.ApiResponse
import com.crrashh.sleepify.data.api.models.PointsRankingItem
import com.crrashh.sleepify.data.api.models.SignInRequest
import com.crrashh.sleepify.data.api.models.SignInResponse
import com.crrashh.sleepify.data.api.models.SleepRankingItem
import com.crrashh.sleepify.data.api.models.SleepStartResponse
import com.crrashh.sleepify.data.api.models.SleepStatusResponse
import com.crrashh.sleepify.data.api.models.UserInfoResponse
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {

    @POST("v1/sign")
    suspend fun signIn(@Body request: SignInRequest): ApiResponse<SignInResponse>

    @DELETE("v1/sign")
    suspend fun signOut(): ApiResponse<Any?>

    @GET("v1/info")
    suspend fun getUserInfo(): ApiResponse<UserInfoResponse>

    @GET("v1/sleep/start")
    suspend fun startSleep(): ApiResponse<SleepStartResponse>

    @GET("v1/sleep/status")
    suspend fun getSleepStatus(): ApiResponse<SleepStatusResponse>

    @GET("v1/ranking/sleep")
    suspend fun getSleepRanking(): ApiResponse<List<SleepRankingItem>>

    @GET("v1/ranking/points")
    suspend fun getPointsRanking(): ApiResponse<List<PointsRankingItem>>
}
