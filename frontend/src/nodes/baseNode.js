import React from 'react';

export const BaseNode = ({ title, subtitle, icon = '●', accent = '#3b82f6', children, footer, style }) => {
  return (
    <div className="node-card" style={{ borderColor: accent, ...style }}>
      <div className="node-header">
        <div className="node-icon" style={{ background: accent }}>
          {icon}
        </div>
        <div className="node-headings">
          <div className="node-title">{title}</div>
          {subtitle ? <div className="node-subtitle">{subtitle}</div> : null}
        </div>
      </div>
      <div className="node-body">{children}</div>
      {footer ? <div className="node-footer">{footer}</div> : null}
    </div>
  );
};
