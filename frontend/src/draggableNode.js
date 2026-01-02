// draggableNode.js

import { useRef } from 'react';

export const DraggableNode = ({ type, label, icon = '●', accent = '#1C2536' }) => {
  const touchPoint = useRef(null);

  const onDragStart = (event, nodeType) => {
    const appData = { nodeType };
    event.target.style.cursor = 'grabbing';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchPoint.current = { x: touch.clientX, y: touch.clientY };
    event.target.style.cursor = 'grabbing';
  };

  const onTouchMove = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchPoint.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event) => {
    const touch = event.changedTouches?.[0];
    const coords = touch ? { x: touch.clientX, y: touch.clientY } : touchPoint.current;
    if (coords) {
      window.dispatchEvent(
        new CustomEvent('pipeline:addNodeFromTouch', {
          detail: { nodeType: type, clientX: coords.x, clientY: coords.y },
        })
      );
    }
    touchPoint.current = null;
    event.target.style.cursor = 'grab';
  };

  return (
    <div
      className="toolbar-chip"
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => (event.target.style.cursor = 'grab')}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      style={{ cursor: 'grab', borderColor: accent }}
      draggable
    >
      <div className="toolbar-icon" style={{ background: accent }}>
        {icon}
      </div>
      <span className="toolbar-label">{label}</span>
    </div>
  );
};
