package com.crrashh.sleepify.data.repository

import com.crrashh.sleepify.data.api.ApiService
import com.crrashh.sleepify.data.api.models.SignInRequest
import com.crrashh.sleepify.data.local.TokenDataStore
import com.crrashh.sleepify.util.EccCrypto
import com.crrashh.sleepify.util.encodeToBase64
import kotlinx.coroutines.flow.Flow
import org.json.JSONObject

class AuthRepository(
    private val apiService: ApiService,
    private val tokenDataStore: TokenDataStore
) {
    val isLoggedIn: Flow<Boolean> = tokenDataStore.isLoggedIn

    suspend fun signIn(username: String, password: String): Result<Unit> = runCatching {
        // Fetch server ECC public key
        val keyResponse = apiService.getPublicKey()
        if (keyResponse.code != 0) throw ApiException(keyResponse.code, keyResponse.message)
        val publicKey = keyResponse.data?.publicKey
            ?: throw ApiException(keyResponse.code, "获取公钥失败")

        // Build plaintext JSON with base64-encoded password
        val plaintext = JSONObject().apply {
            put("username", username)
            put("password", password.encodeToBase64())
        }.toString().toByteArray(Charsets.UTF_8)

        // ECIES encrypt
        val payload = EccCrypto.encrypt(plaintext, publicKey)

        // Send encrypted payload
        val response = apiService.signIn(SignInRequest(payload))
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
