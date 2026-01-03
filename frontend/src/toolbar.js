 
import { DraggableNode } from './draggableNode';
import { palette } from './nodes/registry';

export const PipelineToolbar = () => {
    return (
        <div className="toolbar">
            <div className="toolbar-heading">
                <div className="toolbar-title">Pipeline Builder</div>
                <div className="toolbar-subtitle">Drag a node to the canvas to begin</div>
            </div>
            <div className="toolbar-grid">
                {palette.map((item) => (
                    <DraggableNode
                        key={item.type}
                        type={item.type}
                        label={item.label}
                        icon={item.icon}
                        accent={item.accent}
                    />
                ))}
            </div>
        </div>
    );
};
