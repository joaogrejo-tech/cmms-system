import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const formatName = (nome: string) => {
  const clean = nome.trim();
  if (clean.toUpperCase() === 'PET' || clean.toUpperCase() === 'PCM') return clean.toUpperCase();
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
};

async function higienizarSetores() {
  console.log('🧹 Higienizando e unificando setores no banco...');

  const todosSetores = await prisma.sector.findMany();

  for (const sector of todosSetores) {
    const nomeOficial = formatName(sector.name);

    // 1. Verifica se já existe um setor gravado com o nome formatado no banco
    let setorOficial = await prisma.sector.findUnique({
      where: { name: nomeOficial }
    });

    // 2. Se o setor atual é o próprio oficial (ou o oficial ainda não existe)
    if (!setorOficial) {
      // Renomeia o setor atual para a versão limpa
      await prisma.sector.update({
        where: { id: sector.id },
        data: { name: nomeOficial }
      });
      console.log(`✨ Setor "${sector.name}" renomeado para "${nomeOficial}".`);
    } else if (setorOficial.id !== sector.id) {
      // 3. Se já existe outro setor com o nome oficial, movemos tudo e deletamos a duplicata
      console.log(`🔄 Migrando dados do setor duplicado "${sector.name}" para "${nomeOficial}"...`);

      // Transfere os equipamentos vinculados
      await prisma.asset.updateMany({
        where: { sectorId: sector.id },
        data: { sectorId: setorOficial.id }
      });

      // Transfere as Ordens de Serviço vinculadas
      await prisma.workOrder.updateMany({
        where: { sectorId: sector.id },
        data: { sectorId: setorOficial.id }
      });

      // Apaga o registro duplicado
      await prisma.sector.delete({
        where: { id: sector.id }
      });

      console.log(`🗑️ Setor duplicado "${sector.name}" removido com sucesso.`);
    }
  }

  console.log('--------------------------------------------------');
  console.log('✅ Higienização concluída com sucesso!');
  console.log('--------------------------------------------------');
}

higienizarSetores()
  .catch((e) => console.error('❌ Erro na higienização:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });