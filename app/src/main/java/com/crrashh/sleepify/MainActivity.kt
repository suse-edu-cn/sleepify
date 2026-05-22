package com.crrashh.sleepify

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.crrashh.sleepify.ui.components.AppShell
import com.crrashh.sleepify.ui.navigation.Screen
import com.crrashh.sleepify.ui.screens.home.HomeScreen
import com.crrashh.sleepify.ui.screens.home.HomeViewModel
import com.crrashh.sleepify.ui.screens.info.InfoScreen
import com.crrashh.sleepify.ui.screens.info.InfoViewModel
import com.crrashh.sleepify.ui.screens.ranking.RankingScreen
import com.crrashh.sleepify.ui.screens.ranking.RankingViewModel
import com.crrashh.sleepify.ui.screens.sign.SignInScreen
import com.crrashh.sleepify.ui.screens.sign.SignInViewModel
import com.crrashh.sleepify.ui.theme.SleepifyTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val app = application as SleepifyApp
        val container = app.appContainer

        setContent {
            SleepifyTheme {
                val navController = rememberNavController()
                val isLoggedIn by container.tokenDataStore.isLoggedIn.collectAsState(initial = false)
                val startDestination = if (isLoggedIn) Screen.Home.route else Screen.SignIn.route

                var showTokenExpiredDialog by remember { mutableStateOf(false) }

                LaunchedEffect(Unit) {
                    container.tokenExpired.collect {
                        showTokenExpiredDialog = true
                    }
                }

                if (showTokenExpiredDialog) {
                    AlertDialog(
                        onDismissRequest = {},
                        title = { Text("提示") },
                        text = { Text("登录信息已失效") },
                        confirmButton = {
                            TextButton(onClick = {
                                showTokenExpiredDialog = false
                                navController.navigate(Screen.SignIn.route) {
                                    popUpTo(0) { inclusive = true }
                                }
                            }) {
                                Text("重新登录")
                            }
                        }
                    )
                }

                val tabOrder = mapOf(
                    Screen.Home.route to 0,
                    Screen.Ranking.route to 1,
                    Screen.Info.route to 2
                )

                AppShell(navController = navController) {
                    NavHost(navController = navController, startDestination = startDestination) {
                        composable(Screen.SignIn.route) {
                            val vm: SignInViewModel = viewModel(
                                factory = SignInViewModel.factory(container.authRepository)
                            )
                            SignInScreen(
                                onSignInSuccess = {
                                    navController.navigate(Screen.Home.route) {
                                        popUpTo(Screen.SignIn.route) { inclusive = true }
                                    }
                                },
                                viewModel = vm
                            )
                        }
                        composable(
                            Screen.Home.route,
                            enterTransition = {
                                val from = tabOrder[initialState.destination.route] ?: 0
                                val to = 0
                                if (from < to) slideInHorizontally { it } else slideInHorizontally { -it }
                            },
                            exitTransition = {
                                val from = 0
                                val to = tabOrder[targetState.destination.route] ?: 0
                                if (from < to) slideOutHorizontally { -it } else slideOutHorizontally { it }
                            }
                        ) {
                            val vm: HomeViewModel = viewModel(
                                factory = HomeViewModel.factory(container.userRepository, container.sleepRepository)
                            )
                            HomeScreen(viewModel = vm)
                        }
                        composable(
                            Screen.Ranking.route,
                            enterTransition = {
                                val from = tabOrder[initialState.destination.route] ?: 1
                                val to = 1
                                if (from < to) slideInHorizontally { it } else slideInHorizontally { -it }
                            },
                            exitTransition = {
                                val from = 1
                                val to = tabOrder[targetState.destination.route] ?: 1
                                if (from < to) slideOutHorizontally { -it } else slideOutHorizontally { it }
                            }
                        ) {
                            val vm: RankingViewModel = viewModel(
                                factory = RankingViewModel.factory(container.rankingRepository, container.tokenDataStore)
                            )
                            RankingScreen(viewModel = vm)
                        }
                        composable(
                            Screen.Info.route,
                            enterTransition = {
                                val from = tabOrder[initialState.destination.route] ?: 2
                                val to = 2
                                if (from < to) slideInHorizontally { it } else slideInHorizontally { -it }
                            },
                            exitTransition = {
                                val from = 2
                                val to = tabOrder[targetState.destination.route] ?: 2
                                if (from < to) slideOutHorizontally { -it } else slideOutHorizontally { it }
                            }
                        ) {
                            val vm: InfoViewModel = viewModel(
                                factory = InfoViewModel.factory(container.userRepository, container.authRepository)
                            )
                            InfoScreen(
                                onSignOut = {
                                    navController.navigate(Screen.SignIn.route) {
                                        popUpTo(0) { inclusive = true }
                                    }
                                },
                                viewModel = vm
                            )
                        }
                    }
                }
            }
        }
    }
}
