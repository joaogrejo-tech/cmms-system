import { PrismaClient, Role, Specialty, MaintenanceType, Priority, WorkOrderStatus, AssetCriticality, AssetStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados do CMMS...');

  // ------------------------------------------------------------------
  // SETORES (baseado nos setores típicos de uma cervejaria)
  // ------------------------------------------------------------------
  const sectorNames = [
    'Brassagem',
    'Fermentação e Maturação',
    'Envase',
    'Utilidades',
    'CO2 e Refrigeração',
    'Tratamento de Água',
    'Expedição / Logística',
    'Qualidade',
    'Manutenção',
  ];

  const sectors = await Promise.all(
    sectorNames.map((name) =>
      prisma.sector.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const sectorByName = Object.fromEntries(sectors.map((s) => [s.name, s]));

  // ------------------------------------------------------------------
  // USUÁRIOS (um por perfil, senha padrão: "Cmms@123")
  // ------------------------------------------------------------------
  const passwordHash = await bcrypt.hash('Cmms@123', 10);

  const usersData: Array<{
    name: string;
    email: string;
    role: Role;
    specialty?: Specialty;
    sector?: string;
    registration: string;
  }> = [
    { name: 'Administrador do Sistema', email: 'admin@cervejaria.com', role: Role.ADMIN, registration: '0001' },
    { name: 'Carlos Mendes (PCM)', email: 'pcm@cervejaria.com', role: Role.PCM, registration: '0002', sector: 'Manutenção' },
    { name: 'Roberto Silva (Supervisor)', email: 'supervisor@cervejaria.com', role: Role.SUPERVISOR, registration: '0003', sector: 'Manutenção' },
    { name: 'João Pereira', email: 'mecanico1@cervejaria.com', role: Role.MECANICO, specialty: Specialty.MECANICA, registration: '0004', sector: 'Manutenção' },
    { name: 'Marcos Souza', email: 'mecanico2@cervejaria.com', role: Role.MECANICO, specialty: Specialty.MECANICA, registration: '0005', sector: 'Manutenção' },
    { name: 'Felipe Rocha', email: 'eletricista1@cervejaria.com', role: Role.ELETRICISTA, specialty: Specialty.ELETRICA, registration: '0006', sector: 'Manutenção' },
    { name: 'Diego Alves', email: 'automacao@cervejaria.com', role: Role.ELETRICISTA, specialty: Specialty.AUTOMACAO, registration: '0007', sector: 'Manutenção' },
    { name: 'Ana Costa (Envase)', email: 'solicitante.envase@cervejaria.com', role: Role.SOLICITANTE, registration: '0008', sector: 'Envase' },
    { name: 'Bruno Lima (Brassagem)', email: 'solicitante.brassagem@cervejaria.com', role: Role.SOLICITANTE, registration: '0009', sector: 'Brassagem' },
  ];

  const users = [];
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        specialty: u.specialty,
        registration: u.registration,
        sectorId: u.sector ? sectorByName[u.sector].id : undefined,
      },
    });
    users.push(user);
  }

  const userByEmail = Object.fromEntries(users.map((u) => [u.email, u]));

  // ------------------------------------------------------------------
  // FORNECEDORES
  // ------------------------------------------------------------------
  const suppliers = await Promise.all(
    [
      { name: 'Rolamentos Industriais LTDA', cnpj: '12.345.678/0001-90', email: 'vendas@rolamentosind.com.br' },
      { name: 'AutoPeças Cervejeiras SA', cnpj: '23.456.789/0001-01', email: 'contato@apcervejeiras.com.br' },
      { name: 'Elétrica Industrial Norte', cnpj: '34.567.890/0001-12', email: 'comercial@eletricanorte.com.br' },
    ].map((s) =>
      prisma.supplier.upsert({
        where: { cnpj: s.cnpj },
        update: {},
        create: s,
      }),
    ),
  );

  // ------------------------------------------------------------------
  // ATIVOS (equipamentos típicos de uma cervejaria)
  // ------------------------------------------------------------------
  const assetsData = [
    { code: 'AT-001', tag: 'BR-COZ-01', name: 'Cozinha de Brassagem', sector: 'Brassagem', criticality: AssetCriticality.CRITICA, manufacturer: 'Ziemann Holvrieka' },
    { code: 'AT-002', tag: 'FR-TQ-01', name: 'Tanque de Fermentação 01', sector: 'Fermentação e Maturação', criticality: AssetCriticality.ALTA, manufacturer: 'Praj Industries' },
    { code: 'AT-003', tag: 'FR-TQ-02', name: 'Tanque de Fermentação 02', sector: 'Fermentação e Maturação', criticality: AssetCriticality.ALTA, manufacturer: 'Praj Industries' },
    { code: 'AT-004', tag: 'EN-LIN-01', name: 'Linha de Envase - Garrafas', sector: 'Envase', criticality: AssetCriticality.CRITICA, manufacturer: 'Krones' },
    { code: 'AT-005', tag: 'EN-LIN-02', name: 'Linha de Envase - Latas', sector: 'Envase', criticality: AssetCriticality.CRITICA, manufacturer: 'KHS' },
    { code: 'AT-006', tag: 'UT-COMP-01', name: 'Compressor de Ar Industrial 01', sector: 'Utilidades', criticality: AssetCriticality.ALTA, manufacturer: 'Atlas Copco' },
    { code: 'AT-007', tag: 'CO2-CHIL-01', name: 'Chiller de Amônia', sector: 'CO2 e Refrigeração', criticality: AssetCriticality.CRITICA, manufacturer: 'York' },
    { code: 'AT-008', tag: 'TA-OSMOSE-01', name: 'Sistema de Osmose Reversa', sector: 'Tratamento de Água', criticality: AssetCriticality.MEDIA, manufacturer: 'GE Water' },
  ];

  const assets = [];
  for (const a of assetsData) {
    const asset = await prisma.asset.upsert({
      where: { tag: a.tag },
      update: {},
      create: {
        code: a.code,
        tag: a.tag,
        name: a.name,
        manufacturer: a.manufacturer,
        sectorId: sectorByName[a.sector].id,
        criticality: a.criticality,
        status: AssetStatus.OPERACIONAL,
      },
    });
    assets.push(asset);
  }

  // ------------------------------------------------------------------
  // PEÇAS DE ESTOQUE
  // ------------------------------------------------------------------
  const parts = await Promise.all(
    [
      { code: 'PC-001', name: 'Rolamento 6205-2RS', unit: 'UN', quantity: 24, minStock: 10, unitCost: 45.9, supplierId: suppliers[0].id },
      { code: 'PC-002', name: 'Correia Industrial A-45', unit: 'UN', quantity: 8, minStock: 5, unitCost: 89.5, supplierId: suppliers[1].id },
      { code: 'PC-003', name: 'Contator Tripolar 40A', unit: 'UN', quantity: 3, minStock: 4, unitCost: 210.0, supplierId: suppliers[2].id },
      { code: 'PC-004', name: 'Óleo Lubrificante ISO VG 68', unit: 'L', quantity: 60, minStock: 20, unitCost: 22.3, supplierId: suppliers[0].id },
      { code: 'PC-005', name: 'Sensor de Nível Capacitivo', unit: 'UN', quantity: 2, minStock: 3, unitCost: 340.0, supplierId: suppliers[2].id },
    ].map((p) =>
      prisma.part.upsert({ where: { code: p.code }, update: {}, create: p }),
    ),
  );

  // ------------------------------------------------------------------
  // ORDENS DE SERVIÇO (refletindo as colunas originais da planilha)
  // ------------------------------------------------------------------
  const workOrdersData = [
    {
      code: 'OS-2026-000001',
      description: 'Vazamento de óleo no redutor da linha de envase de garrafas',
      specialty: Specialty.MECANICA,
      sector: 'Envase',
      type: MaintenanceType.CORRETIVA,
      priority: Priority.URGENTE,
      requester: 'solicitante.envase@cervejaria.com',
      assigned: 'mecanico1@cervejaria.com',
      status: WorkOrderStatus.EM_ANDAMENTO,
      asset: 'EN-LIN-01',
      slaHours: 4,
    },
    {
      code: 'OS-2026-000002',
      description: 'Painel elétrico do compressor 01 disjuntando intermitentemente',
      specialty: Specialty.ELETRICA,
      sector: 'Utilidades',
      type: MaintenanceType.CORRETIVA,
      priority: Priority.ALTA,
      requester: 'pcm@cervejaria.com',
      assigned: 'eletricista1@cervejaria.com',
      status: WorkOrderStatus.ABERTA,
      asset: 'UT-COMP-01',
      slaHours: 8,
    },
    {
      code: 'OS-2026-000003',
      description: 'Inspeção preventiva mensal do chiller de amônia',
      specialty: Specialty.REFRIGERACAO,
      sector: 'CO2 e Refrigeração',
      type: MaintenanceType.PREVENTIVA,
      priority: Priority.MEDIA,
      requester: 'pcm@cervejaria.com',
      assigned: 'mecanico2@cervejaria.com',
      status: WorkOrderStatus.CONCLUIDA,
      asset: 'CO2-CHIL-01',
      slaHours: 24,
    },
    {
      code: 'OS-2026-000004',
      description: 'Calibração de sensores de nível do sistema de osmose reversa',
      specialty: Specialty.INSTRUMENTACAO,
      sector: 'Tratamento de Água',
      type: MaintenanceType.CALIBRACAO,
      priority: Priority.BAIXA,
      requester: 'pcm@cervejaria.com',
      assigned: 'automacao@cervejaria.com',
      status: WorkOrderStatus.AGUARDANDO_PECA,
      asset: 'TA-OSMOSE-01',
      slaHours: 48,
    },
    {
      code: 'OS-2026-000005',
      description: 'Troca de correia do agitador do tanque de fermentação 01',
      specialty: Specialty.MECANICA,
      sector: 'Fermentação e Maturação',
      type: MaintenanceType.CORRETIVA,
      priority: Priority.ALTA,
      requester: 'solicitante.brassagem@cervejaria.com',
      assigned: 'mecanico1@cervejaria.com',
      status: WorkOrderStatus.EM_ANDAMENTO,
      asset: 'FR-TQ-01',
      slaHours: 8,
    },
  ];

  for (const wo of workOrdersData) {
    const asset = assets.find((a) => a.tag === wo.asset);
    await prisma.workOrder.upsert({
      where: { code: wo.code },
      update: {},
      create: {
        code: wo.code,
        description: wo.description,
        specialty: wo.specialty,
        sectorId: sectorByName[wo.sector].id,
        maintenanceType: wo.type,
        priority: wo.priority,
        requesterId: userByEmail[wo.requester].id,
        assignedToId: userByEmail[wo.assigned]?.id,
        assetId: asset?.id,
        status: wo.status,
        slaHours: wo.slaHours,
      },
    });
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log(`   - ${sectors.length} setores`);
  console.log(`   - ${users.length} usuários (senha padrão: Cmms@123)`);
  console.log(`   - ${suppliers.length} fornecedores`);
  console.log(`   - ${assets.length} ativos`);
  console.log(`   - ${parts.length} peças`);
  console.log(`   - ${workOrdersData.length} ordens de serviço`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
