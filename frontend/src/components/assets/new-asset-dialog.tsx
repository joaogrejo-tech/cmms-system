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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSectors } from '@/hooks/use-lookups';
import { useCreateAsset } from '@/hooks/use-assets';
import { CRITICALITY_LABELS } from '@/lib/domain';

const schema = z.object({
  code: z.string().min(1, 'Informe o código.'),
  tag: z.string().min(1, 'Informe a TAG.'),
  name: z.string().min(2, 'Informe o nome do ativo.'),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  sectorId: z.string().uuid('Selecione o setor.'),
  criticality: z.string().min(1),
  location: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function NewAssetDialog() {
  const [open, setOpen] = useState(false);
  const { data: sectors } = useSectors();
  const createAsset = useCreateAsset();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { criticality: 'MEDIA' } });

  const onSubmit = (values: FormValues) => {
    createAsset.mutate(
      { ...values, criticality: values.criticality as any, status: 'OPERACIONAL' },
      {
        onSuccess: () => {
          toast.success('Ativo cadastrado com sucesso!');
          reset();
          setOpen(false);
        },
        onError: () => toast.error('Não foi possível cadastrar o ativo. Verifique se o código/TAG já existem.'),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Novo Ativo</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Ativo</DialogTitle>
          <DialogDescription>Cadastre uma nova máquina ou equipamento.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="code">Código</Label>
              <Input id="code" placeholder="AT-009" {...register('code')} />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tag">TAG</Label>
              <Input id="tag" placeholder="EN-LIN-03" {...register('tag')} />
              {errors.tag && <p className="text-xs text-destructive">{errors.tag.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Envasadora de latas 03" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="manufacturer">Fabricante</Label>
              <Input id="manufacturer" {...register('manufacturer')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Modelo</Label>
              <Input id="model" {...register('model')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Setor</Label>
              <Controller
                control={control}
                name="sectorId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {sectors?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.sectorId && <p className="text-xs text-destructive">{errors.sectorId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Criticidade</Label>
              <Controller
                control={control}
                name="criticality"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CRITICALITY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Localização (opcional)</Label>
            <Input id="location" placeholder="Galpão 2, linha 3" {...register('location')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createAsset.isPending}>Salvar Ativo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
