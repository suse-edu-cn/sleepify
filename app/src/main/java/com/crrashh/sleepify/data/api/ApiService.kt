package com.crrashh.sleepify.data.api

import com.crrashh.sleepify.data.api.models.ApiResponse
import com.crrashh.sleepify.data.api.models.LatestVersionResponse
import com.crrashh.sleepify.data.api.models.PointsRankingItem
import com.crrashh.sleepify.data.api.models.SignInRequest
import com.crrashh.sleepify.data.api.models.SignInResponse
import com.crrashh.sleepify.data.api.models.SleepRankingItem
import com.crrashh.sleepify.data.api.models.SleepStartResponse
import com.crrashh.sleepify.data.api.models.SleepStatusResponse
import com.crrashh.sleepify.data.api.models.UserInfoResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {

    @POST("sign/in")
    suspend fun signIn(@Body request: SignInRequest): ApiResponse<SignInResponse>

    @POST("sign/out")
    suspend fun signOut(): ApiResponse<Any?>

    @GET("info")
    suspend fun getUserInfo(): ApiResponse<UserInfoResponse>

    @GET("sleep/start")
    suspend fun startSleep(): ApiResponse<SleepStartResponse>

    @GET("sleep/status")
    suspend fun getSleepStatus(): ApiResponse<SleepStatusResponse>

    @GET("ranking/sleep")
    suspend fun getSleepRanking(): ApiResponse<List<SleepRankingItem>>

    @GET("ranking/points")
    suspend fun getPointsRanking(): ApiResponse<List<PointsRankingItem>>

    @GET("pkg/latest")
    suspend fun getLatestVersion(): ApiResponse<LatestVersionResponse>
}
