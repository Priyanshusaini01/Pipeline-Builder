// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import 'reactflow/dist/style.css';
import { defaultsByType, nodeTypes, handlesByType, accentByType } from './nodes/registry';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  setSelection: state.setSelection,
});

const distance = (a, b) => Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y);

const firstOutput = (type) => handlesByType[type]?.outputs?.[0];
const firstInput = (type) => handlesByType[type]?.inputs?.[0];
const AUTO_CONNECT_THRESHOLD = 220;

const autoConnect = ({ node, nodes, edges, onConnect }) => {
  const nearest = nodes
    .filter((n) => n.id !== node.id)
    .map((n) => ({ node: n, dist: distance(n, node) }))
    .sort((a, b) => a.dist - b.dist)[0];

  if (!nearest || nearest.dist > AUTO_CONNECT_THRESHOLD) return;

  const leftToRight = node.position.x >= nearest.node.position.x;
  const sourceNode = leftToRight ? nearest.node : node;
  const targetNode = leftToRight ? node : nearest.node;

  const sourceHandle = firstOutput(sourceNode.type);
  const targetHandle = firstInput(targetNode.type);

  if (!sourceHandle || !targetHandle) return;

  const exists = edges.some(
    (e) => e.source === sourceNode.id && e.target === targetNode.id && e.sourceHandle === sourceHandle && e.targetHandle === targetHandle
  );
  if (exists) return;

  onConnect({ source: sourceNode.id, target: targetNode.id, sourceHandle, targetHandle });
};

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const {
      nodes,
      edges,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect,
      setSelection,
    } = useStore(selector, shallow);

    const getInitNodeData = (nodeID, type) => {
      const defaults = defaultsByType[type] || {};
      return { id: nodeID, nodeType: type, ...defaults };
    };

    const onDrop = useCallback(
      (event) => {
        event.preventDefault();

        if (!reactFlowWrapper.current || !reactFlowInstance) return;

        const transfer = event?.dataTransfer?.getData('application/reactflow');
        if (!transfer) return;

        const appData = JSON.parse(transfer);
        const type = appData?.nodeType;

        if (!type) return;

        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const nodeID = getNodeID(type);
        const newNode = {
          id: nodeID,
          type,
          position,
          data: getInitNodeData(nodeID, type),
        };

        addNode(newNode);

        autoConnect({ node: newNode, nodes, edges, onConnect });
      },
      [reactFlowInstance, getNodeID, addNode, nodes, edges, onConnect]
    );

    const onNodeDragStop = useCallback(
      (_event, node) => {
        autoConnect({ node, nodes, edges, onConnect });
      },
      [nodes, edges, onConnect]
    );

    const addNodeFromTouch = useCallback(
      ({ clientX, clientY, nodeType }) => {
        if (!reactFlowWrapper.current || !reactFlowInstance) return;
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const withinCanvas =
          clientX >= bounds.left &&
          clientX <= bounds.right &&
          clientY >= bounds.top &&
          clientY <= bounds.bottom;
        if (!withinCanvas) return;

        const position = reactFlowInstance.screenToFlowPosition({
          x: clientX,
          y: clientY,
        });

        const nodeID = getNodeID(nodeType);
        const newNode = {
          id: nodeID,
          type: nodeType,
          position,
          data: getInitNodeData(nodeID, nodeType),
        };

        addNode(newNode);
        autoConnect({ node: newNode, nodes, edges, onConnect });
      },
      [reactFlowInstance, getNodeID, addNode, nodes, edges, onConnect]
    );

    useEffect(() => {
      const handleTouchAdd = (event) => {
        const { nodeType, clientX, clientY } = event.detail || {};
        if (!nodeType || clientX === undefined || clientY === undefined) return;
        addNodeFromTouch({ clientX, clientY, nodeType });
      };

      window.addEventListener('pipeline:addNodeFromTouch', handleTouchAdd);
      return () => window.removeEventListener('pipeline:addNodeFromTouch', handleTouchAdd);
    }, [addNodeFromTouch]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    return (
        <>
        <div ref={reactFlowWrapper} className="canvas-shell">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
            onSelectionChange={({ nodes: selNodes, edges: selEdges }) => setSelection(selNodes, selEdges)}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeDragStop={onNodeDragStop}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
            >
                <Background color="#aaa" gap={gridSize} />
                <Controls />
                <MiniMap
                  className="minimap"
                  position="bottom-right"
                  pannable
                  zoomable
                  style={{ width: 180, height: 140 }}
                  nodeColor={(n) => accentByType[n.type] || '#3b82f6'}
                  nodeStrokeColor={(n) => accentByType[n.type] || '#3b82f6'}
                  maskColor="rgba(12,16,33,0.8)"
                />
            </ReactFlow>
        </div>
        </>
    )
}
