// src/components/TaskAlreadyCompleted.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContexts';
import api from '../Services/Api';
import './TaskAlreadyCompleted.css';

export default function TaskAlreadyCompleted({ refreshKey }) {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setMessage('Please log in to view completed tasks');
      return;
    }

    setIsLoading(true);
    api.get('/members/completed-tasks')
      .then((data) => {
        if (data.length > 0) {
          setCompletedTasks(data);
          setMessage('');
        } else {
          setMessage('No completed tasks found for the current user');
        }
      })
      .catch((error) => {
        if (error.status === 401) {
          setMessage('Session expired. Please log in again.');
        } else {
          setMessage(`Error fetching completed tasks: ${error.message}`);
        }
      })
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, refreshKey]);

  return (
    <div className="completed-task-container">
      <h2>
        {user?.username
          ? `Completed Tasks for ${user.username}`
          : 'Tasks You Already Completed'}
      </h2>
      {isLoading && <p>Loading...</p>}
      {message && <p className="message">{message}</p>}
      {completedTasks.length > 0 && !isLoading ? (
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Task</th>
              <th>Completed At</th>
            </tr>
          </thead>
          <tbody>
            {completedTasks.map((item, index) => (
              <tr key={`task-${index}`}>
                <td>{item.projectName}</td>
                <td>{item.tasks[0].taskTitle}</td>
                <td>{item.tasks[0].completedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !isLoading && !message && <p>No completed tasks to display.</p>
      )}
    </div>
  );
}