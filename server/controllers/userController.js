import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js"

// Sign up new user
export const signup = async (req, res) => {
    try {
        console.log("Body:",req.body);
        const { fullname, email, password, bio } = req.body;

        if (!fullname || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing details" })
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.json({ success: false, message: "Already has an account" })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullname,
            email,
            password: hashedPassword, // 🔥 FIXED (SECURE)
            bio
        });
        const token = generateToken(newUser._id)
        res.json({ success: true, userData: newUser, token, message: "Account Created Successfully" });


    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//user login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email })
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(userData._id)
        res.json({ success: true, userData, token, message: "Login Success" });



    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//controller to check if user is authenticated

export const checkAuth = (req, res) => {
    console.log("req.user:", req.user); // 🔥 ADD THIS
    res.json({ success: true, userData: req.user });
};


//controller to update user profile details

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullname } = req.body;
        const userId = req.user._id;

        let updatedUser;
        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullname }, { new: true })

        }
        else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullname }, { new: true });
        }


        res.json({ success: true, user: updatedUser })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}



