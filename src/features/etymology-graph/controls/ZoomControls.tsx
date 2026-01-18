import './ZoomControls.css';

export interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut, onFitView }: ZoomControlsProps) {
  return (
    <div className="zoom-controls">
      <button
        onClick={onZoomIn}
        className="zoom-control-button"
        title="Zoom in"
        aria-label="Zoom in"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path
            d="M8 3v10M3 8h10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <button
        onClick={onZoomOut}
        className="zoom-control-button"
        title="Zoom out"
        aria-label="Zoom out"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path
            d="M3 8h10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <button
        onClick={onFitView}
        className="zoom-control-button"
        title="Fit view"
        aria-label="Fit view to all nodes"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path
            d="M2 2h4M2 2v4M14 2h-4M14 2v4M2 14h4M2 14v-4M14 14h-4M14 14v-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
