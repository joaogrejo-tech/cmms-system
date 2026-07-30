import { useThemeStore } from '@/stores/theme.store';

/** Paleta consistente com os tokens do design system, usada em todos os gráficos ECharts. */
export function useChartTheme() {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  return {
    isDark,
    textColor: isDark ? '#CBD5E1' : '#475569',
    axisLineColor: isDark ? '#334155' : '#E2E8F0',
    splitLineColor: isDark ? '#1E293B' : '#F1F5F9',
    palette: ['#0E7490', '#F59E0B', '#059669', '#DC2626', '#6366F1', '#EC4899', '#64748B', '#0891B2'],
    tooltipBg: isDark ? '#1E293B' : '#FFFFFF',
    tooltipBorder: isDark ? '#334155' : '#E2E8F0',
  };
}
