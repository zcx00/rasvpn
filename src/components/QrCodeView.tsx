import React from 'react';

interface QrCodeViewProps {
  value: string;
  size?: number;
}

export const QrCodeView: React.FC<QrCodeViewProps> = ({ value, size = 200 }) => {
  // Simple SVG matrix pattern generator for demonstration and visual fidelity
  const gridCount = 21;
  const cellSize = size / gridCount;

  // Pseudo deterministic pattern based on string hash
  const getCellFill = (r: number, c: number) => {
    // Corner finder patterns
    if ((r < 7 && c < 7) || (r < 7 && c >= 14) || (r >= 14 && c < 7)) {
      if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
        return true;
      }
      if (r >= 14 && (r === 14 || r === 20 || c === 0 || c === 6 || (r >= 16 && r <= 18 && c >= 2 && c <= 4))) {
        return true;
      }
      if (c >= 14 && (r === 0 || r === 6 || c === 14 || c === 20 || (r >= 2 && r <= 4 && c >= 16 && c <= 18))) {
        return true;
      }
      return false;
    }

    let charCodeSum = 0;
    for (let i = 0; i < value.length; i++) {
      charCodeSum += value.charCodeAt(i);
    }
    const val = (r * 31 + c * 17 + charCodeSum * 7) % 100;
    return val > 45;
  };

  const cells = [];
  for (let r = 0; r < gridCount; r++) {
    for (let c = 0; c < gridCount; c++) {
      if (getCellFill(r, c)) {
        cells.push(
          <rect
            key={`${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#38bdf8"
            rx={cellSize * 0.15}
          />
        );
      }
    }
  }

  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 inline-block shadow-inner">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="#0f172a" rx={8} />
        {cells}
      </svg>
    </div>
  );
};
