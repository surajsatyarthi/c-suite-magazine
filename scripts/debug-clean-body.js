const title = "Rich Stinson: Visionary Leader Powering America’s Electrification Future"
const body = [
    {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Southwire at 75: Leading the Reshoring Revolution and Building a Sustainable Tomorrow' }]
    },
    {
        _type: 'block',
        style: 'normal',
        children: [{ _type: 'span', text: 'As global electricity demand surges toward a projected 4% annual growth...' }]
    }
]

function norm(s) {
    return String(s || '')
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .toLowerCase()
        .trim()
}

function cleanBody(blocks, postTitle) {
    const b = blocks.slice()
    let removed = 0
    for (let i = 0; i < b.length && removed < 2; i++) {
        const blk = b[i]
        if (!blk || blk._type !== 'block') continue
        const text = blk.children.map(c => c.text).join(' ')

        console.log(`Checking block: "${text}"`)
        console.log(`Norm block: "${norm(text)}"`)
        console.log(`Norm title: "${norm(postTitle)}"`)

        if (norm(text).startsWith(norm(postTitle))) {
            console.log('MATCH! Removing block.')
            b.splice(i, 1)
            removed++
            i--
            continue
        }
        break
    }
    return b
}

const cleaned = cleanBody(body, title)
console.log(`Original length: ${body.length}`)
console.log(`Cleaned length: ${cleaned.length}`)
