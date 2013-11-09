var LAYOUT = (function(lib) {

	var config;

	/*	Returns an action, representing where a specific node should move by 
		providing a new node object with the updated position 	*/
	var getRandomAction = function(graph, temp) {
		// Pick a random node, move along the circle according to temp
		var nodeCount = graph.getNodeCount();
		var id = lib.randomBetween(0, nodeCount-1);
		var oldNode = graph.getNode(id);
		var angles = [	
						{x: 0, y: 1}, {x: 0.5, y: 0.86}, {x: 0.86, y: 0.5}, 
						{x: 1, y: 0}, {x: 0.86, y: -0.5}, {x: 0.5, y: -0.86}, 
						{x: 0, y: -1}, {x: -0.5, y: -0.86}, {x: -0.86, y: -0.5},
						{x: -1, y: 0}, {x: -0.86, y: 0.5}, {x: -0.5, y: 0.86}];
		var angle = angles[lib.randomBetween(0,11)];
		angle.x = angle.x * temp;
		angle.y = angle.y * temp;
		return {id: id, x: oldNode.x + angle.x, y: oldNode.y + angle.y};
	}

	// Todo: don't return a clone, return a graph modified and an undo action!
	var applyAction = function(graph, action) {
		var undoAction = graph.getNode(action.id);
		graph.update(action);
		return undoAction;
	};

	var getScore = function(graph) {
		var getDist = function(node1, node2) {
			return Math.sqrt(Math.pow(node1.x - node2.x, 2)+Math.pow(node1.y - node2.y, 2));
		}

		var score = 0;
		var nodeCount = graph.getNodeCount();
		for (var i = 0; i < nodeCount; i++) {
			var node = graph.getNode(i);
			// For each node...

			// Ensure it's still in the screen!
			if (node.x > 0 && node.x < config.width && node.y > 0 && node.y < config.height) {
				// Nodes repel edges
				var dist = [config.width - node.x, config.height - node.y, node.x, node.y];
				for (var distIndex = 0; distIndex < 4; distIndex++) {
					// lib.assert(dist[distIndex]>0, "A node is on an edge (divide by 0)");
					score += config.boundaryWeight * 1/dist[distIndex];
				}
			} else {
				// If one is offscreen, score is awful.
				score = Infinity;
			}

			// Edges should have minimum possible length
			// Get each outgoing edge
			var adjascentNodes = graph.getAdj(node.id);
			// Remove links to earlier nodes so we don't count them twice!
			adjascentNodes = adjascentNodes.filter(function(adjNode) { return (adjNode.id > node.id); });
			// console.log("Node "+node.id+ " has "+adjascentNodes.length+ " edges");
			var adjCount = adjascentNodes.length;
			for (var adjIndex = 0; adjIndex < adjCount; adjIndex++) {
				var adjNode = adjascentNodes[adjIndex];
				var dist = getDist(node, adjNode);
				// console.log("Edge between "+node.id +" and "+adjNode.id+" is "+dist);
				score += config.edgeLengthWeight * Math.pow(dist, 2);
			}

			// Start at current node and loop over remaining in list
			for (var j = i+1; j < nodeCount; j++) {
				var tmpNode = graph.getNode(j);
				// For each pair of nodes...
				// Nodes repel
				score += config.spreadApartWeight * 1/Math.pow(getDist(node, tmpNode), 2);
			}
		}

		return score;
	}
	
	var step = function(graph, temp) {
		var action = getRandomAction(graph, temp);
		var score = getScore(graph);

		var undoAction = applyAction(graph, action);
		var newScore = getScore(graph);

		// If the new score is worse (higher)
		if (newScore > score) {
			// Undo it with some probability
			var random = Math.random();
			var p = Math.exp((score - newScore)/temp);
			applyAction(graph, undoAction);
		}

		return graph;
	}

	/*	This takes a graph and optimises it's layout. Ninja huh? */
	var layout = function(graph) {
		var temp = 100;
		while (temp > 10) {
			var steps = config.steps;
			for (var i = 0; i < steps; i++) {
				step(graph, temp);
			}
			temp = config.gamma * temp;
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

}(LIB));