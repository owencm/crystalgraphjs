var GRAPH = (function(lib) {

	var edges = [];
	var nodes = {};
	var nodeCount = 0;

	// This returns an array of [{node: {..}, strength: x}]
	var getAdj = function(id) {
		var sNodes = [];
		var edgeCount = edges.length;
		// For each node, check for a connection
		for (var i = 0; i < edgeCount; i++) {
			var edge = edges[i];
			if (edge.a == id) {
				sNodes.push({node: getNode(edge.b), strength: edge.strength});
			} else if(edge.b == id) {
				sNodes.push({node: getNode(edge.a), strength: edge.strength});
			}
		}
		return sNodes;
	}

	var getEdges = function() {
		return edges;
	}

	var setEdge = function(id1, id2, strength) {
		if (id1 > id2) {
			var swap = id1;
			id1 = id2;
			id2 = swap;
		}
		var edgeCount = edges.length;
		for (var i = 0; i < edgeCount; i++) {
			var edge = edges[i];
			if (edge.a == id1 && edge.b == id2) {
				console.log("Edge overwritten");
				edge.strength = strength;
				return;
			}
		}
		edges.push({a: id1, b: id2, strength: strength});
	}

	var getNode = function(id) {
		lib.assert (id>=0&&id<getNodeCount(), "Cannot get node with id: "+id);
		var sNode = {id: id, x: nodes[id].x, y: nodes[id].y};
		return sNode;
	}

	var addNode = function(x, y) {
		nodes[nodeCount] = {x: x, y: y};
		nodeCount++;
	}

	var getNodeCount = function() {
		return nodeCount;
	}

	var update = function(sNode) {
		var id = sNode.id;
		nodes[id] = {x: sNode.x, y: sNode.y};
	}

	var dumpState = function() {
		return {nodeCount: nodeCount, nodes: nodes, edges: edges};
	}

	var loadState = function(state) {
		nodeCount = state.nodeCount;
		nodes = state.nodes;
		edges = state.edges;
	}

	return { 
		getAdj: getAdj,
		getEdges: getEdges,
		setEdge: setEdge,
		getNode: getNode,
		addNode: addNode,
		getNodeCount: getNodeCount,
		update: update,
		dumpState: dumpState,
		loadState: loadState
	};

}(LIB));