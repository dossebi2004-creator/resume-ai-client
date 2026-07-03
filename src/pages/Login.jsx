// client/src/pages/Login.jsx
// -----------------------------------------------------------------------
// Login page. On success, stores the JWT token in localStorage and
// redirects to the homepage. Later steps will use this stored token
// to know "is someone logged in" across the whole app.
// -----------------------------------------------------------------------

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import { useToast } from '../ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast(); // lets us redirect after a successful login

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // stops the browser from doing a full page reload on submit
    setError('');

    // --- Basic client-side validation ---
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email: email.trim(),
        password,
      });

      if (response.data.success) {
        // Save the token so future requests can prove "I'm logged in".
        // localStorage keeps it even if the user refreshes the page.
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        showToast('Welcome back! Login successful 🎉', 'success');

        // Send them to the homepage (or wherever makes sense once
        // we build a dashboard)
        navigate('/');
      } else {
        const message = response.data.message || 'Login failed. Please try again.';
        setError(message);
        showToast(message, 'error');
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-fade-in">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to continue to ResumeAI.</p>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="auth-links-row">
          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </div>

        {error && <div className="error-box">⚠️ {error}</div>}

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
