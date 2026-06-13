package com.crrashh.sleepify

import android.app.Application
import com.crrashh.sleepify.di.AppContainer

class SleepifyApp : Application(){
    lateinit var appContainer: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        appContainer = AppContainer(this)
    }
}
