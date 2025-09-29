// src/pages/MemberDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContexts';
import './MemberDashboard.css';
import TaskTable from '../componenets/TaskTable';
import TaskAlreadyCompleted from '../componenets/TaskAlreadyCompleted';

export default function MemberDashboard() {
  const { user } = useAuth();
  const username = user?.username || 'User';
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTaskCompleted = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="member-dashboard-container">
      <h1>Welcome <span className="shining-username">{username}</span> To Your Own Work Space!</h1>
      <TaskTable onTaskCompleted={handleTaskCompleted} />
      <TaskAlreadyCompleted refreshKey={refreshKey} />
    </div>
  );
}