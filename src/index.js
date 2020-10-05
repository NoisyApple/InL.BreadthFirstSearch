require("./styles.scss"); // using import conflicts with p5.
import p5 from "p5";
import Graph from "./Graph";
import Node from "./Node";

setFavicon(); // Dinamic favicon is set.

let width;
let height;

const k = 0.09; // Spring strength factor.
const springLength = 50; // Spring rest length.
const r = 4; // Repulsion factor.
const forceReduction = 0.98; // Force reduction factor.

// DOM ELEMENTS.
let nodeID;
let nodeShowUp;
let sideBar;
let playPauseButton;
let addNodeButton;
let connectNodeButton;
let deleteNodeButton;
let cancelOptionButton;

let playIcon;
let pauseIcon;

let graph;

// Zoom and displacement controls.
const controls = {
  viewZoom: {
    zoom: 1,
    x: 0,
    y: 0,
    minZoom: 0.5,
    maxZoom: 4,
  },
  viewPosition: {
    prevX: null,
    prevY: null,
    isDragging: false,
  },
};

window.onload = () => {
  // DOM elements initialization.
  nodeID = document.querySelector("#NodeID");
  nodeShowUp = document.querySelector("#NodeShowUp");
  sideBar = document.querySelector("#SideBar");
  playPauseButton = document.querySelector("#PlayPauseButton");
  addNodeButton = document.querySelector("#AddNodeButton");
  connectNodeButton = document.querySelector("#ConnectNodeButton");
  deleteNodeButton = document.querySelector("#DeleteNodeButton");
  cancelOptionButton = document.querySelector("#CancelOptionButton");

  playIcon = document.querySelector("#PlayIcon");
  pauseIcon = document.querySelector("#PauseIcon");

  // P5.
  const sketch = (p5) => {
    // SETUP +++
    p5.setup = () => {
      let canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
      canvas.parent("Canvas");

      // Event listeners.
      addDOMListeners();
      canvas.mouseWheel((e) => mouseWheel(e, p5));
      canvas.mousePressed(() => mousePressed(p5));
      canvas.mouseReleased(() => mouseReleased(p5));
      canvas.mouseMoved(() => mouseDragged(p5));

      width = canvas.width;
      height = canvas.height;

      graph = new Graph(
        p5,
        k,
        springLength,
        r,
        forceReduction,
        controls.viewZoom
      );

      // Show icon depending on updateGraph value.
      playIcon.style.display = !graph.updateGraph ? "block" : "none";
      pauseIcon.style.display = graph.updateGraph ? "block" : "none";

      // EXAMPLE NODES +++
      let gridValue = 5;

      for (let i = 0; i < gridValue * gridValue; i++)
        graph.addNode(
          new Node(
            p5,
            p5.random(0, width),
            p5.random(0, height),
            controls.viewZoom
          )
        );

      for (let i = 0; i < gridValue; i++) {
        for (let j = 0; j < gridValue; j++) {
          let actualNode = graph.getNode(i * gridValue + j);
          let bottomIndex = (i + 1) * gridValue + j;
          let rightIndex = i * gridValue + (j + 1);

          if (rightIndex < graph.nodes.length && j + 1 < gridValue)
            graph.connectNodes(actualNode, graph.getNode(rightIndex));

          if (bottomIndex < graph.nodes.length && i + 1 < gridValue)
            graph.connectNodes(actualNode, graph.getNode(bottomIndex));
        }
      }
      // EXAMPLE NODES ---
    };
    // SETUP ---

    // DRAW LOOP +++
    p5.draw = () => {
      // Background.
      p5.push();
      p5.background("#ddd");

      // CONFIG DATA ON SCREEN.
      // p5.text(`zoom: ${controls.viewZoom.zoom.toFixed(2)}`, 10, 20);
      // p5.text(`action: ${graph.action}`, 10, 40);
      // p5.text(`dragging: ${controls.viewPosition.isDragging}`, 10, 60);
      // p5.text(
      //   `selected node: ${graph.selectedNode ? graph.selectedNode.id : "None"}`,
      //   10,
      //   80
      // );

      p5.noStroke();
      p5.fill(150);
      for (let i = 0; i < width / 20; i++) {
        for (let j = 0; j < height / 20; j++) {
          p5.ellipse(i * 20, j * 20, 2);
        }
      }
      p5.pop();

      p5.scale(controls.viewZoom.zoom);
      p5.translate(controls.viewZoom.x, controls.viewZoom.y);

      graph.draw();
      graph.update();
    };
    // DRAW LOOP ---
  };

  new p5(sketch);
};

