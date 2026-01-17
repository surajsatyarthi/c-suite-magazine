import { NextResponse } from 'next/server'
import { getSpotlightItems, processSpotlightItems } from '@/lib/spotlight'
import { getAllExecutivesWithCompensation } from '@/lib/db'
import { client } from '@/lib/sanity'
import { Post } from '@/lib/types'

// Replicating app/page.tsx logic for debugging
async function getSpotlightExcludeSlugs(spotlightItems: any[]): Promise<string[]> {
  try {
    return spotlightItems
      .map(item => {
        const href = item?.href || ''
        const parts = href.split('/').filter(Boolean)
        return parts.length ? parts[parts.length - 1] : ''
      })
      .filter(Boolean)
  } catch (e) {
    return ['error-in-spotlight-slugs']
  }
}

async function getJuggernautExcludeSlugs(): Promise<string[]> {
  try {
    const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0].items[].link`)
    if (!Array.isArray(config)) return []
    return config.map((link: string) => {
        if (!link) return ''
        const parts = link.split('/').filter(Boolean)
        return parts.length > 0 ? parts[parts.length - 1] : ''
      }).filter(Boolean)
  } catch (e) {
    return ['error-in-juggernaut-slugs']
  }
}

async function getLatestPosts(excludeSlugs: string[] = []): Promise<Post[]> {
  const query = `*[_type == "post" && defined(mainImage.asset) && !(slug.current in $excludeSlugs) && isHidden != true] | order(publishedAt desc) [0...6]`
  try {
    return await client.fetch(query, { excludeSlugs })
  } catch (e) {
    throw new Error('LatestPosts failed: ' + (e as Error).message)
  }
}

export async function GET() {
  const debug: any = {
    steps: []
  }

  try {
    debug.steps.push('Starting spotlight fetch')
    const { items: rawSpotlightItems, desiredCount } = await getSpotlightItems()
    debug.rawSpotlightItemsCount = rawSpotlightItems?.length
    
    debug.steps.push('Processing spotlight items')
    const spotlightItems = processSpotlightItems(rawSpotlightItems, desiredCount)
    debug.spotlightItemsCount = spotlightItems?.length

    debug.steps.push('Extracting spotlight slugs')
    const spotlightSlugs = await getSpotlightExcludeSlugs(spotlightItems)
    debug.spotlightSlugs = spotlightSlugs

    debug.steps.push('Starting latest posts fetch')
    const latestArticles = await getLatestPosts(spotlightSlugs)
    debug.latestArticlesCount = latestArticles?.length

    debug.steps.push('Starting DB fetch')
    const topExecutives = await getAllExecutivesWithCompensation(3)
    debug.topExecutivesCount = topExecutives?.length

    return NextResponse.json({ status: 'ok', debug })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: (error as Error).message, 
      stack: (error as Error).stack,
      debug 
    }, { status: 500 })
  }
}
