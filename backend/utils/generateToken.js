const jwt = require("jsonwebtoken")

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    })

    res.cookie("token", token, {
        httpOnly: true,                                    // JS on the frontend can't read it — mitigates XSS token theft
        secure: process.env.NODE_ENV === "production",      // only sent over HTTPS in prod
        sameSite: "strict",                                 // blocks it being sent on cross-site requests — mitigates CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000                      // 7 days, in ms — keep in sync with expiresIn above
    })

    return token
}

module.exports = generateToken;