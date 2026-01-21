import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function resetViews() {
  const slug = 'shrikant-vaidya-chairman-indianoil'
  
  console.log(`Resetting view count for: ${slug}`)
  
  const { data, error } = await supabase
    .from('views')
    .update({ count: 0 })
    .eq('slug', slug)
    .select()
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  console.log('✅ Successfully reset view count to 0')
  console.log('Data:', data)
}

resetViews().then(() => process.exit(0))
