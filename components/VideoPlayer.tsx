'use client'

import ReactPlayer from 'react-player/lazy'

interface VideoPlayerProps {
    url: string
    caption?: string
}

export default function VideoPlayer({ url, caption }: VideoPlayerProps) {
    if (!url) return null

    return (
        <div className="my-8 w-full max-w-4xl mx-auto">
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <div className="absolute inset-0 bg-gray-100 rounded-lg overflow-hidden">
                    <ReactPlayer
                        url={url}
                        width="100%"
                        height="100%"
                        controls
                        config={{
                            youtube: {
                                playerVars: { showinfo: 1 }
                            }
                        }}
                    />
                </div>
            </div>
            {caption && (
                <div className="mt-2 text-sm text-gray-500 text-center italic font-serif">
                    {caption}
                </div>
            )}
        </div>
    )
}
