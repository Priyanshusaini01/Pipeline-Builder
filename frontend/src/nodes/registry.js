import { makeNode } from './nodeFactory';
import { TextNode } from './textNode';

const definitions = [
  {
    type: 'customInput',
    title: 'Input',
    subtitle: 'Provide data to start',
    icon: 'IN',
    accent: '#0ea5e9',
    defaults: { inputName: 'input', inputType: 'Text' },
    fields: [
      { key: 'inputName', label: 'Name', type: 'text', placeholder: 'input_1' },
      { key: 'inputType', label: 'Type', type: 'select', options: ['Text', 'File', 'JSON'] },
    ],
    outputs: [{ id: 'value', label: 'Value', type: 'source', side: 'right' }],
  },
  {
    type: 'llm',
    title: 'LLM',
    subtitle: 'Model inference',
    icon: 'LL',
    accent: '#6366f1',
    defaults: { model: 'gpt-4', temperature: '0.7' },
    fields: [
      { key: 'model', label: 'Model', type: 'select', options: ['gpt-4', 'gpt-3.5', 'mixtral'] },
      { key: 'temperature', label: 'Temp', type: 'number', min: 0, max: 1, placeholder: '0.7' },
    ],
    inputs: [
      { id: 'system', label: 'System', type: 'target', side: 'left' },
      { id: 'prompt', label: 'Prompt', type: 'target', side: 'left' },
    ],
    outputs: [{ id: 'response', label: 'Response', type: 'source', side: 'right' }],
  },
  {
    type: 'customOutput',
    title: 'Output',
    subtitle: 'Expose results',
    icon: 'OUT',
    accent: '#22c55e',
    defaults: { outputName: 'output', outputType: 'Text' },
    fields: [
      { key: 'outputName', label: 'Name', type: 'text', placeholder: 'output_1' },
      { key: 'outputType', label: 'Type', type: 'select', options: ['Text', 'Image', 'JSON'] },
    ],
    inputs: [{ id: 'value', label: 'Value', type: 'target', side: 'left' }],
  },
  {
    type: 'http',
    title: 'HTTP Request',
    subtitle: 'Call external API',
    icon: 'HT',
    accent: '#ef4444',
    defaults: { url: 'https://api.example.com', method: 'GET' },
    fields: [
      { key: 'url', label: 'URL', type: 'text', placeholder: 'https://...' },
      { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
    ],
    inputs: [{ id: 'body', label: 'Body', type: 'target', side: 'left' }],
    outputs: [{ id: 'httpResponse', label: 'Response', type: 'source', side: 'right' }],
  },
  {
    type: 'branch',
    title: 'Branch',
    subtitle: 'Conditional route',
    icon: 'BR',
    accent: '#f59e0b',
    defaults: { condition: 'status === 200' },
    fields: [{ key: 'condition', label: 'Condition', type: 'text', placeholder: 'status === 200' }],
    inputs: [{ id: 'input', label: 'Input', type: 'target', side: 'left' }],
    outputs: [
      { id: 'true', label: 'True', type: 'source', side: 'right' },
      { id: 'false', label: 'False', type: 'source', side: 'right' },
    ],
  },
  {
    type: 'merge',
    title: 'Merge',
    subtitle: 'Combine streams',
    icon: 'MG',
    accent: '#10b981',
    inputs: [
      { id: 'a', label: 'A', type: 'target', side: 'left' },
      { id: 'b', label: 'B', type: 'target', side: 'left' },
    ],
    outputs: [{ id: 'merged', label: 'Merged', type: 'source', side: 'right' }],
  },
  {
    type: 'delay',
    title: 'Delay',
    subtitle: 'Throttle execution',
    icon: 'DL',
    accent: '#14b8a6',
    defaults: { delayMs: '1000' },
    fields: [{ key: 'delayMs', label: 'Delay (ms)', type: 'number', min: 0, placeholder: '1000' }],
    inputs: [{ id: 'input', label: 'In', type: 'target', side: 'left' }],
    outputs: [{ id: 'delayed', label: 'Out', type: 'source', side: 'right' }],
  },
  {
    type: 'math',
    title: 'Math',
    subtitle: 'Add numbers',
    icon: 'MA',
    accent: '#3b82f6',
    defaults: { operand: '10' },
    fields: [{ key: 'operand', label: 'Add', type: 'number', placeholder: '10' }],
    inputs: [{ id: 'value', label: 'Value', type: 'target', side: 'left' }],
    outputs: [{ id: 'sum', label: 'Sum', type: 'source', side: 'right' }],
  },
  {
    type: 'formatter',
    title: 'Formatter',
    subtitle: 'String template',
    icon: 'FM',
    accent: '#9333ea',
    defaults: { template: 'Hello, {{name}}' },
    fields: [{ key: 'template', label: 'Template', type: 'textarea', rows: 3 }],
    inputs: [{ id: 'data', label: 'Data', type: 'target', side: 'left' }],
    outputs: [{ id: 'text', label: 'Text', type: 'source', side: 'right' }],
  },
  {
    type: 'text',
    title: 'Text',
    subtitle: 'Dynamic variables',
    icon: 'TX',
    accent: '#f97316',
    defaults: { text: '{{input}}' },
    component: TextNode,
  },
];

export const nodeTypes = definitions.reduce((acc, definition) => {
  acc[definition.type] = definition.component ? definition.component : makeNode(definition);
  return acc;
}, {});

export const palette = definitions.map((definition) => ({
  type: definition.type,
  label: definition.title,
  icon: definition.icon,
  accent: definition.accent,
}));

export const defaultsByType = definitions.reduce((acc, definition) => {
  acc[definition.type] = definition.defaults || {};
  return acc;
}, {});

export const handlesByType = definitions.reduce((acc, definition) => {
  acc[definition.type] = {
    inputs: (definition.inputs || []).map((h) => h.id),
    outputs: (definition.outputs || []).map((h) => h.id),
  };
  return acc;
}, {});

export const accentByType = definitions.reduce((acc, definition) => {
  acc[definition.type] = definition.accent || '#3b82f6';
  return acc;
}, {});
