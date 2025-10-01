#!/usr/bin/env node

const testCreateRule = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Rule',
        description: 'Test rule for debugging',
        type: 'eligibility',
        category: 'credit_score',
        condition: '{"field": "creditScore", "operator": ">", "value": 600}',
        action: 'approve',
        priority: 1,
        isActive: true,
        weight: 1.0
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data);
    } else {
      const error = await response.json();
      console.log('Error:', error);
    }
  } catch (error) {
    console.error('Exception:', error);
  }
};

testCreateRule();