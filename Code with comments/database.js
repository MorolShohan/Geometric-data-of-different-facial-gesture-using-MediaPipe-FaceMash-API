//This code sets up a basic Express server and handles saving data to a MySQL database.

const express = require('express'); // Import the express module
const mysql = require('mysql'); // Import the mysql module
const bodyParser = require('body-parser'); // Import the body-parser module

const app = express(); // Create an instance of express
app.use(bodyParser.json()); // Use body-parser to parse JSON request bodies

// Set up MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'confidence_data'
});

// Connect to the MySQL database
db.connect((err) => {
  if (err) {
    throw err; // Throw an error if connection fails
  }
  console.log('MySQL connected...'); // Log success message
});

// Endpoint to save data to the database
app.post('/save-data', (req, res) => {
  const { avgFace, avgLeftHand, avgRightHand } = req.body; // Extract data from the request body

  const query = 'INSERT INTO movements (avg_face, avg_left_hand, avg_right_hand) VALUES (?, ?, ?)'; // SQL query to insert data
  db.query(query, [avgFace.join(','), avgLeftHand.join(','), avgRightHand.join(',')], (err, result) => {
    if (err) {
      return res.status(500).send(err); // Send a 500 status code if an error occurs
    }
    res.send('Data saved to database'); // Send success message
  });
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server running on port 3000');
});

//This setup ensures that your web application captures video input, processes it using Mediapipe to detect facial and hand landmarks, records the data at specified intervals, and then sends the recorded data to a server where it is saved in a MySQL database. Each part of the code is commented to explain its functionality.