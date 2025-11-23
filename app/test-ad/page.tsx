import Link from 'next/link'

export default function TestAdPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">AdInterstitial Test Page</h1>

            <div className="space-y-4 mb-8">
                <p>This page is for testing the AdInterstitial component.</p>
                <div className="flex gap-4">
                    <Link
                        href="/test-ad?openAd=1"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Force Open Ad
                    </Link>
                    <Link
                        href="/test-ad"
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Reset
                    </Link>
                </div>
                <p className="text-sm text-gray-600">
                    Note: Ensure NEXT_PUBLIC_USE_AD_V2=true in .env.local to test V2.
                </p>
            </div>

            <div className="prose prose-lg">
                {/* Generate long content to test scroll detection */}
                {[...Array(20)].map((_, i) => (
                    <p key={i}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                ))}
            </div>
        </div>
    )
}
