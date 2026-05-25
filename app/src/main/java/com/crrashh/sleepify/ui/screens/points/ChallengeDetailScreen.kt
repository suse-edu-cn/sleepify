package com.crrashh.sleepify.ui.screens.points

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChallengeDetailScreen(
    onBack: () -> Unit,
    viewModel: ChallengeDetailViewModel
) {
    val uiState by viewModel.uiState.collectAsState()
    var showEnrollDialog by remember { mutableStateOf(false) }
    var showEnrollSuccessDialog by remember { mutableStateOf(false) }
    var showApplyDialog by remember { mutableStateOf(false) }

    if (showEnrollDialog) {
        AlertDialog(
            onDismissRequest = { showEnrollDialog = false },
            title = { Text("确认报名") },
            text = { Text("确定要报名吗？") },
            confirmButton = {
                TextButton(onClick = {
                    showEnrollDialog = false
                    viewModel.enroll()
                }) {
                    Text("确定")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEnrollDialog = false }) {
                    Text("取消")
                }
            }
        )
    }

    if (showEnrollSuccessDialog) {
        AlertDialog(
            onDismissRequest = { showEnrollSuccessDialog = false },
            title = { Text("提示") },
            text = { Text("报名成功") },
            confirmButton = {
                TextButton(onClick = {
                    showEnrollSuccessDialog = false
                    onBack()
                }) {
                    Text("确定")
                }
            }
        )
    }

    if (uiState.enrollSuccess && !showEnrollSuccessDialog) {
        showEnrollSuccessDialog = true
    }

    if (showApplyDialog) {
        AlertDialog(
            onDismissRequest = { showApplyDialog = false },
            title = { Text("提示") },
            text = { Text("功能正在开发中") },
            confirmButton = {
                TextButton(onClick = { showApplyDialog = false }) {
                    Text("确定")
                }
            }
        )
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0),
        topBar = {
            TopAppBar(
                title = { Text("挑战详情") },
                windowInsets = WindowInsets(0),
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "返回")
                    }
                }
            )
        }
    ) { innerPadding ->
        when {
            uiState.isLoading -> {
                Column(
                    modifier = Modifier.fillMaxSize().padding(innerPadding),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CircularProgressIndicator()
                }
            }
            uiState.error != null -> {
                Column(
                    modifier = Modifier.fillMaxSize().padding(innerPadding),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(uiState.error!!, color = MaterialTheme.colorScheme.error)
                }
            }
            uiState.detail != null -> {
                val detail = uiState.detail!!
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    detail.name,
                                    style = MaterialTheme.typography.headlineSmall,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.weight(1f)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                StatusTag(status = detail.status)
                            }
                            if (!detail.description.isNullOrBlank()) {
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(detail.description, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }

                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow)
                    ) {
                        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            DetailRow("积分", "+${detail.points}")
                            HorizontalDivider()
                            DetailRow(
                                "持续时间",
                                if (detail.isOnetime) "一次性" else "${detail.duration} 天"
                            )
                            HorizontalDivider()
                            DetailRow("截止时间", detail.endTime?.let { formatDeadline(it) } ?: "无")
                            HorizontalDivider()
                            DetailRow("是否可重复", if (detail.isRepeatable) "是" else "否")
                            HorizontalDivider()
                            DetailRow("包含周末", if (detail.isIncludeWeekends) "是" else "否")
                        }
                    }

                    when (detail.status) {
                        "active" -> {
                            Button(
                                onClick = { showEnrollDialog = true },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("报名")
                            }
                        }
                        "expired", "closed" -> {
                            Button(
                                onClick = {},
                                modifier = Modifier.fillMaxWidth(),
                                enabled = false
                            ) {
                                Text("报名")
                            }
                        }
                        "progressing" -> {
                            Button(
                                onClick = { showApplyDialog = true },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("申请")
                            }
                        }
                    }

                    if (uiState.enrollError != null) {
                        Text(uiState.enrollError!!, color = MaterialTheme.colorScheme.error)
                    }
                }
            }
        }
    }
}

@Composable
private fun DetailRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, style = MaterialTheme.typography.bodyLarge)
    }
}

@Composable
private fun StatusTag(status: String) {
    val (text, color) = when (status) {
        "active" -> "可报名" to MaterialTheme.colorScheme.primary
        "progressing" -> "进行中" to MaterialTheme.colorScheme.tertiary
        "closed" -> "已关闭" to MaterialTheme.colorScheme.onSurface
        "expired" -> "已截止" to MaterialTheme.colorScheme.error
        else -> status to MaterialTheme.colorScheme.onSurfaceVariant
    }
    Surface(
        shape = RoundedCornerShape(6.dp),
        color = color.copy(alpha = 0.12f)
    ) {
        Text(
            text,
            style = MaterialTheme.typography.labelSmall,
            color = color,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
        )
    }
}

private fun formatDeadline(isoTime: String): String {
    return try {
        val instant = Instant.parse(isoTime)
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").withZone(ZoneId.systemDefault())
        formatter.format(instant)
    } catch (_: Exception) {
        isoTime
    }
}
