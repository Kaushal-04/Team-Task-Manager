'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewProject({ name: '', description: '' });
        fetchProjects();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="container mt-8"><div className="loader"></div></div>;

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Projects</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center text-muted mt-8">
          <p>You don't have any projects yet.</p>
          <button className="btn-secondary mt-4" onClick={() => setIsModalOpen(true)}>Create your first project</button>
        </div>
      ) : (
        <div className={styles.projectsGrid}>
          {projects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id} className={styles.projectCard}>
              <h3 className={styles.projectName}>{project.name}</h3>
              <p className={styles.projectDesc}>{project.description || 'No description provided.'}</p>
              <div className={styles.projectMeta}>
                <span className={styles.metaItem}>👥 {project._count?.members || 0} Members</span>
                <span className={styles.metaItem}>📋 {project._count?.tasks || 0} Tasks</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className={styles.formGroup}>
                <label>Project Name</label>
                <input 
                  type="text" 
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  required
                  placeholder="e.g. Q3 Marketing Campaign"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea 
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  rows={3}
                  placeholder="Briefly describe the project..."
                />
              </div>
              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
