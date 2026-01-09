'use client'

interface PhotoCreditsProps {
  author?: string
  photographer?: string
}

export default function PhotoCredits({ author, photographer }: PhotoCreditsProps) {
  if (!author && !photographer) return null

  return (
    <div className="text-center text-sm text-gray-500 italic mt-2 font-serif">
      {author && photographer && (
        <>
          Words {author} • Images {photographer}
        </>
      )}
      {author && !photographer && <>Words {author}</>}
      {!author && photographer && <>Images {photographer}</>}
    </div>
  )
}
