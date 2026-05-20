package com.crrashh.sleepify.util

import android.util.Base64

fun String.encodeToBase64(): String =
    Base64.encodeToString(toByteArray(Charsets.UTF_8), Base64.NO_WRAP)
