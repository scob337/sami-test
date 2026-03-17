async function verifyReport() {
  try {
    const response = await fetch('api/test/report?attemptId=42');
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Is Partial:', data.isPartial);
    console.log('Report Preview:', data.reportText?.substring(0, 100) + '...');
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

verifyReport();
