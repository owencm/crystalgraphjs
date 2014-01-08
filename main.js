var config = {
	width: 500,
	height: 500,
	stepMultiple: 10,
	initialDeg: 250,
	finalDeg: 5,
	gamma: 0.75,
	spreadApartWeight: 5000,
	boundaryWeight: 10000,
	edgeLengthWeight: 0.002,
	distFromLinesWeight: 5,
	lineIntersectionWeight: 1500,
	minDist: 5
};

// GRAPH.addNode(60, 70);
// GRAPH.addNode(400, 150);
// GRAPH.setEdge(0, 1, 1);
// GRAPH.addNode(300, 400);
// GRAPH.setEdge(2, 1, 1);
// GRAPH.addNode(400, 100);
// GRAPH.setEdge(3, 2, 1);
// GRAPH.setEdge(3, 1, 1);
// GRAPH.addNode(489, 400);
// GRAPH.setEdge(4, 0, 1);

var nodeCount = LIB.randomBetween(10, 20);
for (var i = 0; i < nodeCount; i++) {
	GRAPH.addNode(LIB.randomBetween(1, 499), LIB.randomBetween(1, 499));
}
for (var i = 0; i < nodeCount; i++) {
	var edgeCount = Math.round(Math.pow(2*Math.random(),3));
	for (var j = 0; j < edgeCount; j++) {
		GRAPH.setEdge(i, LIB.randomBetween(0, nodeCount-1), 1);
	}
}

// var nodeCount = LIB.randomBetween(10, 20);
// for (var i = 0; i < nodeCount; i++) {
// 	GRAPH.addNode(LIB.randomBetween(1, 499), LIB.randomBetween(1, 499));
// }
// for (var i = 0; i < nodeCount; i++) {
// 	GRAPH.setEdge(i, (i+1)%nodeCount, 1);
// }

LAYOUT.setConfig(config);

var steps = [];
LAYOUT.layout(GRAPH, steps);
// VIEW.redraw(GRAPH);

var i = 0;
setInterval(function() {
	if (i<steps.length) {
		GRAPH.loadState(steps[i]);
		VIEW.redraw(GRAPH);
		i++;
	}
}, 100);