import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './MetricsChart.css';

interface MetricData {
  name: string;
  value: number | string;
  collectedAt: string;
}

interface MetricsChartProps {
  data: MetricData[];
  metricName: string;
}

const MetricsChart: React.FC<MetricsChartProps> = ({ data, metricName }) => {
  if (!data || data.length === 0) {
    return <div className="metrics-chart-empty">No data available</div>;
  }

  const chartData = data
    .slice()
    .reverse()
    .map((item) => ({
      name: new Date(item.collectedAt).toLocaleTimeString(),
      value: typeof item.value === 'number' ? item.value : parseFloat(item.value) || 0,
      fullDate: new Date(item.collectedAt).toLocaleString(),
    }));

  return (
    <div className="metrics-chart">
      <h4>{metricName}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value: any) => [value, metricName]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullDate;
              }
              return label;
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricsChart;

