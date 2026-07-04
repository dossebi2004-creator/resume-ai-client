// client/src/pages/ForgotPassword.jsx
// -----------------------------------------------------------------------
// User enters their email. On submit, calls the backend which emails
// them a reset link (this part of the backend was built and tested
// yesterday — a real email was confirmed to arrive).
// -----------------------------------------------------------------------

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import { useToast } from '../ToastContext';

export default function ForgotPassword() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false); // true once the email has been sent

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      // ⚠️ Adjust this URL if your backend route is named differently
      // (e.g. /api/auth/forgotpassword instead of /api/auth/forgot-password)
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, {
        email: email.trim(),
      });

      if (response.data.success) {
        setSent(true); // show the "check your email" message
        showToast('Reset link sent! Check your inbox 📩', 'success');
      } else {
        const message = response.data.message || 'Something went wrong. Please try again.';
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

  // --- After a successful submit, show a confirmation instead of the form ---
  if (sent) {
    return (
      <div className="auth-page page-fade-in">
        <div className="auth-card">
          <h1 className="auth-title">Check your email 📩</h1>
          <p className="auth-subtitle">
            If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
          </p>
          <p className="auth-switch">
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page page-fade-in">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Forgot your password?</h1>
        <p className="auth-subtitle">
          Enter your email and we'll send you a link to reset it.
        </p>

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

        

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <p className="auth-switch">
          Remembered your password? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
