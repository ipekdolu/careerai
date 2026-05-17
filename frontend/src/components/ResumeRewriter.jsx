import { useState, useRef } from 'react'
import { IconUpload, IconCheck, IconPencil, IconDownload } from '@tabler/icons-react'

const API = 'http://127.0.0.1:8000'

export default function ResumeRewriter({ initialResume, initialJd, onBack }) {
  const [resumeFile, setResumeFile] = useState(initialResume || null)
  const [jd, setJd] = useState(initialJd || '')
  const [loading, setLoading] = useState(false)
  const [diff, setDiff] = useState(null)
  const [approved, setApproved] = useState({})
  const [generating, setGenerating] = useState(false)
  const fileRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file) setResumeFile(file)
  }

  const run = async () => {
    if (!resumeFile) return alert('Please upload your resume.')
    if (!jd.trim()) return alert('Please paste a job description.')
    setLoading(true)
    setDiff(null)
    setApproved({})

    const form = new FormData()
    form.append('resume', resumeFile)
    form.append('job_description', jd)

    try {
      const res = await fetch(`${API}/rewrite-resume`, { method: 'POST', body: form })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setDiff(data)

      // Default all to approved
      const defaults = {}
      defaults['summary'] = true
      defaults['skills'] = true
      data.experience.forEach((exp, ei) => {
        exp.bullets.forEach((_, bi) => {
          defaults[`exp_${ei}_bullet_${bi}`] = true
        })
      })
      setApproved(defaults)
    } catch(e) {
      alert('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const toggle = (key) => {
    setApproved(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const generatePdf = async () => {
    if (!diff) return
    setGenerating(true)

    // Build approved content
    const approvedExperience = diff.experience.map((exp, ei) => ({
      company: exp.company,
      role: exp.role,
      dates: exp.dates,
      bullets: exp.bullets.map((b, bi) =>
        approved[`exp_${ei}_bullet_${bi}`] ? b.suggested : b.original
      )
    }))

    const payload = {
        name: diff.name || '',
        contact: diff.contact || '',
        summary: approved['summary'] ? diff.summary_suggested : diff.summary_original,
        skills: approved['skills'] ? diff.skills_suggested : diff.skills_original,
        experience: approvedExperience,
        education: diff.education || '',
}

    try {
      const res = await fetch(`${API}/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(await res.text())
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'rewritten_resume.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch(e) {
      alert('Error generating PDF: ' + e.message)
    } finally {
      setGenerating(false)
    }
  }

  const approvedCount = Object.values(approved).filter(Boolean).length
  const totalCount = Object.keys(approved).length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        {onBack && (
          <button onClick={onBack} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: 13, padding: 0,
          }}>
            ← Back to analysis
          </button>
        )}
      </div>

      <p style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Resume Rewriter</p>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
        Claude rewrites your resume for this specific job. Review each change and approve or reject before downloading.
      </p>

      {!diff && (
        <>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>Resume</label>
            <div
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${resumeFile ? 'var(--teal)' : 'var(--border-hover)'}`,
                borderRadius: 'var(--radius)', padding: 28, textAlign: 'center',
                cursor: 'pointer', background: resumeFile ? 'var(--teal-light)' : 'var(--bg-secondary)',
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
              <input type="file" ref={fileRef} accept=".pdf,.txt" onChange={handleFile} style={{ display: 'none' }} />
            </div>
          </div>

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

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <button onClick={run} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: loading ? '#9ca3af' : 'var(--teal)',
              color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
              padding: '12px 28px', fontSize: 15, fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Rewriting...' : <><IconPencil size={16} /> Rewrite Resume</>}
            </button>
          </div>
        </>
      )}

      {diff && (
        <div>
          {/* Stats bar */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--teal)' }}>{approvedCount}</strong> of <strong>{totalCount}</strong> changes approved
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setApproved(Object.fromEntries(Object.keys(approved).map(k => [k, true])))}
                style={{ fontSize: 13, color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Approve all
              </button>
              <button onClick={() => setApproved(Object.fromEntries(Object.keys(approved).map(k => [k, false])))}
                style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Reject all
              </button>
            </div>
          </div>

          {/* Summary diff */}
          <DiffSection label="Summary" reason={diff.summary_reason}>
            <DiffCard
              original={diff.summary_original || '(no summary in original)'}
              suggested={diff.summary_suggested}
              approved={approved['summary']}
              onToggle={() => toggle('summary')}
            />
          </DiffSection>

          {/* Experience diffs */}
          {diff.experience.map((exp, ei) => (
            <DiffSection key={ei} label={`${exp.role} at ${exp.company}`} sublabel={exp.dates}>
              {exp.bullets.map((bullet, bi) => (
                <DiffCard
                  key={bi}
                  original={bullet.original}
                  suggested={bullet.suggested}
                  reason={bullet.reason}
                  approved={approved[`exp_${ei}_bullet_${bi}`]}
                  onToggle={() => toggle(`exp_${ei}_bullet_${bi}`)}
                />
              ))}
            </DiffSection>
          ))}

          {/* Skills diff */}
          <DiffSection label="Skills" reason={diff.skills_reason}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 10 }}>Original</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {diff.skills_original.map((s, i) => (
                    <span key={i} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{
                background: approved['skills'] ? 'var(--teal-light)' : 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)', padding: 16,
                border: `1px solid ${approved['skills'] ? 'var(--teal)' : 'var(--border)'}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: approved['skills'] ? 'var(--teal)' : 'var(--text-tertiary)', marginBottom: 10 }}>Suggested</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {diff.skills_suggested.map((s, i) => (
                    <span key={i} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, background: approved['skills'] ? 'white' : 'var(--bg-card)', border: `1px solid ${approved['skills'] ? 'var(--teal)' : 'var(--border)'}`, color: approved['skills'] ? 'var(--teal)' : 'var(--text-secondary)' }}>{s}</span>
                  ))}
                </div>
                <button onClick={() => toggle('skills')} style={{
                  marginTop: 12, fontSize: 12, padding: '4px 12px',
                  borderRadius: 99, border: `1px solid ${approved['skills'] ? 'var(--teal)' : 'var(--border)'}`,
                  background: approved['skills'] ? 'var(--teal)' : 'transparent',
                  color: approved['skills'] ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}>
                  {approved['skills'] ? 'Approved' : 'Rejected'}
                </button>
              </div>
            </div>
          </DiffSection>

          {/* Download */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32 }}>
            <button onClick={generatePdf} disabled={generating} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: generating ? '#9ca3af' : 'var(--teal)',
              color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
              padding: '12px 28px', fontSize: 15, fontWeight: 500,
              cursor: generating ? 'not-allowed' : 'pointer',
            }}>
              {generating ? 'Generating PDF...' : <><IconDownload size={16} /> Download PDF</>}
            </button>
            <button onClick={() => setDiff(null)} style={{
              background: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              padding: '12px 28px', fontSize: 15, fontWeight: 500, cursor: 'pointer',
            }}>
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DiffSection({ label, sublabel, reason, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{sublabel}</div>}
        {reason && <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: 4 }}>{reason}</div>}
      </div>
      {children}
    </div>
  )
}

function DiffCard({ original, suggested, reason, approved, onToggle }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: `1px solid ${approved ? 'var(--teal)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 10,
      transition: 'border-color 0.15s',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 6 }}>Original</div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{original}</div>
        </div>
        <div style={{ background: approved ? 'var(--teal-light)' : 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: approved ? 'var(--teal)' : 'var(--text-tertiary)', marginBottom: 6 }}>Suggested</div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: approved ? 'var(--text)' : 'var(--text-secondary)' }}>{suggested}</div>
        </div>
      </div>
      {reason && (
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic', marginBottom: 10 }}>{reason}</div>
      )}
      <button onClick={onToggle} style={{
        fontSize: 12, padding: '4px 14px', borderRadius: 99,
        border: `1px solid ${approved ? 'var(--teal)' : 'var(--border)'}`,
        background: approved ? 'var(--teal)' : 'transparent',
        color: approved ? '#fff' : 'var(--text-secondary)',
        cursor: 'pointer',
      }}>
        {approved ? 'Approved' : 'Rejected'}
      </button>
    </div>
  )
}