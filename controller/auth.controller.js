import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../model/auth.model.js";

// ================= TOKEN =================
const createToken = (user) =>
  jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// ================= REGISTER =================
export const registerUser = async (req, res) => {
  console.log("➡️ registerUser called");

  try {
    const { username, email, password } = req.body;

    // check user exists
    const exist = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (exist) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    console.log("✅ User registered");

    return res.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ register error:", err);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  console.log("➡️ loginUser called");

  try {
    const { email, password } = req.body;

    // find user
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }


    // create token
    const token = createToken(user);

    // send cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };

    res.cookie("token", token, cookieOptions);

    console.log("✅ User logged in");

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ login error:", err);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// ================= GET ME =================
export const getMe = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user?.id)
      .select("-password");

    return res.json({ user });
  } catch {
    return res.json({ user: null });
  }
};

// ================= LOGOUT =================
export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
  });
  return res.json({
    success: true,
    message: "Logged out",
  });
};