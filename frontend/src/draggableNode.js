// draggableNode.js

export const DraggableNode = ({ type, label, icon = '●', accent = '#1C2536' }) => {
  const onDragStart = (event, nodeType) => {
    const appData = { nodeType };
    event.target.style.cursor = 'grabbing';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="toolbar-chip"
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => (event.target.style.cursor = 'grab')}
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
