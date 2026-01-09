import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Trigger ISR revalidation for the CSA article page
async function revalidatePage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://csuitemagazine.global'
  const articlePath = '/csa/shrikant-vaidya-chairman-indianoil'
  
  try {
    console.log('🔄 Revalidating article page...')
    console.log(`URL: ${baseUrl}${articlePath}`)
    
    const response = await fetch(`${baseUrl}/api/revalidate?path=${articlePath}`, {
      method: 'POST',
    })
    
    if (response.ok) {
      console.log('✅ Page revalidated successfully!')
      console.log('Pull quotes should now be visible on the live site.')
    } else {
      console.log('⚠️  Revalidate API not available, pull quotes will show after natural cache expiry')
      console.log('Or you can hard refresh the page (Cmd+Shift+R)')
    }
  } catch (error) {
    console.log('⚠️  Could not trigger revalidation')
    console.log('Pull quotes will appear after cache expires or on hard refresh')
  }
}

revalidatePage().then(() => process.exit(0))
