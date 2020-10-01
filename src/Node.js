export default class Node {
  constructor(p5, x, y) {
    this.p5 = p5;
    this.position = p5.createVector(x, y);
    this.connectedNodes = [];
  }

  draw() {
    this.p5.ellipse(this.position.x, this.position.y, 10);
  }
}
