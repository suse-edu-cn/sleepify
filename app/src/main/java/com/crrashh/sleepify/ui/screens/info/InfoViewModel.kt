package com.crrashh.sleepify.ui.screens.info

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.crrashh.sleepify.data.api.models.LatestVersionResponse
import com.crrashh.sleepify.data.api.models.UserInfoResponse
import com.crrashh.sleepify.data.repository.AuthRepository
import com.crrashh.sleepify.data.repository.PackageRepository
import com.crrashh.sleepify.data.repository.UserRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class InfoUiState(
    val userInfo: UserInfoResponse? = null,
    val isLoading: Boolean = true,
    val error: String? = null,
    val isSigningOut: Boolean = false,
    val signOutSuccess: Boolean = false,
    val latestVersion: LatestVersionResponse? = null
)

class InfoViewModel(
    private val userRepository: UserRepository,
    private val authRepository: AuthRepository,
    private val packageRepository: PackageRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(InfoUiState())
    val uiState: StateFlow<InfoUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            userRepository.getUserInfo()
                .onSuccess { info ->
                    _uiState.value = _uiState.value.copy(userInfo = info, isLoading = false)
                }
                .onFailure { e ->
                    _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
                }
        }
    }

    fun signOut() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSigningOut = true)
            authRepository.signOut()
                .onSuccess {
                    _uiState.value = _uiState.value.copy(isSigningOut = false, signOutSuccess = true)
                }
                .onFailure {
                    authRepository.clearLocal()
                    _uiState.value = _uiState.value.copy(isSigningOut = false, signOutSuccess = true)
                }
        }
    }

    fun checkForUpdate() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(latestVersion = null)
            packageRepository.getLatestVersion()
                .onSuccess { latest ->
                    _uiState.value = _uiState.value.copy(latestVersion = latest)
                }
        }
    }

    fun dismissUpdate() {
        _uiState.value = _uiState.value.copy(latestVersion = null)
    }

    companion object {
        fun factory(
            userRepository: UserRepository,
            authRepository: AuthRepository,
            packageRepository: PackageRepository
        ) = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return InfoViewModel(userRepository, authRepository, packageRepository) as T
            }
        }
    }
}
