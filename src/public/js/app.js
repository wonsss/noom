const socket = io();

const welcome = document.getElementById("welcome");
const roomInput = document.getElementById("roomInput")
const nameInput = document.getElementById("nameInput")
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input")
    const value = input.value;
    socket.emit("new_message", value, roomName, ()=>{
        addMessage(`You: ${value}`)
    });
    input.value = "";
}


function showRoom() { 
    welcome.hidden = true;
    room.hidden = false; 
    const h3 = room.querySelector("h3");
    const h4 = room.querySelector("h4");
    h3.innerText = `Room: ${roomName}`;
    h4.innerText = `Nickname: ${nickname}`;
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit); 
 };
 
function handleRoomSubmit(event) {
    event.preventDefault();
    socket.emit("nickname", nameInput.value);
    socket.emit("enter_room", roomInput.value, showRoom);
    roomName = roomInput.value;
    nickname = nameInput.value;
    roomInput.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
    addMessage(`${user} Joined`)
});

socket.on("bye",(user)=>{
    addMessage(`${user} left`)
})

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if (rooms.length == 0) {
	    return;
    }
    rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    })
})
