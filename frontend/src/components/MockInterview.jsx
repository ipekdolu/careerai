import { useState, useRef, useEffect } from 'react'
import { IconUpload, IconCheck, IconSend, IconPlayerPlay, IconX, IconAlertCircle } from '@tabler/icons-react'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
const SESSION_KEY = 'careerai_mock_session'

const FOCUS_OPTIONS = ['Mixed', 'Technical', 'Behavioral', 'Culture & fit']

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
        <button onClick={onRetry} style={{ background: 'none', border: '1px solid var(--red-text)', borderRadius: 4, cursor: 'pointer', color: 'var(--red-text)', padding: '2px 10px', fontSize: 12, fontWeight: 500, lineHeight: 1.6, whiteSpace: 'nowrap' }}>Retry</button>
      )}
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-text)', padding: 0, fontSize: 16, lineHeight: 1 }}>×</button>
      )}
    </div>
  )
}

function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', height: 20 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--text-tertiary)',
          display: 'inline-block',
          animation: `dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </span>
  )
}

export default function MockInterview({ initialJd, onContextUpdate }) {
  const [resumeFile, setResumeFile] = useState(null)
  const [jd, setJd] = useState(initialJd || '')
  const [focus, setFocus] = useState('Mixed')
  const [totalQ, setTotalQ] = useState(5)
  const [phase, setPhase] = useState('setup')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [pendingFeedback, setPendingFeedback] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)
  const [savedSession, setSavedSession] = useState(null)

  const [interviewState, setInterviewState] = useState({
    currentQuestion: '',
    questions: [],
    answers: [],
    feedbacks: [],
    coveredTopics: [],
    conversationHistory: [],
    questionNum: 1,
  })

  const fileRef = useRef()
  const chatRef = useRef()
  const inputRef = useRef()

  // Check for saved session on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved.phase && saved.phase !== 'setup') {
          setSavedSession(saved)
        }
      }
    } catch(e) {}
  }, [])

  // Persist session on state changes (only during active interview)
  useEffect(() => {
    if (phase === 'setup') return
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        phase, messages, interviewState, summary, jd, focus, totalQ
      }))
    } catch(e) {}
  }, [phase, messages, interviewState, summary, jd, focus, totalQ])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, pendingFeedback])

  const restoreSession = () => {
    if (!savedSession) return
    setPhase(savedSession.phase)
    setMessages(savedSession.messages || [])
    setInterviewState(savedSession.interviewState || interviewState)
    setSummary(savedSession.summary || null)
    setJd(savedSession.jd || '')
    setFocus(savedSession.focus || 'Mixed')
    setTotalQ(savedSession.totalQ || 5)
    setSavedSession(null)
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file) setResumeFile(file)
  }

  const startInterview = async () => {
    if (!jd.trim()) return setError('Please paste a job description.')
    if (jd.trim().length < 80) return setError(`Job description is too short (${jd.trim().length} chars). Paste the full description for relevant questions.`)
    setError(null)
    setLoading(true)
    onContextUpdate?.(resumeFile, jd)
    const form = new FormData()
    form.append('job_description', jd)
    form.append('focus', focus)
    if (resumeFile) form.append('resume', resumeFile)

    try {
      const res = await fetch(`${API}/interview/start`, { method: 'POST', body: form })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()

      setInterviewState({
        currentQuestion: data.first_question,
        questions: [data.first_question],
        answers: [],
        feedbacks: [],
        coveredTopics: [data.first_topic],
        conversationHistory: data.conversation_history,
        questionNum: 1,
      })

      setMessages([{ role: 'ai', text: data.first_question }])
      setPhase('interview')
    } catch(e) {
      setError('Could not start interview. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (sending || !inputVal.trim()) return
    const answer = inputVal.trim()
    setInputVal('')
    setSending(true)

    setMessages(prev => [...prev, { role: 'user', text: answer }])
    setMessages(prev => [...prev, { role: 'ai', loading: true }])

    const form = new FormData()
    form.append('question', interviewState.currentQuestion)
    form.append('answer', answer)
    form.append('job_description', jd)
    form.append('focus', focus)
    form.append('covered_topics', JSON.stringify(interviewState.coveredTopics))
    form.append('conversation_history', JSON.stringify(interviewState.conversationHistory))

    try {
      const res = await fetch(`${API}/interview/answer`, { method: 'POST', body: form })
      if (!res.ok) throw new Error(await res.text())
      const feedback = await res.json()

      const newAnswers = [...interviewState.answers, answer]
      const newFeedbacks = [...interviewState.feedbacks, feedback]
      const newTopics = [...interviewState.coveredTopics, feedback.topic_covered]
      const newHistory = [
        ...interviewState.conversationHistory,
        { role: 'user', content: `Q: ${interviewState.currentQuestion}\nA: ${answer}` },
        { role: 'assistant', content: `Score: ${feedback.score}/10` },
      ]

      setInterviewState(prev => ({
        ...prev,
        answers: newAnswers,
        feedbacks: newFeedbacks,
        coveredTopics: newTopics,
        conversationHistory: newHistory,
      }))

      setMessages(prev => prev.filter(m => !m.loading))
      setPendingFeedback({
        feedback,
        isLast: newAnswers.length >= totalQ,
        nextQuestion: feedback.next_question,
        newAnswers,
        newFeedbacks,
      })
    } catch(e) {
      setMessages(prev => prev.filter(m => !m.loading))
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Your progress is saved — refresh the page to continue.' }])
    } finally {
      setSending(false)
    }
  }

  const handleNext = async () => {
    if (!pendingFeedback) return
    const { isLast, nextQuestion, newAnswers, newFeedbacks } = pendingFeedback
    setPendingFeedback(null)

    if (isLast) {
      setLoading(true)
      const form = new FormData()
      form.append('questions', JSON.stringify(interviewState.questions))
      form.append('answers', JSON.stringify(newAnswers))
      form.append('feedbacks', JSON.stringify(newFeedbacks))
      try {
        const res = await fetch(`${API}/interview/summary`, { method: 'POST', body: form })
        if (!res.ok) throw new Error(await res.text())
        setSummary(await res.json())
        setPhase('summary')
      } catch(e) {
        setError('Could not load summary. Your interview data is saved — refresh to retry.')
      } finally {
        setLoading(false)
      }
    } else {
      const newNum = interviewState.questionNum + 1
      setInterviewState(prev => ({
        ...prev,
        currentQuestion: nextQuestion,
        questions: [...prev.questions, nextQuestion],
        questionNum: newNum,
      }))
      setMessages(prev => [...prev, { role: 'ai', text: nextQuestion }])
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const restart = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setSavedSession(null)
    setPhase('setup')
    setMessages([])
    setPendingFeedback(null)
    setSummary(null)
    setError(null)
    setInterviewState({
      currentQuestion: '', questions: [], answers: [],
      feedbacks: [], coveredTopics: [], conversationHistory: [], questionNum: 1,
    })
  }

  // Running average from completed feedbacks
  const avgScore = interviewState.feedbacks.length > 0
    ? (interviewState.feedbacks.reduce((sum, f) => sum + f.score, 0) / interviewState.feedbacks.length).toFixed(1)
    : null

  // Progress bar uses transform: scaleX to avoid layout thrash
  const progressFraction = phase === 'interview'
    ? (interviewState.questionNum - 1) / totalQ
    : 0

  const scoreColor = (s) => s >= 7 ? 'var(--green-text)' : s >= 5 ? 'var(--amber-text)' : 'var(--red-text)'
  const scoreBg = (s) => s >= 7 ? 'var(--green-bg)' : s >= 5 ? 'var(--amber-bg)' : 'var(--red-bg)'

  return (
    <div>
      <p style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Mock Interview</p>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
        Claude conducts a personalized interview and gives scored feedback on every answer.
      </p>

      {/* Resume saved session banner */}
      {savedSession && phase === 'setup' && (
        <div style={{
          background: 'var(--teal-light)', border: '1px solid var(--teal)',
          borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <p style={{ fontSize: 14, color: 'var(--teal)', margin: 0 }}>
            You have an interview in progress. Continue where you left off?
          </p>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button onClick={restoreSession} style={{
              background: 'var(--teal)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-sm)', padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
              Resume
            </button>
            <button onClick={() => { sessionStorage.removeItem(SESSION_KEY); setSavedSession(null) }} style={{
              background: 'none', color: 'var(--teal)', border: '1px solid var(--teal)',
              borderRadius: 'var(--radius-sm)', padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
              Start fresh
            </button>
          </div>
        </div>
      )}

      {/* SETUP */}
      {phase === 'setup' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 32 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Resume <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional — personalizes the questions)</span>
            </label>
            <div
              role="button"
              tabIndex={0}
              aria-label={resumeFile ? `Resume uploaded: ${resumeFile.name}. Click to change.` : 'Upload resume — click or drag and drop a PDF or TXT file'}
              onClick={() => fileRef.current.click()}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current.click() } }}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setResumeFile(f) }}
              onDragOver={e => e.preventDefault()}
              style={{
                border: `2px dashed ${resumeFile ? 'var(--teal)' : 'var(--border-hover)'}`,
                borderRadius: 'var(--radius)',
                padding: 24, textAlign: 'center', cursor: 'pointer',
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

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>Job description</label>
            <textarea
              value={jd}
              onChange={e => { setJd(e.target.value); onContextUpdate?.(null, e.target.value) }}
              placeholder="Paste the job description here..."
              style={{
                width: '100%', padding: 14, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-card)', color: 'var(--text)', fontSize: 14, resize: 'vertical', minHeight: 130,
                outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--teal)'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,160,0.1)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>Question focus</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {FOCUS_OPTIONS.map(f => (
                <button key={f} onClick={() => setFocus(f)} style={{
                  padding: '8px 18px', border: `1px solid ${focus === f ? 'var(--teal)' : 'var(--border)'}`,
                  borderRadius: 99, background: focus === f ? 'var(--teal-light)' : 'var(--bg-secondary)',
                  color: focus === f ? 'var(--teal)' : 'var(--text-secondary)',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 0.15s',
                }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Number of questions: <strong style={{ color: 'var(--teal)' }}>{totalQ}</strong>
            </label>
            <input
              type="range" min="3" max="6" value={totalQ} step="1"
              onChange={e => setTotalQ(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--teal)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={startInterview} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: loading ? '#9ca3af' : 'var(--teal)',
              color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
              padding: '12px 28px', fontSize: 15, fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Starting...' : <><IconPlayerPlay size={16} /> Start interview</>}
            </button>
          </div>

          {error && <ErrorBanner message={error} onRetry={!loading ? startInterview : undefined} onDismiss={() => setError(null)} />}
        </div>
      )}

      {/* INTERVIEW */}
      {phase === 'interview' && (
        <div>
          {/* Progress bar — uses scaleX to avoid layout thrash */}
          <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 99, marginBottom: 8, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: '100%',
              background: 'var(--teal)', borderRadius: 99,
              transform: `scaleX(${progressFraction})`,
              transformOrigin: 'left',
              transition: 'transform 0.4s ease',
            }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
              Question {interviewState.questionNum} of {totalQ}
            </p>
            {avgScore && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Running avg: <strong style={{ color: 'var(--teal)' }}>{avgScore}/10</strong>
              </p>
            )}
          </div>

          <div ref={chatRef} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 20, minHeight: 340,
            maxHeight: 440, overflowY: 'auto', display: 'flex',
            flexDirection: 'column', gap: 16, marginBottom: 14,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ maxWidth: '78%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', animation: 'msg-up 0.2s cubic-bezier(0.16,1,0.3,1) both' }}>
                <div style={{
                  padding: '12px 16px', borderRadius: 'var(--radius)', fontSize: 14, lineHeight: 1.65,
                  background: m.role === 'user' ? 'var(--teal)' : 'var(--bg-secondary)',
                  color: m.role === 'user' ? '#fff' : 'var(--text)',
                  borderBottomRightRadius: m.role === 'user' ? 4 : 'var(--radius)',
                  borderBottomLeftRadius: m.role === 'ai' ? 4 : 'var(--radius)',
                }}>
                  {m.loading ? <TypingDots /> : m.text}
                </div>
              </div>
            ))}

            {pendingFeedback && (
              <div style={{ maxWidth: '78%', alignSelf: 'flex-start' }}>
                <div style={{ padding: '16px', borderRadius: 'var(--radius)', background: 'var(--bg-secondary)', borderBottomLeftRadius: 4 }}>
                  <span style={{
                    display: 'inline-block', fontSize: 13, fontWeight: 500,
                    padding: '3px 12px', borderRadius: 99, marginBottom: 12,
                    background: scoreBg(pendingFeedback.feedback.score),
                    color: scoreColor(pendingFeedback.feedback.score),
                  }}>
                    {pendingFeedback.feedback.score}/10
                  </span>
                  {/* What worked shown first — positive before constructive */}
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--green-text)', marginBottom: 4 }}>What landed well</div>
                  {pendingFeedback.feedback.what_worked.map((w, i) => (
                    <div key={i} style={{ fontSize: 13, marginBottom: 3, color: 'var(--text)' }}>• {w}</div>
                  ))}
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', margin: '10px 0 4px' }}>To strengthen</div>
                  {pendingFeedback.feedback.what_to_improve.map((w, i) => (
                    <div key={i} style={{ fontSize: 13, marginBottom: 3 }}>• {w}</div>
                  ))}
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic', marginTop: 8 }}>
                    {pendingFeedback.feedback.ideal_answer_hint}
                  </div>
                </div>
              </div>
            )}
          </div>

          {!pendingFeedback && (
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                ref={inputRef}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !sending) submitAnswer() }}
                placeholder="Type your answer and press Enter..."
                disabled={sending}
                style={{
                  flex: 1, padding: '13px 16px', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)',
                  color: 'var(--text)', fontSize: 14, outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--teal)'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,160,0.1)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
              />
              <button onClick={submitAnswer} disabled={sending} style={{
                background: sending ? '#9ca3af' : 'var(--teal)',
                border: 'none', color: '#fff', borderRadius: 'var(--radius-sm)',
                padding: '0 20px', cursor: sending ? 'not-allowed' : 'pointer',
              }}>
                <IconSend size={18} />
              </button>
            </div>
          )}

          {pendingFeedback && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <button onClick={handleNext} disabled={loading} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: loading ? '#9ca3af' : 'var(--teal)',
                color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
                padding: '12px 28px', fontSize: 15, fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Loading...' : pendingFeedback.isLast ? 'View summary' : 'Next question'}
              </button>
            </div>
          )}

          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        </div>
      )}

      {/* SUMMARY MODAL */}
      {phase === 'summary' && summary && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 100, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', maxWidth: 580, width: '100%',
            padding: '40px 36px', position: 'relative',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <button onClick={() => setPhase('interview')} style={{
              position: 'absolute', top: 16, right: 16,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)',
            }}>
              <IconX size={22} />
            </button>

            <div style={{
              width: 130, height: 130, borderRadius: '50%',
              border: `6px solid ${scoreColor(summary.overall_score)}`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px',
            }}>
              <div style={{
                fontFamily: 'DM Serif Display, serif', fontSize: 40,
                lineHeight: 1, color: scoreColor(summary.overall_score),
              }}>
                {parseFloat(summary.overall_score).toFixed(1)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>out of 10</div>
            </div>

            <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, textAlign: 'center', marginBottom: 8 }}>
              Interview complete
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.7, marginBottom: 28 }}>
              {summary.overall_verdict}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div style={{ padding: 16, borderRadius: 'var(--radius-sm)', background: 'var(--green-bg)', border: '1px solid rgba(14,165,160,0.2)' }}>
                <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--green-text)', marginBottom: 8 }}>Strongest answer</div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--green-text)' }}>{summary.strongest_answer}</p>
              </div>
              <div style={{ padding: 16, borderRadius: 'var(--radius-sm)', background: 'var(--red-bg)', border: '1px solid rgba(226,75,74,0.2)' }}>
                <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--red-text)', marginBottom: 8 }}>Next focus area</div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--red-text)' }}>{summary.weakest_answer}</p>
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              Key improvements
              <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
            </div>

            {summary.key_improvements.map((imp, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', fontSize: 14, lineHeight: 1.6 }}>
                <span style={{ fontWeight: 500, color: 'var(--teal)', minWidth: 20 }}>{i + 1}</span>
                <span>{imp}</span>
              </div>
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 28 }}>
              <button onClick={() => setPhase('interview')} style={{
                background: 'var(--teal)', color: '#fff', border: 'none',
                borderRadius: 'var(--radius-sm)', padding: '12px 28px',
                fontSize: 15, fontWeight: 500, cursor: 'pointer', minWidth: 200,
              }}>
                Close summary
              </button>
              <button onClick={restart} style={{
                background: 'transparent', color: 'var(--text-secondary)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                padding: '12px 28px', fontSize: 15, fontWeight: 500,
                cursor: 'pointer', minWidth: 200,
              }}>
                Start new interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
