var LAYOUT = (function(lib) {

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
		var dist = function(node1, node2) {
			return Math.sqrt(Math.pow(node1.x - node2.x, 2)+Math.pow(node1.y - node2.y, 2));
		}

		var score = 0;
		var nodeCount = graph.getNodeCount();
		for (var i = 0; i < nodeCount; i++) {
			var node = graph.getNode(i);
			for (var j = 0; j < nodeCount; j++) {
				var tmpNode = graph.getNode(j);
				if (tmpNode.id != node.id) { 

					// For each pair of nodes...
					score += 1/dist(node, tmpNode);

				}
			}
		}

		return score;
	}
	
	var step = function(graph, time) {
		var actions = getActions(graph, time);
		var actionsCount = actions.length;
		var bestAction = undefined;
		var bestScore = -1;
		for (var i = 0; i < actionsCount; i++) {
			var action = actions[i];
			var undoAction = applyAction(graph, action);
			var score = getScore(graph);
			if (score > bestScore) {
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
		var steps = 5;
		for (var i = 0; i < steps; i++) {
			step(graph, time);
			time++;
		}
		return graph;
	}

	return { 
		layout: layout
	};

}(LIB));