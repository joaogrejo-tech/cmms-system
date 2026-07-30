import { cn } from '@/lib/utils';

interface RadialGaugeProps {
  value: number; // 0-100
  label: string;
  sublabel?: string;
  size?: number;
  colorClassName?: string;
  className?: string;
}

/**
 * Anel radial no espírito de um manômetro de painel industrial — a assinatura
 * visual do sistema, usada para indicadores percentuais (SLA, Disponibilidade)
 * em vez de barras de progresso genéricas.
 */
export function RadialGauge({
  value,
  label,
  sublabel,
  size = 96,
  colorClassName = 'stroke-primary',
  className,
}: RadialGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const strokeWidth = size * 0.09;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  // Início/fim em 135°/405° (270° de arco), como um manômetro real — não um círculo cheio.
  const rotation = -220;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-[220deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="stroke-muted"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className={cn(colorClassName, 'transition-all duration-700 ease-out')}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset + circumference * 0.25}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-data text-lg font-semibold leading-none">{clamped.toFixed(0)}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-foreground">{label}</p>
        {sublabel && <p className="text-[11px] text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  );
}
