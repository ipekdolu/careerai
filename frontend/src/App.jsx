import { useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Analyzer from './components/Analyzer'
import Prep from './components/Prep'
import MockInterview from './components/MockInterview'
import ResumeRewriter from './components/ResumeRewriter'

export default function App() {
  const [section, setSection] = useState('analyzer')
  const [dark, setDark] = useState(false)

  // Shared context: last-used resume file and job description persist across feature switches
  const [sharedResume, setSharedResume] = useState(null)
  const [sharedJd, setSharedJd] = useState('')

  const updateContext = (resume, jd) => {
    if (resume) setSharedResume(resume)
    if (jd) setSharedJd(jd)
  }

  const toggleDark = () => {
    setDark(!dark)
    document.body.classList.toggle('dark')
  }

  return (
    <div>
      <Nav dark={dark} toggleDark={toggleDark} />
      <Hero section={section} setSection={setSection} />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '0 32px 64px' }}>
        {section === 'analyzer' && (
          <Analyzer
            initialResume={sharedResume}
            initialJd={sharedJd}
            onContextUpdate={updateContext}
            onRewrite={() => setSection('rewriter')}
          />
        )}
        {section === 'prep' && (
          <Prep
            initialResume={sharedResume}
            initialJd={sharedJd}
            onContextUpdate={updateContext}
          />
        )}
        {section === 'mock' && (
          <MockInterview
            initialJd={sharedJd}
            onContextUpdate={updateContext}
          />
        )}
        {section === 'rewriter' && (
          <ResumeRewriter
            initialResume={sharedResume}
            initialJd={sharedJd}
            onBack={() => setSection('analyzer')}
          />
        )}
      </main>
    </div>
  )
}
