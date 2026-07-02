import React, { useState } from 'react';
import axios from 'axios';
import './JobMatch.css';

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
  const [resumeId, setResumeId] = useState(resumeIdProp || '');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    setError('');
    setResult(null);

    if (!resumeId.trim()) {
      setError('Please provide a resume ID (upload a resume first).');
      return;
    }
    if (jobDescription.trim().length < 30) {
      setError('Please paste a more complete job description (at least ~30 characters).');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/job-match`, {
        resumeId: resumeId.trim(),
        jobDescription: jobDescription.trim(),
      });

      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError(response.data.message || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong while analyzing. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jobmatch-page">
      <h1 className="jobmatch-title">🎯 Job Match Analyzer</h1>
      <p className="jobmatch-subtitle">Paste a job description below to see how well your resume matches it.</p>

      {!resumeIdProp && (
        <div className="input-group">
          <label htmlFor="resumeId">Resume ID</label>
          <input
            id="resumeId"
            type="text"
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
            placeholder="Paste the resume's MongoDB _id here"
          />
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

      <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Job Match'}
      </button>

      {loading && (
        <div className="spinner-wrapper">
          <div className="spinner" />
          <p>AI is comparing your resume with the job description...</p>
        </div>
      )}

      {error && <div className="error-box">⚠️ {error}</div>}

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
            <BulletList items={result.recommendations?.improvements} />
          </div>

          <div className="grid-2col">
            <div className="card">
              <h3>📚 Suggested Courses</h3>
              <BulletList items={result.recommendations?.courses} />
            </div>
            <div className="card">
              <h3>🚀 Suggested Projects</h3>
              <BulletList items={result.recommendations?.projects} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}