import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Strict Batch List (ID mapping needed)
const BATCH_NAMES = [
    'M W 4-5', 'M W 6-7', 'M W 7-8', 
    'T T 6-7', 'T T 7-8', 'OTT 4-5', 
    'O F 5-7', 'S S 4-5', 'S S 5-6', 
    'SAT 4-6', 'SS 11-2'
]

function findMatchingBatch(csvBatchStr: string): string | null {
    if (!csvBatchStr) return null
    const normalized = csvBatchStr.toUpperCase().replace(/\s+/g, '')
    
    // Improved Mapping Logic
    if (normalized.includes('M-W') || normalized.includes('MW')) {
        if (normalized.includes('4-5')) return 'M W 4-5'
        if (normalized.includes('6-7')) return 'M W 6-7'
        if (normalized.includes('7-8')) return 'M W 7-8'
    }
    
    if (normalized.includes('T-T') || normalized.includes('TT')) {
        if (normalized.includes('ONLINE') || normalized.startsWith('O') || normalized.includes('OTT')) {
             if (normalized.includes('4-5')) return 'OTT 4-5'
        }
        if (normalized.includes('6-7')) return 'T T 6-7'
        if (normalized.includes('7-8')) return 'T T 7-8'
        // Fallback for T-T-4-5 if not online? Maybe map to OTT 4-5 anyway?
        if (normalized.includes('4-5')) return 'OTT 4-5' 
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

    // Specific fixes for failed batches
    if (normalized.includes('SUN') && normalized.includes('4-6')) return 'SAT 4-6' // Closest?
    if (normalized.includes('M-TU-6-7')) return 'M W 6-7' // Approx
    
    return null
}

async function main() {
    // 1. Get Batch Map
    const batches = await prisma.batch.findMany()
    const batchMap = new Map<string, string>()
    batches.forEach(b => batchMap.set(b.name, b.id))

    // 2. Read CSV to get original batch strings
    const csvPath = path.join(process.cwd(), 'Arnav Abacus Academy -26Nov24-07-04-25(Student Master).csv')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = fileContent.split('\n').slice(2)
    const studentBatchStrMap = new Map<string, string>()

    for (const line of lines) {
        const cols = line.split(',')
        if (cols.length < 5) continue
        const name = cols[5]?.trim()
        const batchStr = cols[15]?.trim()
        if (name && batchStr) {
            studentBatchStrMap.set(name, batchStr)
        }
    }

    // 3. Find Unassigned Students
    const unassignedStudents = await prisma.student.findMany({
        where: { batchId: null }
    })

    console.log(`Found ${unassignedStudents.length} unassigned students.`)

    let fixedCount = 0
    for (const student of unassignedStudents) {
        const originalBatchStr = studentBatchStrMap.get(student.name)
        if (originalBatchStr) {
            const targetBatchName = findMatchingBatch(originalBatchStr)
            if (targetBatchName && batchMap.has(targetBatchName)) {
                await prisma.student.update({
                    where: { id: student.id },
                    data: { batchId: batchMap.get(targetBatchName) }
                })
                console.log(`Fixed: ${student.name} -> ${targetBatchName} (${originalBatchStr})`)
                fixedCount++
            } else {
                console.log(`Could not match: ${student.name} (${originalBatchStr})`)
            }
        }
    }

    console.log(`Fixed ${fixedCount} students.`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
