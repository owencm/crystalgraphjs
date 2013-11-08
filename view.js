var VIEW = (function(lib) {

	var nodeRadius = 25;

	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext('2d');

	// Draw a circle
	var drawCircle = function(x, y, r) {
		ctx.fillStyle = "rgb(255,255,255)";
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2*Math.PI);
		ctx.fill();
		ctx.stroke();
	}

	var drawLine = function(x1, y1, x2, y2) {
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}

	var drawGraph = function(graph) {
		var nodeCount = graph.getNodeCount();
		// Loop through and draw all connecting lines
		for (var i = 0; i < nodeCount; i++) {
			var node = graph.getNode(i);
			var adjascentNodes = graph.getAdj(i);
			for (var j = 0; j < adjascentNodes.length; j++) {
				var tempNode = graph.getNode(adjascentNodes[j].id);
				drawLine(node.x, node.y, tempNode.x, tempNode.y);
			}
		}

		for (var nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
			var node = graph.getNode(nodeIndex);
			drawCircle(node.x, node.y, nodeRadius);
		}
	}

	var redraw = function(graph) {
		canvas.width = canvas.width;
		drawGraph(graph);
	}

	return { 
		redraw: redraw
	};

}(LIB));