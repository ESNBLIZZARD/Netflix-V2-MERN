import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const existingUserByEmail = await User.findOne({ email: email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUserByName = await User.findOne({ name: name });
    if (existingUserByName) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const PROFILE_PICS = ["/avatar1.png", "/avatar2.png", "/avatar3.png"];
    const image = PROFILE_PICS[Math.floor(Math.random() * PROFILE_PICS.length)];

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      image,
    });

    generateTokenAndSetCookie(newUser._id, res);
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...newUser._doc,
        password: "", // Exclude sending password from the response
      },
    });
    console.log("Mongo URI:", process.env.MONGO_URI);
  } catch (error) {
    console.log("Error in signup controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function login(req, res) {
 try {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({success: false, message: "All fields are required" });
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({success: false, message: "Invalid credentials" });
  }

  const isPasswordMatch = await bcryptjs.compare(password, user.password);
  if(!isPasswordMatch) {
    return res.status(404).json({success: false, message: "Invalid credentials" });
  }
  generateTokenAndSetCookie(user._id, res);
  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    user: {
      ...user._doc,
      password: "", // Exclude sending password from the response
    },
  });
 } catch (error) {
  console.log("Error in login controller:", error.message)
  res.status(500).json({success: false, message: "Internal server error" });
  }
 }

 
export async function logout(req, res) {
 try {
    res.clearCookie("jwt-netflix", { path: "/" });
    return res.status(200).json({success: true, message: "Logged out successfully" });
  }
  catch (error) {
    console.error("Error in logout controller:", error.message);
    res.status(500).json({success: false, message: "Internal server error" });
  }
}

export async function authCheck(req, res) {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.log("Error in authCheck controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
