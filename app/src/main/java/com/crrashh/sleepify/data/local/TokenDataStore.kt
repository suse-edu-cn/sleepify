package com.crrashh.sleepify.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "sleepify_auth")

class TokenDataStore(private val context: Context) {

    companion object {
        private val TOKEN_KEY = stringPreferencesKey("token")
        private val USER_ID_KEY = stringPreferencesKey("user_id")
    }

    val token: Flow<String?> = context.dataStore.data.map { it[TOKEN_KEY] }
    val userId: Flow<String?> = context.dataStore.data.map { it[USER_ID_KEY] }

    val isLoggedIn: Flow<Boolean> = token.map { !it.isNullOrBlank() }

    suspend fun save(token: String, userId: String) {
        context.dataStore.edit { prefs ->
            prefs[TOKEN_KEY] = token
            prefs[USER_ID_KEY] = userId
        }
    }

    suspend fun clear() {
        context.dataStore.edit { it.clear() }
    }

    suspend fun getTokenBlocking(): String? =
        context.dataStore.data.first()[TOKEN_KEY]

    suspend fun getUserIdBlocking(): String? =
        context.dataStore.data.first()[USER_ID_KEY]
}
