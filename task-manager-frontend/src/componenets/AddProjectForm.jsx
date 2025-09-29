// src/components/AddProjectForm.jsx
import React, { useState } from 'react';
import api from '../Services/Api';
import './AddProjectForm.css';

const AddProjectForm = ({ onProjectAdded, onClose }) => {
  const [projectName, setProjectName] = useState('');
  const [tasks, setTasks] = useState([{ title: '', status: 'working on...' }]);
  const [deadline, setDeadline] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const addTaskField = () => {
    setTasks([...tasks, { title: '', status: 'working on...' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName || tasks.some(t => !t.title)) {
      setMessage('Please fill all fields (Project name and task titles are required)');
      return;
    }

    const newProject = {
      name: projectName,
      deadline: deadline || null,
      tasks: tasks.map((task) => ({
        title: task.title,
        status: task.status,
      })),
    };

    setIsLoading(true);
    try {
      await api.post('/projects', newProject);
      setMessage(`Project ${projectName} added successfully`);
      setProjectName('');
      setTasks([{ title: '', status: 'working on...' }]);
      setDeadline('');
      if (onProjectAdded) onProjectAdded();
      setTimeout(() => {
        setMessage('');
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      setMessage(`Error adding project: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      {message && <p className="message">{message}</p>}
      {isLoading && <p>Loading...</p>}
      <form onSubmit={handleSubmit}>
        <h2 style={{textAlign : "center" , color: "black" , margin:"10px 10px"}}>Add Project</h2>
        <input
          type="text"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
        />
        {tasks.map((task, index) => (
          <div key={index} className="task-input-group">
            <input
              type="text"
              placeholder={`Task ${index + 1} Title`}
              value={task.title}
              onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
              required
            />
            <select
              value={task.status}
              onChange={(e) => handleTaskChange(index, 'status', e.target.value)}
            >
              <option value="working on...">Working on...</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        ))}
        <button type="button" onClick={addTaskField}>Add Another Task</button>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>Submit Project</button>
      </form>
    </div>
  );
};

export default AddProjectForm;