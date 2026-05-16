import { useState, useRef } from 'react'
import { IconUpload, IconCheck, IconSparkles, IconStar, IconAlertTriangle } from '@tabler/icons-react'

const API = 'http://127.0.0.1:8000'

export default function Prep() {
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
    if (!jd.trim()) return alert('Please paste a job description.')
    setLoading(true)
    const form = new FormData()
    form.append('job_description', jd)
    if (resumeFile) form.append('resume', resumeFile)
    try {
      const res = await fetch(`${API}/interview-prep`, { method: 'POST', body: form })
      if (!res.ok) throw new Error(await res.text())
      setResults(await res.json())
    } catch(e) {
      alert('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Interview Prep</p>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
        Resume is optional — a job description alone generates questions. Adding your resume personalizes the talking points.
      </p>

      {/* Upload */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
          Resume <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span>
        </label>
        <div
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${resumeFile ? 'var(--teal)' : 'var(--border-hover)'}`,
            borderRadius: 'var(--radius)',
            padding: 24,
            textAlign: 'center',
            cursor: 'pointer',
            background: resumeFile ? 'var(--teal-light)' : 'var(--bg-secondary)',
            transition: 'all 0.15s',
          }}
        >
          {resumeFile
            ? <IconCheck size={24} color='var(--teal)' style={{ marginBottom: 6 }} />
            : <IconUpload size={24} color='var(--text-tertiary)' style={{ marginBottom: 6 }} />
          }
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {resumeFile
              ? <span style={{ color: 'var(--teal)', fontWeight: 500 }}>{resumeFile.name}</span>
              : <><span style={{ color: 'var(--teal)', fontWeight: 500 }}>Click to upload</span> or drag and drop</>
            }
          </p>
          <input type="file" ref={fileRef} accept=".pdf,.txt" onChange={handleFile} style={{ display: 'none' }} />
        </div>
      </div>

      {/* JD */}
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
            padding: '12px 28px', fontSize: 15, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Generating...' : <><IconSparkles size={16} /> Generate prep guide</>}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div style={{ marginTop: 32 }}>
          <Section label="Technical questions">
            {results.technical_questions.map((q, i) => <QCard key={i} type="Technical" text={q} />)}
          </Section>

          <Section label="Behavioral questions">
            {results.behavioral_questions.map((q, i) => <QCard key={i} type="Behavioral" text={q} />)}
          </Section>

          <Section label="Culture & fit questions">
            {results.culture_questions.map((q, i) => <QCard key={i} type="Culture & fit" text={q} />)}
          </Section>

          <Section label="Topics to study">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {results.topics_to_study.map((t, i) => (
                <span key={i} style={{ fontSize: 13, padding: '5px 14px', borderRadius: 99, background: 'var(--teal-light)', color: 'var(--teal)', fontWeight: 500 }}>{t}</span>
              ))}
            </div>
          </Section>

          <Section label="Your talking points">
            {results.candidate_talking_points.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 14, lineHeight: 1.6 }}>
                <IconStar size={16} color='var(--teal)' style={{ flexShrink: 0, marginTop: 3 }} />
                <span>{p}</span>
              </div>
            ))}
          </Section>

          <Section label="Red flags to address">
            {results.red_flags_to_address.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 14, lineHeight: 1.6 }}>
                <IconAlertTriangle size={16} color='#E24B4A' style={{ flexShrink: 0, marginTop: 3 }} />
                <span>{r}</span>
              </div>
            ))}
          </Section>
        </div>
      )}
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        {label}
        <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
      </div>
      {children}
    </div>
  )
}

function QCard({ type, text }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px 20px', marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--teal)', marginBottom: 6 }}>{type}</div>
      <div style={{ fontSize: 14, lineHeight: 1.6 }}>{text}</div>
    </div>
  )
}