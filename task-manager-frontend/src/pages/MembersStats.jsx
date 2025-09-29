import React, { useState, useEffect } from 'react';
import api from '../Services/Api';
import './MembersStats.css';

export default function MembersStats() {
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, tasksRes] = await Promise.all([
          api.get('/users'),
          api.get('/tasks'),
        ]);
        setMembers(membersRes);
        setTasks(tasksRes);
        setMessage('');
      } catch (error) {
        setMessage(`Error fetching data: ${error.message}`);
      }
    };
    fetchData();
  }, []);

  // Calculate stats for each member
  const memberStats = members.map(member => {
    const userTasks = tasks.filter(task => task.user_id === member.id);
    const uniqueProjects = new Set(userTasks.map(task => task.project_id));
    const projectNumbers = uniqueProjects.size;
    const taskNumbers = userTasks.length;
    const doneTaskNumbers = userTasks.filter(task => task.status === 'completed').length;
    const salary = Math.floor(Math.random() * 5000) + 2000; // Placeholder for salary (random between 2000-7000)

    return {
      id: member.id,
      name: member.username,
      projectNumbers,
      taskNumbers,
      doneTaskNumbers,
      salary,
    };
  });

  return (
    <div className="stats-container">
      <h1>Members Statistics</h1>
      {message && <p className="error-message">{message}</p>}
      {memberStats.length > 0 ? (
        <table className="stats-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>NP</th>
              <th>NT</th>
              <th>NDT</th>
              <th>Salary</th>
            </tr>
          </thead>
          <tbody>
            {memberStats.map(stat => (
              <tr key={stat.id}>
                <td>{stat.id}</td>
                <td>{stat.name}</td>
                <td>{stat.projectNumbers}</td>
                <td>{stat.taskNumbers}</td>
                <td>{stat.doneTaskNumbers}</td>
                <td>${stat.salary.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="loading-message">Loading statistics...</p>
      )}
    </div>
  );
}