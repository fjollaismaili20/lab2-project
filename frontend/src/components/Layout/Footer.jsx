import React, { useContext } from "react";
import { Context } from "../../main";

const Footer = () => {
  const { isAuthorized } = useContext(Context);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`simple-footer ${isAuthorized ? "footerShow" : "footerHide"}`}>
      {/* Back to Top Button */}
      <button className="back-to-top" onClick={scrollToTop}>
        ↑
      </button>

      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-logo">JobPortal</span>
        </div>
        <div className="footer-copyright">
          <p>&copy; 2024 JobPortal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
