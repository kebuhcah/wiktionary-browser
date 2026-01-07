import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { EtymologyWord } from '../../types/etymology';
import './WordNode.css';

interface WordNodeData extends EtymologyWord {
  color: string;
  hasParents?: boolean;
  isExpanded?: boolean;
}

interface WordNodeProps {
  data: WordNodeData;
  selected?: boolean;
}

function WordNode({ data, selected }: WordNodeProps) {
  return (
    <div
      className={`word-node ${selected ? 'selected' : ''}`}
      style={{
        borderColor: data.color,
        boxShadow: selected ? `0 0 0 2px ${data.color}` : undefined
      }}
    >
      {/* Target handles (incoming edges) on all sides */}
      <Handle type="target" position={Position.Top} id="target-top" />
      <Handle type="target" position={Position.Bottom} id="target-bottom" />
      <Handle type="target" position={Position.Left} id="target-left" />
      <Handle type="target" position={Position.Right} id="target-right" />

      <div className="word-node-content">
        <div className="word-text">{data.word}</div>
        <div
          className="language-tag"
          style={{ backgroundColor: data.color }}
        >
          {data.languageDisplay}
        </div>
        {data.definition && (
          <div className="definition-text">{data.definition}</div>
        )}
        {data.partOfSpeech && (
          <div className="pos-text">{data.partOfSpeech}</div>
        )}
      </div>

      {data.hasParents && !data.isExpanded && (
        <div className="expand-indicator">
          <span>+</span>
        </div>
      )}

      {/* Source handles (outgoing edges) on all sides */}
      <Handle type="source" position={Position.Top} id="source-top" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" />
      <Handle type="source" position={Position.Left} id="source-left" />
      <Handle type="source" position={Position.Right} id="source-right" />
    </div>
  );
}

export default memo(WordNode);
