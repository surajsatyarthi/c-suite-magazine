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
    const primaryStyles = "bg-[#c8ab3d] text-white hover:bg-[#b09635]"
    const outlineStyles = "border-2 border-[#c8ab3d] text-[#c8ab3d] hover:bg-[#c8ab3d] hover:text-white"

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
