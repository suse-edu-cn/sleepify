import { p256 } from '@noble/curves/nist.js'
import {
    EC_UNCOMPRESSED_PREFIX,
    EC_POINT_SIZE,
    AES_TAG_SIZE,
    AES_IV_SIZE,
    HKDF_INFO,
    HKDF_SALT,
} from './constants'

function getCrypto(): SubtleCrypto {
    return globalThis.crypto.subtle
}

export function generateKeyPair() {
    const privateKey = p256.utils.randomSecretKey()
    const publicKey = p256.getPublicKey(privateKey, false)
    return {
        privateKey: Buffer.from(privateKey).toString('base64'),
        publicKey: Buffer.from(publicKey).toString('base64'),
    }
}

async function deriveAesKey(sharedSecret: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
    const subtle = getCrypto()

    const keyMaterial = await subtle.importKey(
        'raw',
        sharedSecret,
        'HKDF',
        false,
        ['deriveKey']
    )

    return subtle.deriveKey(
        { name: 'HKDF', hash: 'SHA-256', salt: HKDF_SALT, info: HKDF_INFO },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    )
}

export async function encrypt(
    plaintext: Uint8Array<ArrayBuffer>,
    serverPublicKeyBase64: string
): Promise<string> {
    const subtle = getCrypto()
    const serverPublicKey = Uint8Array.from(atob(serverPublicKeyBase64), (c) =>
        c.charCodeAt(0)
    )

    const ephemeralPrivateKey = p256.utils.randomSecretKey()
    const ephemeralPublicKey = p256.getPublicKey(ephemeralPrivateKey, false)

    const sharedPoint = new Uint8Array(p256.getSharedSecret(ephemeralPrivateKey, serverPublicKey))
    const aesKey = await deriveAesKey(sharedPoint)

    const iv = new Uint8Array(globalThis.crypto.getRandomValues(new Uint8Array(AES_IV_SIZE)))
    const encrypted = new Uint8Array(
        await subtle.encrypt({ name: 'AES-GCM', iv, tagLength: 128 }, aesKey, plaintext as Uint8Array<ArrayBuffer>)
    )

    const ciphertext = encrypted.slice(0, -AES_TAG_SIZE)
    const tag = encrypted.slice(-AES_TAG_SIZE)

    const result = new Uint8Array(
        EC_POINT_SIZE + AES_IV_SIZE + AES_TAG_SIZE + ciphertext.length
    )
    result.set(ephemeralPublicKey, 0)
    result.set(iv, EC_POINT_SIZE)
    result.set(tag, EC_POINT_SIZE + AES_IV_SIZE)
    result.set(ciphertext, EC_POINT_SIZE + AES_IV_SIZE + AES_TAG_SIZE)

    return btoa(String.fromCharCode(...result))
}

export async function decrypt(
    payloadBase64: string,
    serverPrivateKeyBase64: string
): Promise<Uint8Array> {
    const subtle = getCrypto()
    const data = Uint8Array.from(atob(payloadBase64), (c) => c.charCodeAt(0))

    const ephemeralPublicKey = data.slice(0, EC_POINT_SIZE)
    const iv = data.slice(EC_POINT_SIZE, EC_POINT_SIZE + AES_IV_SIZE)
    const tag = data.slice(
        EC_POINT_SIZE + AES_IV_SIZE,
        EC_POINT_SIZE + AES_IV_SIZE + AES_TAG_SIZE
    )
    const ciphertext = data.slice(EC_POINT_SIZE + AES_IV_SIZE + AES_TAG_SIZE)

    const serverPrivateKey = Uint8Array.from(atob(serverPrivateKeyBase64), (c) =>
        c.charCodeAt(0)
    )

    const sharedPoint = new Uint8Array(p256.getSharedSecret(serverPrivateKey, ephemeralPublicKey))
    const aesKey = await deriveAesKey(sharedPoint)

    const encrypted = new Uint8Array(ciphertext.length + AES_TAG_SIZE)
    encrypted.set(ciphertext, 0)
    encrypted.set(tag, ciphertext.length)

    const decrypted = await subtle.decrypt(
        { name: 'AES-GCM', iv, tagLength: 128 },
        aesKey,
        encrypted
    )

    return new Uint8Array(decrypted)
}
