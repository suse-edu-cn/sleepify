export const EC_CURVE = 'P-256'
export const EC_UNCOMPRESSED_PREFIX = 0x04
export const EC_POINT_SIZE = 65
export const AES_TAG_SIZE = 16
export const AES_IV_SIZE = 12
export const HKDF_INFO = new TextEncoder().encode('sleepify-ecies-v1')
export const HKDF_SALT = new Uint8Array(32)
