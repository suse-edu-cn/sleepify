package com.crrashh.sleepify.ui.screens.points

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.crrashh.sleepify.data.api.models.ChallengeDetail
import com.crrashh.sleepify.data.repository.PointsRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ChallengeDetailUiState(
    val detail: ChallengeDetail? = null,
    val isLoading: Boolean = true,
    val error: String? = null,
    val enrollSuccess: Boolean = false,
    val enrollError: String? = null
)

class ChallengeDetailViewModel(
    private val pointsRepository: PointsRepository,
    private val challengeId: String
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChallengeDetailUiState())
    val uiState: StateFlow<ChallengeDetailUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            pointsRepository.getChallengeDetail(challengeId)
                .onSuccess { detail ->
                    _uiState.value = _uiState.value.copy(detail = detail, isLoading = false)
                }
                .onFailure { e ->
                    _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
                }
        }
    }

    fun enroll() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(enrollError = null)
            pointsRepository.enrollChallenge(challengeId)
                .onSuccess {
                    _uiState.value = _uiState.value.copy(enrollSuccess = true)
                }
                .onFailure { e ->
                    _uiState.value = _uiState.value.copy(enrollError = e.message)
                }
        }
    }

    companion object {
        fun factory(pointsRepository: PointsRepository, challengeId: String) =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return ChallengeDetailViewModel(pointsRepository, challengeId) as T
                }
            }
    }
}
