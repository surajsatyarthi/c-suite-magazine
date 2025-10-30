export default function SocialProof() {
  const publications = [
    { name: 'Forbes', color: '#000000' },
    { name: 'Bloomberg', color: '#000000' },
    { name: 'WSJ', color: '#000000' },
    { name: 'Financial Times', color: '#FFF1E5' },
    { name: 'Reuters', color: '#FF6600' },
    { name: 'The Economist', color: '#E3120B' },
  ]

  return (
    <section className="py-12 bg-gray-50 border-y border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            As Featured In
          </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {publications.map((pub) => (
            <div
              key={pub.name}
              className="text-2xl md:text-3xl font-serif font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              {pub.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
