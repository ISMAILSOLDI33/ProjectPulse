// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProjectTable from '../componenets/ProjectTable';
import MemberWorkingOnTable from '../componenets/MemberWorkingOnTable';
import ProjectProgressTable from '../componenets/ProjectProgressTable';
import SideBarAdmin from '../componenets/SideBarAdmin';
import './Dashboard.css';
import AdminLogo from './AdminLogo.jsx'
import MembersStats from './MembersStats.jsx';

const Dashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const handleProjectAction = () => {
    setRefreshKey(prev => prev + 1);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard">
      {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}
      <div className="dashboard-header">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#2c3e50">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
          </svg>
        </button>
        <h1 className="big-title">Admin Dashboard</h1>
      </div>
      <div className="dashboard-container">
        {isSidebarOpen && <SideBarAdmin onClose={toggleSidebar} />}
        <div className="content-container">
          {location.pathname === '/admindashboard' && (
            <>
              <ProjectTable onProjectAction={handleProjectAction} refreshKey={refreshKey} />
              <MemberWorkingOnTable refreshKey={refreshKey} />
            </>
          )}
          {location.pathname === '/admindashboard/about-project' && (
            <ProjectProgressTable refreshKey={refreshKey} />
          )}
          {location.pathname === '/admindashboard/members-stats' && (
            <MembersStats refreshKey={refreshKey} />
          )}          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;