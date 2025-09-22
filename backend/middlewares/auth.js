import { pool, userQueries } from "../database/postgresSchemas.js";
import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  console.log('Authentication check:', { token: token ? 'present' : 'missing' });
  
  if (!token) {
    console.log('No token found, returning 401');
    return next(new ErrorHandler("User Not Authorized", 401));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('Token decoded successfully:', { id: decoded.id });
  } catch (jwtError) {
    console.log('JWT verification failed:', jwtError.message);
    return next(new ErrorHandler("Invalid token", 401));
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  
  const client = await pool.connect();
  try {
    const result = await client.query(userQueries.findById, [decoded.id]);
    if (result.rows.length === 0) {
      return next(new ErrorHandler("User Not Found", 401));
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return next(new ErrorHandler("Authentication failed", 401));
  } finally {
    client.release();
  }
});
