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
            return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
        }
        // Handle youtube.com/watch?v=VIDEO_ID format
        if (cleanUrl.includes('youtube.com/watch')) {
            const videoId = new URL(cleanUrl).searchParams.get('v')
            return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
        }
        // Already an embed URL
        if (cleanUrl.includes('/embed/')) {
            return cleanUrl
        }
        return cleanUrl
    }

    const getVideoId = (url: string) => {
        const cleanUrl = url.split('&')[0].split('?t=')[0]
        if (cleanUrl.includes('youtu.be/')) {
            return cleanUrl.split('youtu.be/')[1].split('?')[0]
        }
        if (cleanUrl.includes('youtube.com/watch')) {
            return new URL(cleanUrl).searchParams.get('v')
        }
        return null
    }

    const embedUrl = getYouTubeEmbedUrl(url)
    const videoId = getVideoId(url)
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`

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
            {/* Fallback link if video is blocked */}
            <div className="mt-3 text-center">
                <a 
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#082945] hover:text-[#c8ab3d] transition-colors inline-flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Watch on YouTube
                </a>
            </div>
        </div>
    )
}
