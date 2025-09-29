import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";
import { useState } from "react";
import "./NavBarUpdate.css";

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <nav className={`navbar ${isSidebarOpen ? "navbar-shifted" : ""}`}>
        <div className="navbar-left">
          {!isSidebarOpen && (
            <button onClick={toggleSidebar} className="sidebar-toggle">
              <span className="toggle-line"></span>
              <span className="toggle-line"></span>
              <span className="toggle-line"></span>
            </button>
          )}
        </div>
        <div className="navbar-center">
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
        <div className="navbar-right">
          <button className="account-icon">👤</button>
          {isAuthenticated && (
            <button onClick={logout} className="logout-btn">Logout</button>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login" className="auth-link">Login</Link>
              <Link to="/register" className="auth-link">Register</Link>
            </>
          )}
        </div>
      </nav>
      <div className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <Link to="/home" onClick={toggleSidebar} className="sidebar-logo">
            TaskManager
          </Link>
          <button onClick={toggleSidebar} className="sidebar-toggle">
            <span className="toggle-line"></span>
            <span className="toggle-line"></span>
            <span className="toggle-line"></span>
          </button>
        </div>
        <div className="sidebar-content">
          <ul>
            <li>
              <Link to="/home" onClick={toggleSidebar} className="sidebar-link">
                Home
              </Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link to="/memberdashboard" onClick={toggleSidebar} className="sidebar-link">
                  Member Dashboard
                </Link>
              </li>
            )}
            {isAuthenticated && isAdmin && (
              <li>
                <Link to="/admindashboard" onClick={toggleSidebar} className="sidebar-link">
                  Admin Dashboard
                </Link>
              </li>
            )}
            <li>
              <Link to="/about-project" onClick={toggleSidebar} className="sidebar-link">
                About Project
              </Link>
            </li>
            <li className="message-item">
              <Link to="/messages" onClick={toggleSidebar} className="sidebar-link">
                Messages <span className="notification-badge">3</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className={`main-content ${isSidebarOpen ? "main-content-shifted" : ""}`}>
        {/* Placeholder for main content */}
      </div>
    </>
  );
}