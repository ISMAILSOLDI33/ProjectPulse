import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContexts';
import api from '../Services/Api';
import AddProjectForm from './AddProjectForm';
import './ProjectTable.css';

const ProjectTable = ({ onProjectAction, refreshKey }) => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmItem, setConfirmItem] = useState(null);
  const [confirmType, setConfirmType] = useState('');
  const [confirmStage, setConfirmStage] = useState('confirmation');
  const [confirmName, setConfirmName] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isModifyProjectModalOpen, setIsModifyProjectModalOpen] = useState(false);
  const [isModifyTaskModalOpen, setIsModifyTaskModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [taskTitle, setTaskTitle] = useState(''); 
  const [taskStatus, setTaskStatus] = useState(''); 
  const [taskUserId, setTaskUserId] = useState(''); 

  const [projectVisibility, setProjectVisibility] = useState({});

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setMessage('Please log in to view projects');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [projectsRes, usersRes] = await Promise.all([
          api.get('/projects'),
          api.get('/users'),
        ]);
        setProjects(projectsRes);
        setUsers(usersRes);
        const visibilityState = {};
        projectsRes.forEach((project , index) => {
          visibilityState[project.id] = index === 0;
        });
        setProjectVisibility(visibilityState);
        setMessage('');
      } catch (error) {
        setMessage(`Error fetching data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, refreshKey]);

  const handleAssignTask = (projectId, taskId) => {
    setSelectedTask({ projectId, taskId });
    setSelectedUserId('');
    setIsAssignModalOpen(true);
  };

  const confirmAssignTask = async () => {
    if (selectedTask && selectedUserId) {
      const taskId = selectedTask.taskId;
      try {
        await api.put(`/tasks/${taskId}`, { user_id: selectedUserId });
        setMessage(`Task ${taskId} assigned to user ID ${selectedUserId}`);
        setSelectedTask(null);
        setSelectedUserId('');
        const projectsRes = await api.get('/projects');
        setProjects(projectsRes);
        if (onProjectAction) onProjectAction();
        setIsAssignModalOpen(false);
      } catch (error) {
        setMessage(`Error assigning task: ${error.message}`);
      }
    } else {
      setMessage('Please select a user');
    }
  };

  const handleDeleteTask = (taskId, projectId) => {
    const task = projects.find(p => p.id === projectId)?.tasks.find(t => t.id === taskId);
    setConfirmItem({ taskId, projectId });
    setConfirmType('task');
    setConfirmName(task ? task.title : 'Unknown Task');
    setConfirmStage('confirmation');
    setIsConfirmModalOpen(true);
  };

  const handleDeleteProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setConfirmItem(projectId);
    setConfirmType('project');
    setConfirmName(project ? project.name : 'Unknown Project');
    setConfirmStage('confirmation');
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmStage === 'confirmation') {
      try {
        if (confirmType === 'task' && confirmItem) {
          await api.delete(`/projects/${confirmItem.projectId}/tasks/${confirmItem.taskId}`);
        } else if (confirmType === 'project' && typeof confirmItem === 'number') {
          await api.delete(`/projects/${confirmItem}`);
        }
        setConfirmStage('success');
        const projectsRes = await api.get('/projects');
        setProjects(projectsRes);
        if (onProjectAction) onProjectAction();
      } catch (error) {
        setMessage(`Error deleting ${confirmType}: ${error.message}`);
        setIsConfirmModalOpen(false);
        setConfirmItem(null);
        setConfirmType('');
        setConfirmStage('confirmation');
        setConfirmName('');
      }
    }
  };

  const handleOkMessage = () => {
    setIsConfirmModalOpen(false);
    setConfirmItem(null);
    setConfirmType('');
    setConfirmStage('confirmation');
    setConfirmName('');
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setConfirmItem(null);
    setConfirmType('');
    setConfirmStage('confirmation');
    setConfirmName('');
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleQuitAssign = () => {
    setIsAssignModalOpen(false);
    setSelectedTask(null);
    setSelectedUserId('');
  };

  const handleModifyProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project);
    setNewName(project.name);
    setNewDeadline(project.deadline || '');
    setIsModifyProjectModalOpen(true);
  };

  const handleModifyTask = (taskId) => {
    const task = projects.find(p => p.tasks.some(t => t.id === taskId))?.tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask({ projectId: task.project_id, taskId: task.id });
      setTaskTitle(task.title);
      setTaskStatus(task.status);
      setTaskUserId(task.user_id || '');
      setIsModifyTaskModalOpen(true);
    }
  };

  const confirmModifyProject = async () => {
    if (selectedProject) {
      try {
        await api.put(`/projects/${selectedProject.id}`, { name: newName, deadline: newDeadline || null });
        setMessage(`Project ${newName} modified successfully`);
        const projectsRes = await api.get('/projects');
        setProjects(projectsRes);
        if (onProjectAction) onProjectAction();
        setIsModifyProjectModalOpen(false);
        setSelectedProject(null);
        setNewName('');
        setNewDeadline('');
      } catch (error) {
        setMessage(`Error modifying project: ${error.message}`);
      }
    }
  };

  const confirmModifyTask = async () => {
    if (selectedTask) {
      try {
        await api.put(`/tasks/${selectedTask.taskId}`, { title: taskTitle, status: taskStatus, user_id: taskUserId || null });
        setMessage(`Task ${selectedTask.taskId} modified successfully`);
        const projectsRes = await api.get('/projects');
        setProjects(projectsRes);
        if (onProjectAction) onProjectAction();
        setIsModifyTaskModalOpen(false);
        setSelectedTask(null);
        setTaskTitle('');
        setTaskStatus('');
        setTaskUserId('');
      } catch (error) {
        setMessage(`Error modifying task: ${error.message}`);
      }
    }
  };

  const filteredProjects = projects.map(project => ({
    ...project,
    tasks: project.tasks.filter(task =>
      filter === 'all' || (filter === 'assigned' && task.user_id) || (filter === 'not-assigned' && !task.user_id)
    ),
  })).filter(project => project.tasks.length > 0);

  const toggleTable = (projectId) => {
    setProjectVisibility(prevVisibility => ({
      ...prevVisibility,
      [projectId]: !prevVisibility[projectId],
    }));
  };

  if (isLoading) {
    return (
      <div className="table-container">
        <p className="loading-message">Loading projects...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="table-container">
        <p className="error-message">{message}</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-header" style={{ marginTop: '0' }}>
        <h1>Current Projects</h1>
        <button className="add-new-project" style={{ marginLeft: '450px', height: '32px' }} onClick={openModal}>
          Add New Project
        </button>
        <select
          className="filter-dropdown"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ textAlign: 'center' }}
        >
          <option value="all">All</option>
          <option value="assigned">Assigned</option>
          <option value="not-assigned">Not Assigned</option>
        </select>
      </div>
      {message && <p className="message">{message}</p>}
      {filteredProjects.length === 0 ? (
        <p className="empty-message">No projects available with the selected filter.</p>
      ) : (
        filteredProjects.map((project, index) => (
          <div key={project.id} style={{ marginBottom: index < filteredProjects.length - 1 ? '40px' : '0' }}>
            <hr
              style={{
                height: '3px',
                color: 'black',
                background: 'linear-gradient(to right, #28a745, #1e7e34)',
                borderRadius: '20px',
              }}
            />
            <table style={{ borderTop: '4px', borderTopColor: 'black' }}>
              <thead className="project-header">
                <tr>
                  <th 
                    style={{ 
                      color: 'green', 
                      fontSize: '1.0em', 
                      background: 'transparent', 
                      textAlign: 'left', 
                      width: '70%', 
                      cursor: 'pointer' 
                    }}
                    onClick={() => toggleTable(project.id)}
                  >
                    <h3>{project.name}</h3>
                  </th>
                  <th style={{ background: 'transparent', textAlign: 'right', width: '30%' }}>
                    <button
                      className="assign stylish-button"
                      onClick={() => handleModifyProject(project.id)}
                      style={{ padding: '0 10px', background: 'transparent' }}
                    >
                      <i className="fas fa-pen-alt" style={{ fontSize: '20px', color: 'green' }}></i>
                    </button>
                    <button
                      className="delete-project stylish-button"
                      onClick={() => handleDeleteProject(project.id)}
                      style={{ padding: '0 10px', background: 'transparent' }}
                    >
                      <i className="fas fa-trash-alt" style={{ fontSize: '20px', color: '#EF4444' }}></i>
                    </button>
                    <button
                      className="toggle-table-btns"
                      onClick={() => toggleTable(project.id)}
                      style={{ padding: '0 10px', background: 'transparent' }}
                    >
                      <i className={`far ${projectVisibility[project.id] ? 'fa-caret-square-up' : 'fa-caret-square-down'}`} style={{ fontSize: '25px' }}></i>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className={`project-tasks-body ${projectVisibility[project.id] ? '' : 'project-hidden'}`}>
                <tr style={{ background: 'linear-gradient(to right, #28a745, #1e7e34)', color: '#F3F4F6', borderRadius: '5px 5px 0 0' }}>
                  <th style={{ textAlign: 'left' }}>Task</th>
                  <th style={{ textAlign: 'right', paddingRight: '20px' }}>Action</th>
                </tr>
                {project.tasks.map((task, taskIndex) => (
                  <tr className="stylish-row" key={task.id}>
                    <td style={{ textAlign: 'left' }}>
                      {task.title} ({task.status})
                      {task.user_id && <span style={{ color: 'green' }}> - Assigned to: {users[task.user_id - 1].username}</span>}
                    </td>
                    <td colSpan="2" style={{ textAlign: 'right' }}>
                      <button
                        className="assign stylish-button"
                        onClick={() => handleAssignTask(project.id, task.id)}
                        style={{ padding: '0 10px', marginRight: '10px', backgroundColor: 'transparent' }}
                      >
                        <i className="material-icons" style={{ fontSize: '20px', color: 'skyblue' }}>assignment</i>
                      </button>
                      <button
                        className="assign stylish-button"
                        onClick={() => handleModifyTask(task.id)}
                        style={{ padding: '0 10px', marginRight: '10px', backgroundColor: 'transparent' }}
                      >
                        <i className="fas fa-pen-alt" style={{ fontSize: '20px', color: 'blue' }}></i>
                      </button>
                      <button
                        className="delete-task stylish-button"
                        onClick={() => handleDeleteTask(task.id, project.id)}
                        style={{ padding: '0 10px', marginRight: '10px', backgroundColor: 'transparent' }}
                      >
                        <i className="fas fa-trash-alt" style={{ fontSize: '20px', color: '#EF4444' }}></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AddProjectForm onProjectAdded={() => { onProjectAction(); closeModal(); }} />
            <button className="modal-close-button" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
      {isConfirmModalOpen && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {confirmStage === 'confirmation' ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="48px"
                    viewBox="0 -960 960 960"
                    width="48px"
                    fill="#EF4444"
                    style={{ animation: 'fadeInScale 0.5s ease-out' }}
                  >
                    <path d="M261-120q-24.75 0-42.37-17.63Q201-155.25 201-180v-570h-41v-60h188v-30h264v30h188v60h-41v570q0 24-18 42t-42 18H261Zm438-630H261v570h438v-570ZM367-266h60v-399h-60v399Zm166 0h60v-399h-60v399ZM261-750v570-570Z" />
                  </svg>
                </div>
                <p
                  style={{
                    textAlign: 'center',
                    marginBottom: '20px',
                    fontSize: '2.5em',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontFamily: "'Poppins', Arial, sans-serif",
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                    animation: 'slideInBounce 0.7s ease-out',
                  }}
                >
                  Are you sure you want to delete this {confirmType}?
                </p>
                <div style={{ textAlign: 'center' }}>
                  <button className="modal-action-button" onClick={handleConfirmDelete} style={{ marginRight: '10px', backgroundColor: '#dc3545' }}>
                    Yes
                  </button>
                  <button className="modal-action-button" onClick={handleCancelDelete} style={{ backgroundColor: '#6c757d' }}>
                    No
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="48px"
                    viewBox="0 -960 960 960"
                    width="48px"
                    fill="#28a745"
                    style={{ animation: 'fadeInScale 0.5s ease-out' }}
                  >
                    <path d="M600-230v-60h145v60H600Zm0-368v-60h280v60H600Zm0 184v-60h235v60H600ZM125-675H80v-60h170v-45h135v45h170v60h-45v415q0 24-18 42t-42 18H185q-24 0-42-18t-18-42v-415Zm60 0v415h265v-415H185Zm0 0v415-415Z" />
                  </svg>
                </div>
                <p
                  style={{
                    textAlign: 'center',
                    marginBottom: '20px',
                    fontSize: '2.5em',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontFamily: "'Poppins', Arial, sans-serif",
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                    animation: 'slideInBounce 0.7s ease-out',
                  }}
                >
                  The {confirmType} "{confirmName}" has been deleted
                </p>
                <div style={{ textAlign: 'center' }}>
                  <button className="modal-action-button" onClick={handleOkMessage} style={{ backgroundColor: '#28a745' }}>
                    OK
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {isAssignModalOpen && (
        <div className="modal-overlay" onClick={handleQuitAssign}>
          <div className="modal-content assign-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Assign Task</h2>
            <p>Task ID: {selectedTask ? selectedTask.taskId : 'N/A'}</p>
            <select
              className="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option className="options" value="">Select User</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} (ID: {user.id})
                </option>
              ))}
            </select>
            <div style={{ marginTop: '20px' }}>
              <button className="assign" onClick={confirmAssignTask}>
                Confirm
              </button>
              <button className="add-new-project" onClick={handleQuitAssign}>
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
      {isModifyProjectModalOpen && selectedProject && (
        <div className="modal-overlay" onClick={() => setIsModifyProjectModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Modify Project</h2>
            <label>
              Name:
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ marginLeft: '10px', padding: '5px' }}
              />
            </label>
            <br />
            <label>
              Deadline:
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                style={{ marginLeft: '10px', padding: '5px' }}
              />
            </label>
            <br />
            <button className="modal-action-button" onClick={confirmModifyProject} style={{ marginTop: '10px' }}>
              Save
            </button>
            <button className="modal-action-button" onClick={() => setIsModifyProjectModalOpen(false)} style={{ marginTop: '10px', marginLeft: '10px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {isModifyTaskModalOpen && selectedTask && (
        <div className="modal-overlay" onClick={() => setIsModifyTaskModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Update Task</h2>
            <br />
            <label>
              Name:
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                style={{ marginLeft: '10px', padding: '5px' }}
              />
            </label>
            <br />
            <br />
            <label>
              Status:
              <input
                type="text"
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                style={{ marginLeft: '10px', padding: '5px' }}
              />
            </label>
            <br />
            <br />
            <label>
              User ID:
              <select
                value={taskUserId}
                onChange={(e) => setTaskUserId(e.target.value || '')}
                style={{ marginLeft: '10px', padding: '5px' }}
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} (ID: {user.id})
                  </option>
                ))}
              </select>
            </label>
            <br />
            <div className='save-action' style={{textAlign :"right" , marginTop : "15px"}}>
              <button className="modal-action-button" onClick={confirmModifyTask} style={{ marginTop: '10px' }}>
                Save
              </button>
              <button className="modal-action-button" onClick={() => setIsModifyTaskModalOpen(false)} style={{ marginTop: '10px', marginLeft: '10px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTable;