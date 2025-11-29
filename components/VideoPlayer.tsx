'use client'

import dynamic from 'next/dynamic'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any

interface VideoPlayerProps {
    url: string
    caption?: string
}

export default function VideoPlayer({ url, caption }: VideoPlayerProps) {
    if (!url) return null

    return (
        <div className="my-8 w-full">
            <div className="relative pt-[56.25%] bg-gray-100 rounded-lg overflow-hidden">
                <ReactPlayer
                    url={url}
                    width="100%"
                    height="100%"
                    className="absolute top-0 left-0"
                    controls
                />
            </div>
            {caption && (
                <div className="mt-2 text-sm text-gray-500 text-center italic font-serif">
                    {caption}
                </div>
            )}
        </div>
    )
}
