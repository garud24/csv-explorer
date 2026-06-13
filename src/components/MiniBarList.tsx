// Horizontal bar chart
import type { ChartItem } from "../types/city";
import { formatNumber } from "../services/insightEngine";

type MiniBarListProps = {
  data: ChartItem[];   // array of { name, value } objects
  color?: string;      // optional — the ? means the prop can be omitted
};

export default function MiniBarList({ data, color = "#0D7377" }: MiniBarListProps) {
  // Find the largest value so every bar is drawn relative to the maximum.
  // Math.max(...data.map(...)) spreads the array into individual arguments.
  // The || 1 prevents division by zero if data is empty.
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="mini-bar-list">
      {data.map((item) => (
        // key is required on every element in a .map() — React needs it
        // to efficiently update the list when data changes.
        <div className="mini-bar-row" key={item.name}>
          <div className="mini-bar-label">
            <span>{item.name}</span>
            <strong>{formatNumber(item.value)}</strong>
          </div>
          <div className="mini-bar-track">
            {/* Width is a percentage of the maximum value.
                The style prop takes a JavaScript object — note double braces:
                outer {} is JSX expression, inner {} is the object literal.
                (item.value / maxValue) * 100 gives 0–100. */}
            <div
              className="mini-bar-fill"
              style={{ width: `${(item.value / maxValue) * 100}%`, background: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}