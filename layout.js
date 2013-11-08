var LAYOUT = (function(lib) {
	var layout = function(graph) {

		/*	
		Actions returns an array of actions, each representing where a 
		specific node should move by providing a new node object with the
		updated position
		*/
		var actions = function(graph, time) {
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

		var result = function(graph, action) {
			var newGraph = lib.clone(graph);
			newGraph.update(action);
			return newGraph;
		};

		return graph;
	}

	return { 
		layout: layout
	};

}(LIB));