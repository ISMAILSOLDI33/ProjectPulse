// src/components/SideBarAdmin.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './SideBarAdmin.css';
import stats from "./stats.svg"

const SideBarAdmin = ({ isOpen, onClose }) => {
  return (
    <div className={`sidebar ${!isOpen ? 'closed' : 'open'}`}>
      <div className="sidebar-header">
        <Link to={"/admindashboard"} style={{textDecoration : "none"}}><h2>For the Admin</h2></Link>
        <button className="sidebar-close-btn" onClick={onClose}>
          <i className="fas fa-angle-double-left" style={{ fontSize: '36px' }}></i>
        </button>
      </div>
      <div className="sidebar-body">
        <Link to ="/admindashboard"  className="sidebar-link"><i class="fa fa-dashboard" style={{fontSize: '18px'}}> Dashboard</i></Link>
        <Link to="/memberdashboard" className="sidebar-link"><i className="fas fa-tasks" style={{ fontSize: '18px' }}> Your Task</i></Link>
        <Link to="/admindashboard/about-project" className="sidebar-link"><i className="fas fa-project-diagram" style={{ fontSize: '20px' }}> About Project</i></Link>
        <Link to="/admindashboard/members-stats" className="sidebar-link"><i class="fa fa-bar-chart-o" style={{ fontSize: '18px' , fontWeight: "bold"}}> Members Stats</i></Link>
      </div>
      <div className="sidebar-footer">
        <h3>Notifications</h3>
        <p>No new notifications</p>
      </div>
    </div>
  );
};

export default SideBarAdmin;