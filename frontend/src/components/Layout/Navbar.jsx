import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaUser, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthorized, setIsAuthorized, user, setUser } = useContext(Context);
  const navigateTo = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const handleLogout = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/v1/user/logout",
        {
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
      setIsAuthorized(false);
      setUser({}); // Clear user data
      navigateTo("/login");
    } catch (error) {
      toast.error(error.response.data.message);
      setIsAuthorized(false);
    }
  };

  return (
    <nav className={`modern-navbar ${isAuthorized ? "navbarShow" : "navbarHide"} ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            <span className="logo-text">JobPortal</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-menu">
          <ul className="nav-links">
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={() => setShow(false)}>
                <span>Home</span>
              </Link>
            </li>
            
            <li className="nav-item">
              <Link to="/job/getall" className="nav-link" onClick={() => setShow(false)}>
                <span>Jobs</span>
              </Link>
            </li>

            {user && user.role === "Employer" && (
              <>
                <li className="nav-item">
                  <Link to="/job/post" className="nav-link" onClick={() => setShow(false)}>
                    <span>Post Job</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/job/me" className="nav-link" onClick={() => setShow(false)}>
                    <span>My Jobs</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/applications/me" className="nav-link" onClick={() => setShow(false)}>
                    <span>Applications</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/reports" className="nav-link" onClick={() => setShow(false)}>
                    <span>Reports</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/companies" className="nav-link" onClick={() => setShow(false)}>
                    <span>Companies</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/blogs" className="nav-link" onClick={() => setShow(false)}>
                    <span>Blogs</span>
                  </Link>
                </li>
              </>
            )}

            {user && user.role !== "Employer" && (
              <>
                <li className="nav-item">
                  <Link to="/applications/me" className="nav-link" onClick={() => setShow(false)}>
                    <span>My Applications</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/blogs" className="nav-link" onClick={() => setShow(false)}>
                    <span>Blogs</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>


        {/* User Info and Logout */}
        <div className="navbar-user">
          <div className="user-info-display">
            <div className="user-avatar">
              <span>👤</span>
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || "User"}</span>
              <span className="user-role">{user?.role || "Guest"}</span>
            </div>
          </div>
          <button className="navbar-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="mobile-menu-btn" onClick={() => setShow(!show)}>
          <span className={`hamburger-text ${show ? 'active' : ''}`}>☰</span>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${show ? 'show' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mobile-user-info">
            <div className="mobile-user-avatar">
              <span>👤</span>
            </div>
            <div className="mobile-user-details">
              <span className="mobile-user-name">{user?.name || "User"}</span>
              <span className="mobile-user-role">{user?.role || "Guest"}</span>
            </div>
          </div>
          
          <ul className="mobile-nav-links">
            <li className="mobile-nav-item">
              <Link to="/" className="mobile-nav-link" onClick={() => setShow(false)}>
                <span>Home</span>
              </Link>
            </li>
            
            <li className="mobile-nav-item">
              <Link to="/job/getall" className="mobile-nav-link" onClick={() => setShow(false)}>
                <span>Jobs</span>
              </Link>
            </li>

            {user && user.role === "Employer" ? (
              <>
                <li className="mobile-nav-item">
                  <Link to="/job/post" className="mobile-nav-link" onClick={() => setShow(false)}>
                    <span>Post Job</span>
                  </Link>
                </li>
                <li className="mobile-nav-item">
                  <Link to="/job/me" className="mobile-nav-link" onClick={() => setShow(false)}>
                    <span>My Jobs</span>
                  </Link>
                </li>
                <li className="mobile-nav-item">
                  <Link to="/applications/me" className="mobile-nav-link" onClick={() => setShow(false)}>
                    <span>Applications</span>
                  </Link>
                </li>
                <li className="mobile-nav-item">
                  <Link to="/reports" className="mobile-nav-link" onClick={() => setShow(false)}>
                    <span>Reports</span>
                  </Link>
                </li>
                <li className="mobile-nav-item">
                  <Link to="/companies" className="mobile-nav-link" onClick={() => setShow(false)}>
                    <span>Companies</span>
                  </Link>
                </li>
                <li className="mobile-nav-item">
                  <Link to="/blogs" className="mobile-nav-link" onClick={() => setShow(false)}>
                    <span>Blogs</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="mobile-nav-item">
                  <Link to="/applications/me" className="mobile-nav-link" onClick={() => setShow(false)}>
                    <span>My Applications</span>
                  </Link>
                </li>
                <li className="mobile-nav-item">
                  <Link to="/blogs" className="mobile-nav-link" onClick={() => setShow(false)}>
                    <span>Blogs</span>
                  </Link>
                </li>
              </>
            )}
            
            <li className="mobile-nav-item">
              <button className="mobile-logout-btn" onClick={handleLogout}>
                <FaSignOutAlt className="mobile-nav-icon" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
