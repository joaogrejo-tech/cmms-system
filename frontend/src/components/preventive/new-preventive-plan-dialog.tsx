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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssetsLookup } from '@/hooks/use-lookups';
import { useCreatePreventivePlan } from '@/hooks/use-preventive';
import { SPECIALTY_LABELS } from '@/lib/domain';

const FREQUENCY_LABELS = { DIAS: 'Dias', SEMANAS: 'Semanas', MESES: 'Meses', ANOS: 'Anos', HORAS_USO: 'Horas de uso' };

const schema = z.object({
  name: z.string().min(3, 'Informe o nome do plano.'),
  assetId: z.string().uuid('Selecione o ativo.'),
  specialty: z.string().min(1, 'Selecione a especialidade.'),
  frequencyValue: z.coerce.number().int().positive('Informe um valor válido.'),
  frequencyUnit: z.string().min(1),
  nextDueAt: z.string().min(1, 'Informe a próxima data de vencimento.'),
  instructions: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function NewPreventivePlanDialog() {
  const [open, setOpen] = useState(false);
  const { data: assets } = useAssetsLookup();
  const createPlan = useCreatePreventivePlan();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { frequencyUnit: 'MESES', frequencyValue: 1 } });

  const onSubmit = (values: FormValues) => {
    createPlan.mutate(
      {
        ...values,
        specialty: values.specialty as any,
        frequencyUnit: values.frequencyUnit as any,
        nextDueAt: new Date(values.nextDueAt).toISOString(),
      },
      {
        onSuccess: () => {
          toast.success('Plano preventivo criado com sucesso!');
          reset();
          setOpen(false);
        },
        onError: () => toast.error('Não foi possível criar o plano preventivo.'),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Novo Plano</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Plano Preventivo</DialogTitle>
          <DialogDescription>Configure a periodicidade e a próxima geração de OS.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome do plano</Label>
            <Input id="name" placeholder="Lubrificação mensal do redutor" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Ativo</Label>
            <Controller
              control={control}
              name="assetId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione o ativo" /></SelectTrigger>
                  <SelectContent>
                    {assets?.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} ({a.tag})</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.assetId && <p className="text-xs text-destructive">{errors.assetId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Especialidade</Label>
            <Controller
              control={control}
              name="specialty"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SPECIALTY_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.specialty && <p className="text-xs text-destructive">{errors.specialty.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="frequencyValue">Repetir a cada</Label>
              <Input id="frequencyValue" type="number" min={1} {...register('frequencyValue')} />
            </div>
            <div className="space-y-1.5">
              <Label>Unidade</Label>
              <Controller
                control={control}
                name="frequencyUnit"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(FREQUENCY_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nextDueAt">Próximo vencimento</Label>
            <Input id="nextDueAt" type="date" {...register('nextDueAt')} />
            {errors.nextDueAt && <p className="text-xs text-destructive">{errors.nextDueAt.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="instructions">Instruções (opcional)</Label>
            <Textarea id="instructions" placeholder="Passo a passo da preventiva..." {...register('instructions')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createPlan.isPending}>Salvar Plano</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
