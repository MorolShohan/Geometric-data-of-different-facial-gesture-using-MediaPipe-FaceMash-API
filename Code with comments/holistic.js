//This file handles the initialization of the Mediapipe Holistic model, video input, and the recording of data.

let recording = false; // Flag to indicate if recording is active
let intervalId; // Interval ID for the recording interval
let data = []; // Array to store recorded data

// Function to handle recording of data
function recordData(results) {
  const { faceLandmarks, leftHandLandmarks, rightHandLandmarks } = results;

  // Check if all landmarks are available
  if (faceLandmarks && leftHandLandmarks && rightHandLandmarks) {
    const faceData = faceLandmarks.map(landmark => [landmark.x, landmark.y, landmark.z]);
    const leftHandData = leftHandLandmarks.map(landmark => [landmark.x, landmark.y, landmark.z]);
    const rightHandData = rightHandLandmarks.map(landmark => [landmark.x, landmark.y, landmark.z]);

    // Push the recorded data into the data array
    data.push({ faceData, leftHandData, rightHandData });
  }
}

// Function to calculate average movements
function calculateAverages() {
  const faceData = [];
  const leftHandData = [];
  const rightHandData = [];

  // Aggregate data from the recorded data array
  data.forEach(entry => {
    faceData.push(...entry.faceData);
    leftHandData.push(...entry.leftHandData);
    rightHandData.push(...entry.rightHandData);
  });

  // Calculate average for face landmarks
  const avgFace = faceData.reduce((acc, val) => acc.map((a, i) => a + val[i]), [0, 0, 0]).map(val => val / faceData.length);
  // Calculate average for left hand landmarks
  const avgLeftHand = leftHandData.reduce((acc, val) => acc.map((a, i) => a + val[i]), [0, 0, 0]).map(val => val / leftHandData.length);
  // Calculate average for right hand landmarks
  const avgRightHand = rightHandData.reduce((acc, val) => acc.map((a, i) => a + val[i]), [0, 0, 0]).map(val => val / rightHandData.length);

  return { avgFace, avgLeftHand, avgRightHand };
}

// Add Mediapipe Holistic setup and usage
const videoElement = document.getElementsByClassName('input_video4')[0]; // Video element for webcam input
const canvasElement = document.getElementsByClassName('output4')[0]; // Canvas element for Mediapipe output
const canvasCtx = canvasElement.getContext('2d'); // Canvas context for drawing

const holistic = new Holistic({ locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
}});

holistic.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  refineFaceLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// Function to handle results from the Holistic model
holistic.onResults((results) => {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
  drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
  drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
  drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#CC0000', lineWidth: 5 });
  drawLandmarks(canvasCtx, results.leftHandLandmarks, { color: '#00FF00', lineWidth: 2 });
  drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#00CC00', lineWidth: 5 });
  drawLandmarks(canvasCtx, results.rightHandLandmarks, { color: '#FF0000', lineWidth: 2 });
  canvasCtx.restore();

  if (recording) {
    recordData(results); // Record data if recording is active
  }
});

// Initialize the camera and start capturing video
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await holistic.send({ image: videoElement });
  },
  width: 640,
  height: 480
});
camera.start(); // Start the camera

// Event listener for start button
document.getElementById('startButton').addEventListener('click', () => {
  recording = true; // Set recording flag to true
  intervalId = setInterval(() => {
    console.log("Recording data...");
  }, 5000); // Log message every 5 seconds
});

// Event listener for stop button
document.getElementById('stopButton').addEventListener('click', () => {
  recording = false; // Set recording flag to false
  clearInterval(intervalId); // Clear the interval

  const averages = calculateAverages(); // Calculate averages
  console.log('Averages:', averages);
  saveDataToDatabase(averages); // Save data to the database
});
