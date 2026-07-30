import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAddWorkOrderComment } from '@/hooks/use-work-orders';
import { formatDateTime, getInitials } from '@/lib/domain';

interface CommentsPanelProps {
  workOrderId: number;
  comments: Array<{ id: string; content: string; createdAt: string; user: { id: string; name: string } }>;
}

export function CommentsPanel({ workOrderId, comments }: CommentsPanelProps) {
  const [content, setContent] = useState('');
  const addComment = useAddWorkOrderComment();

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Textarea
          placeholder="Escreva um comentário..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
        />
        <Button
          size="icon"
          disabled={!content.trim()}
          loading={addComment.isPending}
          onClick={() => addComment.mutate({ id: workOrderId, content }, { onSuccess: () => setContent('') })}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {comments.length === 0 && <p className="text-sm text-muted-foreground">Nenhum comentário ainda.</p>}
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-[10px]">{getInitials(comment.user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 rounded-lg bg-muted px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{comment.user.name}</p>
                <p className="text-[11px] text-muted-foreground">{formatDateTime(comment.createdAt)}</p>
              </div>
              <p className="mt-0.5 text-sm">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
