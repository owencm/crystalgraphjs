var config = {
	width: 500,
	height: 500,
	spreadApartWeight: 1,
	boundaryWeight: 1
};

GRAPH.addNode(60, 70);
GRAPH.addNode(150, 150);
GRAPH.setAdj(0, 1, 1);
LAYOUT.setConfig(config);

LAYOUT.layout(GRAPH);
VIEW.redraw(GRAPH);