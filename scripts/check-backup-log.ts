
import { createClient } from 'next-sanity'

const client = createClient({
  projectId: '2f93fcy8',
  dataset: 'production',
  apiVersion: '2024-10-01',
  useCdn: false,
  token: 'skot4OEOfRDlXxPigwwflOAUoYpYeg9ERyE1VE3syOnF8ZtaW5d7foPsa3socZrlvPajQl8gQHkCZhjrZa4U5dwBR3728uHsMsKfnQ0MjVKBx6WvmOTxELdFZoml2h0GJPQYpUiVfExyKelHwUfMPR2EFRgwdqtOf1kmOBqS340Yl7nw8Fau'
})

async function checkLogs() {
  console.log("Checking for system logs...")
  try {
    const query = `*[_type == "systemLog"] | order(timestamp desc)[0...10]`
    const logs = await client.fetch(query)
    if (logs.length === 0) {
        console.log("No system logs found.")
    } else {
        console.log(JSON.stringify(logs, null, 2))
    }
  } catch (error) {
    console.error("Error fetching logs:", error)
  }
}

checkLogs()
