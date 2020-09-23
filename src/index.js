import "./styles.scss";
import p5 from "p5";

window.onload = () => {
  const sketch = (p5) => {
    p5.setup = () => {
      let canvas = p5.createCanvas(500, 500);
      canvas.parent("Canvas");
    };

    p5.draw = () => {
      p5.background("#bad");
    };
  };

  const P5 = new p5(sketch);
};
