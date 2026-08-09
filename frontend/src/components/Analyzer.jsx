import { useState, useRef } from 'react'
import { IconUpload, IconSearch, IconCheck, IconAlertCircle, IconArrowRight } from '@tabler/icons-react'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
const MAX_FILE_MB = 10

function ErrorBanner({ message, onDismiss, onRetry }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 12,
      padding: '12px 16px', background: 'var(--red-bg)', color: 'var(--red-text)',
      borderRadius: 'var(--radius-sm)', fontSize: 13, lineHeight: 1.5,
      animation: 'slide-in-down 0.2s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      <IconAlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ flex: 1 }}>{message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: 'none', border: '1px solid var(--red-text)', borderRadius: 4,
          cursor: 'pointer', color: 'var(--red-text)', padding: '1px 10px',
          fontSize: 12, fontFamily: 'DM Sans, sans-serif', flexShrink: 0,
        }}>
          Retry
        </button>
      )}
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss error" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--red-text)', padding: 0, fontSize: 16, lineHeight: 1, flexShrink: 0,
        }}>×</button>
      )}
    </div>
  )
}

const scoreColor = (s) => s >= 70 ? 'var(--green-text)' : s >= 50 ? 'var(--amber-text)' : 'var(--red-text)'
const scoreTier  = (s) => s >= 80 ? 'Strong match' : s >= 70 ? 'Good fit' : s >= 50 ? 'Moderate fit' : 'Significant gaps'
const scoreBenchmark = (s) => {
  if (s >= 80) return "You're competitive for this role. Address the remaining gaps to stand out."
  if (s >= 70) return "Good fit. Closing 1–2 gaps below should move you into the top tier."
  if (s >= 50) return "Competitive candidates typically score 70+. Focus on the priority actions below."
  return "Significant gaps. Work through the priority actions below before applying."
}

