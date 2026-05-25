package com.crrashh.sleepify.ui.screens.points

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.crrashh.sleepify.data.api.models.PointsHistoryItem
import com.crrashh.sleepify.data.repository.PointsRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PointsHistoryUiState(
    val items: List<PointsHistoryItem> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null
)

class PointsHistoryViewModel(
    private val pointsRepository: PointsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(PointsHistoryUiState())
    val uiState: StateFlow<PointsHistoryUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            pointsRepository.getHistory()
                .onSuccess { list ->
                    _uiState.value = _uiState.value.copy(items = list, isLoading = false)
                }
                .onFailure { e ->
                    _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
                }
        }
    }

    companion object {
        fun factory(pointsRepository: PointsRepository) =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return PointsHistoryViewModel(pointsRepository) as T
                }
            }
    }
}
