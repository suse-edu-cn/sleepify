package com.crrashh.sleepify.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.crrashh.sleepify.data.api.models.SleepConfig
import com.crrashh.sleepify.data.api.models.SleepStatusResponse
import com.crrashh.sleepify.data.local.TokenDataStore
import com.crrashh.sleepify.data.repository.RankingRepository
import com.crrashh.sleepify.data.repository.SleepRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.time.Duration
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

data class HomeUiState(
    val sleepStatus: SleepStatusResponse? = null,
    val sleepLoading: Boolean = true,
    val sleepError: String? = null,
    val startError: String? = null,
    val elapsedText: String = "",
    val remainingText: String = "",
    val progressPercent: Float = 0f,
    val startTimeFormatted: String = "",
    val endTimeFormatted: String = "",
    val weeklySleepDays: Int? = null,
    val monthlySleepDays: Int? = null,
    val maxContinuousDays: Int? = null,
    val statsLoading: Boolean = true,
    val autoSleepEnabled: Boolean = false,
    val autoSleepTime: String = "22:00",
    val autoSleepFrequency: String = "daily",
    val autoSleepDays: List<Int> = emptyList(),
    val autoSleepLoading: Boolean = false,
    val autoSleepSaving: Boolean = false,
    val showConfigSuccessDialog: Boolean = false
)

class HomeViewModel(
    private val sleepRepository: SleepRepository,
    private val rankingRepository: RankingRepository,
    private val tokenDataStore: TokenDataStore
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        .withZone(ZoneId.systemDefault())

    init {
        refreshSleepStatus()
        loadSleepStats()
        loadAutoSleepConfig()
    }

    fun refreshSleepStatus() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(sleepLoading = true, sleepError = null)
            sleepRepository.getSleepStatus()
                .onSuccess { status ->
                    _uiState.value = _uiState.value.copy(sleepStatus = status, sleepLoading = false)
                    if (status.status == 1) startLiveClock(status)
                }
                .onFailure { e ->
                    _uiState.value = _uiState.value.copy(sleepLoading = false, sleepError = e.message)
                }
        }
    }

    fun startSleep() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(startError = null)
            sleepRepository.startSleep()
                .onSuccess { result ->
                    val status = SleepStatusResponse(
                        status = 1,
                        startTime = result.startTime,
                        plannedEndTime = result.plannedEndTime
                    )
                    _uiState.value = _uiState.value.copy(sleepStatus = status)
                    startLiveClock(status)
                }
                .onFailure { e ->
                    _uiState.value = _uiState.value.copy(startError = e.message ?: "开始睡眠失败")
                }
        }
    }

    private fun startLiveClock(status: SleepStatusResponse) {
        viewModelScope.launch {
            while (isActive) {
                updateClockDisplay(status)
                delay(30_000)
            }
        }
    }

    private fun updateClockDisplay(status: SleepStatusResponse) {
        val startTime = status.startTime ?: return
        val endTime = status.plannedEndTime ?: return
        try {
            val start = Instant.parse(startTime)
            val end = Instant.parse(endTime)
            val now = Instant.now()
            val elapsed = Duration.between(start, now).coerceAtLeast(Duration.ZERO)
            val remaining = Duration.between(now, end).coerceAtLeast(Duration.ZERO)
            val total = Duration.between(start, end)
            val percent = if (total.toMillis() > 0) {
                (elapsed.toMillis().toFloat() / total.toMillis()).coerceIn(0f, 1f)
            } else 0f
            _uiState.value = _uiState.value.copy(
                elapsedText = formatDuration(elapsed),
                remainingText = formatDuration(remaining),
                progressPercent = percent,
                startTimeFormatted = formatter.format(start),
                endTimeFormatted = formatter.format(end)
            )
        } catch (_: Exception) {}
    }

    private fun formatDuration(duration: Duration): String {
        val hours = duration.toHours()
        val minutes = duration.toMinutes() % 60
        return if (hours > 0) "${hours} 小时 ${minutes} 分钟" else "${minutes} 分钟"
    }

    private fun loadSleepStats() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(statsLoading = true)
            val userId = tokenDataStore.getUserIdBlocking()
            if (userId.isNullOrBlank()) {
                _uiState.value = _uiState.value.copy(statsLoading = false)
                return@launch
            }
            rankingRepository.getSleepRanking()
                .onSuccess { list ->
                    val self = list.find { it.id == userId }
                    _uiState.value = _uiState.value.copy(
                        weeklySleepDays = self?.weeklySleepDays,
                        monthlySleepDays = self?.monthlySleepDays,
                        maxContinuousDays = self?.maxContinuousDays,
                        statsLoading = false
                    )
                }
                .onFailure {
                    _uiState.value = _uiState.value.copy(statsLoading = false)
                }
        }
    }

    private fun loadAutoSleepConfig() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(autoSleepLoading = true)
            sleepRepository.getSleepConfig()
                .onSuccess { config ->
                    _uiState.value = _uiState.value.copy(
                        autoSleepEnabled = config.enabled,
                        autoSleepTime = config.time,
                        autoSleepFrequency = config.frequency,
                        autoSleepDays = config.days,
                        autoSleepLoading = false
                    )
                }
                .onFailure {
                    _uiState.value = _uiState.value.copy(autoSleepLoading = false)
                }
        }
    }

    fun toggleAutoSleep(enabled: Boolean) {
        _uiState.value = _uiState.value.copy(autoSleepEnabled = enabled)
    }

    fun onTimeSelected(hour: Int, minute: Int) {
        _uiState.value = _uiState.value.copy(
            autoSleepTime = "%02d:%02d".format(hour, minute)
        )
    }

    fun onFrequencyChanged(frequency: String) {
        _uiState.value = _uiState.value.copy(
            autoSleepFrequency = frequency,
            autoSleepDays = if (frequency != "custom") emptyList() else _uiState.value.autoSleepDays
        )
    }

    fun toggleDay(day: Int) {
        val current = _uiState.value.autoSleepDays
        _uiState.value = _uiState.value.copy(
            autoSleepDays = if (day in current) current - day else current + day
        )
    }

    fun saveAutoSleepConfig() {
        val state = _uiState.value
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(autoSleepSaving = true)
            val config = SleepConfig(
                enabled = state.autoSleepEnabled,
                time = state.autoSleepTime,
                frequency = state.autoSleepFrequency,
                days = state.autoSleepDays
            )
            sleepRepository.updateSleepConfig(config)
                .onSuccess {
                    _uiState.value = _uiState.value.copy(
                        autoSleepSaving = false,
                        showConfigSuccessDialog = true
                    )
                }
                .onFailure {
                    _uiState.value = _uiState.value.copy(autoSleepSaving = false)
                }
        }
    }

    fun dismissConfigSuccessDialog() {
        _uiState.value = _uiState.value.copy(showConfigSuccessDialog = false)
    }

    companion object {
        fun factory(
            sleepRepository: SleepRepository,
            rankingRepository: RankingRepository,
            tokenDataStore: TokenDataStore
        ) = object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return HomeViewModel(sleepRepository, rankingRepository, tokenDataStore) as T
                }
            }
    }
}
