import React, { useContext, useEffect, useState } from "react";
import "./App.css";
import { Context } from "./main";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Home from "./components/Home/Home";
import Jobs from "./components/Job/Jobs";
import JobDetails from "./components/Job/JobDetails";
import Application from "./components/Application/Application";
import MyApplications from "./components/Application/MyApplications";
import PostJob from "./components/Job/PostJob";
import NotFound from "./components/NotFound/NotFound";
import MyJobs from "./components/Job/MyJobs";
import Blog from "./components/blog/Blog";
import BlogDetail from "./components/blog/BlogDetail";
import Company from "./components/Company/Company";
import ReportDashboard from "./components/Reports/ReportDashboard";

const AppContent = () => {
  const { isAuthorized, setIsAuthorized, setUser } = useContext(Context);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      // Only check authentication if not on login/register pages
      if (location.pathname === '/login' || location.pathname === '/register') {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:4000/api/v1/user/getuser",
          {
            withCredentials: true,
          }
        );
        setUser(response.data.user);
        setIsAuthorized(true);
      } catch (error) {
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/job/getall" element={<Jobs />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/application/:id" element={<Application />} />
        <Route path="/applications/me" element={<MyApplications />} />
        <Route path="/job/post" element={<PostJob />} />
        <Route path="/job/me" element={<MyJobs />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/blogs" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/companies" element={<Company />} />
        <Route path="/reports" element={<ReportDashboard />} />
      </Routes>
      <Footer />
      <Toaster />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
