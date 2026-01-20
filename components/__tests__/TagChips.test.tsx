import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TagChips from '../TagChips'

describe('TagChips Component', () => {
  describe('rendering', () => {
    it('should render nothing when tags is empty', () => {
      const { container } = render(<TagChips tags={[]} />)
      expect(container.firstChild).toBeNull()
    })

    it('should render nothing when tags is not an array', () => {
      // @ts-expect-error Testing invalid input
      const { container } = render(<TagChips tags={null} />)
      expect(container.firstChild).toBeNull()
    })

    it('should render tags with # prefix', () => {
      render(<TagChips tags={['AI', 'Leadership']} />)
      expect(screen.getByText('#AI')).toBeDefined()
      expect(screen.getByText('#Leadership')).toBeDefined()
    })

    it('should have accessible label', () => {
      render(<TagChips tags={['Test']} />)
      expect(screen.getByLabelText('Article tags')).toBeDefined()
    })
  })

  describe('tag normalization', () => {
    it('should strip leading # from tag input', () => {
      render(<TagChips tags={['#AI']} />)
      // Should not show ##AI
      expect(screen.getByText('#AI')).toBeDefined()
      expect(screen.queryByText('##AI')).toBeNull()
    })

    it('should capitalize first letter of each word', () => {
      render(<TagChips tags={['digital transformation']} />)
      expect(screen.getByText('#Digital Transformation')).toBeDefined()
    })

    it('should preserve known acronyms in uppercase', () => {
      render(<TagChips tags={['ai', 'esg', 'cfo']} />)
      expect(screen.getByText('#AI')).toBeDefined()
      expect(screen.getByText('#ESG')).toBeDefined()
      expect(screen.getByText('#CFO')).toBeDefined()
    })

    it('should handle editorial overrides', () => {
      render(<TagChips tags={['money finance']} />)
      expect(screen.getByText('#Money & Finance')).toBeDefined()
    })

    it('should convert hyphens and underscores to spaces', () => {
      render(<TagChips tags={['real-estate', 'public_sector']} />)
      expect(screen.getByText('#Real Estate')).toBeDefined()
      expect(screen.getByText('#Public Sector')).toBeDefined()
    })
  })

  describe('variants', () => {
    it('should apply blue variant classes by default', () => {
      const { container } = render(<TagChips tags={['Test']} />)
      const chip = container.querySelector('span span span')
      expect(chip?.className).toContain('text-[#082945]')
    })

    it('should apply gold variant classes when specified', () => {
      const { container } = render(<TagChips tags={['Test']} variant="gold" />)
      const chip = container.querySelector('span span span')
      expect(chip?.className).toContain('text-[#3f330d]')
    })
  })

  describe('sizes', () => {
    it('should apply small size classes by default', () => {
      const { container } = render(<TagChips tags={['Test']} />)
      const chip = container.querySelector('span span span')
      expect(chip?.className).toContain('text-sm')
    })

    it('should apply medium size classes when specified', () => {
      const { container } = render(<TagChips tags={['Test']} size="md" />)
      const chip = container.querySelector('span span span')
      expect(chip?.className).toContain('text-base')
    })
  })

  describe('custom className', () => {
    it('should apply custom className to container', () => {
      const { container } = render(<TagChips tags={['Test']} className="custom-class" />)
      expect(container.firstChild?.className).toContain('custom-class')
    })
  })
})
