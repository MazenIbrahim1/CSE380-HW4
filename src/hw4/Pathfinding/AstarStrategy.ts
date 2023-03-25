import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";
import GraphUtils from "../../Wolfie2D/Utils/GraphUtils";

// TODO Construct a NavigationPath object using A*

/**
 * The AstarStrategy class is an extension of the abstract NavPathStrategy class. For our navigation system, you can
 * now specify and define your own pathfinding strategy. Originally, the two options were to use Djikstras or a
 * direct (point A -> point B) strategy. The only way to change how the pathfinding was done was by hard-coding things
 * into the classes associated with the navigation system. 
 * 
 * - Peter
 */

     interface Node{
        index: number,
        source: number,
        dest: number,
        total: number,
        parent: number
    };
    
    export default class AstarStrategy extends NavPathStrat {
    
        /**
         * @see NavPathStrat.buildPath()
         */
    

         public getNeighbors(current: Node) {
            let edges = this.mesh.graph.getEdges(current.index);
            let neighbors = [];
            while(edges != null) {
                neighbors.push(edges.y);
                edges = edges.next;
            }
            return neighbors;
        }
    
        public checkNeighborInList (neighbor: number, list: Node[]) {
            let i = 0;
            for(let val of list) {
                if(val.index === neighbor) {
                    return i;
                }
                i++;
            }
            return -1;
        }
    
        public getDistance(neighbor: number, source: number): number {
            return Math.abs((this.mesh.graph.positions[neighbor]).x - (this.mesh.graph.positions[source]).x) 
            + Math.abs((this.mesh.graph.positions[neighbor]).y - (this.mesh.graph.positions[source]).y);
        }

        public findLowestNode(open: Node[]) {
            let n = 0;
            let lowest = open[0].total;
            for(let i = 1; i < open.length; i++) {
                if (open[i].total < lowest) {
                    lowest = open[i].total;
                    n = i;
                }
            }
            return n;
        }
    
        public buildPath(to: Vec2, from: Vec2): NavigationPath {
            let start = this.mesh.graph.snap(from);
            let end = this.mesh.graph.snap(to);
            let startNode: Node = {
                index: start,
                source: 0,
                dest: -1,
                total: -1,
                parent: -1,
            }
            let open: Node[] = [startNode];
            let closed: Node[] = [];
            let current: Node;
    
            while(open.length != 0) {
                let lowestNode = this.findLowestNode(open);
                current = open[lowestNode];
                open.splice(lowestNode, 1);
                closed.push(current);
                if(current.index === end) {
                    break;
                }
                let neighbors = this.getNeighbors(current)
                for(let neighbor of neighbors) {
                    if(this.checkNeighborInList(neighbor, closed) > -1) {
                        continue;
                    }
                    let neighborNode: Node = {
                        index: neighbor,
                        source: this.getDistance(neighbor, start),
                        dest: this.getDistance(neighbor, end),
                        total: this.getDistance(neighbor, start) + this.getDistance(neighbor, end),
                        parent: current.index,
                    };
                    let index = this.checkNeighborInList(neighbor, open)
                    if(index != -1) {
                        let openF = open[index].source + open[index].dest;
                        if (neighborNode.total < openF){
                            open[index].source = neighborNode.source;
                            open[index].parent = current.index;
                        }
                    }
                    else {
                        open.push(neighborNode);
                    }
                }
            }
            let stack = new Stack<Vec2>(this.mesh.graph.numVertices);
            while(current.parent != -1) {
                let vec2 = this.mesh.graph.positions[current.index];
                stack.push(vec2);
                for(let node of closed) {
                    if(current.parent === node.index) {
                        current = node;
                    }
                }
            }
            return new NavigationPath(stack);
        }
        
    }