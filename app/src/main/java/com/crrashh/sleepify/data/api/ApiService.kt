package com.crrashh.sleepify.data.api

import com.crrashh.sleepify.data.api.models.ApiResponse
import com.crrashh.sleepify.data.api.models.Challenge
import com.crrashh.sleepify.data.api.models.ChallengeDetail
import com.crrashh.sleepify.data.api.models.CurrentChallenge
import com.crrashh.sleepify.data.api.models.LatestVersionResponse
import com.crrashh.sleepify.data.api.models.PointsHistoryItem
import com.crrashh.sleepify.data.api.models.PointsRankingItem
import com.crrashh.sleepify.data.api.models.PublicKeyResponse
import com.crrashh.sleepify.data.api.models.SignInRequest
import com.crrashh.sleepify.data.api.models.SignInResponse
import com.crrashh.sleepify.data.api.models.SleepConfig
import com.crrashh.sleepify.data.api.models.SleepRankingItem
import com.crrashh.sleepify.data.api.models.SleepStartResponse
import com.crrashh.sleepify.data.api.models.SleepStatusResponse
import com.crrashh.sleepify.data.api.models.UserInfoResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface ApiService {

    @GET("sign/key")
    suspend fun getPublicKey(): ApiResponse<PublicKeyResponse>

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

    @GET("sleep/config")
    suspend fun getSleepConfig(): ApiResponse<SleepConfig>

    @POST("sleep/config")
    suspend fun updateSleepConfig(@Body config: SleepConfig): ApiResponse<SleepConfig>

    @GET("sleep/ranking")
    suspend fun getSleepRanking(): ApiResponse<List<SleepRankingItem>>

    @GET("points/ranking")
    suspend fun getPointsRanking(): ApiResponse<List<PointsRankingItem>>

    @GET("points/challenges/current")
    suspend fun getCurrentChallenges(): ApiResponse<List<CurrentChallenge>>

    @GET("points/history")
    suspend fun getPointsHistory(): ApiResponse<List<PointsHistoryItem>>

    @GET("points/challenges")
    suspend fun getChallenges(): ApiResponse<List<Challenge>>

    @GET("points/challenges/{id}")
    suspend fun getChallengeDetail(@Path("id") id: String): ApiResponse<ChallengeDetail>

    @POST("points/challenges/{id}")
    suspend fun enrollChallenge(@Path("id") id: String): ApiResponse<Any?>

    @GET("pkg/latest")
    suspend fun getLatestVersion(): ApiResponse<LatestVersionResponse>
}
