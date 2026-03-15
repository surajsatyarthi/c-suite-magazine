import { render, screen } from '@testing-library/react'
/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest'
import InFocusBadge from '../InFocusBadge'

describe('InFocusBadge Component', () => {
  it('renders CSA FEATURE for CSA articles', () => {
    const { container } = render(<InFocusBadge articleType="csa" />)
    expect(container.textContent).toContain('SPECIAL FEATURE')
  })

  it('renders IN FOCUS for interview articles', () => {
    const { container } = render(<InFocusBadge articleType="interview" />)
    expect(container.textContent).toContain('IN FOCUS')
  })

  it('renders JUGGERNAUT for juggernaut articles', () => {
    const { container } = render(<InFocusBadge articleType="juggernaut" />)
    expect(container.textContent).toContain('JUGGERNAUT')
  })

  it('renders SPOTLIGHT for spotlight articles', () => {
    const { container } = render(<InFocusBadge articleType="spotlight" />)
    expect(container.textContent).toContain('SPOTLIGHT')
  })

  it('returns null for standard articles', () => {
    const { container } = render(<InFocusBadge articleType={null} />)
    expect(container.innerHTML).toBe('')
  })

  it('applies correct color for CSA badge', () => {
    const { container } = render(<InFocusBadge articleType="csa" />)
    const badge = container.querySelector('div[style*="background"]')
    expect(badge).toHaveStyle({ backgroundColor: '#c8ab3d' })
  })

  it('applies correct color for interview badge', () => {
    const { container } = render(<InFocusBadge articleType="interview" />)
    const badge = container.querySelector('div[style*="background"]')
    expect(badge).toHaveStyle({ backgroundColor: '#003366' })
  })

  it('hides on mobile (has hidden lg:block classes)', () => {
    const { container } = render(<InFocusBadge articleType="csa" />)
    const badge = container.firstElementChild
    expect(badge?.className).toContain('hidden')
    expect(badge?.className).toContain('lg:block')
  })
})
