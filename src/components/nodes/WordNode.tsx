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
      <Handle type="target" position={Position.Top} />

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

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(WordNode);
