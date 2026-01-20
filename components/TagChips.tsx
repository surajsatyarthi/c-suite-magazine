import Link from 'next/link'
import { slugifyTag, normalizeDisplayTag } from '@/lib/tag-utils'

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

type TagChipsProps = {
  tags: string[]
  className?: string
  size?: 'sm' | 'md'
  variant?: 'blue' | 'gold'
}

export default function TagChips({ tags, className, size = 'sm', variant = 'blue' }: TagChipsProps) {
  if (!Array.isArray(tags) || tags.length === 0) return null


  const colorClasses = variant === 'gold'
    ? 'text-[#3f330d] bg-[#c8ab3d]/15 border-[#c8ab3d]/30 hover:bg-[#c8ab3d]/25'
    : 'text-[#082945] bg-[#082945]/10 border-[#082945]/20 hover:bg-[#082945]/20'

  const baseChip = cx(
    'rounded-full border transition-colors',
    colorClasses,
    size === 'sm' ? 'px-3 py-1 text-sm' : 'px-4 py-2 text-base'
  )

  return (
    <div className={cx('flex flex-wrap gap-2', className)} aria-label="Article tags">
      {tags.map((tag, index) => {
        const display = normalizeDisplayTag(tag)
        const slug = slugifyTag(tag)
        if (!display || !slug) return null

        return (
          <Link
            key={`${tag}-${index}`}
            href={`/tag/${slug}`}
            className={baseChip}
          >
            #{display}
          </Link>
        )
      })}
    </div>
  )
}
