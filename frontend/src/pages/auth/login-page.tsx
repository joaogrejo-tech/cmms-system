import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Gauge, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/hooks/use-auth';

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: LoginForm) => {
    login.mutate(values, {
      onSuccess: () => {
        const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/';
        navigate(redirectTo, { replace: true });
      },
      onError: () => {
        toast.error('Credenciais inválidas', {
          description: 'Verifique seu e-mail e senha e tente novamente.',
        });
      },
    });
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Painel de marca — lado esquerdo */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[hsl(222,47%,9%)] p-12 text-white lg:flex">
        <div className="absolute inset-0 opacity-[0.07]">
          <svg width="100%" height="100%">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Gauge className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">CMMS Cervejaria</span>
        </div>

        <div className="relative space-y-6">
          <blockquote className="max-w-md text-2xl font-medium leading-snug tracking-tight">
            Da planilha ao controle total da manutenção — em tempo real.
          </blockquote>
          <div className="grid grid-cols-3 gap-6 max-w-sm border-t border-white/10 pt-6">
            <div>
              <p className="font-data text-2xl font-semibold text-primary">99.2%</p>
              <p className="text-xs text-white/60">Disponibilidade</p>
            </div>
            <div>
              <p className="font-data text-2xl font-semibold text-primary">4.1h</p>
              <p className="text-xs text-white/60">MTTR médio</p>
            </div>
            <div>
              <p className="font-data text-2xl font-semibold text-primary">96%</p>
              <p className="text-xs text-white/60">SLA cumprido</p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-white/40">Planejamento e Controle da Manutenção · PCM</p>
      </div>

      {/* Formulário — lado direito */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-slide-up space-y-8">
          <div className="space-y-2 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Gauge className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold tracking-tight">CMMS Cervejaria</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
            <p className="text-sm text-muted-foreground">Acesse o sistema de gestão da manutenção.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.nome@cervejaria.com"
                icon={<Mail className="h-4 w-4" />}
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" loading={login.isPending}>
              Entrar
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Problemas para acessar? Fale com o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
