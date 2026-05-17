import { IconFileText, IconBulb, IconMicrophone, IconPencil } from '@tabler/icons-react'


const features = [
  {
    id: 'analyzer',
    icon: <IconFileText size={26} />,
    title: 'Resume Analyzer',
    desc: 'Match your resume to any job description and see exactly where you stand.',
  },
  {
    id: 'rewriter',
    icon: <IconPencil size={26} />,
    title: 'Resume Rewriter',
    desc: 'Get your resume rewritten for a specific job. Review and approve every change.',
  },
  {
    id: 'prep',
    icon: <IconBulb size={26} />,
    title: 'Interview Prep',
    desc: 'Get a personalized guide with likely questions, topics, and talking points.',
  },
  {
    id: 'mock',
    icon: <IconMicrophone size={26} />,
    title: 'Mock Interview',
    desc: 'Practice with an AI interviewer and get scored feedback on every answer.',
  },
]
export default function Hero({ section, setSection }) {
  return (
    <div style={{ padding: '56px 32px 40px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{
        fontFamily: 'DM Serif Display, serif',
        fontSize: 44,
        lineHeight: 1.15,
        color: 'var(--text)',
        marginBottom: 14,
      }}>
        Land your next job<br />with <span style={{ color: 'var(--teal)' }}>CareerAI</span>
      </h1>
      <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 40 }}>
        From application to offer — everything you need in one place.
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 16,
        marginBottom: 36,
      }}>
        {features.map(f => (
          <div
            key={f.id}
            onClick={() => setSection(f.id)}
            style={{
              background: 'var(--bg-card)',
              border: `${section === f.id ? '2px' : '1px'} solid ${section === f.id ? 'var(--teal)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: '28px 22px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: section === f.id ? '0 0 0 3px rgba(14,165,160,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ color: 'var(--teal)', marginBottom: 14 }}>{f.icon}</div>
            <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}