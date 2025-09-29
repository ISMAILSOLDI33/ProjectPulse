// src/components/LogoutModal.js
import React from "react";
import "./NavBar.css"; // Reuse NavBar.css for styling
import logouticon from "./logout-icon.svg"

const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-contents logout-modal rotate-modal" onClick={(e) => e.stopPropagation()}>
        <i class="fa fa-sign-out" style={{fontSize : "48px" , color: "#2c3e50"}}></i>
        <p className="modal-text-logout">Are you sure you want to logout ?</p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="confirm-button">
            Yes
          </button>
          <button onClick={onCancel} className="cancel-button">
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;