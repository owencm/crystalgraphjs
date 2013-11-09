var LAYOUT = (function(lib, view) {

	var config;

	var circleRadius = function(deg) {
		return deg/3;
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

	var getScore = function(graph) {
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

		var minimizeEdgeLength = function(node) {
			var score = 0;
			// Get each outgoing edge
			var adjascentAnnotatedNodes = graph.getAdj(node.id);
			// Remove links to earlier nodes so we don't count them twice!
			adjascentAnnotatedNodes = adjascentAnnotatedNodes.filter(function(adjAnnNode) { return (adjAnnNode.node.id > node.id); });
			var adjCount = adjascentAnnotatedNodes.length;
			for (var adjIndex = 0; adjIndex < adjCount; adjIndex++) {
				var adjAnnNode = adjascentAnnotatedNodes[adjIndex];
				var dist = getDistBetweenPoints(node, adjAnnNode.node);
				// The higher strength the connection, the more important to minimize
				score += Math.pow((1+adjAnnNode.strength),2) * Math.pow(dist, 2);
			}
			score = score * config.edgeLengthWeight;
			return score;
		}

		var maximizeDistFromBoundary = function(node) {
			var score = 0;
			if (node.x > 0 && node.x < config.width && node.y > 0 && node.y < config.height) {
				// Nodes repel edges
				var dist = [config.width - node.x, config.height - node.y, node.x, node.y];
				for (var distIndex = 0; distIndex < 4; distIndex++) {
					// lib.assert(dist[distIndex]>0, "A node is on an edge (divide by 0)");
					score +=  1/dist[distIndex];
				}
			} else {
				// If one is offscreen, score is awful.
				score = Infinity;
			}
			score = score * config.boundaryWeight;
			return score;
		}

		var maximizeDistFromOtherLines = function(graph, node) {
			var score = 0;
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
				var tmpScore = Math.round(1/Math.pow(dist, 2)*5000);
				score += tmpScore;
			}
			score = config.distFromLinesWeight * score;
			return score;
		}

		var maximizeDistBetweenNodes = function(oNode, iNode) {
			var score = 1/Math.pow(getDistBetweenPoints(oNode, iNode), 2);
			score = config.spreadApartWeight * score;
			return score;
		}

		var score = 0;
		var nodeCount = graph.getNodeCount();
		for (var i = 0; i < nodeCount; i++) {
			var outerNode = graph.getNode(i);
			// For each node...

			score += maximizeDistFromBoundary(outerNode);
			score += minimizeEdgeLength(outerNode);
			score += maximizeDistFromOtherLines(graph, outerNode);

			// Start at current node and loop over remaining in list
			for (var j = i+1; j < nodeCount; j++) {
				var innerNode = graph.getNode(j);
				// For each pair of nodes...

				score += maximizeDistBetweenNodes(outerNode, innerNode);

			}
		}
		return score;
	}
	
	var step = function(graph, deg, debug) {
		var score = getScore(graph);
		var action = getRandomAction(graph, deg);
		var undoAction = applyAction(graph, action);
		var newScore = getScore(graph);

		if (newScore > score) {
			applyAction(graph, undoAction)
		} else {
			debug.push(lib.clone(graph.dumpState()));
		}

		// // If the new score is worse (higher)
		// if (newScore > score) {
		// 	// Undo it with some probability
		// 	var random = Math.random();
		// 	var p = Math.exp((score - newScore)/deg);
		// 	console.log("Old score: "+score+" new: "+newScore+" p we take action:"+p);
		// 	if (random > p) {
		// 		// Undo the bad action
		// 		applyAction(graph, undoAction);
		// 	} else {
		// 		console.log("Took bad action")
		// 		// Take the bad action
		// 		debug.push(lib.clone(graph.dumpState()));
		// 	}
		// } else {
		// 	debug.push(lib.clone(graph.dumpState()));
		// }

		return graph;
	}

	/*	This takes a graph and optimises it's layout. Ninja huh? */
	var layout = function(graph, debug) {
		var deg = 1000;
		while (deg > 20) {
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