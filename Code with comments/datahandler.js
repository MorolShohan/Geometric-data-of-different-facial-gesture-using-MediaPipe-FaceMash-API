//This file handles sending the recorded data to the server.

// Function to send data to the server and save it to the database
async function saveDataToDatabase(data) {
    const response = await fetch('/save-data', { // Send a POST request to the /save-data endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data) // Convert the data to a JSON string
    });
  
    if (response.ok) {
      console.log('Data successfully saved to database'); // Log success message
    } else {
      console.error('Failed to save data to database'); // Log error message
    }
  }
  