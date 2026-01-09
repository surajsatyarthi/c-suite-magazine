import { render } from '@testing-library/react'
import { describe, it, expect } from '@jest/globals'
import HeroOverlay from '../HeroOverlay'

describe('HeroOverlay Component', () => {
  it('renders tagline when show is true', () => {
    const { container } = render(<HeroOverlay tagline="INDIA'S ENERGY MAJOR" show={true} />)
    expect(container.textContent).toContain("INDIA'S ENERGY MAJOR")
  })

  it('does not render when show is false', () => {
    const { container } = render(<HeroOverlay tagline="TEST" show={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('does not render when tagline is null', () => {
    const { container } = render(<HeroOverlay tagline={null} show={true} />)
    expect(container.innerHTML).toBe('')
  })

  it('applies gradient overlay styling', () => {
    const { container } = render(<HeroOverlay tagline="TEST" />)
    const overlay = container.querySelector('div[style*="gradient"]')
    expect(overlay).toHaveStyle({
      background: expect.stringContaining('linear-gradient'),
    })
  })

  it('uses uppercase text styling', () => {
    const { container } = render(<HeroOverlay tagline="test lowercase" />)
    const heading = container.querySelector('h2')
    expect(heading?.className).toContain('uppercase')
  })

  it('positions overlay at bottom', () => {
    const { container } = render(<HeroOverlay tagline="TEST" />)
    const wrapper = container.firstElementChild
    expect(wrapper?.className).toContain('bottom-0')
    expect(wrapper?.className).toContain('left-0')
    expect(wrapper?.className).toContain('right-0')
  })
})
