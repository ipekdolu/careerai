import { IconSun, IconMoon } from '@tabler/icons-react'

export default function Nav({ dark, toggleDark }) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        fontFamily: 'DM Serif Display, serif',
        fontSize: 22,
        color: 'var(--text)',
      }}>
        Career<span style={{ color: 'var(--teal)' }}>AI</span>
      </div>
      <button onClick={toggleDark} style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 99,
        padding: '6px 14px',
      }}>
        {dark ? <IconMoon size={15} /> : <IconSun size={15} />}
        {dark ? 'Dark' : 'Light'}
      </button>
    </nav>
  )
}