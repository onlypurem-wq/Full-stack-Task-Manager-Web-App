const User = require("../models/user.model")
const bcrypt = require("bcrypt")
const generateToken = require("../utils/generateToken")

const createUser = async (req, res) => {
    try {

        const {name, password, email} = req.body;


        if (!name || !email || !password) {
            return res.status(400).json({message: "Missing fields"})
        }

        const user = await User.findOne({email})
        if (user) {
            return res.status(400).json({message: "User already exists"})
        }

        const hashpassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({
            name, 
            email,
            password: hashpassword
        })

        generateToken(res, newUser._id);

        const userObj = newUser.toObject();
        delete userObj.password;

        return res.status(201).json({message: "User created successfully", User: userObj})

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({message: "Missing fields"})
        }
        const user = await User.findOne({email: email})

        if (!user) {
            return res.status(404).json({message: "User not found"})
        }

        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            return res.status(400).json({message: "Invalid email or password"})
        }

        generateToken(res, user._id);

        const userObj = user.toObject();
        delete userObj.password;

        return res.status(200).json({message: "Login successful!", user: userObj})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const logoutUser = (req, res) => {
    res.clearCookie("token", { maxAge: 0 })
    return res.status(200).json({ message: "Logged out successfully" })
}

const getUserProfile = async (req, res) => {
    try {
        // req.user was already set by the `protect` middleware,
        // and it's already password-stripped since we used .select("-password") there
        return res.status(200).json({ user: req.user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


module.exports = {createUser, loginUser, logoutUser, getUserProfile}