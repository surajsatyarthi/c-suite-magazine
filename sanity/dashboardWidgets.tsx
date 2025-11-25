import {useEffect, useState} from 'react'
import Link from 'next/link'
import {useClient, type SanityClient} from 'sanity'
import {projectId} from './env'

type Counts = {
  totalPosts: number
  hiddenPosts: number
  missingImage: number
  weakExcerpt: number
}

export function OverviewCountsWidget() {
  const client = useClient({ apiVersion: '2025-10-28' }) as SanityClient
  const [counts, setCounts] = useState<Counts | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const result = await client.fetch(
          `{
            "totalPosts": count(*[_type == "post"]),
            "hiddenPosts": count(*[_type == "post" && isHidden == true]),
            "missingImage": count(*[_type == "post" && !defined(mainImage.asset)]),
            "weakExcerpt": count(*[_type == "post" && (!defined(excerpt) || length(excerpt) < 20)])
          }`
        )
        if (mounted) setCounts(result)
      } catch (e: unknown) {
        const msg = (e as Error)?.message || 'Failed to load counts'
        if (mounted) setError(msg)
      }
    }
    run()
    return () => { mounted = false }
  }, [client])

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Editorial Overview</h2>
      {error && <p style={{ color: '#b00020', marginTop: 8 }}>{error}</p>}
      {!counts && !error && <p style={{ marginTop: 8 }}>Loading…</p>}
      {counts && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
          <Card label="Total Articles" value={counts.totalPosts} />
          <Card label="Hidden Articles" value={counts.hiddenPosts} />
          <Card label="Missing Image" value={counts.missingImage} />
          <Card label="Weak/No Excerpt" value={counts.weakExcerpt} />
        </div>
      )}
    </div>
  )
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
    </div>
  )
}

export function QuickLinksWidget() {
  const linkStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #eee',
    marginRight: 8,
    marginTop: 8,
    textDecoration: 'none',
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Quick Actions</h2>
      <div style={{ marginTop: 8 }}>
        <Link href="/studio/desk" style={linkStyle}>Open Desk</Link>
        <Link href="/studio/desk/post" style={linkStyle}>Posts</Link>
        <Link href="/studio/desk/writer" style={linkStyle}>Writers</Link>
        <Link href="/studio/desk/category" style={linkStyle}>Categories</Link>
        <Link href="/studio/desk/advertisement" style={linkStyle}>Advertisements</Link>
        <a href="intent://edit?type=spotlightConfig&id=spotlightConfig" style={linkStyle}>Spotlight Config</a>
      </div>
      <div style={{ marginTop: 12 }}>
        <a href="intent://create?type=post" style={linkStyle}>New Post</a>
        <a href="intent://create?type=writer" style={linkStyle}>New Writer</a>
        <a href="intent://create?type=category" style={linkStyle}>New Category</a>
        <a href="intent://create?type=advertisement" style={linkStyle}>New Ad</a>
      </div>
      <div style={{ marginTop: 12 }}>
        <a
          href={`https://www.sanity.io/manage/project/${projectId}/settings/api`}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >Sanity Project Settings</a>
        <a
          href={`https://www.sanity.io/manage/project/${projectId}/settings/api`}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >CORS Origins</a>
      </div>
    </div>
  )
}
