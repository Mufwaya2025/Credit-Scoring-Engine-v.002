import { db } from './src/lib/db'

async function testDbConnection() {
  try {
    console.log('Testing database connection...')
    
    // Try to create a test rule
    const testRule = await db.rule.create({
      data: {
        name: 'Test Rule',
        description: 'Test rule for database connection',
        type: 'eligibility',
        category: 'credit_score',
        condition: '{"field": "creditScore", "operator": ">", "value": 600}',
        action: 'approve',
        priority: 1,
        isActive: true,
        weight: 1.0
      }
    })
    
    console.log('Test rule created:', testRule)
    
    // Try to read it back
    const rules = await db.rule.findMany()
    console.log('All rules:', rules)
    
    // Clean up
    await db.rule.delete({
      where: { id: testRule.id }
    })
    
    console.log('Database connection test successful!')
  } catch (error) {
    console.error('Database connection test failed:', error)
  }
}

testDbConnection()