

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

  frameRate(3);

  setInterval(handleMouse, 1000 / MOUSE_PULLING_RATE);
}

function draw() {
  background(220);
  nodeMap.aStarOnce();
  nodeMap.render();
}

function handleMouse() {
  const cRect = canvas.getBoundingClientRect();
  const cx = mouseX - cRect.x;
  const cy = mouseY - cRect.y;
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

