// src/components/Navbar.js
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";
import { useState } from "react";
import LogoutModal from "./LogoutModal"; // Import the new component
import "./NavBar.css"; // Ensure this file exists
// import logo from "./logo.png"  // ❌ Not needed anymore

export default function Navbar() {
  const [isModalLogoutOpen, setIsModalLogoutOpen] = useState(false);
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    setIsModalLogoutOpen(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await logout();
      setIsModalLogoutOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleQuitLogout = () => {
    setIsModalLogoutOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <Link to="/home" aria-label="Task Manager Home">
            {/* Inline SVG logo (white + gold) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 700 160"
              width="200"
              height="40"
              role="img"
              aria-label="Task Manager logo"
            >
              {/* Background removed so it blends with navbar */}
              <text
                x="0"
                y="100"
                fontFamily="Segoe UI, Poppins, Arial, sans-serif"
                fontWeight="700"
                fontSize="100"
                fill="#ffffff"
                letterSpacing="1"
              >
                Task
              </text>
              <text
                x="230"
                y="90"
                fontFamily="Segoe UI, Poppins, Arial, sans-serif"
                fontWeight="700"
                fontSize="70"
                fill="#d4af37"
                letterSpacing="1"
              >
                Manager
              </text>
              <text
                x="5"
                y="150"
                fontFamily="Arial, sans-serif"
                fontSize="50"
                fill="#ffffff"
                opacity="0.8"
              >
                Web Application
              </text>
            </svg>
          </Link>
        </div>
        <ul className="nav-list">
          <li>
            <Link to="/home">Home</Link>
          </li>
          {isAuthenticated && !isAdmin && (
            <li>
              <Link to="/memberdashboard">Member Dashboard</Link>
            </li>
          )}
          {isAuthenticated && isAdmin && (
            <li>
              <Link to="/admindashboard">Admin Dashboard</Link>
            </li>
          )}
          {!isAuthenticated ? (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          ) : (
            <li>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </li>
          )}
        </ul>
      </nav>
      <LogoutModal
        isOpen={isModalLogoutOpen}
        onConfirm={handleConfirmLogout}
        onCancel={handleQuitLogout}
      />
    </>
  );
}
