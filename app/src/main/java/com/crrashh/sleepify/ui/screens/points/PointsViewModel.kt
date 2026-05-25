package com.crrashh.sleepify.ui.screens.points

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.crrashh.sleepify.data.api.models.CurrentChallenge
import com.crrashh.sleepify.data.repository.PointsRepository
import com.crrashh.sleepify.data.repository.UserRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PointsUiState(
    val points: Int? = null,
    val isLoading: Boolean = true,
    val error: String? = null,
    val challenges: List<CurrentChallenge> = emptyList(),
    val challengesLoading: Boolean = true
)

class PointsViewModel(
    private val userRepository: UserRepository,
    private val pointsRepository: PointsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(PointsUiState())
    val uiState: StateFlow<PointsUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            userRepository.getUserInfo()
                .onSuccess { info ->
                    _uiState.value = _uiState.value.copy(points = info.points, isLoading = false)
                }
                .onFailure { e ->
                    _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
                }
            _uiState.value = _uiState.value.copy(challengesLoading = true)
            pointsRepository.getCurrentChallenges()
                .onSuccess { list ->
                    _uiState.value = _uiState.value.copy(challenges = list, challengesLoading = false)
                }
                .onFailure {
                    _uiState.value = _uiState.value.copy(challengesLoading = false)
                }
        }
    }

    companion object {
        fun factory(userRepository: UserRepository, pointsRepository: PointsRepository) =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return PointsViewModel(userRepository, pointsRepository) as T
                }
            }
    }
}
