import p5 from "p5";

export default class Node {
  constructor(p5, x, y, controls) {
    this.p5 = p5;
    this.controls = controls;
    this.position = p5.createVector(x, y);
    this.connectedNodes = [];
    this.diameter = 20;
  }

  draw() {
    let mouseVector = this.p5.createVector(
      this.p5.mouseX / this.controls.zoom - this.controls.x,
      this.p5.mouseY / this.controls.zoom - this.controls.y
    );

    let mouseOver =
      p5.Vector.sub(mouseVector, this.position).mag() < this.diameter / 2;

    this.p5.push();
    if (mouseOver) this.p5.fill("#00f");
    this.p5.ellipse(this.position.x, this.position.y, this.diameter);
    this.p5.pop();
  }
}
