import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
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
import { useCreatePurchaseOrder } from '@/hooks/use-purchases';
import { useSuppliers } from '@/hooks/use-suppliers';
import { formatCurrency } from '@/lib/domain';

const itemSchema = z.object({
  description: z.string().min(2, 'Descreva o item.'),
  quantity: z.coerce.number().positive('Quantidade inválida.'),
  unitValue: z.coerce.number().nonnegative('Valor inválido.'),
});

const schema = z.object({
  supplierId: z.string().optional(),
  expectedAt: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Inclua ao menos um item.'),
});

type FormValues = z.infer<typeof schema>;

export function NewPurchaseOrderDialog() {
  const [open, setOpen] = useState(false);
  const { data: suppliers } = useSuppliers();
  const createOrder = useCreatePurchaseOrder();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { items: [{ description: '', quantity: 1, unitValue: 0 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = watch('items');
  const total = items?.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitValue) || 0), 0) ?? 0;

  const onSubmit = (values: FormValues) => {
    createOrder.mutate(
      { ...values, supplierId: values.supplierId || undefined, expectedAt: values.expectedAt || undefined },
      {
        onSuccess: () => {
          toast.success('Pedido de compra criado com sucesso!');
          reset({ items: [{ description: '', quantity: 1, unitValue: 0 }] });
          setOpen(false);
        },
        onError: () => toast.error('Não foi possível criar o pedido de compra.'),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Novo Pedido</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Pedido de Compra</DialogTitle>
          <DialogDescription>Solicite materiais e peças para o estoque da manutenção.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Fornecedor (opcional)</Label>
              <Controller
                control={control}
                name="supplierId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Definir depois" /></SelectTrigger>
                    <SelectContent>
                      {suppliers?.data.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expectedAt">Prazo esperado</Label>
              <Input id="expectedAt" type="date" {...register('expectedAt')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Itens do pedido</Label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <Input placeholder="Descrição do item" className="flex-1" {...register(`items.${index}.description`)} />
                  <Input type="number" min={0.01} step={0.01} placeholder="Qtd" className="w-20" {...register(`items.${index}.quantity`)} />
                  <Input type="number" min={0} step={0.01} placeholder="Valor unit." className="w-28" {...register(`items.${index}.unitValue`)} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            {errors.items && <p className="text-xs text-destructive">{errors.items.message}</p>}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, unitValue: 0 })}>
              <Plus className="h-3.5 w-3.5" /> Adicionar item
            </Button>
          </div>

          <div className="flex justify-end border-t border-border pt-3 text-sm font-semibold">
            Total estimado: <span className="ml-1 font-data">{formatCurrency(total)}</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea id="notes" {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createOrder.isPending}>Salvar Pedido</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
