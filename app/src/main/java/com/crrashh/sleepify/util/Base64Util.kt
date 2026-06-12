package com.crrashh.sleepify.util

import android.util.Base64

fun String.encodeToBase64(): String =
    Base64.encodeToString(toByteArray(Charsets.UTF_8), Base64.NO_WRAP)

fun Double.formatPoints(): String =
    if (this % 1.0 == 0.0) toInt().toString() else String.format("%.1f", this)

fun String.formatIsoDate(): String =
    replace("T", " ").replace("Z", "")
