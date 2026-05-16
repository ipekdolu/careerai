import { useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Analyzer from './components/Analyzer'
import Prep from './components/Prep'
import MockInterview from './components/MockInterview'

export default function App() {
  const [section, setSection] = useState('analyzer')
  const [dark, setDark] = useState(false)

  const toggleDark = () => {
    setDark(!dark)
    document.body.classList.toggle('dark')
  }

  return (
    <div>
      <Nav dark={dark} toggleDark={toggleDark} />
      <Hero section={section} setSection={setSection} />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '0 32px 64px' }}>
        {section === 'analyzer' && <Analyzer />}
        {section === 'prep' && <Prep />}
        {section === 'mock' && <MockInterview />}
      </main>
    </div>
  )
}