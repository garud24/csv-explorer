// area sparkline chart

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { ChartItem } from "../types/city";
import { formatNumber } from "../services/insightEngine";

type TrendCardProps = {
  title: string;
  value: string;
  subtitle: string;
  data: ChartItem[];   // x = name, y = value
  color?: string;
};

export default function TrendCard({
  title,
  value,
  subtitle,
  data,
  color = "#0D7377",
}: TrendCardProps) {
  return (
    <div className="trend-card">
      <div className="trend-card-header">
        <span className="trend-card-title">{title}</span>
        <strong className="trend-card-value">{value}</strong>
        <p className="trend-card-subtitle">{subtitle}</p>
      </div>

      {/* Only render the chart if there is data.
          Short-circuit evaluation: if data.length > 0 is false,
          React skips everything after &&. */}
      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            {/* SVG gradient fill — defined once, referenced by id */}
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <Tooltip formatter={(value) => formatNumber(Number(Array.isArray(value) ? value[0] : value))} />
            <Area
              type="monotone"       // smooth curve between points
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill="url(#areaGradient)"   // reference the gradient above
              dot={false}           // hide individual data points
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}