import React, { useContext, useState } from "react";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLock2Fill } from "react-icons/ri";
import { Link, Navigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../main";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthorized, setIsAuthorized, setUser } = useContext(Context);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/v1/user/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      toast.success(data.message);
      setEmail("");
      setPassword("");
      setRole("");
      setUser(data.user); // Store user data including role
      setIsAuthorized(true);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Only redirect if user is already authorized (not from form submission)
  if(isAuthorized && !isLoading){
    return <Navigate to={'/'}/>
  }

  return (
    <>
      <section className="authPage">
        <div className="container">
          <div className="header">
            
            <h3>Login to your account</h3>
          </div>
          <form>
            <div className="inputTag">
              <label>Email Address</label>
              <div>
                <input
                  type="email"
                  placeholder="ek@hotmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <MdOutlineMailOutline />
              </div>
            </div>
            <div className="inputTag">
              <label>Password</label>
              <div>
                <input
                  type="password"
                  placeholder="Your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <RiLock2Fill />
              </div>
            </div>
            <button type="submit" onClick={handleLogin} disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>
            <Link to={"/register"}>Register Now</Link>
          </form>
        </div>
       
      </section>
    </>
  );
};

export default Login;
