'use client'

interface VideoPlayerProps {
    url: string
    caption?: string
}

export default function VideoPlayer({ url, caption }: VideoPlayerProps) {
    if (!url) return null

    // Convert YouTube URL to embed format
    const getYouTubeEmbedUrl = (url: string) => {
        // Remove timestamp and other parameters
        const cleanUrl = url.split('&')[0].split('?t=')[0]
        
        // Handle youtu.be/VIDEO_ID format
        if (cleanUrl.includes('youtu.be/')) {
            const videoId = cleanUrl.split('youtu.be/')[1].split('?')[0]
            return `https://www.youtube.com/embed/${videoId}`
        }
        // Handle youtube.com/watch?v=VIDEO_ID format
        if (cleanUrl.includes('youtube.com/watch')) {
            const videoId = new URL(cleanUrl).searchParams.get('v')
            return `https://www.youtube.com/embed/${videoId}`
        }
        // Already an embed URL
        if (cleanUrl.includes('/embed/')) {
            return cleanUrl
        }
        return cleanUrl
    }

    const embedUrl = getYouTubeEmbedUrl(url)

    return (
        <div className="my-8 w-full max-w-4xl mx-auto">
            <div className="relative w-full rounded-lg overflow-hidden shadow-lg bg-gray-100" style={{ paddingTop: '56.25%' }}>
                <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={embedUrl}
                    title={caption || 'YouTube video'}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
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
