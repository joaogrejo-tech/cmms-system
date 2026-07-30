import ReactECharts from 'echarts-for-react';
import { useChartTheme } from '@/hooks/use-chart-theme';

interface LineChartProps {
  data: { label: string; value: number }[];
  valueFormatter?: (value: number) => string;
  height?: number;
  colorIndex?: number;
  area?: boolean;
}

export function LineChart({ data, valueFormatter, height = 260, colorIndex = 0, area = true }: LineChartProps) {
  const { textColor, axisLineColor, splitLineColor, palette, tooltipBg, tooltipBorder } = useChartTheme();
  const color = palette[colorIndex % palette.length];

  const option = {
    color: [color],
    grid: { left: 45, right: 20, top: 20, bottom: 30, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: textColor },
      formatter: (params: any) => {
        const p = params[0];
        const value = valueFormatter ? valueFormatter(p.value) : p.value;
        return `${p.name}: ${value}`;
      },
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.label),
      boundaryGap: false,
      axisLine: { lineStyle: { color: axisLineColor } },
      axisLabel: { color: textColor, fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: textColor, fontSize: 11 },
      splitLine: { lineStyle: { color: splitLineColor } },
    },
    series: [
      {
        type: 'line',
        data: data.map((d) => d.value),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5 },
        areaStyle: area
          ? {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: `${color}33` },
                  { offset: 1, color: `${color}00` },
                ],
              },
            }
          : undefined,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height }} notMerge />;
}
