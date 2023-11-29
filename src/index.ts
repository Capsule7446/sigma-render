import Graph from "graphology";
import Sigma from "sigma";
import ForceSupervisor from "graphology-layout-force/worker";
import data from "./data.json";
import {EdgeDisplayData} from "sigma/types";

// Retrieve the html document for sigma container
const container = document.getElementById("sigma-container") as HTMLElement;

const graph = new Graph();
graph.import(data);

const layout = new ForceSupervisor(graph, { isNodeFixed: (_, attr) => attr.highlighted });
layout.start();

const renderer = new Sigma(graph, container);
let draggedNode: string | null = null;
let isDragging = false;

// Bind graph interactions:
renderer.on("enterNode", ({ node }) => {
		setHoveredNode(node);
});
renderer.on("leaveNode", () => {
		setHoveredNode(undefined);
});
// On mouse move, if the drag mode is enabled, we change the position of the draggedNode
renderer.getMouseCaptor().on("mousemovebody", (e) => {
		if (!isDragging || !draggedNode) return;

		// Get new position of node
		const pos = renderer.viewportToGraph(e);

		graph.setNodeAttribute(draggedNode, "x", pos.x);
		graph.setNodeAttribute(draggedNode, "y", pos.y);

		// Prevent sigma to move camera:
		e.preventSigmaDefault();
		e.original.preventDefault();
		e.original.stopPropagation();
});

// On mouse up, we reset the autoscale and the dragging mode
renderer.getMouseCaptor().on("mouseup", () => {
		if (draggedNode) {
				graph.removeNodeAttribute(draggedNode, "highlighted");
		}
		isDragging = false;
		draggedNode = null;

});

// Disable the autoscale at the first down interaction
renderer.getMouseCaptor().on("mousedown", () => {
		if (!renderer.getCustomBBox()) renderer.setCustomBBox(renderer.getBBox());
});

function setHoveredNode(node?: string) {
		if (node) {
				state.hoveredNode = node;
				state.hoveredNeighbors = new Set(graph.neighbors(node));
		} else {
				state.hoveredNode = undefined;
				state.hoveredNeighbors = undefined;
		}

		// Refresh rendering:
		renderer.refresh();
}
const state: State = { searchQuery: "" };
interface State {
		hoveredNode?: string;
		searchQuery: string;

		// State derived from query:
		selectedNode?: string;
		suggestions?: Set<string>;

		// State derived from hovered node:
		hoveredNeighbors?: Set<string>;
}
renderer.setSetting("edgeReducer", (edge, data) => {
		const res: Partial<EdgeDisplayData> = { ...data };

		if (state.hoveredNode && !graph.hasExtremity(edge, state.hoveredNode)) {
				res.hidden = true;
		}

		if (state.suggestions && (!state.suggestions.has(graph.source(edge)) || !state.suggestions.has(graph.target(edge)))) {
				res.hidden = true;
		}

		return res;
});
