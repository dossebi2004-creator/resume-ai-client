// client/src/components/FAQSection.jsx
// -----------------------------------------------------------------------
// An accordion-style FAQ section. Clicking a question expands/collapses
// its answer with a smooth height animation.
// -----------------------------------------------------------------------

import React, { useState } from 'react';

const FAQS = [
  {
    q: "How secure is my resume?",
    a: "Your resume is stored securely and only accessible by you. We use industry-standard encryption and never share your data with third parties."
  },
  {
    q: "How long does analysis take?",
    a: "Most resumes are analyzed within 10-15 seconds. Larger or more complex documents may take slightly longer."
  },
  {
    q: "Does ATS score matter?",
    a: "Yes — many companies use Applicant Tracking Systems (ATS) to automatically filter resumes before a human ever sees them. A higher ATS score means your resume is more likely to pass that first screening."
  },
  {
    q: "Which file types are supported?",
    a: "We currently support PDF, DOC, and DOCX formats, up to 5MB in size."
  },
  {
    q: "Can I download reports?",
    a: "Yes — once your resume is analyzed, you can download a professional PDF report or have it emailed directly to any address."
  },
  {
    q: "How is AI used?",
    a: "Our AI reads your resume, extracts your skills and experience, compares them against job descriptions, and generates a personalized score along with suggestions to improve your resume."
  },
];

function FAQItem({ faq, isOpen, onClick }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.85)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.9)',
        marginBottom: 12,
        overflow: 'hidden',
        boxShadow: isOpen ? '0 8px 24px rgba(255,167,38,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <button
        onClick={onClick}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 22px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#2D3748' }}>
          {faq.q}
        </span>
        <span
          style={{
            fontSize: '1.3rem',
            color: '#FFA726',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            flexShrink: 0,
            marginLeft: 12,
          }}
        >
          +
        </span>
      </button>

      <div
        style={{
          maxHeight: isOpen ? 300 : 0,
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 0.35s ease, opacity 0.25s ease',
          overflow: 'hidden',
        }}
      >
        <p style={{
          padding: '0 22px 20px',
          color: '#718096',
          fontSize: '0.9rem',
          lineHeight: 1.7,
          margin: 0,
        }}>
          {faq.a}
        </p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section style={{
      padding: '80px 2rem',
      background: 'linear-gradient(180deg,#FFF8E1 0%,#E1F5FE 100%)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{
          fontSize: '0.75rem', fontWeight: 700, color: '#FFA726',
          textTransform: 'uppercase', letterSpacing: 3,
          background: 'rgba(255,167,38,0.1)', padding: '4px 14px',
          borderRadius: 20, display: 'inline-block', marginBottom: 10,
        }}>
          FAQ
        </span>
        <h2 style={{
          fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 800,
          background: 'linear-gradient(135deg,#E65100,#4FC3F7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginTop: 8,
        }}>
          Frequently Asked Questions
        </h2>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {FAQS.map((faq, i) => (
          <FAQItem
            key={i}
            faq={faq}
            isOpen={openIndex === i}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </section>
  );
}