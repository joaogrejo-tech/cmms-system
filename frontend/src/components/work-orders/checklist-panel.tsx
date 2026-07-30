import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAddChecklistItem, useToggleChecklistItem } from '@/hooks/use-work-orders';
import { cn } from '@/lib/utils';

interface ChecklistPanelProps {
  workOrderId: number;
  items: Array<{ id: string; description: string; done: boolean }>;
}

export function ChecklistPanel({ workOrderId, items }: ChecklistPanelProps) {
  const [description, setDescription] = useState('');
  const addItem = useAddChecklistItem();
  const toggleItem = useToggleChecklistItem();

  const completedCount = items.filter((i) => i.done).length;

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {completedCount} de {items.length} itens concluídos
        </p>
      )}

      <div className="space-y-1">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nenhum item de checklist adicionado.</p>}
        {items.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 hover:bg-surface-hover"
          >
            <input
              type="checkbox"
              checked={item.done}
              onChange={(e) => toggleItem.mutate({ itemId: item.id, done: e.target.checked, workOrderId })}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <span className={cn('text-sm', item.done && 'text-muted-foreground line-through')}>{item.description}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Adicionar item ao checklist..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && description.trim()) {
              addItem.mutate({ id: workOrderId, description }, { onSuccess: () => setDescription('') });
            }
          }}
        />
        <Button
          variant="outline"
          size="icon"
          disabled={!description.trim()}
          loading={addItem.isPending}
          onClick={() => addItem.mutate({ id: workOrderId, description }, { onSuccess: () => setDescription('') })}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
