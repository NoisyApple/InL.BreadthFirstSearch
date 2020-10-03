import p5 from "p5";

export default class Graph {
  static NONE = 0;
  static CONNECTING_NODE = 1;

  constructor(p5, k, springLength, r, forceReduction, controls) {
    this.p5 = p5;
    this.k = k;
    this.springLength = springLength;
    this.r = r;
    this.forceReduction = forceReduction;
    this.nodes = [];
    this.connections = [];
    this.selectedNode = undefined;
    this.action = Graph.NONE;
    this.controls = controls;
  }

  addNode(node) {
    this.nodes.push(node);
  }

  getNode(index) {
    if (index < this.nodes.length) return this.nodes[index];
  }

  draw() {
    // Connecting node.
    if (this.action == Graph.CONNECTING_NODE) {
      let mouseVector = this.p5.createVector(
        this.p5.mouseX / this.controls.zoom - this.controls.x,
        this.p5.mouseY / this.controls.zoom - this.controls.y
      );

      this.p5.line(
        this.selectedNode.position.x,
        this.selectedNode.position.y,
        mouseVector.x,
        mouseVector.y
      );
    }

    // Connections.
    this.connections.forEach((c) => {
      let aPos = c.nodeA.position;
      let bPos = c.nodeB.position;

      this.p5.line(aPos.x, aPos.y, bPos.x, bPos.y);
    });

    // Nodes.
    this.nodes.forEach((n) => {
      n.draw();
    });
  }

  update() {
    this.nodes.forEach((n) => {
      let springF = this.p5.createVector();
      let repulsionF = this.p5.createVector();
      let totalF = this.p5.createVector();

      // Spring force to connected nodes.
      n.connectedNodes.forEach((cNode) => {
        let force = p5.Vector.sub(n.position, cNode.position).normalize();
        let d = p5.Vector.sub(n.position, cNode.position).mag() + 0.1;
        force.mult(this.k * (this.springLength - d));
        springF.add(force);
      });

      // Repulsion force to any other node.
      this.nodes.forEach((anyNode) => {
        if (n !== anyNode) {
          let force = p5.Vector.sub(n.position, anyNode.position).normalize();
          let d = p5.Vector.sub(n.position, anyNode.position).mag() + 0.1;
          force.mult((1 / d) * this.r);
          repulsionF.add(force);
        }
      });

      totalF.add(springF.add(repulsionF));
      totalF.mult(this.forceReduction);

      n.position.add(totalF);
    });
  }

  connectNode(nodeA, nodeB) {
    if (nodeA !== nodeB) {
      this.connections.push({ nodeA: nodeA, nodeB: nodeB });
      nodeA.connectedNodes.push(nodeB);
      nodeB.connectedNodes.push(nodeA);
    }
  }

  handleClick() {
    // Get clicked node.
    let clickedNode = this.nodes.find((n) => {
      let mouseVector = this.p5.createVector(
        this.p5.mouseX / n.controls.zoom - n.controls.x,
        this.p5.mouseY / n.controls.zoom - n.controls.y
      );

      let mouseOver =
        p5.Vector.sub(mouseVector, n.position).mag() < n.diameter / 2;

      return mouseOver;
    });

    switch (this.action) {
      case Graph.NONE:
        if (this.selectedNode !== undefined)
          this.selectedNode.isSelected = false; // Reset previous selected node.

        this.selectedNode = clickedNode; // Assigns new selected mode.

        if (clickedNode !== undefined) clickedNode.isSelected = true;

        break;
      case Graph.CONNECTING_NODE:
        if (clickedNode !== undefined) {
          this.connectNode(this.selectedNode, clickedNode);
          this.action = Graph.NONE;
        }
        break;
    }
  }
}