// DOM Event Listeners.
function addDOMListeners() {
  playPauseButton.addEventListener("click", () => toggleGraphUpdate());

  cancelOptionButton.addEventListener("click", () =>
    actionSelected(Graph.NONE)
  );

  addNodeButton.addEventListener("click", () =>
    actionSelected(Graph.ADDING_NODE)
  );

  connectNodeButton.addEventListener("click", () =>
    actionSelected(Graph.CONNECTING_NODE)
  );

  deleteNodeButton.addEventListener("click", () =>
    actionSelected(Graph.DELETING_NODE)
  );
}

// Toggles graph's updateGraph value.
function toggleGraphUpdate() {
  graph.updateGraph = !graph.updateGraph;

  playIcon.style.display = !graph.updateGraph ? "block" : "none";
  pauseIcon.style.display = graph.updateGraph ? "block" : "none";
}

// Updates graph's action.
function actionSelected(action) {
  addNodeButton.classList.remove("option-selected");
  connectNodeButton.classList.remove("option-selected");
  deleteNodeButton.classList.remove("option-selected");

  switch (action) {
    case Graph.NONE:
      cancelOptionButton.setAttribute("disabled", "");
      graph.action = Graph.NONE;
      break;
    case Graph.ADDING_NODE:
      addNodeButton.classList.add("option-selected");
      cancelOptionButton.removeAttribute("disabled");
      graph.action = Graph.ADDING_NODE;
      break;
    case Graph.CONNECTING_NODE:
      connectNodeButton.classList.add("option-selected");
      cancelOptionButton.removeAttribute("disabled");
      graph.action = Graph.CONNECTING_NODE;
      break;
    case Graph.DELETING_NODE:
      deleteNodeButton.classList.add("option-selected");
      cancelOptionButton.removeAttribute("disabled");
      graph.action = Graph.DELETING_NODE;
      break;
  }
}

// ZOOM HANDLER +++
function mouseWheel(e, p5) {
  const { x, y, deltaY } = e;
  const wheelFactor = 0.1;
  const zoom = wheelFactor * (deltaY / -100);

  const xWeight = (x - controls.viewZoom.x) / (width * controls.viewZoom.zoom);
  const yWeight = (y - controls.viewZoom.y) / (height * controls.viewZoom.zoom);

  if (
    controls.viewZoom.zoom > controls.viewZoom.minZoom &&
    controls.viewZoom.zoom < controls.viewZoom.maxZoom
  ) {
    controls.viewZoom.x -= xWeight * width * zoom;
    controls.viewZoom.y -= yWeight * height * zoom;
  }
  controls.viewZoom.zoom += zoom;

  controls.viewZoom.zoom = p5.constrain(
    controls.viewZoom.zoom,
    controls.viewZoom.minZoom,
    controls.viewZoom.maxZoom
  );
}
// ZOOM HANDLER ---

// MOTION HANDLERS +++
function mousePressed(p5) {
  controls.viewPosition.isDragging = true;
  controls.viewPosition.prevX = p5.mouseX;
  controls.viewPosition.prevY = p5.mouseY;
}

function mouseReleased(p5) {
  controls.viewPosition.isDragging = false;
  controls.viewPosition.prevX = null;
  controls.viewPosition.prevY = null;

  graph.handleClick();
}

function mouseDragged(p5) {
  if (controls.viewPosition.isDragging) {
    let difX = p5.mouseX - controls.viewPosition.prevX;
    let difY = p5.mouseY - controls.viewPosition.prevY;

    controls.viewZoom.x += difX;
    controls.viewZoom.y += difY;
    controls.viewPosition.prevX = p5.mouseX;
    controls.viewPosition.prevY = p5.mouseY;
  }
}
// MOTION HANDLERS ---

// DINAMIC FAVICON +++
function setFavicon() {
  // Canvas declaration.
  let canvas = document.createElement("canvas");
  canvas.setAttribute("width", 40);
  canvas.setAttribute("height", 40);

  var ctx = canvas.getContext("2d");

  let hue = Math.random() * 360; // Random color.

  // Outer circle.
  ctx.beginPath();
  ctx.arc(20, 20, 20, 0, Math.PI * 2, true);
  ctx.fillStyle = `hsl(${hue}, 50%, 45%)`;
  ctx.fill();

  // Inner circle.
  ctx.beginPath();
  ctx.arc(20, 20, 15, 0, Math.PI * 2, true);
  ctx.fillStyle = `hsl(${hue}, 50%, 65%)`;
  ctx.fill();

  // Canvas image to data.
  var img = canvas.toDataURL("image/png");

  // Favicon is set.
  var link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  link.type = "image/x-icon";
  link.rel = "shortcut icon";
  link.href = img;
  document.getElementsByTagName("head")[0].appendChild(link);
}
// DINAMIC FAVICON ---
