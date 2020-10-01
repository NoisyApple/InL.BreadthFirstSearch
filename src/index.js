import "./styles.scss";
import p5 from "p5";
import Graph from "./Graph";
import Node from "./Node";

const width = 500;
const height = 500;

const k = 0.09;
const springLength = 5;
const r = 4;
const forceReduction = 0.98;

let scale = 1;

let graph;

window.onload = () => {
  const sketch = (p5) => {
    p5.setup = () => {
      let canvas = p5.createCanvas(width, height);
      canvas.parent("Canvas");

      graph = new Graph(p5, k, springLength, r, forceReduction);

      let gridValue = 10;

      for (let i = 0; i < gridValue * gridValue; i++)
        graph.addNode(new Node(p5, p5.random(0, width), p5.random(0, height)));

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

    p5.draw = () => {
      p5.scale(scale);
      p5.background("#adb");
      graph.draw();
      graph.update();
    };

    // p5.mouseWheel = (e) => {
    //   scale += (e.delta / 1000) * -1;
    // };
  };

  new p5(sketch);
};
