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
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Warning
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
        PointsCard(
            uiState = uiState,
            onRefresh = viewModel::refreshUser
        )
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
                        Icon(Icons.Default.Warning, null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("暂无活跃的睡眠记录", style = MaterialTheme.typography.bodyLarge.copy(lineHeight = 30.sp), color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(onClick = onStartSleep, modifier = Modifier.fillMaxWidth()) {
                        Icon(Icons.Default.Bedtime, null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("开始睡觉")
                    }
                }
            }
        }
    }
}

@Composable
private fun PointsCard(
    uiState: HomeUiState,
    onRefresh: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow)
    ) {
        Column(modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Star, null, tint = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("积分", style = MaterialTheme.typography.titleMedium)
                }
                IconButton(onClick = onRefresh) {
                    Icon(Icons.Default.Refresh, contentDescription = "刷新")
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
            when {
                uiState.userLoading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
                }
                uiState.userInfo != null -> {
                    Text("${uiState.userInfo.points}", style = MaterialTheme.typography.headlineLarge.copy(lineHeight = 44.sp), color = MaterialTheme.colorScheme.primary)
                }
                else -> {
                    Text(uiState.userError ?: "无法加载积分", style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 26.sp), color = MaterialTheme.colorScheme.error)
                }
            }
        }
    }
}
