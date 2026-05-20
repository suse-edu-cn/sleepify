package com.crrashh.sleepify.ui.screens.ranking

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.crrashh.sleepify.data.api.models.PointsRankingItem
import com.crrashh.sleepify.data.api.models.SleepRankingItem
import com.crrashh.sleepify.data.local.TokenDataStore
import com.crrashh.sleepify.data.repository.RankingRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class RankingUiState(
    val selectedTab: Int = 0,
    val sleepRanking: List<SleepRankingItem> = emptyList(),
    val pointsRanking: List<PointsRankingItem> = emptyList(),
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: String? = null,
    val currentUserId: String? = null,
    val selectedSleepItem: SleepRankingItem? = null
)

class RankingViewModel(
    private val rankingRepository: RankingRepository,
    private val tokenDataStore: TokenDataStore
) : ViewModel() {

    private val _uiState = MutableStateFlow(RankingUiState())
    val uiState: StateFlow<RankingUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun selectTab(tab: Int) {
        _uiState.value = _uiState.value.copy(selectedTab = tab)
    }

    fun selectSleepItem(item: SleepRankingItem?) {
        _uiState.value = _uiState.value.copy(selectedSleepItem = item)
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val userId = tokenDataStore.getUserIdBlocking()
            val sleepResult = rankingRepository.getSleepRanking()
            val pointsResult = rankingRepository.getPointsRanking()
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                currentUserId = userId,
                sleepRanking = sleepResult.getOrNull() ?: _uiState.value.sleepRanking,
                pointsRanking = pointsResult.getOrNull() ?: _uiState.value.pointsRanking,
                error = sleepResult.exceptionOrNull()?.message
                    ?: pointsResult.exceptionOrNull()?.message
            )
        }
    }

    fun pullToRefresh() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isRefreshing = true, error = null)
            val userId = tokenDataStore.getUserIdBlocking()
            val sleepResult = rankingRepository.getSleepRanking()
            val pointsResult = rankingRepository.getPointsRanking()
            _uiState.value = _uiState.value.copy(
                isRefreshing = false,
                currentUserId = userId,
                sleepRanking = sleepResult.getOrNull() ?: _uiState.value.sleepRanking,
                pointsRanking = pointsResult.getOrNull() ?: _uiState.value.pointsRanking,
                error = sleepResult.exceptionOrNull()?.message
                    ?: pointsResult.exceptionOrNull()?.message
            )
        }
    }

    companion object {
        fun factory(rankingRepository: RankingRepository, tokenDataStore: TokenDataStore) =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return RankingViewModel(rankingRepository, tokenDataStore) as T
                }
            }
    }
}
