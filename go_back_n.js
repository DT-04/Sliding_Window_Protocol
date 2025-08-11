document.addEventListener('DOMContentLoaded', function () {
    // Back button click event
    const backBtn = document.getElementById("backBtn");
    backBtn.addEventListener('click', function () {
        window.history.back();  // Simulates the "Back" action
    });
});

let packetSize;
let windowSize;
let packets = [];
let damagedPacket = -1;
let transmissionSpeed = 1000; 
let base = 0; 
let nextPacket = 0; 
let retransmitting = false; 

document.getElementById("speedControl").addEventListener("input", function() {
    transmissionSpeed = parseInt(this.value);
    document.getElementById("speedDisplay").textContent = `Speed: ${transmissionSpeed}ms`;
});

function startSimulation() {
    packetSize = parseInt(document.getElementById("packetSize").value);
    windowSize = parseInt(document.getElementById("windowSize").value);
    
    packets = [];
    const senderDiv = document.getElementById("sender");
    senderDiv.innerHTML = "";
    for (let i = 0; i < packetSize; i++) {
        const packet = document.createElement("div");
        packet.classList.add("packet");
        packet.textContent = i;
        senderDiv.appendChild(packet);
        packets.push(packet);
    }
    
    document.getElementById("receiver").innerHTML = "";
    damagedPacket = -1;
    base = 0;
    nextPacket = 0;
    retransmitting = false;
    
    sendPacketsInWindow();
}

function sendPacketsInWindow() {
    for (let i = nextPacket; i < base + windowSize && i < packetSize; i++) {
        if (!packets[i].classList.contains("transmitting") && !packets[i].classList.contains("received")) {
            sendPacket(i);
        }
    }
}

function sendPacket(packetIndex) {
    const packet = packets[packetIndex];
    packet.classList.add("transmitting");

    setTimeout(() => {
        if (packetIndex === damagedPacket) {
            packet.classList.remove("transmitting");
            packet.classList.add("damaged");
            if (!retransmitting) {
                retransmitting = true;
                resendPacket(packetIndex); 
            }
        } else {
            packet.classList.remove("transmitting");
            packet.classList.add("received");
            addToReceiver(packet);
            
            if (packetIndex === base) {
                base++;
                sendPacketsInWindow(); 
            }
        }
    }, transmissionSpeed);
}

function resendPacket(packetIndex) {
    packets[packetIndex].classList.remove("damaged");
    sendPacket(packetIndex);
    retransmitting = false; 
}

function addToReceiver(packet) {
    const receiverDiv = document.getElementById("receiver");
    const receivedPacket = document.createElement("div");
    receivedPacket.classList.add("packet", "received");
    receivedPacket.textContent = packet.textContent;
    receiverDiv.appendChild(receivedPacket);
}

function damagePacket() {
    if (nextPacket < packetSize) {
        damagedPacket = base;
        packets[base].classList.add("damaged");
    }
}
