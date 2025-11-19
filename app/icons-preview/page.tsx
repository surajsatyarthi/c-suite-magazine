import React from 'react'

type Option = {
  title: string
  code: string
  render: () => React.ReactNode
}

const gold = '#c8ab3d'
const navy = '#0b1b2b'

const OPTIONS: Option[] = [
  {
    title: 'Bold Crown (Fill)',
    code: 'crown-fill',
    render: () => (
      <svg width={128} height={128} viewBox="0 0 24 24" aria-label="Bold crown">
        <circle cx="12" cy="12" r="12" fill={navy} />
        <path
          fill={gold}
          d="M6 16l-1-6 3.5 2.5L12 6l3.5 6.5L19 10l-1 6H6zm0 2h12v2H6v-2z"
        />
      </svg>
    ),
  },
  {
    title: 'Minimal Crown (Outline)',
    code: 'crown-outline',
    render: () => (
      <svg width={128} height={128} viewBox="0 0 24 24" aria-label="Minimal crown">
        <circle cx="12" cy="12" r="12" fill={navy} />
        <path
          d="M4 16l3.5-6 4.5 3 4.5-3L20 16M6 18h12"
          stroke={gold}
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Classic Crown (Balanced)',
    code: 'crown-balanced',
    render: () => (
      <svg width={128} height={128} viewBox="0 0 24 24" aria-label="Classic crown">
        <circle cx="12" cy="12" r="12" fill={navy} />
        <path
          fill={gold}
          d="M5 16l2-7 3 3 2-4 2 4 3-3 2 7H5zm0 2h14v2H5v-2z"
        />
      </svg>
    ),
  },
]

export const metadata = {
  title: 'Icon Preview',
  description: 'Choose a crown style below',
}

export default function IconsPreviewPage() {
  return (
    <main style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '20px', marginBottom: '12px' }}>Crown Icon Preview</h1>
      <p style={{ marginBottom: '16px' }}>
        These previews are rendered locally (no external links). Reply with a code below and I’ll set it as the favicon.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
        }}
      >
        {OPTIONS.map((opt) => (
          <div
            key={opt.code}
            style={{
              border: '1px solid #eee',
              borderRadius: '8px',
              padding: '12px',
              background: '#fafafa',
              textAlign: 'center',
            }}
          >
            <strong style={{ fontSize: '14px' }}>{opt.title}</strong>
            <div style={{ marginTop: '8px' }}>{opt.render()}</div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#333' }}>
              Code: <code>{opt.code}</code>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
