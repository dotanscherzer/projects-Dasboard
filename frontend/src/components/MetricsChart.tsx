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

  // Function to convert metric value to number based on metric type
  const convertToNumericValue = (value: any, metricType: string): number => {
    // If already a number, return it
    if (typeof value === 'number') {
      return value;
    }

    // For health and automation_status metrics, convert status strings to numeric codes
    if (metricType === 'health' || metricType === 'automation_status') {
      const statusMap: Record<string, number> = {
        'up': 1,
        'ok': 1,
        'healthy': 1,
        'ready': 1,
        'current': 1,
        'success': 1,
        'down': 0,
        'unhealthy': 0,
        'failing': 0,
        'error': 0,
        'failed': 0,
        'unknown': 0.5,
        'degraded': 0.5,
        'stale': 0.5,
      };
      
      const statusStr = String(value).toLowerCase();
      return statusMap[statusStr] ?? 0.5; // Default to 0.5 for unknown status values
    }

    // For other metrics, try to parse as number
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? 0 : parsed;
  };

  const chartData = data
    .slice()
    .reverse()
    .map((item) => ({
      name: new Date(item.collectedAt).toLocaleTimeString(),
      value: convertToNumericValue(item.value, metricName),
      originalValue: item.value, // Preserve original for tooltip
      fullDate: new Date(item.collectedAt).toLocaleString(),
    }));

  return (
    <div className="metrics-chart">
      <h4>{metricName}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 1]} />
          <Tooltip
            formatter={(value: any, _name: any, props: any) => {
              // Show original status string in tooltip for health/automation_status
              if (metricName === 'health' || metricName === 'automation_status') {
                const originalValue = props.payload?.originalValue || value;
                return [`${originalValue} (${value})`, metricName];
              }
              return [value, metricName];
            }}
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

