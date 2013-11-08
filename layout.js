var LAYOUT = (function(lib) {

	var config;

	/*	Actions returns an array of actions, each representing where a 
		specific node should move by providing a new node object with the
		updated position 	*/
	var getActions = function(graph, time) {
		var nodeCount = graph.getNodeCount();
		var result = [];
		for (var i = 0; i < nodeCount; i++) {
			var node = graph.getNode(i);
			var oldX = node.x;
			var oldY = node.y;
			result.push(
				{id: i, x: oldX + 10, y: oldY},
				{id: i, x: oldX - 10, y: oldY},
				{id: i, x: oldX, y: oldY + 10},
				{id: i, x: oldX, y: oldY - 10}
			);
		}
		return result;
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
			// Nodes repel edges
			var dist = [config.width - node.x, config.height - node.y, node.x, node.y];
			for (var distIndex = 0; distIndex < 4; distIndex++) {
				lib.assert(dist[distIndex]>0, "A node is on an edge (divide by 0)");
				score += config.boundaryWeight * 1/dist[distIndex];
			}


			for (var j = 0; j < nodeCount; j++) {
				var tmpNode = graph.getNode(j);
				if (tmpNode.id != node.id) { 

					// For each pair of nodes...
					// Nodes repel
					score += config.closenessWeight * 1/Math.pow(getDist(node, tmpNode), 2);

				}
			}
		}

		return score;
	}
	
	var step = function(graph, time) {
		var actions = getActions(graph, time);
		var actionsCount = actions.length;
		var bestAction = undefined;
		var bestScore;
		for (var i = 0; i < actionsCount; i++) {
			var action = actions[i];
			var undoAction = applyAction(graph, action);
			var score = getScore(graph);
			if (score < bestScore || bestAction == undefined) {
				bestScore = score;
				bestAction = action;
			}
			applyAction(graph, undoAction);
		}
		applyAction(graph, bestAction);
	}

	/*	This takes a graph and optimises it's layout. Ninja huh? */
	var layout = function(graph) {
		var time = 0;
		var steps = 100;
		for (var i = 0; i < steps; i++) {
			step(graph, time);
			time++;
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