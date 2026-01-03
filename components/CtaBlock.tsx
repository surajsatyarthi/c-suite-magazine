import Link from 'next/link'

interface CtaBlockProps {
    value: {
        text: string
        url: string
        style: 'primary' | 'outline'
    }
}

export default function CtaBlock({ value }: CtaBlockProps) {
    const { text, url, style } = value
    if (!text || !url) return null

    const baseStyles = "inline-block px-8 py-3 text-sm font-bold tracking-wider uppercase transition-colors duration-200"
    const primaryStyles = "bg-[#c8ab3d] text-white hover:bg-[#b09635] active:bg-[#9d7e2a]"
    const outlineStyles = "border-2 border-[#9d7e2a] text-[#9d7e2a] hover:bg-[#c8ab3d] hover:text-[#082945] active:bg-[#b09635] active:border-[#b09635]"

    return (
        <div className="my-8 text-center">
            <Link
                href={url}
                className={`${baseStyles} ${style === 'outline' ? outlineStyles : primaryStyles}`}
            >
                {text}
            </Link>
        </div>
    )
}
