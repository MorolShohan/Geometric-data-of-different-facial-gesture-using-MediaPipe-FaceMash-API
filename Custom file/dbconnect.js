const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'confidence_data'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL connected...');
});

app.post('/save-data', (req, res) => {
  const { avgFace, avgLeftHand, avgRightHand } = req.body;

  const query = 'INSERT INTO movements (avg_face, avg_left_hand, avg_right_hand) VALUES (?, ?, ?)';
  db.query(query, [avgFace.join(','), avgLeftHand.join(','), avgRightHand.join(',')], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send('Data saved to database');
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
