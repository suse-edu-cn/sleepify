package com.crrashh.sleepify.util

import android.util.Base64
import java.math.BigInteger
import java.security.KeyFactory
import java.security.SecureRandom
import java.security.spec.ECGenParameterSpec
import java.security.spec.ECParameterSpec
import java.security.spec.ECPoint
import java.security.spec.ECPublicKeySpec
import javax.crypto.Cipher
import javax.crypto.KeyAgreement
import javax.crypto.Mac
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

private const val EC_POINT_SIZE = 65
private const val AES_TAG_SIZE = 16
private const val AES_IV_SIZE = 12
private val HKDF_INFO = "sleepify-ecies-v1".toByteArray(Charsets.UTF_8)
private val HKDF_SALT = ByteArray(32)

/**
 * ECIES encryption matching the server's implementation.
 *
 * Shared secret: x-coordinate only (32 bytes) from ECDH.
 * Payload format (Base64 encoded):
 *   ephemeralPublicKey(65) || iv(12) || authTag(16) || ciphertext
 */
object EccCrypto {

    fun encrypt(
        plaintext: ByteArray,
        serverPublicKeyBase64: String
    ): String {
        val serverPublicKeyBytes = Base64.decode(serverPublicKeyBase64, Base64.NO_WRAP)

        // Generate ephemeral EC key pair
        val kpg = java.security.KeyPairGenerator.getInstance("EC")
        kpg.initialize(ECGenParameterSpec("secp256r1"), SecureRandom())
        val ephemeralKeyPair = kpg.generateKeyPair()

        // ECDH: get shared secret x-coordinate (32 bytes)
        val kf = KeyFactory.getInstance("EC")
        val serverPublicKey = kf.generatePublic(
            ECPublicKeySpec(decodeUncompressedPoint(serverPublicKeyBytes), p256Params())
        )
        val keyAgreement = KeyAgreement.getInstance("ECDH")
        keyAgreement.init(ephemeralKeyPair.private)
        keyAgreement.doPhase(serverPublicKey, true)
        val sharedX = keyAgreement.generateSecret().padTo32()

        // Derive AES key via HKDF
        val aesKey = deriveAesKey(sharedX)

        // AES-256-GCM encrypt
        val iv = ByteArray(AES_IV_SIZE).also { SecureRandom().nextBytes(it) }
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(
            Cipher.ENCRYPT_MODE,
            SecretKeySpec(aesKey, "AES"),
            GCMParameterSpec(128, iv)
        )
        val cipherOutput = cipher.doFinal(plaintext)
        val ciphertext = cipherOutput.copyOfRange(0, cipherOutput.size - AES_TAG_SIZE)
        val tag = cipherOutput.copyOfRange(cipherOutput.size - AES_TAG_SIZE, cipherOutput.size)

        // Encode ephemeral public key as uncompressed point
        val ephemeralPublicKey = encodeUncompressedPoint(
            (ephemeralKeyPair.public as java.security.interfaces.ECPublicKey).w
        )

        // Concatenate: ephemeralPublicKey || iv || tag || ciphertext
        val result = ByteArray(EC_POINT_SIZE + AES_IV_SIZE + AES_TAG_SIZE + ciphertext.size)
        var offset = 0
        ephemeralPublicKey.copyInto(result, offset); offset += EC_POINT_SIZE
        iv.copyInto(result, offset); offset += AES_IV_SIZE
        tag.copyInto(result, offset); offset += AES_TAG_SIZE
        ciphertext.copyInto(result, offset)

        return Base64.encodeToString(result, Base64.NO_WRAP)
    }

    private fun encodeUncompressedPoint(point: ECPoint): ByteArray {
        val x = point.affineX.toByteArray().trimToLen(32)
        val y = point.affineY.toByteArray().trimToLen(32)
        return byteArrayOf(0x04) + x + y
    }

    private fun decodeUncompressedPoint(bytes: ByteArray): ECPoint {
        require(bytes.size == EC_POINT_SIZE && bytes[0] == 0x04.toByte()) {
            "Invalid uncompressed point"
        }
        val x = BigInteger(1, bytes.copyOfRange(1, 33))
        val y = BigInteger(1, bytes.copyOfRange(33, 65))
        return ECPoint(x, y)
    }

    private fun deriveAesKey(sharedSecret: ByteArray): ByteArray {
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(HKDF_SALT, "HmacSHA256"))
        val prk = mac.doFinal(sharedSecret)

        mac.init(SecretKeySpec(prk, "HmacSHA256"))
        mac.update(HKDF_INFO)
        mac.update(1.toByte())
        return mac.doFinal().copyOf(32)
    }

    private val cachedParams: ECParameterSpec by lazy {
        val kpg = java.security.KeyPairGenerator.getInstance("EC")
        kpg.initialize(ECGenParameterSpec("secp256r1"))
        (kpg.generateKeyPair().public as java.security.interfaces.ECPublicKey).params
    }

    private fun p256Params(): ECParameterSpec = cachedParams

    /** Pad or trim ByteArray to exactly [targetLen] bytes */
    private fun ByteArray.trimToLen(targetLen: Int): ByteArray {
        if (size == targetLen) return this
        if (size > targetLen) return copyOfRange(size - targetLen, size)
        return ByteArray(targetLen - size) + this
    }

    /** Ensure byte array is exactly 32 bytes (left-pad with zeros) */
    private fun ByteArray.padTo32(): ByteArray = trimToLen(32)
}
