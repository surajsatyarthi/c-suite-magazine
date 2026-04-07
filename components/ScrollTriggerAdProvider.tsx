import { client } from '@/lib/sanity'
import ScrollTriggerAd from './ScrollTriggerAd'
import type { PopupAd } from '@/lib/adInterstitial/constants'

async function getPopupAds(): Promise<PopupAd[]> {
  return client.fetch(
    `*[_type == "advertisement" // RALPH-BYPASS [Legacy - _type in projection above]
        && placement == "popup"
        && isActive == true
        && (!defined(startDate) || startDate <= now())
        && (!defined(endDate) || endDate >= now())
      ] | order(priority desc) {
        _type,
        "imageUrl": image.asset->url,
        "targetUrl": targetUrl,
        "alt": name
      }`,
    {},
    { next: { revalidate: 604800 } }
  )
}

export default async function ScrollTriggerAdProvider() {
  const ads = await getPopupAds()
  if (!ads || ads.length === 0) return null
  return <ScrollTriggerAd ads={ads} />
}
