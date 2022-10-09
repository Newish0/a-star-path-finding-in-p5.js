class Node {
    constructor(x, y, nodeMap, type = "navigable") {
      this.x = x;
      this.y = y;
      this.type = type;
  
      let { startNode, endNode } = nodeMap;
  
      if (type == "navigable") {
        this.gCost = dist(x, y, startNode.x, startNode.y); // distance from starting node
        this.hCost = dist(x, y, endNode.x, endNode.y); // distance from end node
        this.fCost = this.gCost + this.hCost;
      }
    }
  
    setAsPathNode() {
      this.isPathNode = true;
    }
  }
  
  