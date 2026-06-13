import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.crrashh.sleepify"
    compileSdk = 37

    defaultConfig {
        applicationId = "com.crrashh.sleepify"
        minSdk = 31
        targetSdk = 37
        versionCode = 40
        versionName = "1.0.2"

    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }

    buildFeatures {
        compose = true
        buildConfig = true
        viewBinding = false
    }
    compileSdkMinor = 0
    dependenciesInfo {
        includeInApk = true
        includeInBundle = true
    }

    packaging {
        jniLibs {
            excludes += listOf(
                "lib/arm64-v8a/libandroidx.graphics.path.so",
                "lib/armeabi-v7a/libandroidx.graphics.path.so",
                "lib/x86/libandroidx.graphics.path.so",
                "lib/x86_64/libandroidx.graphics.path.so",
                "lib/arm64-v8a/libdatastore_shared_counter.so",
                "lib/armeabi-v7a/libdatastore_shared_counter.so",
                "lib/x86/libdatastore_shared_counter.so",
                "lib/x86_64/libdatastore_shared_counter.so"
            )
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_21)
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.navigation.compose)

    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)

    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.gson)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.gson)

    implementation(libs.datastore.preferences)
    implementation(libs.coroutines.android)
    implementation(libs.coil.compose)
    implementation(libs.coil.network.okhttp)

    debugImplementation(libs.androidx.ui.tooling)
}
