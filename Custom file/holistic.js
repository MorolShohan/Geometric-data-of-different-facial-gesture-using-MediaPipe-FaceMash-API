// holistic.js
let recording = false;
let intervalId;
let data = [];

// Function to handle recording of data
function recordData(results) {
  const { faceLandmarks, leftHandLandmarks, rightHandLandmarks } = results;

  if (faceLandmarks && leftHandLandmarks && rightHandLandmarks) {
    const faceData = faceLandmarks.map(landmark => [landmark.x, landmark.y, landmark.z]);
    const leftHandData = leftHandLandmarks.map(landmark => [landmark.x, landmark.y, landmark.z]);
    const rightHandData = rightHandLandmarks.map(landmark => [landmark.x, landmark.y, landmark.z]);

    data.push({ faceData, leftHandData, rightHandData });
  }
}

// Function to calculate average movements
function calculateAverages() {
  const faceData = [];
  const leftHandData = [];
  const rightHandData = [];

  data.forEach(entry => {
    faceData.push(...entry.faceData);
    leftHandData.push(...entry.leftHandData);
    rightHandData.push(...entry.rightHandData);
  });

  const avgFace = faceData.reduce((acc, val) => acc.map((a, i) => a + val[i]), [0, 0, 0]).map(val => val / faceData.length);
  const avgLeftHand = leftHandData.reduce((acc, val) => acc.map((a, i) => a + val[i]), [0, 0, 0]).map(val => val / leftHandData.length);
  const avgRightHand = rightHandData.reduce((acc, val) => acc.map((a, i) => a + val[i]), [0, 0, 0]).map(val => val / rightHandData.length);

  return { avgFace, avgLeftHand, avgRightHand };
}

// Add Mediapipe Holistic setup and usage
const videoElement = document.getElementsByClassName('input_video4')[0];
const canvasElement = document.getElementsByClassName('output4')[0];
const canvasCtx = canvasElement.getContext('2d');

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
    recordData(results);
  }
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await holistic.send({ image: videoElement });
  },
  width: 640,
  height: 480
});
camera.start();

// Event listeners for start and stop buttons
document.getElementById('startButton').addEventListener('click', () => {
  recording = true;
  intervalId = setInterval(() => {
    console.log("Recording data...");
  }, 5000);
});

document.getElementById('stopButton').addEventListener('click', () => {
  recording = false;
  clearInterval(intervalId);

  const averages = calculateAverages();
  console.log('Averages:', averages);
  saveDataToDatabase(averages);
});
