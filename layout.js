var LAYOUT = (function(lib, view) {

	var config;

	var circleRadius = function(deg) {
		// This starts at the longest distance across the screen * 1/2
		// and decreases to 10 pixels
		var maxMove = 300;
		var minMove = 10;
		// How far through the temperature decrease are we?
		var ratio = (deg-config.finalDeg)/(config.initialDeg-config.finalDeg);
		return ratio * (maxMove-minMove) + minMove;
	}

	/*	Returns an action, representing where a specific node should move by 
		providing a new node object with the updated position 	*/
	var getRandomAction = function(graph, deg) {
		// Pick a random node, move along the circle according to deg
		var nodeCount = graph.getNodeCount();
		var id = lib.randomBetween(0, nodeCount-1);
		var oldNode = graph.getNode(id);
		var angles = [	
						{x: 0, y: 1}, {x: 0.5, y: 0.86}, {x: 0.86, y: 0.5}, 
						{x: 1, y: 0}, {x: 0.86, y: -0.5}, {x: 0.5, y: -0.86}, 
						{x: 0, y: -1}, {x: -0.5, y: -0.86}, {x: -0.86, y: -0.5},
						{x: -1, y: 0}, {x: -0.86, y: 0.5}, {x: -0.5, y: 0.86}];
		var angle = angles[lib.randomBetween(0,11)];
		angle.x = Math.round(angle.x * circleRadius(deg));
		angle.y = Math.round(angle.y * circleRadius(deg));
		return {id: id, x: oldNode.x + angle.x, y: oldNode.y + angle.y};
	}

	// Todo: don't return a clone, return a graph modified and an undo action!
	var applyAction = function(graph, action) {
		var undoAction = graph.getNode(action.id);
		graph.update(action);
		return undoAction;
	};

	var getCost = function(graph) {
		var getDistBetweenPoints = function(node1, node2) {
			return Math.round(Math.sqrt(Math.pow(node1.x - node2.x, 2)+Math.pow(node1.y - node2.y, 2)));
		}

		var getDistBetweenLineAndPoint = function(l, p) {
			var A = p.x - l.x1;
			var B = p.y - l.y1;
			var C = l.x2 - l.x1;
			var D = l.y2 - l.y1;

			var dot = A * C + B * D;
			var len_sq = C * C + D * D;
			var param = dot / len_sq;

			var xx, yy;

			if (param < 0 || (l.x1 == l.x2 && l.y1 == l.y2)) {
				xx = l.x1;
				yy = l.y1;
			}
			else if (param > 1) {
				xx = l.x2;
				yy = l.y2;
			}
			else {
				xx = l.x1 + param * C;
				yy = l.y1 + param * D;
			}

			var dx = p.x - xx;
			var dy = p.y - yy;
			return Math.round(Math.sqrt(dx * dx + dy * dy));
		}

		// Wrapper around library code
		var doLinesIntersect = function(l1, l2) {
			var intersectLineLine = function(a1, a2, b1, b2) {
				var result;
				
				var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
				var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
				var u_b  = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

				if ( u_b != 0 ) {
					var ua = ua_t / u_b;
					var ub = ub_t / u_b;

					if ( 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1 ) {
						return true;
					}
				} else {
					if ( ua_t == 0 || ub_t == 0 ) {
						return true;
					}
				}
				return false;
			};

			return intersectLineLine(
									{x: l1.x1, y: l1.y1}, 
									{x: l1.x2, y: l1.y2},
									{x: l2.x1, y: l2.y1},
									{x: l2.x2, y: l2.y2}
									);

		}

		var minimizeEdgeLength = function(node) {
			var cost = 0;
			// Get each outgoing edge
			var adjascentAnnotatedNodes = graph.getAdj(node.id);
			// Remove links to earlier nodes so we don't count them twice!
			adjascentAnnotatedNodes = adjascentAnnotatedNodes.filter(function(adjAnnNode) { return (adjAnnNode.node.id > node.id); });
			var adjCount = adjascentAnnotatedNodes.length;
			for (var adjIndex = 0; adjIndex < adjCount; adjIndex++) {
				var adjAnnNode = adjascentAnnotatedNodes[adjIndex];
				var dist = getDistBetweenPoints(node, adjAnnNode.node);
				// The higher strength the connection, the more important to minimize
				cost += Math.pow((1+adjAnnNode.strength),2) * Math.pow(dist, 2);
			}
			cost = cost * config.edgeLengthWeight;
			return cost;
		}

		var maximizeDistFromBoundary = function(node) {
			var cost = 0;
			if (node.x > 0 && node.x < config.width && node.y > 0 && node.y < config.height) {
				// Nodes repel edges
				var dist = [config.width - node.x, config.height - node.y, node.x, node.y];
				for (var distIndex = 0; distIndex < 4; distIndex++) {
					// lib.assert(dist[distIndex]>0, "A node is on an edge (divide by 0)");
					cost +=  1/dist[distIndex];
				}
			} else {
				// If one is offscreen, cost is awful.
				cost = Infinity;
			}
			cost = cost * config.boundaryWeight;
			return cost;
		}

		var maximizeDistFromOtherLines = function(graph, node) {
			var cost = 0;
			var edges = graph.getEdges();
			// Remove all edges connected to the current node
			edges = edges.filter(function(edge){ return (edge.a != node.id && edge.b != node.id) });
			var edgeCount = edges.length;
			for (var i = 0; i < edgeCount; i++) {
				var edge = edges[i];
				var aNode = graph.getNode(edge.a);
				var bNode = graph.getNode(edge.b);
				var line = {x1: aNode.x, y1: aNode.y, x2: bNode.x, y2: bNode.y};
				var point = {x: node.x, y: node.y};
				var dist = getDistBetweenLineAndPoint(line, point);
				dist = (dist < config.minDist) ? config.minDist : dist;
				var tmpCost = Math.round(1/Math.pow(dist, 2)*5000);
				cost += tmpCost;
			}
			cost = config.distFromLinesWeight * cost;
			return cost;
		}

		var maximizeDistBetweenNodes = function(oNode, iNode) {
			var cost = 1/Math.pow(getDistBetweenPoints(oNode, iNode), 2);
			cost = config.spreadApartWeight * cost;
			return cost;
		}

		var cost = 0;
		var nodeCount = graph.getNodeCount();
		for (var i = 0; i < nodeCount; i++) {
			var outerNode = graph.getNode(i);
			// For each node...

			cost += maximizeDistFromBoundary(outerNode);
			cost += minimizeEdgeLength(outerNode);
			cost += maximizeDistFromOtherLines(graph, outerNode);

			// Start at current node and loop over remaining in list
			for (var j = i+1; j < nodeCount; j++) {
				var innerNode = graph.getNode(j);
				// For each pair of nodes...

				cost += maximizeDistBetweenNodes(outerNode, innerNode);

			}
		}

		// Find intersecting edges and add cost
		var edges = graph.getEdges();
		var edgeCount = edges.length;
		for (var i = 0; i < edgeCount; i++) {
			var edge1 = edges[i];
			for (var j = i+1; j < edgeCount; j++) {
				var edge2 = edges[j];
				// For every pair of edges that aren't for the same node
				if (edge1.a != edge2.a && edge1.a != edge2.b &&
					edge1.b != edge2.a && edge1.b != edge2.b) {
					var l1node1 = graph.getNode(edge1.a);
					var l1node2 = graph.getNode(edge1.b);
					var l1 = {x1: l1node1.x, y1: l1node1.y, x2: l1node2.x, y2: l1node2.y};
					var l2node1 = graph.getNode(edge2.a);
					var l2node2 = graph.getNode(edge2.b);
					var l2 = {x1: l2node1.x, y1: l2node1.y, x2: l2node2.x, y2: l2node2.y};
					if (doLinesIntersect(l1, l2)) {
						// console.log("lines intersect");
						// console.log(l1);
						// console.log(l2);
						cost += config.lineIntersectionWeight;
					}
				}
			}
		}

		return cost;
	}
	
	var step = function(graph, deg, debug) {
		var oldCost = getCost(graph);
		var action = getRandomAction(graph, deg);
		var undoAction = applyAction(graph, action);
		var newCost = getCost(graph);

		// if (newCost > oldCost) {
		// 	applyAction(graph, undoAction)
		// } else {
		// 	console.log(oldCost);
		// 	debug.push(lib.clone(graph.dumpState()));
		// }

		if (newCost > oldCost) {
			var random = Math.random();
			var p = Math.exp((oldCost - newCost)/deg);
			if (random > p) {
				// Undo the bad action
				applyAction(graph, undoAction);
			} else {
			console.log("Time: "+deg+" Old: "+oldCost+" new: "+newCost+" p: "+p);

				console.log("Take the bad action");
				debug.push(lib.clone(graph.dumpState()));
			}
		}

		return graph;
	}

	/*	This takes a graph and optimises it's layout. Ninja huh? */
	var layout = function(graph, debug) {
		var deg = config.initialDeg;
		while (deg > config.finalDeg) {
			var steps = config.stepMultiple * graph.getNodeCount();
			for (var i = 0; i < steps; i++) {
				step(graph, deg, debug);
			}
			deg = config.gamma * deg;
		}
		return graph;
	}

	var setConfig = function(newConfig) {
		config = newConfig;
	}

	return { 
		layout: layout,
		setConfig: setConfig
	};

}(LIB, VIEW));