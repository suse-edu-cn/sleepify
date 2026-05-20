# Retrofit
-keepattributes Signature
-keepattributes Exceptions
-keep class com.crrashh.sleepify.data.api.models.** { *; }
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }

# Gson
-keep class com.google.gson.** { *; }
-keepattributes *Annotation*
