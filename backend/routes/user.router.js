const express = require("express")
const router = express.Router()
const {createUser, loginUser, logoutUser, getUserProfile} = require("../controllers/user.controller")
const protect = require("../middleware/auth.middleware")

router.post("/signup", createUser)

router.post("/login", loginUser)

router.post("/logout", logoutUser)

router.get("/profile", protect, getUserProfile)

module.exports = router