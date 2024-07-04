CREATE DATABASE confidence_data;
USE confidence_data;

CREATE TABLE movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  avg_face VARCHAR(255),
  avg_left_hand VARCHAR(255),
  avg_right_hand VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
