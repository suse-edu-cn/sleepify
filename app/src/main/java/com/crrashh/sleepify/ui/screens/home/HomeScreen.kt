package com.crrashh.sleepify.ui.screens.home

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Bedtime
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.IconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ExposedDropdownMenuAnchorType
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TimePicker
import androidx.compose.material3.TimePickerDialog
import androidx.compose.material3.rememberTimePickerState
import androidx.compose.ui.unit.sp
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
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
        AutoSleepCard(
            uiState = uiState,
            onToggle = viewModel::toggleAutoSleep,
            onTimeSelected = viewModel::onTimeSelected,
            onFrequencyChanged = viewModel::onFrequencyChanged,
            onToggleDay = viewModel::toggleDay,
            onSave = viewModel::saveAutoSleepConfig,
            onDismissDialog = viewModel::dismissConfigSuccessDialog
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

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
private fun AutoSleepCard(
    uiState: HomeUiState,
    onToggle: (Boolean) -> Unit,
    onTimeSelected: (Int, Int) -> Unit,
    onFrequencyChanged: (String) -> Unit,
    onToggleDay: (Int) -> Unit,
    onSave: () -> Unit,
    onDismissDialog: () -> Unit
) {
    var showTimePicker by remember { mutableStateOf(false) }
    var frequencyExpanded by remember { mutableStateOf(false) }

    if (uiState.showConfigSuccessDialog) {
        AlertDialog(
            onDismissRequest = onDismissDialog,
            title = { Text("提示") },
            text = { Text("自动睡眠配置已更新成功") },
            confirmButton = {
                TextButton(onClick = onDismissDialog) { Text("确定") }
            }
        )
    }

    if (showTimePicker) {
        val parts = uiState.autoSleepTime.split(":")
        val initialHour = parts.getOrNull(0)?.toIntOrNull() ?: 22
        val initialMinute = parts.getOrNull(1)?.toIntOrNull() ?: 0
        val timePickerState = rememberTimePickerState(
            initialHour = initialHour,
            initialMinute = initialMinute,
            is24Hour = true
        )
        AlertDialog(
            onDismissRequest = { showTimePicker = false },
            title = { Text("选择时间") },
            text = {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    TimePicker(state = timePickerState)
                    if (timePickerState.hour !in 20..23) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "时间范围为 20:00 - 23:59",
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (timePickerState.hour in 20..23) {
                            onTimeSelected(timePickerState.hour, timePickerState.minute)
                            showTimePicker = false
                        }
                    }
                ) { Text("确定") }
            },
            dismissButton = {
                TextButton(onClick = { showTimePicker = false }) { Text("取消") }
            }
        )
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.Schedule, null, tint = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.width(6.dp))
                Text("自动睡眠", style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.weight(1f))
                Switch(
                    checked = uiState.autoSleepEnabled,
                    onCheckedChange = onToggle
                )
            }
            Spacer(modifier = Modifier.height(12.dp))

            if (!uiState.autoSleepEnabled) {
                Text(
                    "当前未启用自动睡眠",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                // Time selector
                Text(
                    text = uiState.autoSleepTime,
                    style = MaterialTheme.typography.displaySmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showTimePicker = true }
                        .padding(vertical = 8.dp)
                )
                Spacer(modifier = Modifier.height(12.dp))

                // Frequency dropdown
                val frequencyOptions = listOf("daily" to "每天", "workday" to "工作日", "custom" to "自定义")
                val currentLabel = frequencyOptions.find { it.first == uiState.autoSleepFrequency }?.second ?: "每天"

                ExposedDropdownMenuBox(
                    expanded = frequencyExpanded,
                    onExpandedChange = { frequencyExpanded = it }
                ) {
                    OutlinedTextField(
                        value = currentLabel,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("频率") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = frequencyExpanded) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(ExposedDropdownMenuAnchorType.PrimaryNotEditable)
                    )
                    ExposedDropdownMenu(
                        expanded = frequencyExpanded,
                        onDismissRequest = { frequencyExpanded = false }
                    ) {
                        frequencyOptions.forEach { (value, label) ->
                            DropdownMenuItem(
                                text = { Text(label) },
                                onClick = {
                                    onFrequencyChanged(value)
                                    frequencyExpanded = false
                                }
                            )
                        }
                    }
                }

                // Custom day selector
                if (uiState.autoSleepFrequency == "custom") {
                    Spacer(modifier = Modifier.height(12.dp))
                    val dayLabels = listOf(1 to "一", 2 to "二", 3 to "三", 4 to "四", 5 to "五", 6 to "六", 0 to "日")
                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        dayLabels.forEach { (day, label) ->
                            val selected = day in uiState.autoSleepDays
                            if (selected) {
                                Button(onClick = { onToggleDay(day) }) {
                                    Text(label)
                                }
                            } else {
                                OutlinedButton(onClick = { onToggleDay(day) }) {
                                    Text(label)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = onSave,
                    enabled = !uiState.autoSleepSaving,
                    modifier = Modifier.align(Alignment.End)
                ) {
                    if (uiState.autoSleepSaving) {
                        CircularProgressIndicator(
                            modifier = Modifier.height(18.dp).width(18.dp),
                            strokeWidth = 2.dp,
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    } else {
                        Text("更新配置")
                    }
                }
            }
        }
    }
}
