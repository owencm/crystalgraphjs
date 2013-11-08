GRAPH.addNode(60, 70);
GRAPH.addNode(150, 150);
GRAPH.setAdj(0, 1, 1);

LAYOUT.layout(GRAPH);
VIEW.redraw(GRAPH);