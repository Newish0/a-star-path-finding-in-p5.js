class Map {
    static PX_PER_NODE = 50;

    constructor(mapWidth, mapHeight) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;

        this.nodeMap = new Array(mapHeight);
        for (let i = 0; i < mapHeight; i++) this.nodeMap[i] = new Array(mapWidth);


    }

    autoScale(width, height) {
        const minAxis = min(this.mapHeight, this.mapWidth);
        const minCanvasDimension = min(width, height);

        Map.PX_PER_NODE = minCanvasDimension / minAxis;

    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    aStarInit() {
        if (this.startNode && this.endNode) {
            const listOfNeighborCoords = this.getNeighborCoords(this.startNode);

            for (const neighborCoord of listOfNeighborCoords) {
                neighborCoord.parent = this.startNode;
            }

            this.queue = listOfNeighborCoords;
            this.activeNodes = [];
            this.closedNodes = [];
            this.bestPath = [];
            this.found = false;
            this.isPaused = false;
            return true;
        }

        return false;
    }

    aStarOnce() {

        if (this.isPaused) return;

        console.debug("Current queue:", this.queue);

        const curCoord = this.queue.shift();

        // Choose lowest fCost from activeNodes
        if (!curCoord) {
            let lowestFCostNode = this.activeNodes[0];

            for (const activeNode of this.activeNodes) {
                if (activeNode.fCost < lowestFCostNode.fCost) {
                    lowestFCostNode = activeNode;
                }
            }

            console.debug("Lowest f-cost node:", lowestFCostNode);

            // Unsolvable!
            if (!lowestFCostNode) {
                this.isPaused = true;
            }


            if (!this.closedNodes.includes(lowestFCostNode)) {
                const listOfNeighborCoords = this.getNeighborCoords(lowestFCostNode);


                if(!listOfNeighborCoords) return; // No solution from this node.


                for (const neighborCoord of listOfNeighborCoords) {
                    neighborCoord.parent = lowestFCostNode;
                }

                this.queue = listOfNeighborCoords;
                this.closedNodes.push(lowestFCostNode);
                lowestFCostNode.setAsClosedNode();
                this.activeNodes.splice(this.activeNodes.indexOf(lowestFCostNode), 1);
            }

            return;
        }

        const { x, y, parent } = curCoord;
        console.debug("Current coordinate being worked on:", curCoord);

        if (this.coordIsEnd(x, y)) {
            this.found = true;
            this.isPaused = true;
            this.lastViewedNode = this.endNode;

            // Retrace to startNode for best path.
            this.bestPath = [];
            let curNode = this.closedNodes.at(-1);

            while (curNode != this.startNode) {
                this.bestPath.push(curNode);
                curNode = curNode.parent;
            }
            console.debug("Best path:", this.bestPath);

            return;

            // Will also count wall node as "exist", hence ignore.
        } else if (this.lastViewedNode = this.coordIsNode(x, y)) {
            return;
        }

        const curNode = this.setNewNode(x, y);
        curNode.parent = parent;
        this.activeNodes.push(curNode);

        this.lastViewedNode = curNode;
    }

    coordIsInMap(x, y) {
        return x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight;
    }

    coordIsNode(x, y) {

        if (this.coordIsInMap(x, y) && this.nodeMap[y][x]) {
            return this.nodeMap[y][x];
        } else {
            return null;
        }
    }

    clientCoordToMapCoord(clientX, clientY) {
        return {
            mx: parseInt(clientX / Map.PX_PER_NODE),
            my: parseInt(clientY / Map.PX_PER_NODE)
        }
    }

    coordIsEnd(x, y) {
        return x == this.endNode.x && y == this.endNode.y;
    }

    getNeighborCoords(node) {

        if (!node) {
            return null;
        }

        let { x, y } = node;
        const neighborCoords = [];

        const left = x - 1;
        const right = x + 1;
        const upper = y - 1;
        const lower = y + 1;

        // upper left
        if (upper >= 0 && left >= 0) {
            neighborCoords.push({
                x: left,
                y: upper
            });
        }

        // upper mid
        if (upper >= 0) {
            neighborCoords.push({
                x,
                y: upper
            });
        }


        // upper right
        if (upper >= 0 && right < this.mapWidth) {
            neighborCoords.push({
                x: right,
                y: upper
            });
        }

        // left 
        if (left >= 0) {
            neighborCoords.push({
                x: left,
                y
            });
        }

        // right
        if (right < this.mapWidth) {
            neighborCoords.push({
                x: right,
                y
            });
        }

        // lower left
        if (lower < this.mapHeight && left >= 0) {
            neighborCoords.push({
                x: left,
                y: lower
            });
        }

        // lower mid
        if (lower < this.mapHeight) {
            neighborCoords.push({
                x,
                y: lower
            });
        }
        // lower right
        if (lower < this.mapHeight && right < this.mapWidth) {
            neighborCoords.push({
                x: right,
                y: lower
            });
        }

        return neighborCoords;
    }


    setNewNode(x, y, type = "navigable") {
        this.nodeMap[y][x] = new Node(x, y, this, type);

        return this.nodeMap[y][x];
    }

    removeNode(x, y, type = "unnavigable") {
        if (this.nodeMap[y][x] && this.nodeMap[y][x].type == type) {
            delete this.nodeMap[y][x];
        }
    }

    setStartNode(x, y) {
        this.startNode = this.setNewNode(x, y, "unnavigable");
    }

    setEndNode(x, y) {
        this.endNode = this.setNewNode(x, y, "unnavigable");
    }

    render() {
        const textPadding = Map.PX_PER_NODE * 0.1;
        for (let i = 0; i < this.nodeMap.length; i++) {
            for (let j = 0; j < this.nodeMap[i].length; j++) {
                strokeWeight(1); // reset stroke weight

                if (this.lastViewedNode && this.nodeMap[i][j] == this.lastViewedNode) {
                    strokeWeight(4);
                }

                if (this.nodeMap[i][j] == this.startNode) {
                    fill(100, 100, 200);
                    rect(j * Map.PX_PER_NODE, i * Map.PX_PER_NODE, Map.PX_PER_NODE, Map.PX_PER_NODE);

                    fill(0);
                    textSize(Map.PX_PER_NODE * 0.33)
                    textAlign(CENTER, CENTER);
                    text("Start", j * Map.PX_PER_NODE + Map.PX_PER_NODE / 2, i * Map.PX_PER_NODE + Map.PX_PER_NODE / 2)

                } else if (this.nodeMap[i][j] == this.endNode) {
                    fill(100, 100, 200);
                    rect(j * Map.PX_PER_NODE, i * Map.PX_PER_NODE, Map.PX_PER_NODE, Map.PX_PER_NODE);

                    fill(0);
                    textSize(Map.PX_PER_NODE * 0.33)
                    textAlign(CENTER, CENTER);
                    text("End", j * Map.PX_PER_NODE + Map.PX_PER_NODE / 2, i * Map.PX_PER_NODE + Map.PX_PER_NODE / 2)
                } else if (this.nodeMap[i][j]) {

                    // Draw red color if node is a wall.
                    if (this.nodeMap[i][j].type == "unnavigable") {
                        fill(200, 100, 100);
                        rect(j * Map.PX_PER_NODE, i * Map.PX_PER_NODE, Map.PX_PER_NODE, Map.PX_PER_NODE);
                        continue;
                    }

                    // Draw aqua color if node is part of the path.
                    if (this.found && this.bestPath.includes(this.nodeMap[i][j])) {
                        fill(100, 255, 255);
                    } else if (this.nodeMap[i][j].isClosedNode) {
                        fill(200, 200, 100);
                    } else {
                        fill(100, 200, 100);
                    }

                    rect(j * Map.PX_PER_NODE, i * Map.PX_PER_NODE, Map.PX_PER_NODE, Map.PX_PER_NODE);

                    fill(0);
                    textSize(Map.PX_PER_NODE * 0.33)
                    textAlign(CENTER, BOTTOM);
                    text(this.nodeMap[i][j].fCost.toFixed(1), j * Map.PX_PER_NODE + Map.PX_PER_NODE / 2, i * Map.PX_PER_NODE + Map.PX_PER_NODE - textPadding)

                    textSize(Map.PX_PER_NODE * 0.2)
                    textAlign(LEFT, TOP);
                    text(this.nodeMap[i][j].gCost.toFixed(1), j * Map.PX_PER_NODE + textPadding, i * Map.PX_PER_NODE + textPadding)

                    textSize(Map.PX_PER_NODE * 0.2)
                    textAlign(RIGHT, TOP);
                    text(this.nodeMap[i][j].hCost.toFixed(1), (j + 1) * Map.PX_PER_NODE - textPadding, i * Map.PX_PER_NODE + textPadding)

                } else {
                    fill(100);
                    rect(j * Map.PX_PER_NODE, i * Map.PX_PER_NODE, Map.PX_PER_NODE, Map.PX_PER_NODE);
                }
            }
        }
    }

}