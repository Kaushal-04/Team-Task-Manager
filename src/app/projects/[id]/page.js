'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import styles from './page.module.css';
import { useParams } from 'next/navigation';

export default function ProjectDetails() {
  const params = useParams();
  const id = params?.id;
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', assignedToId: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const isAdmin = project?.members?.some(m => m.userId === user?.id && m.role === 'ADMIN');

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, projectId: id })
      });
      if (res.ok) {
        setIsTaskModalOpen(false);
        setNewTask({ title: '', description: '', priority: 'MEDIUM', assignedToId: '' });
        fetchProject();
      } else {
        alert('Failed to create task');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchProject();
      else {
        const data = await res.json();
        alert(data.error || 'Failed to update task');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newMemberEmail })
      });
      if (res.ok) {
        setNewMemberEmail('');
        fetchProject();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="container mt-8"><div className="loader"></div></div>;
  if (!project) return <div className="container mt-8">Project not found</div>;

  const todoTasks = project.tasks.filter(t => t.status === 'TODO');
  const progressTasks = project.tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = project.tasks.filter(t => t.status === 'DONE');

  const renderTaskCard = (task) => (
    <div key={task.id} className={styles.taskCard} onClick={() => setSelectedTask(task)}>
      <div className={styles.taskTitle}>{task.title}</div>
      {task.description && <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>{task.description}</div>}
      <div className={styles.taskMeta}>
        <span className={`${styles.priority} ${styles[task.priority.toLowerCase()]}`}>{task.priority}</span>
        <span>{task.assignedTo ? task.assignedTo.name : 'Unassigned'}</span>
      </div>
      <div style={{marginTop: '0.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.75rem'}}>
        {task.status !== 'TODO' && <button className="btn-secondary" style={{padding: '0.25rem 0.5rem'}} onClick={(e) => { e.stopPropagation(); handleUpdateTaskStatus(task.id, 'TODO'); }}>To Do</button>}
        {task.status !== 'IN_PROGRESS' && <button className="btn-secondary" style={{padding: '0.25rem 0.5rem'}} onClick={(e) => { e.stopPropagation(); handleUpdateTaskStatus(task.id, 'IN_PROGRESS'); }}>In Progress</button>}
        {task.status !== 'DONE' && <button className="btn-secondary" style={{padding: '0.25rem 0.5rem'}} onClick={(e) => { e.stopPropagation(); handleUpdateTaskStatus(task.id, 'DONE'); }}>Done</button>}
      </div>
    </div>
  );

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{project.name}</h1>
          <p className={styles.desc}>{project.description}</p>
        </div>
        <div className={styles.actions}>
          <button className="btn-secondary" onClick={() => setIsMemberModalOpen(true)}>Members</button>
          {isAdmin && <button className="btn-primary" onClick={() => setIsTaskModalOpen(true)}>+ Task</button>}
        </div>
      </div>

      <div className={styles.board}>
        <div className={styles.column}>
          <div className={styles.colHeader}>
            <span>To Do</span>
            <span className={styles.taskCount}>{todoTasks.length}</span>
          </div>
          <div className={styles.colBody}>
            {todoTasks.map(renderTaskCard)}
          </div>
        </div>
        <div className={styles.column}>
          <div className={styles.colHeader}>
            <span>In Progress</span>
            <span className={styles.taskCount}>{progressTasks.length}</span>
          </div>
          <div className={styles.colBody}>
            {progressTasks.map(renderTaskCard)}
          </div>
        </div>
        <div className={styles.column}>
          <div className={styles.colHeader}>
            <span>Done</span>
            <span className={styles.taskCount}>{doneTasks.length}</span>
          </div>
          <div className={styles.colBody}>
            {doneTasks.map(renderTaskCard)}
          </div>
        </div>
      </div>

      {isTaskModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Create Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea rows={3} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>Priority</label>
                <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Assign To</label>
                <select value={newTask.assignedToId} onChange={e => setNewTask({...newTask, assignedToId: e.target.value})}>
                  <option value="">Unassigned</option>
                  {project.members.map(m => (
                    <option key={m.userId} value={m.userId}>{m.user.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn-secondary" onClick={() => setIsTaskModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMemberModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Project Members</h2>
            <div className={styles.memberList}>
              {project.members.map(m => (
                <div key={m.id} className={styles.memberItem}>
                  <div>
                    <div>{m.user.name}</div>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{m.user.email}</div>
                  </div>
                  <span className={styles.memberRole}>{m.role}</span>
                </div>
              ))}
            </div>
            {isAdmin && (
              <form onSubmit={handleAddMember} style={{marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem'}}>
                <div className={styles.formGroup}>
                  <label>Add Member by Email</label>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <input required type="email" placeholder="user@example.com" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} />
                    <button type="submit" className="btn-primary">Add</button>
                  </div>
                </div>
              </form>
            )}
            <div className={styles.modalActions} style={{marginTop: '1.5rem'}}>
              <button className="btn-secondary" onClick={() => setIsMemberModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
