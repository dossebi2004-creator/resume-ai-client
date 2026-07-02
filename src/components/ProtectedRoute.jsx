// client/src/components/ProtectedRoute.jsx
// -----------------------------------------------------------------------
// Wraps any page that should require login. If there's no saved token,
// it redirects to /login instead of showing the page.
//
// Usage in App.js:
//   <Route path="/job-match" element={
//     <ProtectedRoute><JobMatch /></ProtectedRoute>
//   } />
// -----------------------------------------------------------------------

import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  // No token saved → user isn't logged in → send them to /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token exists → show the page they asked for
  return children;
}