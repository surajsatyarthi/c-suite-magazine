import OptimizedImage from './OptimizedImage'


interface PartnerQuote {
  quote: string
  name: string
  title: string
  company: string
  logo?: {
    asset: {
      _ref: string
      _type: string
    }
  }
  logoUrl?: string // From query projection
}

interface PartnerQuotesProps {
  quotes: PartnerQuote[]
}

export default function PartnerQuotes({ quotes }: PartnerQuotesProps) {
  if (!quotes || quotes.length === 0) return null

  return (
    <div className="my-16 border-t border-b border-gray-200 py-12">
      <h3 className="text-center font-serif text-2xl md:text-3xl font-bold text-[#082945] mb-2">
        Partner Perspectives
      </h3>
      <div className="w-24 h-0.5 bg-[#c8ab3d] mx-auto mb-10"></div>
      
      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
        {quotes.map((item, index) => (
          <div 
            key={index}
            className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            {/* Company Logo, verified via Alt Text for Ad Tests */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 bg-white">
                 {item.logoUrl ? (
                    <div className="relative w-full h-full">
                       <OptimizedImage
                          src={item.logoUrl}
                          alt={`${item.company} Logo`}
                          fill
                          className="object-contain p-2"
                        />
                    </div>
                 ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#003366] to-[#082945] flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                 )}
              </div>
              
              <div className="flex-1">
                {/* Quote */}
                <p className="text-gray-700 italic leading-relaxed mb-4 text-sm md:text-base">
                  "{item.quote}"
                </p>
                
                {/* Attribution */}
                <div className="border-t border-gray-200 pt-3">
                  <p className="font-semibold text-[#082945] text-sm">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {item.title}
                  </p>
                  <p className="text-xs text-[#c8ab3d] font-semibold mt-1">
                    {item.company}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
