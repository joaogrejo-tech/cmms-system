import { useRef } from 'react';
import { toast } from 'sonner';
import { FileText, Image as ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUploadWorkOrderAttachment } from '@/hooks/use-work-orders';
import { formatDateTime } from '@/lib/domain';

interface AttachmentsPanelProps {
  workOrderId: number;
  attachments: Array<{ id: string; fileName: string; fileUrl: string; fileType: string; createdAt: string }>;
}

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? '').replace(/\/api\/?$/, '');

export function AttachmentsPanel({ workOrderId, attachments }: AttachmentsPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadWorkOrderAttachment();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    upload.mutate(
      { id: workOrderId, file },
      {
        onSuccess: () => toast.success('Arquivo anexado com sucesso.'),
        onError: () => toast.error('Não foi possível enviar o arquivo.'),
      },
    );
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {attachments.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">Nenhum arquivo anexado ainda.</p>
        )}
        {attachments.map((att) => (
          <a
            key={att.id}
            href={`${API_ORIGIN}${att.fileUrl}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-surface-hover"
          >
            {att.fileType.startsWith('image/') ? (
              <img src={`${API_ORIGIN}${att.fileUrl}`} alt={att.fileName} className="h-20 w-full rounded-md object-cover" />
            ) : (
              <div className="flex h-20 w-full items-center justify-center rounded-md bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="line-clamp-1 text-xs font-medium">{att.fileName}</p>
              <p className="text-[10px] text-muted-foreground">{formatDateTime(att.createdAt)}</p>
            </div>
          </a>
        ))}
      </div>

      <input ref={inputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" />
      <Button variant="outline" onClick={() => inputRef.current?.click()} loading={upload.isPending}>
        <Upload className="h-4 w-4" /> Anexar arquivo
      </Button>
    </div>
  );
}
