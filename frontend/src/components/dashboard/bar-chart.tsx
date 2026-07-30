import ReactECharts from 'echarts-for-react';
import { useChartTheme } from '@/hooks/use-chart-theme';

interface BarChartProps {
  data: { label: string; value: number }[];
  horizontal?: boolean;
  valueFormatter?: (value: number) => string;
  height?: number;
  colorIndex?: number;
}

export function BarChart({ data, horizontal = false, valueFormatter, height = 260, colorIndex = 0 }: BarChartProps) {
  const { textColor, axisLineColor, splitLineColor, palette, tooltipBg, tooltipBorder } = useChartTheme();

  const categoryAxis = {
    type: 'category' as const,
    data: data.map((d) => d.label),
    axisLine: { lineStyle: { color: axisLineColor } },
    axisLabel: { color: textColor, fontSize: 11, interval: 0, rotate: horizontal ? 0 : data.length > 6 ? 30 : 0 },
    axisTick: { show: false },
  };

  const valueAxis = {
    type: 'value' as const,
    axisLine: { show: false },
    axisLabel: { color: textColor, fontSize: 11 },
    splitLine: { lineStyle: { color: splitLineColor } },
  };

  const option = {
    color: [palette[colorIndex % palette.length]],
    grid: { left: horizontal ? 100 : 40, right: 20, top: 20, bottom: horizontal ? 20 : 50, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: textColor },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        const value = valueFormatter ? valueFormatter(p.value) : p.value;
        return `${p.name}: ${value}`;
      },
    },
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    series: [
      {
        type: 'bar',
        data: data.map((d) => d.value),
        barMaxWidth: 32,
        itemStyle: { borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0] },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height }} notMerge />;
}
