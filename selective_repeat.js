document.addEventListener('DOMContentLoaded', function () {
    const backBtn = document.getElementById("backBtn");
    backBtn.addEventListener('click', function () {
        window.history.back();
    });
});

let packetSize;
let windowSize;
let packets = [];
let damagedPacket = -1;
let transmissionSpeed = 1000;
let base = 0;
let nextPacket = 0;
let acks = {}; // Track received ACKs for selective repeat

document.getElementById("speedControl").addEventListener("input", function () {
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
    acks = {};

    sendPacketsInWindow();
}

function sendPacketsInWindow() {
    for (let i = base; i < base + windowSize && i < packetSize; i++) {
        if (!acks[i]) { // Only send packets that have not been acknowledged
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
            console.log(`Packet ${packetIndex} damaged`);
        } else {
            packet.classList.remove("transmitting");
            packet.classList.add("received");
            addToReceiver(packetIndex);
        }
    }, transmissionSpeed);
}

function addToReceiver(packetIndex) {
    const receiverDiv = document.getElementById("receiver");
    const receivedPacket = document.createElement("div");
    receivedPacket.classList.add("packet", "received");
    receivedPacket.textContent = `Packet ${packetIndex}`;
    receiverDiv.appendChild(receivedPacket);

    // Mark this packet as acknowledged
    acks[packetIndex] = true;

    // Move the base to the next unacknowledged packet in sequence
    while (acks[base]) {
        base++;
    }

    // Continue sending packets within the current window
    if (Object.keys(acks).length === packetSize) {
        console.log("All packets received.");
    } else {
        sendPacketsInWindow();
    }
}

function damagePacket() {
    if (nextPacket < packetSize) {
        damagedPacket = base + Math.floor(Math.random() * windowSize);
        packets[damagedPacket].classList.add("damaged");
        setTimeout(() => {
            if (damagedPacket >= base && !acks[damagedPacket]) {
                packets[damagedPacket].classList.remove("damaged");
                sendPacket(damagedPacket); // Resend only the damaged packet selectively
            }
        }, transmissionSpeed);
    }
}
