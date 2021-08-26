const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const fullscreenBtn = document.getElementById("fullscreen");
const connectionBtn = document.getElementById("connection");

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let connection = true;
let roomName;
let myPeerConnection;

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
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = true;
  }
}
function handleConnectClick() {
  if (connection) {
    connectionBtn.innerText = "Disconnect";
    connection = false;
    myStream.getTracks().forEach((track) => track.stop());
  } else {
    connectionBtn.innerText = "Connect";
    connection = true;
    getMedia();
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
connectionBtn.addEventListener("click", handleConnectClick);

//welcome form (join a room)
const welcome = document.getElementById("welcome");

const welcomeForm = welcome.querySelector("form");

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcome.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

//socket code

//Host브라우저에서 돌아가는 코드, offer을 준다.
socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
});

//Guset 브라우저에서 돌아가는 코드, offer을 받아서 answer을 찍는다.
socket.on("offer", async (offer) => {
  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("sent the answer");
});

//Host브라우저에서 실행
socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

// RTC Code
function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  console.log("got ice candidate");
  console.log(data);
}
