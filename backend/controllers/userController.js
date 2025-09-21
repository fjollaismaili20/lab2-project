import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { pool, userQueries } from "../database/postgresSchemas.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill full form!"));
  }
  
  const client = await pool.connect();
  try {
    // Check if email already exists
    const existingUser = await client.query(userQueries.findByEmail, [email]);
    if (existingUser.rows.length > 0) {
      return next(new ErrorHandler("Email already registered!"));
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await client.query(userQueries.insert, [
      name, email, phone, hashedPassword, role
    ]);
    
    const user = result.rows[0];
    sendToken(user, 201, res, "User Registered!");
  } catch (error) {
    console.error('Registration error:', error);
    return next(new ErrorHandler("Registration failed", 500));
  } finally {
    client.release();
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password."));
  }
  
  const client = await pool.connect();
  try {
    const result = await client.query(userQueries.findByEmail, [email]);
    if (result.rows.length === 0) {
      return next(new ErrorHandler("Invalid Email Or Password.", 400));
    }
    
    const user = result.rows[0];
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid Email Or Password.", 400));
    }
  
    
    sendToken(user, 201, res, "User Logged In!");
  } catch (error) {
    console.error('Login error:', error);
    return next(new ErrorHandler("Login failed", 500));
  } finally {
    client.release();
  }
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out Successfully.",
    });
});


export const getUser = catchAsyncErrors((req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});