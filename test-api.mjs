async function testGenerateReport() {
  try {
    const response = await fetch('api/test/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId: 42,
        testId: 1,
        userData: { id: 1, user_metadata: { fullName: 'Test User', gender: 'ذكر' } },
        answers: [
          { questionText: 'سؤال تجريبي', optionText: 'إجابة تجريبية' }
        ]
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testGenerateReport();
