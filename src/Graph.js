import p5 from "p5";

export default class Graph {
  constructor(p5, k, springLength, r, forceReduction) {
    this.p5 = p5;
    this.k = k;
    this.springLength = springLength;
    this.r = r;
    this.forceReduction = forceReduction;
    this.nodes = [];
    this.connections = [];
  }

  addNode(node) {
    this.nodes.push(node);
  }

  getNode(index) {
    if (index < this.nodes.length) return this.nodes[index];
  }

  draw() {
    this.connections.forEach((c) => {
      let aPos = c.nodeA.position;
      let bPos = c.nodeB.position;

      this.p5.line(aPos.x, aPos.y, bPos.x, bPos.y);
    });

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
}
