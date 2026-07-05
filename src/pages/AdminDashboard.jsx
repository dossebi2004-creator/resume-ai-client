// client/src/pages/AdminDashboard.jsx
// -----------------------------------------------------------------------
// Admin-only dashboard: summary stats, recent activity, and searchable/
// paginated tables for managing users and resumes.
// -----------------------------------------------------------------------

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import BackBar from '../components/BackBar';

export default function AdminDashboard() {
  return (
    <div>
      <BackBar title="Admin Dashboard" />
      {/* rest of your existing AdminDashboard JSX */}
    </div>
  );
}
const API_BASE = `${process.env.REACT_APP_API_URL}/api/admin`;

// Helper: builds the standard Authorization header using the saved token
function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'resumes'

  return (
    <div className="admin-page page-fade-in">
      <h1 className="admin-title">🛠️ Admin Dashboard</h1>

      <div className="admin-tabs">
        <button
          className={activeTab === 'overview' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'users' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={activeTab === 'resumes' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('resumes')}
        >
          Resumes
        </button>
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'resumes' && <ResumesTab />}
    </div>
  );
}

// =========================================================================
// OVERVIEW TAB — summary cards + recent activity
// =========================================================================
function OverviewTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE}/stats`, { headers: authHeaders() });
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load stats.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stats.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading dashboard...</div>;
  if (error) return <div className="admin-error">⚠️ {error}</div>;
  if (!stats) return null;

  return (
    <div>
      {/* --- Summary Cards --- */}
      <div className="stats-grid">
        <StatCard label="Total Users" value={stats.totalUsers} icon="👥" />
        <StatCard label="Total Resumes" value={stats.totalResumes} icon="📄" />
        <StatCard label="AI Analyses Run" value={stats.totalAnalyses} icon="🤖" />
        <StatCard
          label="Avg. Resume Score"
          value={stats.avgResumeScore !== null ? `${stats.avgResumeScore}%` : 'N/A'}
          icon="📊"
        />
      </div>

      {/* --- Recent Activity --- */}
      <div className="recent-grid">
        <div className="recent-card">
          <h3>Recent Uploads</h3>
          {stats.recentUploads.length === 0 ? (
            <p className="empty-note">No uploads yet.</p>
          ) : (
            <ul className="recent-list">
              {stats.recentUploads.map((r) => (
                <li key={r._id}>
                  <span className="recent-main">{r.fileName}</span>
                  <span className="recent-sub">
                    {r.userId?.name || 'Unknown user'} • {formatDate(r.uploadDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="recent-card">
          <h3>Recent Users</h3>
          {stats.recentUsers.length === 0 ? (
            <p className="empty-note">No users yet.</p>
          ) : (
            <ul className="recent-list">
              {stats.recentUsers.map((u) => (
                <li key={u._id}>
                  <span className="recent-main">{u.name}</span>
                  <span className="recent-sub">
                    {u.email} • {u.role} • {formatDate(u.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// =========================================================================
// USERS TAB — searchable, paginated table with delete
// =========================================================================
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE}/users`, {
        headers: authHeaders(),
        params: { search, page, limit: 8 },
      });
      if (response.data.success) {
        setUsers(response.data.data);
        setTotalPages(response.data.pagination.totalPages || 1);
      } else {
        setError(response.data.message || 'Failed to load users.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API_BASE}/users/${id}`, { headers: authHeaders() });
      fetchUsers(); // refresh the list after deleting
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div>
      <input
        className="admin-search"
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      {loading && <div className="admin-loading">Loading users...</div>}
      

      {!loading && !error && (
        <>
          <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="5" className="empty-note">No users found.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDelete(u._id, u.name)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

// =========================================================================
// RESUMES TAB — searchable, paginated table with delete
// =========================================================================
function ResumesTab() {
  const [resumes, setResumes] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE}/resumes`, {
        headers: authHeaders(),
        params: { search, page, limit: 8 },
      });
      if (response.data.success) {
        setResumes(response.data.data);
        setTotalPages(response.data.pagination.totalPages || 1);
      } else {
        setError(response.data.message || 'Failed to load resumes.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resumes.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleDelete = async (id, fileName) => {
    if (!window.confirm(`Delete resume "${fileName}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API_BASE}/resumes/${id}`, { headers: authHeaders() });
      fetchResumes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete resume.');
    }
  };

  return (
    <div>
      <input
        className="admin-search"
        type="text"
        placeholder="Search by file name..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      {loading && <div className="admin-loading">Loading resumes...</div>}
      {error && !loading && <div className="admin-error">⚠️ {error}</div>}

      {!loading && !error && (
        <>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Uploaded By</th>
                <th>Version</th>
                <th>Score</th>
                <th>Uploaded</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resumes.length === 0 ? (
                <tr><td colSpan="6" className="empty-note">No resumes found.</td></tr>
              ) : (
                resumes.map((r) => (
                  <tr key={r._id}>
                    <td>{r.fileName}</td>
                    <td>{r.userId?.name || '—'}</td>
                    <td>{r.versionNumber ? `v${r.versionNumber}` : '—'}</td>
                    <td>{r.aiAnalysis?.resumeScore ? `${r.aiAnalysis.resumeScore}%` : '—'}</td>
                    <td>{formatDate(r.uploadDate)}</td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDelete(r._id, r.fileName)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

// --- Shared pagination control used by both tables ---
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>← Prev</button>
      <span>Page {page} of {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next →</button>
    </div>
  );
}
