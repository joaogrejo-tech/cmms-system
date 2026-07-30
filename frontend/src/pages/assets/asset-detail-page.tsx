import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Cog, Gauge, MapPin, ClipboardList } from 'lucide-react';
import { useAsset } from '@/hooks/use-assets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ASSET_STATUS_LABELS,
  ASSET_STATUS_VARIANT,
  CRITICALITY_VARIANT,
} from '@/components/assets/asset-card';
import { STATUS_BADGE_VARIANT, STATUS_LABELS, CRITICALITY_LABELS, formatDate, formatDateTime } from '@/lib/domain';
import { Button } from '@/components/ui/button';

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: asset, isLoading } = useAsset(id);

  if (isLoading || !asset) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/assets')}>
        <ArrowLeft className="h-4 w-4" /> Voltar para Ativos
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-data text-sm text-muted-foreground">{asset.tag}</span>
            <Badge variant={CRITICALITY_VARIANT[asset.criticality as keyof typeof CRITICALITY_VARIANT]}>
              {CRITICALITY_LABELS[asset.criticality as keyof typeof CRITICALITY_LABELS]}
            </Badge>
            <Badge variant={ASSET_STATUS_VARIANT[asset.status as keyof typeof ASSET_STATUS_VARIANT]}>
              {ASSET_STATUS_LABELS[asset.status as keyof typeof ASSET_STATUS_LABELS]}
            </Badge>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">{asset.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold text-foreground">Ficha técnica</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 pt-0 text-sm sm:grid-cols-3">
              <Info icon={Building2} label="Fabricante" value={asset.manufacturer ?? '—'} />
              <Info icon={Cog} label="Modelo" value={asset.model ?? '—'} />
              <Info icon={Cog} label="Nº de série" value={asset.serialNumber ?? '—'} />
              <Info icon={MapPin} label="Setor" value={asset.sector?.name ?? '—'} />
              <Info icon={MapPin} label="Localização" value={asset.location ?? '—'} />
              <Info icon={Gauge} label="Código interno" value={asset.code} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold text-foreground">Ordens de Serviço relacionadas</CardTitle></CardHeader>
            <CardContent className="pt-0">
              {asset.workOrders?.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma OS registrada para este ativo.</p>}
              <div className="divide-y divide-border">
                {asset.workOrders?.map((wo: any) => (
                  <Link
                    key={wo.id}
                    to={`/work-orders/${wo.id}`}
                    className="flex items-center justify-between py-2.5 text-sm transition-colors hover:text-primary"
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      <span className="font-data">{wo.code}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="line-clamp-1">{wo.description}</span>
                    </div>
                    <Badge variant={STATUS_BADGE_VARIANT[wo.status as keyof typeof STATUS_BADGE_VARIANT]}>
                      {STATUS_LABELS[wo.status as keyof typeof STATUS_LABELS]}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold text-foreground">Últimas leituras de medidor</CardTitle></CardHeader>
            <CardContent className="space-y-2 pt-0">
              {asset.meterReadings?.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma leitura registrada.</p>}
              {asset.meterReadings?.map((r: any) => (
                <div key={r.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{formatDate(r.readAt)}</span>
                  <span className="font-data font-medium">{r.value} {r.unit}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {asset.preventivePlans?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold text-foreground">Planos preventivos</CardTitle></CardHeader>
              <CardContent className="space-y-2 pt-0">
                {asset.preventivePlans.map((p: any) => (
                  <div key={p.id} className="rounded-md border border-border p-2.5 text-sm">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Próxima: {formatDateTime(p.nextDueAt)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
