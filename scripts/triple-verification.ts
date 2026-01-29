// @ts-ignore
import fetch from 'node-fetch'
import { lookup } from 'dns/promises'

const DOMAIN = 'csuitemagazine.global'
const WWW_DOMAIN = `www.${DOMAIN}`
const SITE_URL = `https://${DOMAIN}`

async function tripleVerification() {
    console.log("🔒 Initiating Triple Verification Protocol...")
    console.log(`POINTER: ${SITE_URL}\n`)

    let errors = 0

    // 1. DNS Verification
    try {
        console.log("1️⃣  DNS Check...")
        const ips = await lookup(DOMAIN)
        console.log(`   ✅ Apex resolves to: ${ips.address}`)
    } catch (err: any) {
        console.error(`   ❌ DNS Lookup failed for ${DOMAIN}`)
        errors++
    }

    // 2. Reachability & Headers (Apex)
    try {
        console.log("\n2️⃣  Apex Reachability...")
        const res = await fetch(SITE_URL)
        const text = await res.text()

        if (res.ok) {
            console.log(`   ✅ Status 200 OK`)
        } else {
            console.error(`   ❌ Status ${res.status} (Expected 200)`)
            errors++
        }

        if (text.includes("C-Suite")) {
            console.log(`   ✅ Content match verified ("C-Suite")`)
        } else {
            console.error(`   ❌ Content verification failed`)
            errors++
        }
    } catch (err: any) {
        console.error(`   ❌ Connection failed: ${err.message}`)
        errors++
    }

    // 3. WWW Redirect Check
    try {
        console.log("\n3️⃣  WWW Redirect Check...")
        const res = await fetch(`https://${WWW_DOMAIN}`, { redirect: 'manual' })
        if (res.status === 301 || res.status === 308 || res.status === 200) { // Vercel sometimes returns 200 for www if configured as alias
            console.log(`   ✅ WWW responds (Status ${res.status})`)
        } else {
            console.error(`   ❌ WWW validation failed (Status ${res.status})`)
            errors++
        }
    } catch (err: any) {
        console.error(`   ❌ WWW Connection failed`)
        errors++
    }

    // 4. API Health Check
    try {
        console.log("\n4️⃣  API Health Check (/api/categories)...")
        const res = await fetch(`${SITE_URL}/api/categories`)
        if (res.ok) {
            const json = await res.json()
            if (Array.isArray(json) || (json.categories && Array.isArray(json.categories))) {
                console.log(`   ✅ API returns valid category list`)
            } else {
                console.error(`   ❌ API returned invalid format. Got keys: ${Object.keys(json).join(', ')}`)
                errors++
            }
        } else {
            console.error(`   ❌ API Error (Status ${res.status})`)
            errors++
        }
    } catch (err: any) {
        console.error(`   ❌ API Connection failed`)
        errors++
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    if (errors === 0) {
        console.log("✅ TRIPLE VERIFICATION PASSED")
        process.exit(0)
    } else {
        console.error(`❌ VERIFICATION FAILED with ${errors} errors`)
        process.exit(1)
    }
}

tripleVerification()
