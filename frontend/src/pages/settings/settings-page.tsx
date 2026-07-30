import { useState } from 'react';
import { toast } from 'sonner';
import { Moon, Save, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import { api } from '@/lib/api-client';
import { ROLE_LABELS, getInitials } from '@/lib/domain';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme } = useThemeStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!user || newPassword.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/users/${user.id}/password`, { currentPassword, newPassword });
      toast.success('Senha atualizada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      toast.error('Não foi possível atualizar a senha. Verifique a senha atual.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Preferências do sistema e da sua conta.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold text-foreground">Meu perfil</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4 pt-0">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-base">{user ? getInitials(user.name) : '?'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground">{user ? ROLE_LABELS[user.role] : ''}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold text-foreground">Aparência</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:bg-surface-hover',
              )}
            >
              <Sun className="h-5 w-5" />
              <span className="text-sm font-medium">Claro</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:bg-surface-hover',
              )}
            >
              <Moon className="h-5 w-5" />
              <span className="text-sm font-medium">Escuro</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold text-foreground">Segurança</CardTitle></CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <Button onClick={handleChangePassword} loading={saving}>
            <Save className="h-4 w-4" /> Salvar nova senha
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
