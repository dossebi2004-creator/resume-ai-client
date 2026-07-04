// ============================================================
// LoadingState.jsx — Shared step-based loading indicator
//
// Used by both the Upload section (App.js) and Job Match page
// (JobMatch.jsx) so the AI-processing wait feels informative
// instead of a plain spinner. Themeable so each page keeps its
// existing visual identity (warm yellow/orange vs indigo/purple).
//
// Props:
//   steps        - array of string labels, e.g. ["Uploading...", "Analyzing..."]
//   currentStep  - index (0-based) of the step currently in progress.
//                  Steps before this index are shown as completed (✓).
//                  Pass steps.length to mark everything as done.
//   theme        - "warm" (App.js palette) | "indigo" (Job Match palette)
//   message      - optional small caption shown under the spinner
// ============================================================
import React from 'react';

const THEMES = {
  indigo: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    track: '#e5e7eb',
    text: '#1f2937',
    muted: '#6b7280',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  warm: {
    primary: '#FFA726',
    secondary: '#FF7043',
    track: '#EDF2F7',
    text: '#2D3748',
    muted: '#718096',
    fontFamily: "'Poppins', sans-serif",
  },
};

export default function LoadingState({ steps = [], currentStep = 0, theme = 'indigo', message }) {
  const t = THEMES[theme] || THEMES.indigo;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
        padding: '20px 12px',
        fontFamily: t.fontFamily,
        width: '100%',
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: `4px solid ${t.track}`,
          borderTopColor: t.primary,
          animation: 'lsSpin 0.85s linear infinite',
          flexShrink: 0,
        }}
      />

      {message && (
        <p style={{ color: t.muted, fontSize: 13.5, margin: 0, textAlign: 'center' }}>{message}</p>
      )}

      {/* Step list */}
      {steps.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            width: '100%',
            maxWidth: 340,
          }}
        >
          {steps.map((step, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: isDone || isActive ? '#fff' : t.muted,
                    background: isDone
                      ? t.secondary
                      : isActive
                      ? `linear-gradient(135deg, ${t.primary}, ${t.secondary})`
                      : t.track,
                    transition: 'background 0.3s ease',
                  }}
                >
                  {isDone ? '✓' : i + 1}
                </div>
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive || isDone ? t.text : t.muted,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {step}
                </span>
                {isActive && (
                  <span style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
                    <span style={dotStyle(t.primary, 0)} />
                    <span style={dotStyle(t.primary, 0.15)} />
                    <span style={dotStyle(t.primary, 0.3)} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes lsSpin { to { transform: rotate(360deg); } }
        @keyframes lsBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function dotStyle(color, delay) {
  return {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: color,
    animation: `lsBounce 1s ${delay}s infinite ease-in-out`,
  };
}