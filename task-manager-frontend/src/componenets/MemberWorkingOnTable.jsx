
// src/components/MemberWorkingOnTable.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContexts';
import api from '../Services/Api';
import './MemberWorkingOnTable.css';

const MemberWorkingOnTable = ({ onTaskAction, refreshKey }) => {
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setMessage('Please log in to view member tasks');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [usersRes, tasksRes] = await Promise.all([
          api.get('/users'),
          api.get('/tasks'),
        ]);
        setMembers(usersRes);
        setTasks(tasksRes);
        setMessage('');
      } catch (error) {
        setMessage(`Error fetching data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, refreshKey]);

  const handleDeleteTask = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}`, { user_id: "" });
      setTasks(tasks.map(task => task.id === taskId ? { ...task, user_id: "" } : task));
      setMessage('Task unassigned successfully');
      setTimeout(() => setMessage(''), 3000);
      if (onTaskAction) onTaskAction();
    } catch (error) {
      setMessage(`Error unassigning task: ${error.message}`);
    }
  };

  const toggleTable = () => setIsTableVisible(!isTableVisible);

  if (isLoading) {
    return <div className="member-working-on-container"><p>Loading...</p></div>;
  }

  if (!isAuthenticated) {
    return <div className="member-working-on-container"><p>{message}</p></div>;
  }

  return (
    <div className="member-working-on-container">
      <div className="table-header">
        <h1>Members Working On</h1>
        <button className="toggle-table-btn" onClick={toggleTable}>
          <i className={`far ${isTableVisible ? 'fa-caret-square-up' : 'fa-caret-square-down'}`} style={{ fontSize: '36px' }}></i>
        </button>
      </div>
      <div className={`table-content ${isTableVisible ? '' : 'hidden'}`}>
        {message && <p className="message">{message}</p>}
        <table>
          <thead>
            <tr className="titles">
              <th>Member</th>
              <th>Task</th>
            </tr>
          </thead>
          <tbody>
            {members.map(user => {
              const userTasks = tasks.filter(task => task.user_id === user.id);
              if (userTasks.length > 0) {
                return (
                  <tr key={user.id}>
                    <td style={{textAlign : "center"}}><h3>{user.username}</h3></td>
                    <td>
                      {userTasks.map(task => (
                        <div key={task.id} className="task-row">
                          {task.title} // ({task.status})
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteTask(task.id)}
                            aria-label={`Unassign ${task.title} from ${user.username}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M4 7H20" stroke="currentColor" strokeWidth="2"/>
                              <path d="M10 11V17" stroke="currentColor" strokeWidth="2"/>
                              <path d="M14 11V17" stroke="currentColor" strokeWidth="2"/>
                              <path d="M5 7L6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19L19 7" stroke="currentColor" strokeWidth="2"/>
                              <path d="M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </td>
                  </tr>
                );
              }
              return null;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberWorkingOnTable;