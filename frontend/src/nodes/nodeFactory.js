import React from 'react';
import { Handle, Position } from 'reactflow';
import { BaseNode } from './baseNode';
import { useStore } from '../store';

const sideToPosition = {
  left: Position.Left,
  right: Position.Right,
};

const handleOffset = (index, total) => {
  const step = 100 / (total + 1);
  return `${(index + 1) * step}%`;
};

const renderHandles = (handles, type) => {
  if (!handles?.length) return null;
  return handles.map((handle, idx) => (
    <Handle
      key={`${type}-${handle.id}`}
      type={handle.type}
      position={sideToPosition[handle.side || 'left']}
      id={handle.id}
      style={{ top: handleOffset(idx, handles.length) }}
      isConnectable
    >
      <div className="handle-label">{handle.label}</div>
    </Handle>
  ));
};

const Field = ({ field, value, onChange }) => {
  if (field.type === 'select') {
    return (
      <label className="field">
        <span>{field.label}</span>
        <select value={value} onChange={onChange}>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === 'textarea') {
    return (
      <label className="field">
        <span>{field.label}</span>
        <textarea value={value} onChange={onChange} rows={field.rows || 3} />
      </label>
    );
  }

  return (
    <label className="field">
      <span>{field.label}</span>
      <input
        type={field.type || 'text'}
        value={value}
        onChange={onChange}
        placeholder={field.placeholder}
        min={field.min}
        max={field.max}
      />
    </label>
  );
};

export const makeNode = (definition) => {
  const Node = ({ id, data }) => {
    const updateNodeField = useStore((state) => state.updateNodeField);
    const valueFor = (key, fallback) => (data?.[key] ?? fallback ?? '');
    const handleChange = (key) => (event) => updateNodeField(id, key, event.target.value);

    return (
      <BaseNode
        title={definition.title}
        subtitle={definition.subtitle}
        icon={definition.icon}
        accent={definition.accent}
      >
        {definition.fields?.length ? (
          <div className="node-form">
            {definition.fields.map((field) => (
              <Field
                key={field.key}
                field={field}
                value={valueFor(field.key, field.defaultValue)}
                onChange={handleChange(field.key)}
              />
            ))}
          </div>
        ) : null}
        {definition.body
          ? definition.body({ id, data, valueFor, handleChange, updateNodeField })
          : null}
        {renderHandles(definition.inputs, 'input')}
        {renderHandles(definition.outputs, 'output')}
      </BaseNode>
    );
  };

  return Node;
};
