import { PortableText } from '@portabletext/react'
import { processPortableText, portableTextComponents } from '@/lib/portableText'

type PortableBodyV2Props = {
    value: any | undefined
    ads?: boolean
    interviewMode?: boolean
}

/**
 * PortableBodyV2 - Simplified version using extracted modules
 * 
 * This is a refactored version of PortableBody.tsx that:
 * - Uses modular, testable utility functions
 * - Has clearer separation of concerns
 * - Is easier to maintain and debug
 * 
 * Can be enabled via feature flag: NEXT_PUBLIC_USE_PORTABLE_V2=true
 */
export default function PortableBodyV2({ value, ads = true, interviewMode }: PortableBodyV2Props) {
    // Check environment flag for interview mode
    const envInterviewEnabled = String(process.env.NEXT_PUBLIC_INTERVIEW_QA_FORMATTER || '').toLowerCase() === 'true'

    // Process content through transformation pipeline
    const finalBlocks = processPortableText(value, {
        interviewMode,
        envInterviewEnabled,
    })

    if (!finalBlocks || finalBlocks.length === 0) return null

    const blockCount = finalBlocks.length
    const minBlocksForMidAd = 6
    const adsEnabled = !!ads

    // Short content: render without inline ads
    if (blockCount < minBlocksForMidAd) {
        return (
            <div className="prose prose-lg max-w-3xl mx-auto">
                <PortableText value={finalBlocks} components={portableTextComponents} />
            </div>
        )
    }

    // Long content: split for potential mid-article ads
    const midIndex = Math.floor(blockCount / 2)
    const firstHalf = finalBlocks.slice(0, midIndex)
    const secondHalf = finalBlocks.slice(midIndex)

    return (
        <div className="prose prose-lg max-w-3xl mx-auto">
            <PortableText value={firstHalf} components={portableTextComponents} />
            <PortableText value={secondHalf} components={portableTextComponents} />
        </div>
    )
}
