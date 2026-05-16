import { useState, useRef } from 'react'
import { IconUpload, IconSearch, IconCheck, IconAlertCircle } from '@tabler/icons-react'

const API = 'http://127.0.0.1:8000'

export default function Analyzer() {
  const [resumeFile, setResumeFile] = useState(null)
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const fileRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file) setResumeFile(file)
  }

  const run = async () => {
    if (!resumeFile) return alert('Please upload your resume.')
    if (!jd.trim()) return alert('Please paste a job description.')
    setLoading(true)
    const form = new FormData()
    form.append('resume', resumeFile)
    form.append('job_description', jd)
    try {
      const res = await fetch(`${API}/analyze`, { method: 'POST', body: form })
      if (!res.ok) throw new Error(await res.text())
      setResults(await res.json())
    } catch(e) {
      alert('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = results
    ? results.overall_fit_score >= 70 ? 'var(--teal)'
    : results.overall_fit_score >= 50 ? '#EF9F27' : '#E24B4A'
    : 'var(--teal)'

  return (
    <div>
      <p style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Resume Analyzer</p>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
        Upload your resume and paste a job description to get your fit score.
      </p>

      {/* Upload box */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>Resume</label>
        <div
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${resumeFile ? 'var(--teal)' : 'var(--border-hover)'}`,
            borderRadius: 'var(--radius)',
            padding: 28,
            textAlign: 'center',
            cursor: 'pointer',
            background: resumeFile ? 'var(--teal-light)' : 'var(--bg-secondary)',
            transition: 'all 0.15s',
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
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>PDF or TXT, up to 10MB</p>
          <input type="file" ref={fileRef} accept=".pdf,.txt" onChange={handleFile} style={{ display: 'none' }} />
        </div>
      </div>

      {/* JD textarea */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>Job description</label>
        <textarea
          value={jd}
          onChange={e => setJd(e.target.value)}
          placeholder="Paste the job description here..."
          style={{
            width: '100%', padding: 14, border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)',
            color: 'var(--text)', fontSize: 14, resize: 'vertical', minHeight: 150,
          }}
        />
      </div>

      {/* Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <button
          onClick={run}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: loading ? '#9ca3af' : 'var(--teal)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
            padding: '12px 28px', fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Analyzing...' : <><IconSearch size={16} /> Analyze fit</>}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div style={{ marginTop: 32 }}>
          {/* Score card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 64, color: scoreColor, lineHeight: 1 }}>{results.overall_fit_score}</div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>Overall fit score</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>{results.one_line_verdict}</div>
          </div>

          {/* Keywords grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 12 }}>Matched keywords</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {results.matched_keywords.map(k => (
                  <span key={k} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, fontWeight: 500, background: 'var(--green-bg)', color: 'var(--green-text)' }}>{k}</span>
                ))}
              </div>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 12 }}>Missing keywords</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {results.missing_keywords.map(k => (
                  <span key={k} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, fontWeight: 500, background: 'var(--red-bg)', color: 'var(--red-text)' }}>{k}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Strengths and gaps */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
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
                  <IconAlertCircle size={16} color='#E24B4A' style={{ flexShrink: 0, marginTop: 3 }} />
                  <span>{g}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bullets */}
          <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', margin: '28px 0 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            Suggested resume bullets
            <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
          </div>
          {results.suggested_resume_bullets.map((b, i) => (
            <div key={i} style={{ borderLeft: '3px solid var(--teal)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', padding: '14px 18px', marginBottom: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeftColor: 'var(--teal)', borderLeftWidth: 3, fontSize: 14, lineHeight: 1.7 }}>{b}</div>
          ))}
        </div>
      )}
    </div>
  )
}