import { PrismaClient, Specialty, MaintenanceType, Priority, WorkOrderSubStatus } from '@prisma/client';
import * as xlsx from 'xlsx';

const prisma = new PrismaClient();

// Função para formatar o nome dos setores em Title Case (ex: "Garrafa", "Lata", "PET")
const formatSectorName = (nome: string) => {
  const clean = nome.trim();
  if (clean.toUpperCase() === 'PET' || clean.toUpperCase() === 'PCM') {
    return clean.toUpperCase();
  }
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
};

// Mapeamento exato de Especialidade
const mapSpecialtyEnum = (val: string): Specialty => {
  const v = val.toUpperCase().trim();
  if (v.includes('ELETRO') && v.includes('MECAN')) return 'ELETROMECANICA';
  if (v.includes('ELETR')) return 'ELETRICA';
  if (v.includes('MECAN')) return 'MECANICA';
  if (v.includes('PCM')) return 'PCM';
  if (v.includes('TERCEIR')) return 'TERCEIRIZADO';
  if (v.includes('SOLDA') || v.includes('CALDEIRA')) return 'SOLDA_CALDEIRARIA';
  if (v.includes('CIVIL')) return 'CIVIL';
  if (v.includes('AUTOMAC')) return 'AUTOMACAO';
  if (v.includes('UTILID')) return 'UTILIDADES';
  if (v.includes('REFRIG')) return 'REFRIGERACAO';
  if (v.includes('ENVASE')) return 'ENVASE';
  if (v.includes('QUALID')) return 'QUALIDADE';
  return 'OUTROS';
};

// Mapeamento de Status
const mapStatus = (val: string): any => {
  const v = val.toUpperCase().trim();
  if (v === 'CONCLUIDO' || v === 'CONCLUIDA' || v === 'FINALIZADA') return 'CONCLUIDA';
  if (v === 'EM_ANDAMENTO') return 'EM_ANDAMENTO';
  return 'EM_ANALISE';
};

async function importarOS() {
  console.log('🚀 Iniciando a importação completa do Histórico de OS...');

  const workbook = xlsx.readFile('./IMPORTAR-OS.xlsx', { cellDates: true });
  const worksheet = workbook.Sheets['IMPORTAR_OS'];
  const osRaw = xlsx.utils.sheet_to_json(worksheet, { range: 2 });

  console.log('⏳ Carregando usuários e ativos do banco...');
  const dbUsers = await prisma.user.findMany();
  const dbAssets = await prisma.asset.findMany();

  if (dbUsers.length === 0) {
    throw new Error('Nenhum usuário cadastrado no banco de dados para vincular como solicitante.');
  }

  const findUserId = (nome: string) => {
    if (!nome) return null;
    const user = dbUsers.find(u => u.name.toUpperCase().includes(nome.toUpperCase().trim()));
    return user ? user.id : null;
  };

  const findAssetId = (tag: string) => {
    if (!tag || tag === 'NAO_APLICADO') return null;
    const ast = dbAssets.find(a => a.tag === tag.trim().toUpperCase());
    return ast ? ast.id : null;
  };

  let sucesso = 0;
  let erro = 0;

  for (const row of osRaw as any[]) {
    const idPlanilha = row['ID'];
    if (!idPlanilha) continue;

    const codeOS = `OS-${idPlanilha}`;

    try {
      // Se a OS já existir, atualiza especialidade e pula inserção
      const osExistente = await prisma.workOrder.findUnique({ where: { code: codeOS } });
      if (osExistente) {
        const especialidadeTexto = String(row['ESPECIALIDADE'] || '').trim();
        if (especialidadeTexto) {
          await prisma.workOrder.update({
            where: { code: codeOS },
            data: { specialty: mapSpecialtyEnum(especialidadeTexto) }
          });
        }
        sucesso++;
        continue;
      }

      const descricao = String(row['DESCRIÇÃO'] || '').trim();
      const especialidadeTexto = String(row['ESPECIALIDADE'] || '').trim();
      const setorNome = String(row['SETOR'] || '').trim();
      const tipoOs = String(row['TIPO OS'] || 'CORRETIVA').trim() as MaintenanceType;
      const equipamentoTag = String(row['EQUIPAMENTO'] || '').trim();
      const prioridade = String(row['PRIORIDADE'] || 'MEDIA').trim() as Priority;
      const solicitanteNome = String(row['SOLICITANTE'] || '').trim();
      const responsaveisStr = String(row['RESPONSAVEL'] || '').trim();
      const statusRaw = String(row['STATUS'] || 'EM_ANALISE').trim();
      const subStatus = (row['SUBSTATUS'] ? String(row['SUBSTATUS']).trim() : null) as WorkOrderSubStatus | null;

      let dataAbertura = new Date();
      if (row['DATA ABERTURA'] instanceof Date) {
        dataAbertura = row['DATA ABERTURA'];
      }

      // Garante setor formatado sem duplicar
      const nomeSetorFormatado = formatSectorName(setorNome);
      const sector = await prisma.sector.upsert({
        where: { name: nomeSetorFormatado },
        update: {},
        create: {
          name: nomeSetorFormatado,
          active: true,
        }
      });

      // Define solicitante obrigatório (fallback para o primeiro usuário)
      const requesterId = findUserId(solicitanteNome) || dbUsers[0].id;
      const assetId = findAssetId(equipamentoTag);

      let assignedToId: string | null = null;
      if (responsaveisStr && responsaveisStr !== 'undefined' && responsaveisStr.toUpperCase() !== 'TERCEIROS') {
        const primeiroTecnico = responsaveisStr.split(',')[0];
        assignedToId = findUserId(primeiroTecnico);
      }

      await prisma.workOrder.create({
        data: {
          code: codeOS,
          description: descricao,
          specialty: mapSpecialtyEnum(especialidadeTexto),
          maintenanceType: tipoOs,
          priority: prioridade,
          status: mapStatus(statusRaw),
          subStatus: subStatus,
          openedAt: dataAbertura,

          sector: { connect: { id: sector.id } },
          requester: { connect: { id: requesterId } },
          ...(assignedToId && { assignedTo: { connect: { id: assignedToId } } }),
          ...(assetId && { asset: { connect: { id: assetId } } }),
        }
      });

      console.log(`✅ ${codeOS} importada com sucesso.`);
      sucesso++;
    } catch (e: any) {
      console.error(`❌ Erro na ${codeOS}:`, e.message);
      erro++;
    }
  }

  console.log('--------------------------------------------------');
  console.log(`📊 Resumo da Importação de OS:`);
  console.log(`✅ Sucesso / Processadas: ${sucesso}`);
  console.log(`❌ Erros: ${erro}`);
  console.log('--------------------------------------------------');
}

importarOS()
  .catch((e) => console.error('Falha crítica:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });