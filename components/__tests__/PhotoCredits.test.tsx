import { render } from '@testing-library/react'
import { describe, it, expect } from '@jest/globals'
import PhotoCredits from '../PhotoCredits'

describe('PhotoCredits Component', () => {
  it('renders both author and photographer', () => {
    const { container } = render(
      <PhotoCredits author="JACOB GOLDBERG" photographer="ABHISHEK BALI" />
    )
    expect(container.textContent).toContain('Words JACOB GOLDBERG')
    expect(container.textContent).toContain('Images ABHISHEK BALI')
    expect(container.textContent).toContain('•')
  })

  it('renders only author when photographer missing', () => {
    const { container } = render(<PhotoCredits author="JACOB GOLDBERG" />)
    expect(container.textContent).toContain('Words JACOB GOLDBERG')
    expect(container.textContent).not.toContain('Images')
    expect(container.textContent).not.toContain('•')
  })

  it('renders only photographer when author missing', () => {
    const { container } = render(<PhotoCredits photographer="ABHISHEK BALI" />)
    expect(container.textContent).toContain('Images ABHISHEK BALI')
    expect(container.textContent).not.toContain('Words')
    expect(container.textContent).not.toContain('•')
  })

  it('renders nothing when both missing', () => {
    const { container } = render(<PhotoCredits />)
    expect(container.innerHTML).toBe('')
  })

  it('applies correct styling (centered, italic, gray)', () => {
    const { container } = render(<PhotoCredits author="TEST" />)
    const element = container.firstElementChild
    expect(element?.className).toContain('text-center')
    expect(element?.className).toContain('italic')
    expect(element?.className).toContain('text-gray-500')
  })
})
