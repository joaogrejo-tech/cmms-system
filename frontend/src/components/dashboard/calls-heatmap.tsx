import ReactECharts from 'echarts-for-react';
import { useChartTheme } from '@/hooks/use-chart-theme';

interface HeatmapProps {
  data: { date: string; value: number }[];
  height?: number;
}

export function CallsHeatmap({ data, height = 200 }: HeatmapProps) {
  const { textColor, tooltipBg, tooltipBorder } = useChartTheme();

  const values = data.map((d) => d.value);
  const max = Math.max(1, ...values);

  const dates = data.map((d) => d.date);
  const range: [string, string] =
    dates.length > 0
      ? [dates[0], dates[dates.length - 1]]
      : [`${new Date().getFullYear()}-01-01`, `${new Date().getFullYear()}-12-31`];

  const option = {
    tooltip: {
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: textColor },
      formatter: (p: any) => `${p.value[0]}: ${p.value[1]} chamado(s)`,
    },
    visualMap: {
      min: 0,
      max,
      show: false,
      inRange: { color: ['#0E749015', '#0E7490'] },
    },
    calendar: {
      top: 20,
      left: 30,
      right: 10,
      cellSize: ['auto', 14],
      range,
      itemStyle: { borderWidth: 3, borderColor: 'transparent' },
      splitLine: { show: false },
      yearLabel: { show: false },
      dayLabel: { color: textColor, fontSize: 10 },
      monthLabel: { color: textColor, fontSize: 10 },
      splitArea: { show: false },
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: data.map((d) => [d.date, d.value]),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height }} notMerge />;
}
