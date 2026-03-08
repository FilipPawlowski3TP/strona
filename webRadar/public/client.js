const mapCanvas = document.getElementById('mapCanvas');
const radarCanvas = document.getElementById('radarCanvas');
const mapCtx = mapCanvas.getContext('2d');
const radarCtx = radarCanvas.getContext('2d');
const sessionEl = document.getElementById('session-id');
const mapEl = document.getElementById('map-name');
const statusEl = document.getElementById('ws-status');

const sessionId = window.location.pathname.split('/').pop();
sessionEl.textContent = sessionId;

let ws = null;
let currentMap = "";
let mapImage = new Image();
let mapConfig = { pos_x: 0, pos_y: 0, scale: 1 };

function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}/ws/radar?session=${sessionId}`);
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
        statusEl.textContent = 'online';
        statusEl.style.color = '#00ff00';
    };

    ws.onclose = () => {
        statusEl.textContent = 'offline';
        statusEl.style.color = '#ff0000';
        setTimeout(connect, 2000);
    };

    ws.onmessage = (event) => {
        parseData(event.data);
    };
}

function parseData(buffer) {
    const view = new DataView(buffer);
    let offset = 0;

    const type = view.getUint8(offset++);
    if (type !== 0x01) return; // Only handle updates

    const localTeam = view.getInt32(offset, true); offset += 4;
    const playerCount = view.getInt32(offset, true); offset += 4;

    // Map name (64 bytes)
    const mapNameArr = new Uint8Array(buffer, offset, 64);
    let mapName = new TextDecoder().decode(mapNameArr).split('\0')[0];
    offset += 64;

    if (mapName && mapName !== currentMap) {
        loadMap(mapName);
    }

    render(localTeam, playerCount, buffer, offset);
}

async function loadMap(name) {
    currentMap = name;
    mapEl.textContent = name;

    // Attempt to load map image and config
    mapImage.src = `/maps/${name}.png`;
    try {
        const response = await fetch(`/maps/${name}.txt`);
        if (response.ok) {
            const text = await response.text();
            const lines = text.split('\n');
            lines.forEach(line => {
                if (line.includes('pos_x')) mapConfig.pos_x = parseFloat(line.split(' ')[1]);
                if (line.includes('pos_y')) mapConfig.pos_y = parseFloat(line.split(' ')[1]);
                if (line.includes('scale')) mapConfig.scale = parseFloat(line.split(' ')[1]);
            });
        }
    } catch (e) {
        console.error("Failed to load map config", e);
    }

    mapImage.onload = () => {
        mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
        mapCtx.drawImage(mapImage, 0, 0, mapCanvas.width, mapCanvas.height);
    };
}

function worldToCanvas(worldX, worldY) {
    const canvasX = (worldX - mapConfig.pos_x) / mapConfig.scale;
    const canvasY = (mapConfig.pos_y - worldY) / mapConfig.scale;

    // Assuming 1024x1024 source map coordinates scaled to 800x800 canvas
    return {
        x: (canvasX / 1024) * 800,
        y: (canvasY / 1024) * 800
    };
}

function render(localTeam, playerCount, buffer, startOffset) {
    radarCtx.clearRect(0, 0, radarCanvas.width, radarCanvas.height);
    let offset = startOffset;

    for (let i = 0; i < playerCount; i++) {
        const pView = new DataView(buffer, offset, 60);

        const x = pView.getFloat32(0, true);
        const y = pView.getFloat32(4, true);
        const z = pView.getFloat32(8, true);
        const yaw = pView.getFloat32(12, true);
        const health = pView.getInt32(16, true);
        const team = pView.getInt32(20, true);
        const isAlive = pView.getUint8(24);

        // Name (32 bytes)
        const nameArr = new Uint8Array(buffer, offset + 25, 32);
        const name = new TextDecoder().decode(nameArr).split('\0')[0];

        if (isAlive && health > 0) {
            const pos = worldToCanvas(x, y);
            drawPlayer(pos.x, pos.y, yaw, team === localTeam, health, name, team);
        }

        offset += 60;
    }
}

function drawPlayer(x, y, yaw, isLocal, health, name, team) {
    const color = team === 2 ? '#ff4d4d' : '#4d79ff'; // 2=T, 3=CT roughly

    radarCtx.save();
    radarCtx.translate(x, y);

    // Draw dot
    radarCtx.beginPath();
    radarCtx.arc(0, 0, 6, 0, Math.PI * 2);
    radarCtx.fillStyle = color;
    radarCtx.fill();
    radarCtx.strokeStyle = '#fff';
    radarCtx.lineWidth = 1;
    radarCtx.stroke();

    // Draw direction arrow
    radarCtx.rotate(-(yaw) * (Math.PI / 180));
    radarCtx.beginPath();
    radarCtx.moveTo(0, -6);
    radarCtx.lineTo(0, -12);
    radarCtx.strokeStyle = '#fff';
    radarCtx.stroke();

    radarCtx.restore();

    // Draw name & health
    radarCtx.fillStyle = '#fff';
    radarCtx.font = '10px Arial';
    radarCtx.textAlign = 'center';
    radarCtx.fillText(`${name} (${health})`, x, y + 15);
}

connect();
