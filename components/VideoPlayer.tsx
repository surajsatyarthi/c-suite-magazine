'use client'

interface VideoPlayerProps {
    url: string
    caption?: string
}

export default function VideoPlayer({ url, caption }: VideoPlayerProps) {
    if (!url) return null

    // Convert YouTube URL to embed format
    const getYouTubeEmbedUrl = (url: string) => {
        // Handle youtu.be/VIDEO_ID format
        if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1].split('?')[0]
            return `https://www.youtube.com/embed/${videoId}`
        }
        // Handle youtube.com/watch?v=VIDEO_ID format
        if (url.includes('youtube.com/watch')) {
            const videoId = new URL(url).searchParams.get('v')
            return `https://www.youtube.com/embed/${videoId}`
        }
        // Already an embed URL
        if (url.includes('/embed/')) {
            return url
        }
        return url
    }

    const embedUrl = getYouTubeEmbedUrl(url)

    return (
        <div className="my-8 w-full max-w-4xl mx-auto">
            <div className="relative w-full rounded-lg overflow-hidden shadow-lg" style={{ paddingTop: '56.25%' }}>
                <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={embedUrl}
                    title={caption || 'YouTube video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