export default function Analyzer({ initialResume, initialJd, onContextUpdate, onRewrite }) {
  const [resumeFile, setResumeFile] = useState(initialResume || null)
  const [jd, setJd] = useState(initialJd || '')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const fileRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      return setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_FILE_MB} MB.`)
    }
    setResumeFile(file)
    setError(null)
    onContextUpdate?.(file, null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      return setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_FILE_MB} MB.`)
    }
    setResumeFile(file)
    setError(null)
    onContextUpdate?.(file, null)
  }

  const run = async () => {
    if (!resumeFile) return setError('Upload your resume before analyzing.')
    if (!jd.trim()) return setError('Paste a job description to continue.')
    if (jd.trim().length < 80) return setError(`Job description is too short (${jd.trim().length} chars). Paste the full posting for accurate results.`)
    setError(null)
    setLoading(true)
    onContextUpdate?.(resumeFile, jd)
    const form = new FormData()
    form.append('resume', resumeFile)
    form.append('job_description', jd)
    try {
      const res = await fetch(`${API}/analyze`, { method: 'POST', body: form })
      if (!res.ok) throw new Error(await res.text())
      setResults(await res.json())
    } catch {
      setError('Analysis failed. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const topActions = results ? [
    ...results.missing_keywords.slice(0, 2).map(k => `Add "${k}" — it appears in the job description`),
    ...results.experience_gaps.slice(0, 2),
  ].slice(0, 3) : []

  return (
    <div>
      <p style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Resume Analyzer</p>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
        Upload your resume and paste a job description to get your fit score.
      </p>

      {/* Upload */}
      <div style={{ marginBottom: 18 }}>
        <label htmlFor="analyzer-file-display" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
          Resume
        </label>
        <div
          id="analyzer-file-display"
          role="button"
          tabIndex={0}
          aria-label={resumeFile ? `Resume uploaded: ${resumeFile.name}. Click to change.` : 'Upload your resume — click or drag and drop a PDF or TXT file'}
          onClick={() => fileRef.current.click()}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current.click() } }}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          style={{
            border: `2px dashed ${resumeFile ? 'var(--teal)' : 'var(--border-hover)'}`,
            borderRadius: 'var(--radius)', padding: 28, textAlign: 'center', cursor: 'pointer',
            background: resumeFile ? 'var(--teal-light)' : 'var(--bg-secondary)', transition: 'all 0.15s',
          }}
        >
          {resumeFile
            ? <IconCheck size={28} color='var(--teal)' style={{ marginBottom: 8 }} />
            : <IconUpload size={28} color='var(--text-tertiary)' style={{ marginBottom: 8 }} />
          }
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {resumeFile
              ? <span style={{ color: 'var(--teal)', fontWeight: 500 }}>{resumeFile.name}</span>
              : <><span style={{ color: 'var(--teal)', fontWeight: 500 }}>Click to upload</span> or drag and drop</>
            }
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>PDF or TXT, up to {MAX_FILE_MB} MB</p>
          <input
            type="file" ref={fileRef} accept=".pdf,.txt" onChange={handleFile}
            aria-hidden="true" style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* JD */}
      <div style={{ marginBottom: 18 }}>
        <label htmlFor="analyzer-jd" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
          Job description
        </label>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>
          Paste the full posting — more detail means more accurate keyword matching.
        </p>
        <textarea
          id="analyzer-jd"
          aria-label="Job description"
          value={jd}
          onChange={e => { setJd(e.target.value); onContextUpdate?.(null, e.target.value) }}
          placeholder="Paste the full job description here…"
          style={{
            width: '100%', padding: 14, border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)',
            color: 'var(--text)', fontSize: 14, resize: 'vertical', minHeight: 150,
            outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--teal)'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,160,0.1)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
        />
        {jd.length > 0 && jd.trim().length < 80 && (
          <p style={{ fontSize: 12, color: 'var(--amber-text)', marginTop: 6 }}>
            {jd.trim().length} characters — paste the full job posting for accurate results (most are 300–800 characters).
          </p>
        )}
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <button
          onClick={run}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: loading ? '#9ca3af' : 'var(--teal)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
            padding: '12px 28px', fontSize: 15, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Analyzing…' : <><IconSearch size={16} /> Analyze fit</>}
        </button>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} onRetry={!loading ? run : undefined} />}

      {/* Results */}
      {results && (
        <div style={{ marginTop: 32, animation: 'fade-scale-in 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>

          {/* Score card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 64, color: scoreColor(results.overall_fit_score), lineHeight: 1 }}>
              {results.overall_fit_score}
              <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: 'var(--text-tertiary)' }}>/100</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }} title="Scores above 70 are competitive for most roles. Scores below 50 suggest significant keyword gaps.">
              Fit score · <strong style={{ color: scoreColor(results.overall_fit_score) }}>{scoreTier(results.overall_fit_score)}</strong>
              <span style={{ marginLeft: 6, cursor: 'help', borderBottom: '1px dotted var(--text-tertiary)' }} title="How scores work: 80+ = strong match, 70–79 = good fit, 50–69 = moderate, below 50 = significant gaps">?</span>
            </div>
            <div style={{ fontSize: 14, color: scoreColor(results.overall_fit_score), fontWeight: 500, marginTop: 8 }}>
              {scoreBenchmark(results.overall_fit_score)}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              {results.one_line_verdict}
            </div>
          </div>

          {/* Priority actions */}
          {topActions.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 14 }}>
                Top actions to improve your fit
              </div>
              {topActions.map((action, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < topActions.length - 1 ? 10 : 0, fontSize: 14, lineHeight: 1.6 }}>
                  <span style={{ color: 'var(--teal)', fontWeight: 600, minWidth: 18, flexShrink: 0 }}>{i + 1}.</span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          )}

          {/* Missing keywords */}
          {results.missing_keywords.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--red-text)', marginBottom: 12 }}>Missing keywords</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {results.missing_keywords.map(k => (
                  <span key={k} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, fontWeight: 500, background: 'var(--red-bg)', color: 'var(--red-text)' }}>{k}</span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested bullets */}
          <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', margin: '28px 0 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            Suggested resume bullets
            <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
          </div>
          {results.suggested_resume_bullets.map((b, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '14px 18px', marginBottom: 10,
              fontSize: 14, lineHeight: 1.7,
            }}>
              {b}
            </div>
          ))}

          {/* Strengths and gaps */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, marginTop: 24 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 12 }}>Strengths</div>
              {results.strengths.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 14, lineHeight: 1.6 }}>
                  <IconCheck size={16} color='var(--teal)' style={{ flexShrink: 0, marginTop: 3 }} />
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 12 }}>Experience gaps</div>
              {results.experience_gaps.map((g, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 14, lineHeight: 1.6 }}>
                  <IconAlertCircle size={16} color='var(--red-text)' style={{ flexShrink: 0, marginTop: 3 }} />
                  <span>{g}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Matched keywords */}
          {results.matched_keywords.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--green-text)', marginBottom: 12 }}>Matched keywords</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {results.matched_keywords.map(k => (
                  <span key={k} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, fontWeight: 500, background: 'var(--green-bg)', color: 'var(--green-text)' }}>{k}</span>
                ))}
              </div>
            </div>
          )}

          {/* Cross-feature CTA */}
          {onRewrite && resumeFile && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
              <button
                onClick={onRewrite}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: '1px solid var(--teal)',
                  color: 'var(--teal)', borderRadius: 'var(--radius-sm)',
                  padding: '11px 22px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--teal-light)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
              >
                Rewrite this resume <IconArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
