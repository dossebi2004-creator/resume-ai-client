// client/src/components/Toast.jsx
// -----------------------------------------------------------------------
// A single toast notification — a small popup that shows a message,
// then automatically disappears after a few seconds.
// -----------------------------------------------------------------------

import React, { useEffect } from 'react';

export default function Toast({ id, message, type, onClose }) {
  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const styles = {
    success: { bg: '#E8F5E9', border: '#81C784', color: '#2E7D32', icon: '✅' },
    error:   { bg: '#FFEBEE', border: '#EF5350', color: '#C62828', icon: '⚠️' },
    info:    { bg: '#E1F5FE', border: '#4FC3F7', color: '#0277BD', icon: 'ℹ️' },
  };

  const s = styles[type] || styles.info;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        padding: '14px 18px',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        fontFamily: "'Poppins', sans-serif",
        fontSize: '0.9rem',
        fontWeight: 600,
        minWidth: 260,
        maxWidth: 360,
        animation: 'toastSlideIn 0.3s ease both',
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => onClose(id)}
        style={{
          background: 'none',
          border: 'none',
          color: s.color,
          fontSize: '1.1rem',
          cursor: 'pointer',
          fontWeight: 700,
          lineHeight: 1,
          padding: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}