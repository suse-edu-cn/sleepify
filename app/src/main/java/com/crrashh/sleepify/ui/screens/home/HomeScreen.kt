package com.crrashh.sleepify.ui.screens.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bedtime
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.IconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.ui.unit.sp
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun HomeScreen(
    viewModel: HomeViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        SleepStatusCard(
            uiState = uiState,
            onStartSleep = viewModel::startSleep,
            onRefresh = viewModel::refreshSleepStatus
        )
        SleepStatsCard(uiState = uiState)
    }
}

@Composable
private fun SleepStatusCard(
    uiState: HomeUiState,
    onStartSleep: () -> Unit,
    onRefresh: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerLow
        )
    ) {
        Column(modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Bedtime, null, tint = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("睡眠状态", style = MaterialTheme.typography.titleMedium)
                }
                IconButton(onClick = onRefresh) {
                    Icon(Icons.Default.Refresh, contentDescription = "刷新")
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
            when {
                uiState.sleepLoading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
                }
                uiState.sleepStatus?.status == 1 -> {
                    Text("睡眠中", style = MaterialTheme.typography.titleLarge.copy(lineHeight = 34.sp), color = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("已睡", style = MaterialTheme.typography.labelMedium.copy(lineHeight = 24.sp))
                            Text(uiState.elapsedText, style = MaterialTheme.typography.bodyLarge.copy(lineHeight = 30.sp))
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("剩余", style = MaterialTheme.typography.labelMedium.copy(lineHeight = 24.sp))
                            Text(uiState.remainingText, style = MaterialTheme.typography.bodyLarge.copy(lineHeight = 30.sp))
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    LinearProgressIndicator(progress = { uiState.progressPercent }, modifier = Modifier.fillMaxWidth())
                    Spacer(modifier = Modifier.height(2.dp))
                    Text("${(uiState.progressPercent * 100).toInt()}%", style = MaterialTheme.typography.labelSmall.copy(lineHeight = 20.sp), modifier = Modifier.align(Alignment.End))
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("开始时间: ${uiState.startTimeFormatted}", style = MaterialTheme.typography.bodySmall.copy(lineHeight = 24.sp))
                    Text("结束时间: ${uiState.endTimeFormatted}", style = MaterialTheme.typography.bodySmall.copy(lineHeight = 24.sp))
                }
                else -> {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("当前无进行中的睡眠活动", style = MaterialTheme.typography.bodyLarge.copy(lineHeight = 30.sp), color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Spacer(modifier = Modifier.height(20.dp))
                    Button(onClick = onStartSleep, modifier = Modifier.fillMaxWidth()) {
                        Text("开始睡觉")
                    }
                }
            }
        }
    }
}

@Composable
private fun SleepStatsCard(uiState: HomeUiState) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.BarChart, null, tint = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.width(6.dp))
                Text("睡眠统计", style = MaterialTheme.typography.titleMedium)
            }
            Spacer(modifier = Modifier.height(16.dp))
            when {
                uiState.statsLoading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
                }
                uiState.weeklySleepDays != null -> {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        StatItem(label = "本周睡眠天数", value = "${uiState.weeklySleepDays}")
                        StatItem(label = "本月睡眠天数", value = "${uiState.monthlySleepDays}")
                        StatItem(label = "最大连续天数", value = "${uiState.maxContinuousDays}")
                    }
                }
                else -> {
                    Text("暂无统计数据", color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.align(Alignment.CenterHorizontally))
                }
            }
            Spacer(modifier = Modifier.height(6.dp))
        }
    }
}

@Composable
private fun StatItem(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Row(verticalAlignment = Alignment.Bottom) {
            Text(value, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(label, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
