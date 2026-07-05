import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './JobMatch.css';
import { useToast } from '../ToastContext';
import BackBar from '../components/BackBar';
// ...existing imports


function ScoreRing({ score, label }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="score-ring">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} className="score-ring-bg" />
        <circle
          cx="70" cy="70" r={radius}
          stroke={color} strokeWidth="12" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          className="score-ring-fg"
        />
        <text x="70" y="72" textAnchor="middle" className="score-ring-text">{score}%</text>
      </svg>
      <p className="score-ring-label">{label}</p>
    </div>
  );
}

function ProgressBar({ score, label }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="progress-bar-wrapper">
      <div className="progress-bar-label">
        <span>{label}</span>
        <span>{score}%</span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function SkillChips({ items, variant }) {
  if (!items || items.length === 0) return <p className="empty-note">None listed.</p>;
  return (
    <div className="chip-list">
      {items.map((item, idx) => (
        <span key={idx} className={`chip chip-${variant}`}>{item}</span>
      ))}
    </div>
  );
}

function BulletList({ items }) {
  if (!items || items.length === 0) return <p className="empty-note">Nothing to show.</p>;
  return (
    <ul className="bullet-list">
      {items.map((item, idx) => <li key={idx}>{item}</li>)}
    </ul>
  );
}

export default function JobMatch({ resumeId: resumeIdProp }) {
  const { showToast } = useToast();

  const [resumes, setResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(!resumeIdProp);
  const [resumesError, setResumesError] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState(resumeIdProp || '');

  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const fetchResumes = useCallback(async ({ silent } = {}) => {
    if (resumeIdProp) return; // Skip fetching if a resumeId was passed in directly

    if (!silent) setResumesLoading(true);
    setResumesError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/my-resumes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const list = response.data.data || [];
        // Backend already sorts oldest -> newest by versionNumber; we want newest first
        const sorted = [...list].sort((a, b) => b.versionNumber - a.versionNumber);
        setResumes(sorted);

        setSelectedResumeId((prevSelected) => {
          // Keep the current selection if it still exists in the refreshed list,
          // otherwise default to the newest resume.
          const stillExists = sorted.some((r) => r._id === prevSelected);
          if (stillExists) return prevSelected;
          return sorted.length > 0 ? sorted[0]._id : '';
        });

        if (sorted.length === 0) {
          setResumesError('No resumes found. Please upload a resume first.');
        }
      } else {
        setResumesError(response.data.message || 'Could not load your resumes.');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Could not load your resumes. Please try again.';
      setResumesError(message);
      if (!silent) showToast(message, 'error');
    } finally {
      if (!silent) setResumesLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeIdProp]);

  // Fetch on mount
  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // Re-fetch (silently, no spinner) whenever the tab/window regains focus —
  // covers the case where a resume was uploaded on another tab/page and the
  // user switches back here without a full reload.
  useEffect(() => {
    if (resumeIdProp) return;

    const handleFocus = () => fetchResumes({ silent: true });
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') fetchResumes({ silent: true });
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchResumes, resumeIdProp]);

  const handleAnalyze = async () => {
    setError('');
    setResult(null);

    if (!selectedResumeId) {
      setError('Please select a resume first.');
      return;
    }
    if (jobDescription.trim().length < 30) {
      setError('Please paste a more complete job description (at least ~30 characters).');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/job-match`, {
        resumeId: selectedResumeId,
        jobDescription: jobDescription.trim(),
      });

      if (response.data.success) {
        setResult(response.data.data);
        showToast('Job match analysis complete! 🎯', 'success');
      } else {
        const message = response.data.message || 'Analysis failed. Please try again.';
        setError(message);
        showToast(message, 'error');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong while analyzing. Please try again.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jobmatch-page page-fade-in">
      <BackBar title="Job Match Analyzer" />
      <h1 className="jobmatch-title">🎯 Job Match Analyzer</h1>
      <p className="jobmatch-subtitle">Paste a job description below to see how well your resume matches it.</p>

      {!resumeIdProp && (
        <div className="input-group">
          <label htmlFor="resumeSelect">Select Resume</label>
          {resumesLoading ? (
            <p className="empty-note">Loading your resumes...</p>
          ) : resumesError ? (
            <div className="error-box">⚠️ {resumesError}</div>
          ) : (
            <select
              id="resumeSelect"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
            >
              {resumes.map((resume) => (
                <option key={resume._id} value={resume._id}>
                  {resume.fileName} (v{resume.versionNumber})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="input-group">
        <label htmlFor="jobDescription">Job Description</label>
        <textarea
          id="jobDescription"
          rows={10}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
        />
      </div>

      <button
        className="analyze-btn"
        onClick={handleAnalyze}
        disabled={loading || resumesLoading || !selectedResumeId}
      >
        {loading ? 'Analyzing...' : 'Analyze Job Match'}
      </button>

      {loading && (
        <div className="spinner-wrapper">
          <div className="spinner" />
          <p>AI is comparing your resume with the job description...</p>
        </div>
      )}

      

      {result && !loading && (
        <div className="results-dashboard">
          <div className="scores-row">
            <ScoreRing score={result.matchScore} label="Match Score" />
            <div className="ats-wrapper">
              <ProgressBar score={result.atsScore} label="ATS Score" />
            </div>
          </div>

          <div className="summary-box">
            <h3>AI Summary</h3>
            <p>{result.summary}</p>
          </div>

          <div className="grid-2col">
            <div className="card">
              <h3>✅ Matched Skills</h3>
              <SkillChips items={result.matchedSkills} variant="matched" />
            </div>
            <div className="card">
              <h3>❌ Missing Skills</h3>
              <SkillChips items={result.missingSkills} variant="missing" />
            </div>
          </div>

          <div className="grid-2col">
            <div className="card">
              <h3>💪 Strengths</h3>
              <BulletList items={result.strengths} />
            </div>
            <div className="card">
              <h3>⚠️ Weaknesses</h3>
              <BulletList items={result.weaknesses} />
            </div>
          </div>

          <div className="card">
            <h3>🛠️ Recommended Improvements</h3>
            <BulletList items={result.recommendedImprovements} />
          </div>

          <div className="grid-2col">
            <div className="card">
              <h3>📚 Suggested Courses</h3>
              <BulletList items={result.recommendedCourses} />
            </div>
            <div className="card">
              <h3>🚀 Suggested Projects</h3>
              <BulletList items={result.recommendedProjects} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}