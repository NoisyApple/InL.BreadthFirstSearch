require("./styles.scss");
import p5 from "p5";
import Graph from "./Graph";
import Node from "./Node";

const width = 500;
const height = 500;

const k = 0.09; // Spring strength factor.
const springLength = 5; // Spring rest length.
const r = 4; // Repulsion factor.
const forceReduction = 0.98; // Force reduction factor.

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

let graph;

window.onload = () => {
  const sketch = (p5) => {
    // SETUP +++
    p5.setup = () => {
      let canvas = p5.createCanvas(width, height);
      canvas.parent("Canvas");

      graph = new Graph(p5, k, springLength, r, forceReduction);

      let gridValue = 10;

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
            graph.connectNode(actualNode, graph.getNode(rightIndex));

          if (bottomIndex < graph.nodes.length && i + 1 < gridValue)
            graph.connectNode(actualNode, graph.getNode(bottomIndex));
        }
      }
    };
    // SETUP ---

    // DRAW LOOP +++
    p5.draw = () => {
      p5.background("#adb");

      p5.text(`zoom: ${controls.viewZoom.zoom.toFixed(2)}`, 10, 20);

      p5.scale(controls.viewZoom.zoom);
      p5.translate(controls.viewZoom.x, controls.viewZoom.y);

      graph.draw();
      graph.update();
    };
    // DRAW LOOP ---

    // ZOOM HANDLER +++
    p5.mouseWheel = (e) => {
      const { x, y, delta } = e;
      const wheelFactor = 0.1;
      const zoom = wheelFactor * (delta / -100);

      const xWeight =
        (x - controls.viewZoom.x) / (width * controls.viewZoom.zoom);
      const yWeight =
        (y - controls.viewZoom.y) / (height * controls.viewZoom.zoom);

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
    };
    // ZOOM HANDLER ---

    // MOTION HANDLERS +++
    p5.mousePressed = () => {
      controls.viewPosition.isDragging = true;
      controls.viewPosition.prevX = p5.mouseX;
      controls.viewPosition.prevY = p5.mouseY;
    };

    p5.mouseReleased = () => {
      controls.viewPosition.isDragging = false;
      controls.viewPosition.prevX = null;
      controls.viewPosition.prevY = null;
    };

    p5.mouseDragged = () => {
      if (controls.viewPosition.isDragging) {
        let difX = p5.mouseX - controls.viewPosition.prevX;
        let difY = p5.mouseY - controls.viewPosition.prevY;

        controls.viewZoom.x += difX;
        controls.viewZoom.y += difY;
        controls.viewPosition.prevX = p5.mouseX;
        controls.viewPosition.prevY = p5.mouseY;
      }
    };
    // MOTION HANDLERS ---
  };

  new p5(sketch);
};
