import React, { useContext } from "react";
import { Context } from "../../main";
import { Link } from "react-router-dom";
import { 
  FaFacebookF, 
  FaYoutube, 
  FaLinkedin, 
  FaTwitter,
  FaInstagram,
  FaGithub,
  FaBriefcase,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowUp
} from "react-icons/fa";

const Footer = () => {
  const { isAuthorized } = useContext(Context);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`modern-footer ${isAuthorized ? "footerShow" : "footerHide"}`}>
      {/* Back to Top Button */}
      <button className="back-to-top" onClick={scrollToTop}>
        <FaArrowUp />
      </button>

      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-logo">
              <FaBriefcase className="logo-icon" />
              <span className="logo-text">JobPortal</span>
            </div>
            <p className="footer-description">
              Connecting talented professionals with amazing opportunities. 
              Find your dream job or discover your next great hire.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <FaYoutube />
              </a>
              <a href="#" className="social-link" aria-label="GitHub">
                <FaGithub />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/job/getall">Browse Jobs</Link></li>
              <li><Link to="/companies">Companies</Link></li>
              <li><Link to="/blogs">Blog</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          {/* For Job Seekers */}
          <div className="footer-section">
            <h3 className="footer-title">For Job Seekers</h3>
            <ul className="footer-links">
              <li><Link to="/job/getall">Find Jobs</Link></li>
              <li><Link to="/applications/me">My Applications</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/resume-builder">Resume Builder</Link></li>
              <li><Link to="/career-advice">Career Advice</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="footer-section">
            <h3 className="footer-title">For Employers</h3>
            <ul className="footer-links">
              <li><Link to="/job/post">Post a Job</Link></li>
              <li><Link to="/job/me">My Jobs</Link></li>
              <li><Link to="/applications/me">Applications</Link></li>
              <li><Link to="/reports">Analytics</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3 className="footer-title">Contact Us</h3>
            <div className="contact-info">
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <span>info@jobportal.com</span>
              </div>
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>123 Business St, City, State 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              <p>&copy; 2024 JobPortal. All rights reserved.</p>
            </div>
            <div className="footer-legal">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/cookies">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
