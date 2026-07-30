import ReactECharts from 'echarts-for-react';
import { useChartTheme } from '@/hooks/use-chart-theme';

interface PieChartProps {
  data: { label: string; value: number }[];
  labelMap?: Record<string, string>;
  donut?: boolean;
  height?: number;
}

export function PieChart({ data, labelMap, donut = false, height = 260 }: PieChartProps) {
  const { textColor, palette, tooltipBg, tooltipBorder } = useChartTheme();

  const option = {
    color: palette,
    tooltip: {
      trigger: 'item',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: textColor },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      bottom: 0,
      textStyle: { color: textColor, fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        type: 'pie',
        radius: donut ? ['45%', '70%'] : '70%',
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: 'transparent', borderWidth: 2 },
        label: { show: false },
        labelLine: { show: false },
        data: data.map((d) => ({ name: labelMap?.[d.label] ?? d.label, value: d.value })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height }} notMerge />;
}
