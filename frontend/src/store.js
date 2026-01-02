// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  nodeIDs: {},
  selectedNodes: [],
  selectedEdges: [],
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node]
        });
    },
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      set({
        edges: addEdge({...connection, type: 'smoothstep', animated: true, markerEnd: {type: MarkerType.Arrow, height: '20px', width: '20px'}}, get().edges),
      });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, [fieldName]: fieldValue } };
          }
          return node;
        }),
      });
    },
    setSelection: (nodes, edges) => {
      set({ selectedNodes: nodes, selectedEdges: edges });
    },
    removeSelected: () => {
      const nodeIds = get().selectedNodes.map((n) => n.id);
      const edgeIds = get().selectedEdges.map((e) => e.id);
      set({
        nodes: get().nodes.filter((n) => !nodeIds.includes(n.id)),
        edges: get().edges.filter(
          (e) =>
            !edgeIds.includes(e.id) &&
            !nodeIds.includes(e.source) &&
            !nodeIds.includes(e.target)
        ),
        selectedNodes: [],
        selectedEdges: [],
      });
    },
    clearAll: () => {
      set({ nodes: [], edges: [], selectedNodes: [], selectedEdges: [], nodeIDs: {} });
    },
  }));
