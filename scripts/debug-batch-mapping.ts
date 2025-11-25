import fs from 'fs'
import path from 'path'

// Strict Batch List
const ALLOWED_BATCHES = [
    { name: 'M W 4-5', days: 'Mon, Wed', timeSlot: '4 PM - 5 PM', isOnline: false },
    { name: 'M W 6-7', days: 'Mon, Wed', timeSlot: '6 PM - 7 PM', isOnline: false },
    { name: 'M W 7-8', days: 'Mon, Wed', timeSlot: '7 PM - 8 PM', isOnline: false },
    { name: 'T T 6-7', days: 'Tue, Thu', timeSlot: '6 PM - 7 PM', isOnline: false },
    { name: 'T T 7-8', days: 'Tue, Thu', timeSlot: '7 PM - 8 PM', isOnline: false },
    { name: 'OTT 4-5', days: 'Tue, Thu', timeSlot: '4 PM - 5 PM', isOnline: true },
    { name: 'O F 5-7', days: 'Fri', timeSlot: '5 PM - 7 PM', isOnline: true },
    { name: 'S S 4-5', days: 'Sat, Sun', timeSlot: '4 PM - 5 PM', isOnline: false },
    { name: 'S S 5-6', days: 'Sat, Sun', timeSlot: '5 PM - 6 PM', isOnline: false },
    { name: 'SAT 4-6', days: 'Sat', timeSlot: '4 PM - 6 PM', isOnline: false },
    { name: 'SS 11-2', days: 'Sat, Sun', timeSlot: '11 AM - 2 PM', isOnline: false }
]

function findMatchingBatch(csvBatchStr: string): string | null {
    if (!csvBatchStr) return null
    const normalized = csvBatchStr.toUpperCase().replace(/\s+/g, '')
    
    if (normalized.includes('M-W') || normalized.includes('MW')) {
        if (normalized.includes('4-5')) return 'M W 4-5'
        if (normalized.includes('6-7')) return 'M W 6-7'
        if (normalized.includes('7-8')) return 'M W 7-8'
    }
    
    if (normalized.includes('T-T') || normalized.includes('TT')) {
        if (normalized.includes('ONLINE') || normalized.startsWith('O')) {
             if (normalized.includes('4-5')) return 'OTT 4-5'
        }
        if (normalized.includes('6-7')) return 'T T 6-7'
        if (normalized.includes('7-8')) return 'T T 7-8'
    }

    if (normalized.includes('SAT') && !normalized.includes('SUN')) {
        if (normalized.includes('4-6')) return 'SAT 4-6'
    }

    if (normalized.includes('S-S') || normalized.includes('SS') || (normalized.includes('SAT') && normalized.includes('SUN'))) {
        if (normalized.includes('4-5')) return 'S S 4-5'
        if (normalized.includes('5-6')) return 'S S 5-6'
        if (normalized.includes('11-2')) return 'SS 11-2'
    }

    if (normalized.includes('O-F') || (normalized.includes('ONLINE') && normalized.includes('F'))) {
        if (normalized.includes('5-7')) return 'O F 5-7'
    }
    
    return null
}

function main() {
    const csvPath = path.join(process.cwd(), 'Arnav Abacus Academy -26Nov24-07-04-25(Student Master).csv')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = fileContent.split('\n').slice(2)

    const batchCounts = new Map<string, number>()
    const failedBatches = new Set<string>()

    for (const line of lines) {
        const cols = line.split(',')
        if (cols.length < 5) continue
        const batchStr = cols[15]?.trim()
        
        if (batchStr) {
            const match = findMatchingBatch(batchStr)
            if (match) {
                batchCounts.set(match, (batchCounts.get(match) || 0) + 1)
            } else {
                failedBatches.add(batchStr)
            }
        }
    }

    console.log('--- Matched Batches ---')
    for (const [batch, count] of batchCounts) {
        console.log(`${batch}: ${count} students`)
    }

    console.log('\n--- Failed to Match ---')
    failedBatches.forEach(b => console.log(`"${b}"`))
}

main()
