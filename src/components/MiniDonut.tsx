// Donut/Pie chart
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { ChartItem } from "../types/city";
import { formatNumber } from "../services/insightEngine";

type MiniDonutProps = {
  data: ChartItem[];
};

// A fixed color palette — index into this array using % (modulo)
// so you never run out of colors even with more than 6 items.
const COLORS = ["#0D7377", "#14A085", "#F4A261", "#E76F51", "#2A9D8F", "#E9C46A"];

export default function MiniDonut({ data }: MiniDonutProps) {
  return (
    <div className="mini-donut-wrap">
      {/* ResponsiveContainer makes the chart fill its parent's width.
          Without it you'd need to hardcode a pixel width. */}
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Tooltip
            formatter={(value) => formatNumber(Number(Array.isArray(value) ? value[0] : value))}
          />
          <Pie
            data={data}
            dataKey="value"    // which field of ChartItem to use as the slice size
            nameKey="name"     // which field to use as the label
            innerRadius={40}   // the hole in the middle — makes it a donut, not a pie
            outerRadius={70}
            paddingAngle={2}   // tiny gap between slices
          >
            {/* You need one <Cell> per data item to set individual colors.
                index % COLORS.length loops back to 0 when index exceeds the array. */}
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend below the chart */}
      <div className="mini-donut-legend">
        {data.map((item, index) => (
          <div className="mini-donut-legend-item" key={item.name}>
            <span
              className="mini-donut-swatch"
              style={{ background: COLORS[index % COLORS.length] }}
            />
            <span>{item.name}</span>
            <strong>{formatNumber(item.value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}