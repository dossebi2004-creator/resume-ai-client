// client/src/pages/ResumeHistory.jsx
// -----------------------------------------------------------------------
// Shows a timeline of every resume version the logged-in user has
// uploaded. Each version can be downloaded as a PDF report or emailed
// to any address.
// -----------------------------------------------------------------------

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ResumeHistory.css';
import { useToast } from '../ToastContext';
import BackBar from '../components/BackBar';


function getScore(resume) {
  return resume?.aiAnalysis?.resumeScore ?? null;
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ResumeHistory() {
  const { showToast } = useToast();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- NEW (Day 11): state for the "Email this report" modal ---
  const [emailModalFor, setEmailModalFor] = useState(null); // holds the resume being emailed, or null if modal is closed
  const [emailInput, setEmailInput] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/my-resumes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setResumes(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load your resume history.');
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to load your resume history.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Downloads the PDF report for a specific resume version.
  const handleDownloadPDF = async (resumeId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
  `${process.env.REACT_APP_API_URL}/api/resume/${resumeId}/pdf-report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileName.replace(/\.[^/.]+$/, '')}_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      showToast('Failed to download the PDF report. Please try again.', 'error');
      console.error('PDF download error:', err);
    }
  };

  // --- NEW (Day 11): sends the PDF report to an email address ---
  const handleSendEmail = async () => {
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setEmailMessage('⚠️ Please enter a valid email address.');
      return;
    }

    setEmailSending(true);
    setEmailMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
  `${process.env.REACT_APP_API_URL}/api/resume/${emailModalFor._id}/email-report`,
        { email: emailInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setEmailMessage('✅ Report sent successfully! Check the inbox.');
        showToast('Report emailed successfully! 📧', 'success');
      } else {
        const message = response.data.message || 'Failed to send.';
        setEmailMessage(message);
        showToast(message, 'error');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send. Please try again.';
      setEmailMessage(message);
      showToast(message, 'error');
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="history-page page-fade-in">
      <BackBar title="Job Match Analyzer" />
      <h1 className="history-title">📈 Resume Version History</h1>
      <p className="history-subtitle">
        Track how your resume has improved across every version you've uploaded.
      </p>

      {loading && (
        <div className="spinner-wrapper">
          <div className="spinner" />
          <p>Loading your resume history...</p>
        </div>
      )}

      

      {!loading && !error && resumes.length === 0 && (
        <div className="empty-state">
          <p>You haven't uploaded any resumes yet.</p>
          <Link to="/#upload" className="upload-link-btn">
            Upload your first resume
          </Link>
        </div>
      )}

      {!loading && !error && resumes.length > 0 && (
        <div className="timeline">
          {resumes.map((resume, index) => {
            const score = getScore(resume);
            const previousScore = index > 0 ? getScore(resumes[index - 1]) : null;

            let trend = null;
            if (score !== null && previousScore !== null) {
              if (score > previousScore) trend = 'up';
              else if (score < previousScore) trend = 'down';
              else trend = 'same';
            }

            return (
              <div className="timeline-item" key={resume._id}>
                <div className="timeline-marker">
                  <span className="version-badge">v{resume.versionNumber}</span>
                </div>

                <div className="timeline-card">
                  <div className="timeline-card-header">
                    <h3>{resume.fileName}</h3>
                    <span className="timeline-date">{formatDate(resume.uploadDate)}</span>
                  </div>

                  <div className="timeline-score-row">
                    {score !== null ? (
                      <>
                        <div className="score-pill">
                          Score: <strong>{score}%</strong>
                        </div>
                        {trend === 'up' && <span className="trend trend-up">▲ Improved</span>}
                        {trend === 'down' && <span className="trend trend-down">▼ Dropped</span>}
                        {trend === 'same' && <span className="trend trend-same">— No change</span>}
                      </>
                    ) : (
                      <span className="no-score">No AI score available</span>
                    )}
                  </div>

                  <div className="timeline-meta">
                    <span>{resume.fileType?.split('/').pop()?.toUpperCase()}</span>
                    <span>•</span>
                    <span>{resume.fileSize}</span>
                  </div>

                  {/* PDF download button (Day 10) */}
                  <button
                    className="download-pdf-btn"
                    onClick={() => handleDownloadPDF(resume._id, resume.fileName)}
                  >
                    📄 Download PDF Report
                  </button>

                  {/* NEW (Day 11): Email report button */}
                  <button
                    className="email-report-btn"
                    onClick={() => {
                      setEmailModalFor(resume);
                      setEmailInput('');
                      setEmailMessage('');
                    }}
                  >
                    📧 Email Report
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NEW (Day 11): "Email this report" modal — shown only when
          emailModalFor holds a resume (i.e. after clicking the button above) */}
      {emailModalFor && (
        <div className="modal-overlay" onClick={() => setEmailModalFor(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Email this report</h3>
            <p className="modal-subtitle">Sending: {emailModalFor.fileName}</p>
            <input
              type="email"
              placeholder="recipient@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
            {emailMessage && <p className="modal-message">{emailMessage}</p>}
            <div className="modal-actions">
              <button onClick={() => setEmailModalFor(null)} className="modal-cancel">
                Cancel
              </button>
              <button onClick={handleSendEmail} disabled={emailSending} className="modal-send">
                {emailSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
