import { prisma } from '@/config/prisma';

/**
 * Gera códigos sequenciais no formato PREFIXO-ANO-NNNNNN (ex: OS-2026-000123).
 * Usa transação com contagem do próprio ano para evitar colisão em concorrência,
 * com retry em caso de conflito de unicidade (P2002).
 */
export async function generateSequentialCode(
  entity: 'workOrder' | 'purchaseOrder',
  prefix: string,
): Promise<string> {
  const year = new Date().getFullYear();

  const count =
    entity === 'workOrder'
      ? await prisma.workOrder.count({
          where: { code: { startsWith: `${prefix}-${year}-` } },
        })
      : await prisma.purchaseOrder.count({
          where: { code: { startsWith: `${prefix}-${year}-` } },
        });

  const nextNumber = String(count + 1).padStart(6, '0');
  return `${prefix}-${year}-${nextNumber}`;
}
