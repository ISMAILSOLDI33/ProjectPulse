// src/components/ProjectProgressTable.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContexts';
import api from '../Services/Api';
import './ProjectProgressTable.css';

const ProjectProgressTable = ({ refreshKey }) => {
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setMessage('Please log in to view project progress');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    api.get('/projects/progress')
      .then((data) => {
        if (data.length > 0) {
          setProjects(data);
          setMessage('');
        } else {
          setMessage('No project progress data found');
        }
      })
      .catch((error) => setMessage(`Error fetching projects: ${error.message}`))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, refreshKey]);

  if (isLoading) {
    return <div className="progress-container"><p>Loading...</p></div>;
  }

  if (!isAuthenticated) {
    return <div className="progress-container"><p>{message}</p></div>;
  }

  return (
    <div className="progress-container">
      <h1>Project Progress</h1>
      {message && <p className="message">{message}</p>}
      <table>
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Total Tasks</th>
            <th>Completed Tasks</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.project_id}>
              <td>{project.project_name}</td>
              <td>{project.total_tasks}</td>
              <td>{project.completed_tasks}</td>
              <td>{project.progress}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectProgressTable;