// src/components/TaskTable.jsx
import React, { useState, useEffect } from 'react';
import api from '../Services/Api';
import './TaskTable.css';

export default function TaskTable({ onTaskCompleted, refreshKey }) {
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('');
  const [isConfirmDoneModalOpen, setIsConfirmDoneModalOpen] = useState(false); // Confirmation modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Success modal
  const [selectedTaskId, setSelectedTaskId] = useState(null); // Track the task being processed

  useEffect(() => {
    api.get('/members/tasks')
      .then((data) => {
        if (data.tasks) setTasks(data.tasks.filter(task => task.status !== "completed"));
        else setMessage('No tasks found for the current user');
      })
      .catch((error) => setMessage(`Error fetching tasks: ${error.message}`));
  }, [refreshKey]);

  const handleDone = (taskId) => {
    setSelectedTaskId(taskId);
    setIsConfirmDoneModalOpen(true); // Open confirmation modal
  };

  const handleConfirmMarkAsDone = () => {
    if (selectedTaskId) {
      api.put(`/tasks/${selectedTaskId}/complete`)
        .then(() => {
          setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTaskId));
          setMessage(`Task ID ${selectedTaskId} marked as done`);
          setTimeout(() => setMessage(''), 3000);
          if (onTaskCompleted) onTaskCompleted();
          setIsConfirmDoneModalOpen(false); // Close confirmation modal
          setIsSuccessModalOpen(true); // Open success modal
        })
        .catch((error) => setMessage(`Error marking task as done: ${error.message}`));
    }
  };

  const handleCancelDone = () => {
    setIsConfirmDoneModalOpen(false); // Close confirmation modal
    setSelectedTaskId(null);
  };

  const handleOkaySuccess = () => {
    setIsSuccessModalOpen(false); // Close success modal
  };

  return (
    <div className="task-table-container">
      <h1>Tasks Awaiting You!</h1>
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Tasks</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? (
            Array.from(
              new Map(tasks.map(task => [task.projectId, task])).values()
            ).map(task => {
              const projectTasks = tasks.filter(t => t.projectId === task.projectId);
              return (
                <tr key={`${task.projectId}`}>
                  <td>{task.projectName}</td>
                  <td>
                    {projectTasks.map(task => (
                      <div key={task.id} className="task-item">
                        {task.title}
                        <div className="task-actions">
                          <button
                            className="done-button"
                            onClick={() => handleDone(task.id)}
                          >
                            Done
                          </button>
                          <button
                            className="description-button"
                            onClick={() => alert(`Description for ${task.title} coming soon!`)}
                          >
                            Description
                          </button>
                        </div>
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })
          ) : <h2 className="if-no-tasks">You have no tasks currently</h2>}
        </tbody>
      </table>
      {message && <p className="message">{message}</p>}
      {isConfirmDoneModalOpen && (
        <div className="done-overlay" onClick={handleCancelDone}>
          <div className="done-content" onClick={(e) => e.stopPropagation()}>
            <i className="material-icons" style={{ fontSize: '36px', color: '#1e40af' }}>done</i>
            <p className="done-text">Are you sure you want to mark this task as done?</p>
            <div className="done-buttons">
              <button onClick={handleConfirmMarkAsDone} className="confirm-button">
                Yes
              </button>
              <button onClick={handleCancelDone} className="cancel-button">
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {isSuccessModalOpen && (
        <div className="success-modern-overlay" onClick={handleOkaySuccess}>
          <div className="success-modern-content" onClick={(e) => e.stopPropagation()}>
            <i className="material-icons" style={{ fontSize: '36px', color: '#69e08fff' }}>done</i>
            <p className="success-modern-text">The task ID {selectedTaskId} marked as done</p>
            <div className="success-modern-buttons">
              <button onClick={handleOkaySuccess} className="success-modern-button">
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}