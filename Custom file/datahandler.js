// dataHandler.js
async function saveDataToDatabase(data) {
    const response = await fetch('/save-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  
    if (response.ok) {
      console.log('Data successfully saved to database');
    } else {
      console.error('Failed to save data to database');
    }
  }
  