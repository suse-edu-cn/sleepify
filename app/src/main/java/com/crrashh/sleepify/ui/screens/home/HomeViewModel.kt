package com.crrashh.sleepify.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.crrashh.sleepify.data.api.models.SleepStatusResponse
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
    val endTimeFormatted: String = ""
)

class HomeViewModel(
    private val sleepRepository: SleepRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        .withZone(ZoneId.systemDefault())

    init {
        refreshSleepStatus()
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

    companion object {
        fun factory(sleepRepository: SleepRepository) =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return HomeViewModel(sleepRepository) as T
                }
            }
    }
}
