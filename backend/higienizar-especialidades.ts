import { PrismaClient, Specialty } from '@prisma/client';
import * as xlsx from 'xlsx';

const prisma = new PrismaClient();

// Mapeamento exato do texto da planilha para o Enum aceito no seu Banco
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

async function higienizarEspecialidades() {
  console.log('🚀 Atualizando e corrigindo as Especialidades das OS no banco...');

  // 1. Carrega a planilha
  const workbook = xlsx.readFile('./IMPORTAR-OS.xlsx', { cellDates: true });
  const worksheet = workbook.Sheets['IMPORTAR_OS'];
  const osRaw = xlsx.utils.sheet_to_json(worksheet, { range: 2 });

  let atualizados = 0;
  let naoEncontrados = 0;

  for (const row of osRaw as any[]) {
    const idPlanilha = row['ID'];
    if (!idPlanilha) continue;

    const especialidadeTexto = String(row['ESPECIALIDADE'] || '').trim();
    if (!especialidadeTexto) continue;

    const enumCorrect = mapSpecialtyEnum(especialidadeTexto);
    const codeOS = `OS-${idPlanilha}`;

    try {
      // Atualiza a OS existente no banco
      const os = await prisma.workOrder.updateMany({
        where: { code: codeOS },
        data: { specialty: enumCorrect }
      });

      if (os.count > 0) {
        atualizados++;
      } else {
        naoEncontrados++;
      }
    } catch (err: any) {
      console.error(`❌ Erro ao atualizar ${codeOS}:`, err.message);
    }
  }

  console.log('--------------------------------------------------');
  console.log(`📊 Resultado da Correção de Especialidades:`);
  console.log(`✅ Atualizados com sucesso: ${atualizados}`);
  if (naoEncontrados > 0) console.log(`⚠️ OSs não encontradas: ${naoEncontrados}`);
  console.log('--------------------------------------------------');
}

higienizarEspecialidades()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });