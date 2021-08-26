const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const fullscreenBtn = document.getElementById("fullscreen");
const connectionBtn = document.getElementById("connection");

let myStream;
let muted = false;
let cameraOff = false;
let connection = true;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput"); //디바이스 인풋 중에 비디오 인풋만 보기 위해 필터
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label == camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstraints = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

getMedia();

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    camereBtn.innerText = "Turn Camera On";
    cameraOff = false;
  } else {
    camereBtn.innerText = "Turn Camera Off";
    cameraOff = true;
  }
}
function handleConnectClick() {
  myStream.getTracks().forEach((track) => track.stop());
  if (connection) {
    connectionBtn.innerText = "Disconnect";
    connection = false;
  } else {
    connectionBtn.innerText = "Connect";
    connection = true;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
}

function handleFullscreen() {
  if (myFace.requestFullscreen) {
    myFace.requestFullscreen();
  } else if (myFace.mozRequestFullScreen) {
    /* Firefox */
    myFace.mozRequestFullScreen();
  } else if (myFace.webkitRequestFullscreen) {
    /* Chrome, Safari & Opera */
    myFace.webkitRequestFullscreen();
  } else if (myFace.msRequestFullscreen) {
    /* IE/Edge */
    myFace.msRequestFullscreen();
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);
fullscreenBtn.addEventListener("click", handleFullscreen);
