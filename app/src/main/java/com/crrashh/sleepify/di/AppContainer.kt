package com.crrashh.sleepify.di

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.widget.Toast
import com.crrashh.sleepify.data.api.ApiService
import com.crrashh.sleepify.data.local.TokenDataStore
import com.crrashh.sleepify.data.repository.AuthRepository
import com.crrashh.sleepify.data.repository.RankingRepository
import com.crrashh.sleepify.data.repository.SleepRepository
import com.crrashh.sleepify.data.repository.UserRepository
import com.google.gson.Gson
import com.google.gson.JsonObject
import kotlinx.coroutines.runBlocking
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.ResponseBody.Companion.toResponseBody
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class AppContainer(private val context: Context) {

    val tokenDataStore = TokenDataStore(context)
    private val gson = Gson()
    private val mainHandler = Handler(Looper.getMainLooper())

    private val okHttpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .writeTimeout(10, TimeUnit.SECONDS)
        .addInterceptor { chain ->
            val token = runBlocking { tokenDataStore.getTokenBlocking() }
            val userId = runBlocking { tokenDataStore.getUserIdBlocking() }

            val requestBuilder = chain.request().newBuilder()
                .addHeader("Accept-Encoding", "identity")
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
        .addNetworkInterceptor { chain ->
            val response = chain.proceed(chain.request())
            val body = response.body ?: return@addNetworkInterceptor response
            val contentType = body.contentType()
            val bodyString = body.string()

            try {
                val json = gson.fromJson(bodyString, JsonObject::class.java)
                if (json.has("code") && json.get("code").asInt != 0) {
                    val message = json.get("message")?.asString ?: "未知错误"
                    mainHandler.post {
                        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (_: Exception) {}

            response.newBuilder()
                .body(bodyString.toResponseBody(contentType))
                .build()
        }
        .build()

    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl("https://sleepify.crrashh.com/v1/")
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    private val apiService: ApiService = retrofit.create(ApiService::class.java)

    val authRepository = AuthRepository(apiService, tokenDataStore)
    val userRepository = UserRepository(apiService)
    val sleepRepository = SleepRepository(apiService)
    val rankingRepository = RankingRepository(apiService)
}
