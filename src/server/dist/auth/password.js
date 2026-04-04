import argon2 from "argon2";
export async function hashPassword(password) {
    return argon2.hash(password);
}
export async function verifyPassword(hash, password) {
    try {
        return await argon2.verify(hash, password);
    }
    catch {
        return false;
    }
}
