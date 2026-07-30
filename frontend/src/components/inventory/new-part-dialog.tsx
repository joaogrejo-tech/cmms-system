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
import { useCreatePart } from '@/hooks/use-inventory';
import { useSuppliers } from '@/hooks/use-suppliers';

const schema = z.object({
  code: z.string().min(1, 'Informe o código.'),
  name: z.string().min(2, 'Informe o nome da peça.'),
  unit: z.string().min(1),
  quantity: z.coerce.number().nonnegative(),
  minStock: z.coerce.number().nonnegative(),
  unitCost: z.coerce.number().nonnegative(),
  location: z.string().optional(),
  supplierId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const UNITS = ['UN', 'PC', 'KG', 'L', 'M', 'CX', 'PAR'];

export function NewPartDialog() {
  const [open, setOpen] = useState(false);
  const { data: suppliers } = useSuppliers();
  const createPart = useCreatePart();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { unit: 'UN', quantity: 0, minStock: 0, unitCost: 0 } });

  const onSubmit = (values: FormValues) => {
    createPart.mutate(
      { ...values, supplierId: values.supplierId || undefined },
      {
        onSuccess: () => {
          toast.success('Peça cadastrada com sucesso!');
          reset();
          setOpen(false);
        },
        onError: () => toast.error('Não foi possível cadastrar a peça (código já existente?).'),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Nova Peça</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Peça</DialogTitle>
          <DialogDescription>Cadastre um item no estoque de manutenção.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="code">Código</Label>
              <Input id="code" placeholder="PC-006" {...register('code')} />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Unidade</Label>
              <Controller
                control={control}
                name="unit"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Rolamento 6205-2RS" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Qtd. inicial</Label>
              <Input id="quantity" type="number" min={0} step={0.01} {...register('quantity')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minStock">Estoque mínimo</Label>
              <Input id="minStock" type="number" min={0} step={0.01} {...register('minStock')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unitCost">Custo unitário</Label>
              <Input id="unitCost" type="number" min={0} step={0.01} {...register('unitCost')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="location">Localização</Label>
              <Input id="location" placeholder="Prateleira A3" {...register('location')} />
            </div>
            <div className="space-y-1.5">
              <Label>Fornecedor</Label>
              <Controller
                control={control}
                name="supplierId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                    <SelectContent>
                      {suppliers?.data.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createPart.isPending}>Salvar Peça</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
