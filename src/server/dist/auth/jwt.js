import jwt from "jsonwebtoken";
function getJwtSecret() {
    const s = process.env.JWT_SECRET;
    if (!s)
        return null;
    return s;
}
export function signAccessToken(payload) {
    const secret = getJwtSecret();
    if (!secret)
        return null;
    return jwt.sign(payload, secret, { expiresIn: "2h" });
}
export function verifyAccessToken(token) {
    const secret = getJwtSecret();
    if (!secret)
        return null;
    try {
        const decoded = jwt.verify(token, secret);
        if (typeof decoded !== "object" || !decoded)
            return null;
        if (!("userId" in decoded))
            return null;
        const userId = decoded.userId;
        if (typeof userId !== "string" || userId.length === 0)
            return null;
        return { userId };
    }
    catch {
        return null;
    }
}
