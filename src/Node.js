import p5 from "p5";
import Graph from "./Graph";

export default class Node {
  static idCount = 0;

  constructor(p5, x, y, controls) {
    this.p5 = p5;
    this.id = ++Node.idCount;
    this.controls = controls;
    this.position = p5.createVector(x, y);
    this.connectedNodes = [];
    this.diameter = 20;
    this.isSelected = false;
    this.color = Math.floor(Math.random() * 360);
  }

  draw() {
    let mouseVector = this.p5.createVector(
      this.p5.mouseX / this.controls.zoom - this.controls.x,
      this.p5.mouseY / this.controls.zoom - this.controls.y
    );

    let mouseOver =
      p5.Vector.sub(mouseVector, this.position).mag() < this.diameter / 2;

    this.p5.push();
    if (mouseOver || this.isSelected) {
      this.p5.noFill();
      this.p5.ellipse(this.position.x, this.position.y, this.diameter + 5);
    }

    this.p5.colorMode(this.p5.HSL);
    this.p5.fill(this.color, 50, 65);
    this.p5.stroke(this.color, 50, 45);
    this.p5.strokeWeight(2);
    this.p5.ellipse(this.position.x, this.position.y, this.diameter);

    // this.p5.fill(this.color, 50, 45);
    // this.p5.stroke(this.color, 50, 35);
    // this.p5.noStroke();
    this.p5.textSize(18);
    this.p5.textStyle(this.p5.BOLD);
    this.p5.text(
      Graph.NAMES[this.id % Graph.NAMES.length],
      this.position.x + this.diameter / 1.5,
      this.position.y - this.diameter / 2 / 2
    );
    this.p5.pop();
  }
}
