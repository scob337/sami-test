async function testDynamicPrompt() {
  try {
    const response = await fetch('http://localhost:3000/api/test/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId: 44, // Using a recent attemptId
        testId: 1,
        userData: { id: 1, user_metadata: { fullName: 'Sami User', gender: 'ذكر' } },
        answers: [
          { questionText: 'كيف تتعامل مع الضغوط؟', optionText: 'أبقى هادئاً وأفكر بوضوح' }
        ]
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Report Start:', data.report?.substring(0, 150));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testDynamicPrompt();
