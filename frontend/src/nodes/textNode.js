 
import React, { useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';
import { BaseNode } from './baseNode';

const variablePattern = /\{\{\s*([A-Za-z_$][\w$]*)\s*\}\}/g;

const distributeHandles = (count, index) => {
  const step = 100 / (count + 1);
  return `${(index + 1) * step}%`;
};

export const TextNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const textValue = data?.text ?? '{{input}}';

  const variables = useMemo(() => {
    const names = new Set();
    let match;
    while ((match = variablePattern.exec(textValue)) !== null) {
      names.add(match[1]);
    }
    return Array.from(names);
  }, [textValue]);

  const longestLine = textValue.split('\n').reduce((max, line) => Math.max(max, line.length), 0);
  const width = Math.min(Math.max(240, longestLine * 8 + 120), 540);
  const height = Math.min(Math.max(160, textValue.split('\n').length * 28 + 90), 420);

  const handleChange = (event) => {
    updateNodeField(id, 'text', event.target.value);
  };

  return (
    <BaseNode
      title="Text"
      subtitle="Template with variables"
      icon="TX"
      accent="#f97316"
      style={{ width, minHeight: height }}
    >
      <label className="field">
        <span>Content</span>
        <textarea
          className="node-textarea"
          value={textValue}
          onChange={handleChange}
          style={{ width: `${width - 36}px`, height: `${height - 110}px` }}
          placeholder="Type text and use {{variables}}"
        />
      </label>
      {variables.length ? (
        <div className="chip-row">
          {variables.map((name) => (
            <span key={name} className="chip">{`{{${name}}}`}</span>
          ))}
        </div>
      ) : (
        <div className="chip-row muted">No variables detected</div>
      )}

      {variables.map((name, idx) => (
        <Handle
          key={`${id}-${name}`}
          type="target"
          position={Position.Left}
          id={`var-${name}`}
          style={{ top: distributeHandles(variables.length, idx) }}
        />
      ))}

      <Handle type="source" position={Position.Right} id={`${id}-output`} />
    </BaseNode>
  );
};
