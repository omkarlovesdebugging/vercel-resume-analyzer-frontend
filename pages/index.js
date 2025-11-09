import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('screener'); 
  const [jd, setJd] = useState('');
  const [resume, setResume] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  // --- HANDLERS ---
  async function handleScore(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch('/api/score-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_description: jd, resume_text: resume }),
      });
      const data = await r.json(); // Get JSON data
      if (!r.ok) {
        // Use error detail from FastAPI if present
        throw new Error(data.detail || `API Error: ${r.status} ${r.statusText}`);
      }
      setResult(data);
    } catch (err) {
      setResult({ error: String(err.message) });
    } finally {
      setLoading(false);
    }
  }

  async function handleSummarize(e) {
    e.preventDefault();
    setSummarizing(true);
    setSummaryText('');
    setSummaryError(null);
    try {
      const r = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalText }),
      });
      const data = await r.json();
      if (!r.ok) {
        throw new Error(data.error || data.detail || 'Failed to generate summary');
      }
      setSummaryText(data.summary);
    } catch (err) {
      setSummaryError(String(err.message));
    } finally {
      setSummarizing(false);
    }
  }

  function sendToScreener(target) {
    if (!summaryText) return;
    if (target === 'jd') setJd(summaryText);
    else if (target === 'resume') setResume(summaryText);
    setActiveTab('screener');
  }

  // --- RENDER FUNCTIONS ---
  function renderResults() {
    if (!result) return null;
    if (result.error) {
      return <div className={styles.errorBox}><strong>Error:</strong> {result.error}</div>;
    }

    // --- NEW: Use field names from our Pydantic model ---
    // Note: FastAPI/Pydantic handle the 'Key Matches' -> 'KeyMatches' mapping
    // We also check for the original spaced keys just in case.
    const keyMatches = result.KeyMatches || result['Key Matches'] || [];
    const skillsGap = result.SkillsGap || result['Skills Gap'] || [];
    const analysis = result.summary_analysis || "No analysis provided.";
    const score = result.Score || 0;

    return (
      <>
        {/* --- NEW: The AI-Generated Summary Analysis --- */}
        <div className={styles.analysisCard}>
          <h3>AI Analysis</h3>
          <p>{analysis}</p>
        </div>

        {/* --- The Scorecard Grid --- */}
        <div className={styles.resultsGrid}>
          <div className={styles.resultCard}>
            <span className={styles.scoreLabel}>Overall Fit</span>
            <span className={styles.scoreValue}>{score}/10</span>
          </div>
          <div className={styles.resultCard}>
            <h3>Key Matches</h3>
            <div className={styles.pillContainer}>
              {keyMatches.length > 0 ? (
                keyMatches.map((match) => (
                  <span key={match} className={`${styles.pill} ${styles.pillMatch}`}>{match}</span>
                ))
              ) : <span className={styles.pillNone}>None found</span>}
            </div>
          </div>
          <div className={styles.resultCard}>
            <h3>Skills Gap</h3>
            <div className={styles.pillContainer}>
              {skillsGap.length > 0 ? (
                skillsGap.map((gap) => (
                  <span key={gap} className={`${styles.pill} ${styles.pillGap}`}>{gap}</span>
                ))
              ) : <span className={styles.pillNone}>None found</span>}
            </div>
          </div>
        </div>
      </>
    );
  }

  // (This function is unchanged)
  const renderScreenerTab = () => (
    <>
      <form onSubmit={handleScore} className={styles.form}>
        <div className={styles.inputGrid}>
          <div className={styles.textareaContainer}>
            <label htmlFor="jd">Job Description</label>
            <textarea id="jd" rows={12} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job description here..." />
          </div>
          <div className={styles.textareaContainer}>
            <label htmlFor="resume">Candidate Resume</label>
            <textarea id="resume" rows={12} value={resume} onChange={(e) => setResume(e.target.value)} placeholder="Paste the candidate's resume here..." />
          </div>
        </div>
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Scoring…' : 'Score Fit'}
        </button>
      </form>
      {loading && (<div className={styles.loaderContainer}><div className={styles.loader}></div></div>)}
      {result && (<section className={styles.resultsSection}><h2>Result</h2>{renderResults()}</section>)}
    </>
  );

  // (This function is unchanged)
  const renderSummarizerTab = () => (
    <>
      <form onSubmit={handleSummarize} className={styles.form}>
        <div className={styles.inputGrid}>
          <div className={styles.textareaContainer}>
            <label htmlFor="originalText">Original Text</label>
            <textarea id="originalText" rows={12} value={originalText} onChange={(e) => setOriginalText(e.target.value)} placeholder="Paste a long job description or resume to summarize..."/>
          </div>
          <div className={styles.textareaContainer}>
            <label htmlFor="summaryText">Summarized Text</label>
            <textarea id="summaryText" rows={12} value={summaryText} readOnly placeholder="Your summary will appear here..." className={styles.readOnlyTextarea} />
          </div>
        </div>
        <button type="submit" disabled={summarizing} className={styles.button}>
          {summarizing ? 'Summarizing…' : 'Generate Summary'}
        </button>
      </form>
      {summarizing && (<div className={styles.loaderContainer}><div className={styles.loader}></div></div>)}
      {summaryError && (<div className={styles.errorBox} style={{ marginTop: '1rem' }}><strong>Error:</strong> {summaryError}</div>)}
      {!summarizing && summaryText && (
        <div className={styles.summaryActions}>
          <button onClick={() => sendToScreener('jd')} className={styles.actionButton}>Send to Job Description</button>
          <button onClick={() => sendToScreener('resume')} className={styles.actionButton}>Send to Candidate Resume</button>
        </div>
      )}
    </>
  );

  // (This function is unchanged)
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>FastTrack HR Agent</h1>
      <p className={styles.subtitle}>AI-Powered Hiring Tools</p>
      <div className={styles.tabContainer}>
        <button className={`${styles.tabButton} ${activeTab === 'screener' ? styles.tabButtonActive : ''}`} onClick={() => setActiveTab('screener')}>Resume Screener</button>
        <button className={`${styles.tabButton} ${activeTab === 'summarizer' ? styles.tabButtonActive : ''}`} onClick={() => setActiveTab('summarizer')}>Text Summarizer</button>
      </div>
      <div className={styles.tabContent}>
        {activeTab === 'screener' ? renderScreenerTab() : renderSummarizerTab()}
      </div>
    </main>
  );
}