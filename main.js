var config = {
	width: 500,
	height: 500,
	steps: 1,
	spreadApartWeight: 10,
	boundaryWeight: 1,
	edgeLengthWeight: 0.00000001
};

GRAPH.addNode(60, 70);
GRAPH.addNode(400, 150);
GRAPH.setAdj(0, 1, 1);
GRAPH.addNode(300, 400);
GRAPH.setAdj(2, 1, 1);
GRAPH.addNode(400, 100);
GRAPH.setAdj(3, 2, 1);
GRAPH.setAdj(3, 1, 1);
GRAPH.addNode(489, 400);
GRAPH.setAdj(4, 0, 1);
LAYOUT.setConfig(config);

var i = 0;
setInterval(function() {
	if (i < 200) {
		LAYOUT.layout(GRAPH);
		VIEW.redraw(GRAPH);
		i++;
	}
}, 10);