package com.crrashh.sleepify.data.repository

import com.crrashh.sleepify.data.api.ApiService
import com.crrashh.sleepify.data.api.models.SignInRequest
import com.crrashh.sleepify.data.local.TokenDataStore
import com.crrashh.sleepify.util.encodeToBase64
import kotlinx.coroutines.flow.Flow

class AuthRepository(
    private val apiService: ApiService,
    private val tokenDataStore: TokenDataStore
) {
    val isLoggedIn: Flow<Boolean> = tokenDataStore.isLoggedIn

    suspend fun signIn(username: String, password: String): Result<Unit> = runCatching {
        val encodedPassword = password.encodeToBase64()
        val response = apiService.signIn(SignInRequest(username, encodedPassword))
        if (response.code != 0) throw ApiException(response.code, response.message)
        val data = response.data ?: throw ApiException(response.code, "响应数据为空")
        tokenDataStore.save(data.token, data.id)
    }

    suspend fun signOut(): Result<Unit> = runCatching {
        apiService.signOut()
        tokenDataStore.clear()
    }

    suspend fun clearLocal() {
        tokenDataStore.clear()
    }
}

class ApiException(val code: Int, override val message: String) : Exception(message)
