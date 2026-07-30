import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '@/shared/utils/pagination';

export class NotificationService {
  async list(userId: string, query: { page?: string; perPage?: string; unreadOnly?: string }) {
    const { skip, take, page, perPage } = parsePagination(query);
    const where = { userId, read: query.unreadOnly === 'true' ? false : undefined };

    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return { ...buildPaginatedResponse(items, total, page, perPage), unreadCount };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new NotFoundError('Notificação');
    return prisma.notification.update({ where: { id }, data: { read: true } });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  }
}
