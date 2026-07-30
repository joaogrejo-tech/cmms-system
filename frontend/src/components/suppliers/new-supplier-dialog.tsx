import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { useCreateSupplier } from '@/hooks/use-suppliers';

const schema = z.object({
  name: z.string().min(2, 'Informe o nome do fornecedor.'),
  cnpj: z.string().optional(),
  contact: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido.').optional().or(z.literal('')),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function NewSupplierDialog() {
  const [open, setOpen] = useState(false);
  const createSupplier = useCreateSupplier();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    createSupplier.mutate(
      { ...values, email: values.email || undefined },
      {
        onSuccess: () => {
          toast.success('Fornecedor cadastrado com sucesso!');
          reset();
          setOpen(false);
        },
        onError: () => toast.error('Não foi possível cadastrar o fornecedor.'),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Novo Fornecedor</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Fornecedor</DialogTitle>
          <DialogDescription>Cadastre um fornecedor de peças ou serviços.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome / Razão social</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" placeholder="00.000.000/0001-00" {...register('cnpj')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact">Contato</Label>
              <Input id="contact" placeholder="Nome do vendedor" {...register('contact')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register('phone')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" {...register('address')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createSupplier.isPending}>Salvar Fornecedor</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
