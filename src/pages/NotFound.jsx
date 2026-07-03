// client/src/pages/NotFound.jsx
// -----------------------------------------------------------------------
// Shown whenever someone visits a URL that doesn't match any route
// (e.g. a typo, an old bookmark, or a broken link).
// -----------------------------------------------------------------------

import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.emoji}>🧭</div>
        <h1 style={styles.code}>404</h1>
        <h2 style={styles.title}>Page Not Found</h2>
        <p style={styles.subtitle}>
          The page you're looking for doesn't exist, may have been moved, or the link might be broken.
        </p>
        <Link to="/" style={styles.button}>
          ⬅ Back to Home
        </Link>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg,#FFF8E1 0%,#FFF3E0 30%,#E1F5FE 70%,#F3E5F5 100%)',
    fontFamily: "'Poppins', sans-serif",
    padding: '2rem',
  },
  card: {
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(16px)',
    borderRadius: 24,
    boxShadow: '0 8px 32px rgba(255,167,38,0.15)',
    border: '1px solid rgba(255,255,255,0.8)',
    padding: '3rem 2.5rem',
    textAlign: 'center',
    maxWidth: 440,
  },
  emoji: {
    fontSize: '3.5rem',
    marginBottom: '0.5rem',
  },
  code: {
    fontSize: 'clamp(3rem, 8vw, 4.5rem)',
    fontWeight: 900,
    background: 'linear-gradient(135deg,#E65100 0%,#FFA726 45%,#0277BD 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1,
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#2D3748',
    marginBottom: '0.8rem',
  },
  subtitle: {
    color: '#718096',
    fontSize: '0.95rem',
    lineHeight: 1.7,
    marginBottom: '2rem',
  },
  button: {
    display: 'inline-block',
    background: 'linear-gradient(135deg,#FFA726,#FF7043)',
    color: '#fff',
    textDecoration: 'none',
    padding: '13px 32px',
    borderRadius: 40,
    fontWeight: 700,
    fontSize: '0.95rem',
    boxShadow: '0 6px 20px rgba(255,112,67,0.38)',
    transition: 'all 0.25s ease',
  },
};