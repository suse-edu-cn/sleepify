package com.crrashh.sleepify.di

import android.content.Context
import com.crrashh.sleepify.data.api.ApiService
import com.crrashh.sleepify.data.local.TokenDataStore
import com.crrashh.sleepify.data.repository.AuthRepository
import com.crrashh.sleepify.data.repository.RankingRepository
import com.crrashh.sleepify.data.repository.SleepRepository
import com.crrashh.sleepify.data.repository.UserRepository
import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class AppContainer(context: Context) {

    val tokenDataStore = TokenDataStore(context)

    private val okHttpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .writeTimeout(10, TimeUnit.SECONDS)
        .addInterceptor { chain ->
            val token = runBlocking { tokenDataStore.getTokenBlocking() }
            val userId = runBlocking { tokenDataStore.getUserIdBlocking() }

            val requestBuilder = chain.request().newBuilder()
            if (!token.isNullOrBlank()) {
                val cookies = buildList {
                    add("token=$token")
                    if (!userId.isNullOrBlank()) add("id=$userId")
                }.joinToString("; ")
                requestBuilder.addHeader("Cookie", cookies)
            }
            chain.proceed(requestBuilder.build())
        }
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .build()

    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl("https://sleepify.crrashh.com/")
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    private val apiService: ApiService = retrofit.create(ApiService::class.java)

    val authRepository = AuthRepository(apiService, tokenDataStore)
    val userRepository = UserRepository(apiService)
    val sleepRepository = SleepRepository(apiService)
    val rankingRepository = RankingRepository(apiService)
}
