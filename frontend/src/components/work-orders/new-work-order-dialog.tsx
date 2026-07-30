import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useSectors, useUsers, useAssetsLookup } from '@/hooks/use-lookups';
import { useCreateWorkOrder } from '@/hooks/use-work-orders';
import { MAINTENANCE_TYPE_LABELS, PRIORITY_LABELS, SPECIALTY_LABELS } from '@/lib/domain';

const schema = z.object({
  description: z.string().min(5, 'Descreva o problema com mais detalhes.'),
  detailedNotes: z.string().optional(),
  specialty: z.string().min(1, 'Selecione a especialidade.'),
  sectorId: z.string().uuid('Selecione o setor.'),
  maintenanceType: z.string().min(1, 'Selecione o tipo.'),
  priority: z.string().min(1, 'Selecione a prioridade.'),
  assignedToId: z.string().optional(),
  assetId: z.string().optional(),
  dueAt: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function NewWorkOrderDialog() {
  const [open, setOpen] = useState(false);
  const { data: sectors } = useSectors();
  const { data: technicians } = useUsers({});
  const createWorkOrder = useCreateWorkOrder();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIA' },
  });

  const sectorId = watch('sectorId');
  const { data: assets } = useAssetsLookup(sectorId);

  const onSubmit = (values: FormValues) => {
    createWorkOrder.mutate(
      {
        description: values.description,
        detailedNotes: values.detailedNotes,
        specialty: values.specialty as any,
        sectorId: values.sectorId,
        maintenanceType: values.maintenanceType as any,
        priority: values.priority as any,
        assignedToId: values.assignedToId || undefined,
        assetId: values.assetId || undefined,
        dueAt: values.dueAt || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Ordem de serviço criada com sucesso!');
          reset();
          setOpen(false);
        },
        onError: () => {
          toast.error('Não foi possível criar a OS. Verifique os dados e tente novamente.');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Nova OS
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nova Ordem de Serviço</DialogTitle>
          <DialogDescription>Preencha os dados abaixo para abrir uma nova OS.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição do problema</Label>
            <Textarea id="description" placeholder="Descreva o problema observado..." {...register('description')} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Setor</Label>
              <Controller
                control={control}
                name="sectorId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
                    <SelectContent>
                      {sectors?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.sectorId && <p className="text-xs text-destructive">{errors.sectorId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Ativo (opcional)</Label>
              <Controller
                control={control}
                name="assetId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!sectorId}>
                    <SelectTrigger><SelectValue placeholder="Selecione o ativo" /></SelectTrigger>
                    <SelectContent>
                      {assets?.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name} ({a.tag})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Especialidade</Label>
              <Controller
                control={control}
                name="specialty"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(SPECIALTY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.specialty && <p className="text-xs text-destructive">{errors.specialty.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Tipo de manutenção</Label>
              <Controller
                control={control}
                name="maintenanceType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(MAINTENANCE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.maintenanceType && <p className="text-xs text-destructive">{errors.maintenanceType.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Responsável (opcional)</Label>
              <Controller
                control={control}
                name="assignedToId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Atribuir depois" /></SelectTrigger>
                    <SelectContent>
                      {technicians?.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dueAt">Prazo (opcional)</Label>
              <Input id="dueAt" type="datetime-local" {...register('dueAt')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="detailedNotes">Observações (opcional)</Label>
            <Textarea id="detailedNotes" placeholder="Informações adicionais..." {...register('detailedNotes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={createWorkOrder.isPending}>
              Salvar Ordem de Serviço
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
