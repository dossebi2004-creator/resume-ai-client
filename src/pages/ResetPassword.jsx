// client/src/pages/ResetPassword.jsx
// -----------------------------------------------------------------------
// This is the page the link inside the reset-password email points to.
// The URL contains a token, e.g.: /reset-password/abc123token
// We read that token from the URL and send it + the new password to
// the backend to complete the reset.
// -----------------------------------------------------------------------

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import { useToast } from '../ToastContext';

export default function ResetPassword() {
  // Pulls the token out of the URL — matches the :token part of the
  // route we'll register in App.js as /reset-password/:token
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // ⚠️ Adjust this URL/shape to match your actual resetPassword route.
      // Common patterns are either:
      //   POST /api/auth/reset-password/:token   with { password } in body
      //   POST /api/auth/reset-password           with { token, password } in body
      // This assumes the first pattern — tell me if yours is different.
      const response = await axios.post(
  `${process.env.REACT_APP_API_URL}/api/auth/reset-password/${token}`,
  { password }
);

      if (response.data.success) {
        setSuccess(true);
        showToast('Password reset successful! ✅', 'success');
        // Give them a moment to read the success message, then send to login
        setTimeout(() => navigate('/login'), 2500);
      } else {
        const message = response.data.message || 'Reset failed. The link may have expired.';
        setError(message);
        showToast(message, 'error');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'This reset link is invalid or has expired. Please request a new one.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page page-fade-in">
        <div className="auth-card">
          <h1 className="auth-title">Password reset ✅</h1>
          <p className="auth-subtitle">
            Your password has been updated. Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page page-fade-in">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-subtitle">Enter a new password for your account.</p>

        <div className="input-group">
          <label htmlFor="password">New Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>

        <div className="input-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
          />
        </div>

        {error && <div className="error-box">⚠️ {error}</div>}

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <p className="auth-switch">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}