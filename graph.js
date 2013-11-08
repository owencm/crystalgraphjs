var GRAPH = (function(lib) {

	var adj = [];

	var nodes = {};

	var nodeCount = 0;

	var getNodeCount = function() {
		return nodeCount;
	}

	var addNode = function(x, y) {
		nodes[nodeCount] = {x: x, y: y};
		// Add a new column of 0s on the right of the adj matrix
		// i is the row index
		for (var i = 0; i <adj.length; i++) {
			adj[i].push(0);
		}
		nodeCount++;
		// Add a new row of 0s at the bottom of the adj matrix
		var row = lib.newFilledArray(nodeCount, 0);
		adj.push(row);
	}

	var setAdj = function(id1, id2, value) {
		adj[id1][id2] = value;
		adj[id2][id1] = value;
	}

	var getNode = function(id) {
		lib.assert (id>=0&&id<getNodeCount(), "Cannot get node with id: "+id);
		var sNode = {id: id, x: nodes[id].x, y: nodes[id].y};
		return sNode;
	}

	// This returns an array of nodes and their adjascency to the node with id=id
	var getAdjById = function(id) {
		var sNodes = [];
		// For each node, check for a connection
		for (var i = 0; i < getNodeCount(); i++) {
			if (adj[i][id] > 0) {
				sNodes.push(getNode(i));
			}
		}
		return sNodes;
	}

	var update = function(sNode) {
		var id = nodes.id;
		nodes.id = {x: sNode.x, y: sNode.y};
	}

	var debug = function() {
		console.log(JSON.stringify(nodes));
		console.log(JSON.stringify(adj));
	}

	return { 
		getAdjById: getAdjById,
		setAdj: setAdj,
		getNode: getNode,
		addNode: addNode,
		getNodeCount: getNodeCount,
		update: update,
		debug: debug
	};

}(LIB));