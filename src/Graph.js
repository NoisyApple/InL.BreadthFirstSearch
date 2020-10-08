import p5 from "p5";
import Node from "./Node";

export default class Graph {
  static NONE = 0;
  static SELECTING_NODE = 1;
  static ADDING_NODE = 2;
  static CONNECTING_NODE = 3;
  static DELETING_NODE = 4;
  static FINDING_PATH = 5;

  static NAMES = [
    "Harry",
    "Ross",
    "Bruce",
    "Cook",
    "Carolyn",
    "Morgan",
    "Albert",
    "Walker",
    "Randy",
    "Reed",
    "Larry",
    "Barnes",
    "Lois",
    "Wilson",
    "Jesse",
    "Campbell",
    "Ernest",
    "Rogers",
    "Theresa",
    "Patterson",
    "Henry",
    "Simmons",
    "Michelle",
    "Perry",
    "Frank",
    "Butler",
    "Shirley",
  ];

  constructor(p5, k, springLength, r, forceReduction, controls, DOMElements) {
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
    this.connectionNodes = {
      nodeA: undefined,
      nodeB: undefined,
    };
    this.breadthFirstSearch = {
      nodeA: undefined,
      nodeB: undefined,
      path: [],
      pathFound: false,
    };
    this.updateGraph = true;
    this.DOMElements = DOMElements;
  }

  addNode(node) {
    this.nodes.push(node);
  }

  deleteNode(node) {
    // Eliminates all connections first.
    for (let i = node.connectedNodes.length - 1; i >= 0; i--)
      this.disconnectNodes(node, node.connectedNodes[i]);

    // Eliminates node from graph.
    let nodeIndex = this.nodes.indexOf(node);
    this.nodes.splice(nodeIndex, 1);
  }

  getNode(index) {
    if (index < this.nodes.length) return this.nodes[index];
  }

  draw() {
    // Connecting node.
    if (
      this.action == Graph.CONNECTING_NODE &&
      this.connectionNodes.nodeA != undefined
    ) {
      let mouseVector = this.p5.createVector(
        this.p5.mouseX / this.controls.zoom - this.controls.x,
        this.p5.mouseY / this.controls.zoom - this.controls.y
      );

      this.p5.line(
        this.connectionNodes.nodeA.position.x,
        this.connectionNodes.nodeA.position.y,
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

    // BFS path connections.
    this.p5.push();
    this.p5.stroke("#fb3640");
    this.p5.strokeWeight(3);
    this.breadthFirstSearch.path.forEach((n, i, path) => {
      if (i > 0) {
        this.p5.line(
          path[i - 1].position.x,
          path[i - 1].position.y,
          n.position.x,
          n.position.y
        );
      }
    });
    this.p5.pop();

    // Nodes.
    this.nodes.forEach((n) => {
      n.draw(this);
    });
  }

  update() {
    if (this.updateGraph) {
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
  }

  connectNodes(nodeA, nodeB) {
    if (nodeA !== nodeB) {
      this.connections.push({ nodeA: nodeA, nodeB: nodeB });
      nodeA.connectedNodes.push(nodeB);
      nodeB.connectedNodes.push(nodeA);
    }
  }

  disconnectNodes(nodeA, nodeB) {
    if (nodeA !== nodeB) {
      let nodeBIndex = nodeA.connectedNodes.indexOf(nodeB);
      let nodeAIndex = nodeB.connectedNodes.indexOf(nodeA);

      // Removes connected node in both sides.
      nodeA.connectedNodes.splice(nodeBIndex, 1);
      nodeB.connectedNodes.splice(nodeAIndex, 1);

      // Removes connection.
      for (let i = 0; i < this.connections.length; i++) {
        if (
          (this.connections[i].nodeA == nodeA &&
            this.connections[i].nodeB == nodeB) ||
          (this.connections[i].nodeA == nodeB &&
            this.connections[i].nodeB == nodeA)
        ) {
          this.connections.splice(i, 1);
          break;
        }
      }
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
      // Default state.
      case Graph.SELECTING_NODE:
        if (this.selectedNode !== undefined)
          this.selectedNode.isSelected = false; // Reset previous selected node.

        this.selectedNode = clickedNode; // Assigns new selected mode.

        if (clickedNode !== undefined) clickedNode.isSelected = true;

        break;

      // Adding a node.
      case Graph.ADDING_NODE:
        const {
          renameNodeModal,
          exitModalButton,
          renameNodeInput,
        } = this.DOMElements;

        this.updateGraph = false;

        exitModalButton.style.display = "none";

        renameNodeModal.style.visibility = "visible";
        renameNodeModal.style.opacity = "1";

        let newNode = new Node(
          this.p5,
          this.p5.mouseX / this.controls.zoom - this.controls.x,
          this.p5.mouseY / this.controls.zoom - this.controls.y,
          this.controls
        );

        this.addNode(newNode);
        this.selectedNode = newNode;
        break;

      // Connecting nodes.
      case Graph.CONNECTING_NODE:
        if (clickedNode !== undefined) {
          if (
            this.connectionNodes.nodeA == undefined &&
            this.connectionNodes.nodeB == undefined
          ) {
            this.connectionNodes.nodeA = clickedNode;
          } else if (
            this.connectionNodes.nodeA != undefined &&
            this.connectionNodes.nodeB == undefined
          ) {
            this.connectionNodes.nodeB = clickedNode;
            this.connectNodes(
              this.connectionNodes.nodeA,
              this.connectionNodes.nodeB
            );
            this.connectionNodes = { nodeA: undefined, nodeB: undefined };
          }
        }
        break;

      // Deleting nodes.
      case Graph.DELETING_NODE:
        if (clickedNode !== undefined) {
          this.deleteNode(clickedNode);
        }
        break;

      // Finding path.
      case Graph.FINDING_PATH:
        if (clickedNode !== undefined) {
          if (
            (this.breadthFirstSearch.nodeA == undefined &&
              this.breadthFirstSearch.nodeB == undefined) ||
            (this.breadthFirstSearch.nodeA != undefined &&
              this.breadthFirstSearch.nodeB != undefined)
          ) {
            this.breadthFirstSearch = {
              nodeA: undefined,
              nodeB: undefined,
              path: [],
              pathFound: false,
            };

            this.breadthFirstSearch.nodeA = clickedNode;
            this.breadthFirstSearch.path.push(clickedNode);
          } else {
            this.breadthFirstSearch.nodeB = clickedNode;
            this.findPath(
              this.breadthFirstSearch.nodeA,
              this.breadthFirstSearch.nodeB
            );

            this.breadthFirstSearch.pathFound = true;
          }
        }
        break;
    }
  }

  findPath(nodeA, nodeB) {
    let queue = [];
    let checked = {};

    queue.push(nodeA);
    checked[nodeA.id] = { parent: null };

    while (queue.length != 0) {
      let current = queue.shift();
      if (current.id == nodeB.id) {
        break;
      } else {
        current.connectedNodes.forEach((cNode) => {
          if (!checked.hasOwnProperty(cNode.id)) {
            queue.push(cNode);
            checked[cNode.id] = { parent: current };
          }
        });
      }
    }

    let path = [nodeB];
    let currentPathNode = checked[nodeB.id];

    while (currentPathNode.parent != null) {
      path = [currentPathNode.parent, ...path];
      currentPathNode = checked[currentPathNode.parent.id];
    }

    this.breadthFirstSearch.path = path;
  }
}
