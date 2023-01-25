

const MOUSE_PULLING_RATE = 60;

let nodeMap = null;

let canvas = null;

function setup() {
  const renderer = createCanvas(800, 800);

  canvas = renderer.canvas;

  nodeMap = new Map(30, 30);
  nodeMap.autoScale(width, height);
  nodeMap.setStartNode(0, 0);
  nodeMap.setEndNode(4, 9);

  nodeMap.setNewNode(4, 4, "unnavigable");
  nodeMap.aStarInit();

  nodeMap.pause();

  initControls();

  frameRate(3);

  setInterval(handleMouse, 1000 / MOUSE_PULLING_RATE);
}

function draw() {
  background(220);
  nodeMap.aStarOnce();
  nodeMap.render();
}

function handleMouse() {
  // const cRect = canvas.getBoundingClientRect();
  // const cx = mouseX - cRect.x;
  // const cy = mouseY - cRect.y;
  const cx = mouseX;
  const cy = mouseY;
  const { mx, my } = nodeMap.clientCoordToMapCoord(cx, cy);

  if (!nodeMap.coordIsInMap(mx, my)) {
    return;
  }

  if (mouseIsPressed === true) {
    if (mouseButton === LEFT) {
      nodeMap.setNewNode(mx, my, "unnavigable");
    }
    if (mouseButton === RIGHT) {
      nodeMap.removeNode(mx, my, "unnavigable");
    }
    if (mouseButton === CENTER) {

    }
  }
}


function initControls() {
  const controlsCon = document.querySelector("#controls");
  const settingsCon = document.querySelector("#settings");
  const playPauseBtn = document.querySelector("#play-pause");
  const startNodeInput = document.querySelector("#start-node");
  const endNodeInput = document.querySelector("#end-node");
  const rateInput = document.querySelector("#astar-cal-rate");


  controlsCon.style.width = `${width}px`;
  settingsCon.style.width = `${width}px`;

  startNodeInput.value = `${nodeMap.startNode.x},${nodeMap.startNode.y}`;
  endNodeInput.value = `${nodeMap.endNode.x},${nodeMap.endNode.y}`;

  const handleStartEndNodeChange = () => {
    const newStartNodeValues = startNodeInput.value.split(",");
    const newStartNodeX = parseInt(newStartNodeValues[0]);
    const newStartNodeY = parseInt(newStartNodeValues[1]);
    const newEndNodeValues = endNodeInput.value.split(",");
    const newEndNodeX = parseInt(newEndNodeValues[0]);
    const newEndNodeY = parseInt(newEndNodeValues[1]);

    if (!isNaN(newStartNodeX) && !isNaN(newStartNodeY) && nodeMap.coordIsInMap(newStartNodeX, newStartNodeY)) {
      nodeMap.removeNode(nodeMap.startNode.x, nodeMap.startNode.y);
      nodeMap.setStartNode(newStartNodeX, newStartNodeY);
      startNodeInput.classList.remove("error");
    } else {
      startNodeInput.classList.add("error");
    }

    if (!isNaN(newEndNodeX) && !isNaN(newEndNodeY) && nodeMap.coordIsInMap(newEndNodeX, newEndNodeY)) {
      nodeMap.removeNode(nodeMap.endNode.x, nodeMap.endNode.y);
      nodeMap.setEndNode(newEndNodeX, newEndNodeY);
      endNodeInput.classList.remove("error");
    } else {
      endNodeInput.classList.add("error");
    }
  }

  startNodeInput.addEventListener("keyup", handleStartEndNodeChange);
  startNodeInput.addEventListener("onchange", handleStartEndNodeChange);
  endNodeInput.addEventListener("keyup", handleStartEndNodeChange);
  endNodeInput.addEventListener("onchange", handleStartEndNodeChange);


  rateInput.onchange = () => {
    console.log(parseInt(rateInput.value))
    frameRate(parseInt(rateInput.value));
  };

  playPauseBtn.addEventListener("click", () => {
    const playIcon = "Play";
    const pauseIcon = "Pause";
    if (nodeMap.isPaused) {
      playPauseBtn.textContent = pauseIcon;
      nodeMap.isPaused = false;
    } else {
      playPauseBtn.textContent = playIcon;
      nodeMap.isPaused = true;
    }
  });
}

