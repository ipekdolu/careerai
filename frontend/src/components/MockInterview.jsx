import { useState, useRef, useEffect } from 'react'
import { IconUpload, IconCheck, IconSend, IconPlayerPlay, IconX } from '@tabler/icons-react'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const FOCUS_OPTIONS = ['Mixed', 'Technical', 'Behavioral', 'Culture & fit']

export default function MockInterview() {
  const [resumeFile, setResumeFile] = useState(null)
  const [jd, setJd] = useState('')
  const [focus, setFocus] = useState('Mixed')
  const [totalQ, setTotalQ] = useState(5)
  const [phase, setPhase] = useState('setup') // setup | interview | summary
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [pendingFeedback, setPendingFeedback] = useState(null)
  const [summary, setSummary] = useState(null)

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

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, pendingFeedback])

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file) setResumeFile(file)
  }

  const startInterview = async () => {
    if (!jd.trim()) return alert('Please paste a job description.')
    setLoading(true)
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
      alert('Error: ' + e.message)
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
      setMessages(prev => [...prev, { role: 'ai', text: 'Something went wrong. Please try again.' }])
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
        alert('Error loading summary: ' + e.message)
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
    setPhase('setup')
    setMessages([])
    setPendingFeedback(null)
    setSummary(null)
    setInterviewState({
      currentQuestion: '', questions: [], answers: [],
      feedbacks: [], coveredTopics: [], conversationHistory: [], questionNum: 1,
    })
  }

  const progress = phase === 'interview'
    ? Math.round(((interviewState.questionNum - 1) / totalQ) * 100)
    : 0

  const scoreColor = (s) => s >= 7 ? 'var(--teal)' : s >= 5 ? '#EF9F27' : '#E24B4A'
  const scoreBg = (s) => s >= 7 ? 'var(--green-bg)' : s >= 5 ? 'var(--amber-bg)' : 'var(--red-bg)'
  const scoreText = (s) => s >= 7 ? 'var(--green-text)' : s >= 5 ? 'var(--amber-text)' : 'var(--red-text)'

  return (
    <div>
      <p style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Mock Interview</p>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
        Claude conducts a personalized interview and gives scored feedback on every answer.
      </p>

      {/* SETUP */}
      {phase === 'setup' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 32 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Resume <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span>
            </label>
            <div
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${resumeFile ? 'var(--teal)' : 'var(--border-hover)'}`,
                borderRadius: 'var(--radius)',
                padding: 24, textAlign: 'center', cursor: 'pointer',
                background: resumeFile ? 'var(--teal-light)' : 'var(--bg-secondary)',
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
              onChange={e => setJd(e.target.value)}
              placeholder="Paste the job description here..."
              style={{ width: '100%', padding: 14, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: 14, resize: 'vertical', minHeight: 130 }}
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
        </div>
      )}

      {/* INTERVIEW */}
      {phase === 'interview' && (
        <div>
          <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 99, marginBottom: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--teal)', borderRadius: 99, transition: 'width 0.4s ease' }} />
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
            Question {interviewState.questionNum} of {totalQ}
          </p>

          <div ref={chatRef} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 20, minHeight: 340,
            maxHeight: 440, overflowY: 'auto', display: 'flex',
            flexDirection: 'column', gap: 16, marginBottom: 14,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ maxWidth: '78%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  padding: '12px 16px', borderRadius: 'var(--radius)', fontSize: 14, lineHeight: 1.65,
                  background: m.role === 'user' ? 'var(--teal)' : 'var(--bg-secondary)',
                  color: m.role === 'user' ? '#fff' : 'var(--text)',
                  borderBottomRightRadius: m.role === 'user' ? 4 : 'var(--radius)',
                  borderBottomLeftRadius: m.role === 'ai' ? 4 : 'var(--radius)',
                }}>
                  {m.loading ? '...' : m.text}
                </div>
              </div>
            ))}

            {pendingFeedback && (
              <div style={{ maxWidth: '78%', alignSelf: 'flex-start' }}>
                <div style={{ padding: '16px', borderRadius: 'var(--radius)', background: 'var(--bg-secondary)', borderBottomLeftRadius: 4 }}>
                  <span style={{
                    display: 'inline-block', fontSize: 13, fontWeight: 500,
                    padding: '3px 12px', borderRadius: 99, marginBottom: 10,
                    background: scoreBg(pendingFeedback.feedback.score),
                    color: scoreText(pendingFeedback.feedback.score),
                  }}>
                    {pendingFeedback.feedback.score}/10
                  </span>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>What worked</div>
                  {pendingFeedback.feedback.what_worked.map((w, i) => (
                    <div key={i} style={{ fontSize: 13, marginBottom: 3 }}>• {w}</div>
                  ))}
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', margin: '8px 0 4px' }}>What to improve</div>
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
                placeholder="Type your answer here..."
                disabled={sending}
                style={{
                  flex: 1, padding: '13px 16px', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)',
                  color: 'var(--text)', fontSize: 14,
                }}
              />
              <button onClick={submitAnswer} disabled={sending} style={{
                background: sending ? '#9ca3af' : 'var(--teal)',
                border: 'none', color: '#fff', borderRadius: 'var(--radius-sm)',
                padding: '0 20px', cursor: sending ? 'not-allowed' : 'pointer', fontSize: 18,
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
              color: 'var(--text-tertiary)', fontSize: 22,
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
                <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--red-text)', marginBottom: 8 }}>Weakest answer</div>
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