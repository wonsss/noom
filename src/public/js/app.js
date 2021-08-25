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


function showRoom(newCount) {   //mod
    welcome.hidden = true;
    room.hidden = false; 
    const h3 = room.querySelector("h3");
    const h4 = room.querySelector("h4");
    h3.innerText = `Room: ${roomName} (${newCount})`; //add
    h4.innerText = `Nickname: ${nickname}`;
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit); 
 };
 
function handleRoomSubmit(event) {
    event.preventDefault();
    roomName = roomInput.value;
    nickname = nameInput.value;
    socket.emit("nickname", nameInput.value);
    socket.emit("enter_room", roomInput.value, showRoom);
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("first", (newCount) => {
    showRoom(newCount)
})

socket.on("welcome", (user, newCount) => {
    //const h3 = room.querySelector("h3");
    //h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} Joined`)
    showRoom(newCount)  //add
});

socket.on("bye", (user, newCount) => {
    //const h3 = room.querySelector("h3");
    //h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} left`)
    showRoom(newCount)  //add
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
