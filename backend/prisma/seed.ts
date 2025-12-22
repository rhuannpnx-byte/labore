import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // ====================================
  // CRIAR SUPERUSUÁRIO
  // ====================================
  const hashedPassword = await bcrypt.hash('Rh021197@', 10);

  const superuser = await prisma.user.upsert({
    where: { email: 'rhuann.nunes@tecpav.com' },
    update: {
      password: hashedPassword,
      name: 'Rhuann Nunes',
      role: 'SUPERADMIN',
      isActive: true
    },
    create: {
      email: 'rhuann.nunes@tecpav.com',
      password: hashedPassword,
      name: 'Rhuann Nunes',
      role: 'SUPERADMIN',
      isActive: true
    }
  });

  console.log('✅ Superusuário criado/atualizado:', {
    id: superuser.id,
    email: superuser.email,
    name: superuser.name,
    role: superuser.role
  });

  // ====================================
  // CRIAR EMPRESA DE EXEMPLO
  // ====================================
  const company = await prisma.company.upsert({
    where: { cnpj: '00.000.000/0001-00' },
    update: {},
    create: {
      name: 'TECPAV Engenharia',
      cnpj: '00.000.000/0001-00',
      email: 'contato@tecpav.com',
      phone: '(11) 98765-4321',
      address: 'Av. Principal, 1000 - São Paulo, SP'
    }
  });

  console.log('✅ Empresa criada:', {
    id: company.id,
    name: company.name
  });

  // ====================================
  // CRIAR PROJETOS DE EXEMPLO
  // ====================================
  const project1 = await prisma.project.create({
    data: {
      name: 'Obra Rodovia BR-101',
      code: 'BR-101-KM-450',
      description: 'Pavimentação e restauração da rodovia BR-101',
      status: 'ACTIVE',
      companyId: company.id,
      address: 'BR-101, KM 450 - Litoral Sul'
    }
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Viaduto Centro',
      code: 'VDT-CENTRO-01',
      description: 'Construção de viaduto no centro da cidade',
      status: 'ACTIVE',
      companyId: company.id,
      address: 'Av. Central, Centro - São Paulo, SP'
    }
  });

  console.log('✅ Projetos criados:', {
    project1: project1.name,
    project2: project2.name
  });

  // ====================================
  // CRIAR USUÁRIOS DE EXEMPLO
  // ====================================
  const adminPassword = await bcrypt.hash('admin123', 10);
  const engenheiroPassword = await bcrypt.hash('eng123', 10);
  const labPassword = await bcrypt.hash('lab123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@tecpav.com',
      password: adminPassword,
      name: 'Administrador TECPAV',
      role: 'ADMIN',
      companyId: company.id,
      phone: '(11) 98765-0001'
    }
  });

  const engenheiro = await prisma.user.create({
    data: {
      email: 'engenheiro@tecpav.com',
      password: engenheiroPassword,
      name: 'João Engenheiro',
      role: 'ENGENHEIRO',
      companyId: company.id,
      phone: '(11) 98765-0002'
    }
  });

  const laboratorista = await prisma.user.create({
    data: {
      email: 'laboratorista@tecpav.com',
      password: labPassword,
      name: 'Maria Laboratorista',
      role: 'LABORATORISTA',
      companyId: company.id,
      phone: '(11) 98765-0003'
    }
  });

  console.log('✅ Usuários criados:', {
    admin: admin.email,
    engenheiro: engenheiro.email,
    laboratorista: laboratorista.email
  });

  // ====================================
  // VINCULAR USUÁRIOS AOS PROJETOS
  // ====================================
  await prisma.userProject.createMany({
    data: [
      { userId: engenheiro.id, projectId: project1.id },
      { userId: engenheiro.id, projectId: project2.id },
      { userId: laboratorista.id, projectId: project1.id }
    ]
  });

  console.log('✅ Usuários vinculados aos projetos');

  // ====================================
  // CRIAR FORMULÁRIOS DE EXEMPLO
  // ====================================
  const form1 = await prisma.form.create({
    data: {
      title: 'Inspeção de Pavimentação',
      description: 'Formulário para inspeção de qualidade de pavimentação',
      status: 'ACTIVE',
      createdById: engenheiro.id,
      fields: {
        create: [
          {
            label: 'Espessura da Camada (cm)',
            fieldKey: 'espessura',
            type: 'NUMBER',
            required: true,
            order: 0
          },
          {
            label: 'Largura da Faixa (m)',
            fieldKey: 'largura',
            type: 'NUMBER',
            required: true,
            order: 1
          },
          {
            label: 'Comprimento (m)',
            fieldKey: 'comprimento',
            type: 'NUMBER',
            required: true,
            order: 2
          },
          {
            label: 'Temperatura do Asfalto (°C)',
            fieldKey: 'temperatura',
            type: 'NUMBER',
            required: true,
            order: 3
          },
          {
            label: 'Observações',
            fieldKey: 'observacoes',
            type: 'TEXTAREA',
            required: false,
            order: 4
          }
        ]
      },
      rules: {
        create: [
          {
            name: 'Volume Aplicado (m³)',
            ruleKey: 'volume',
            formula: '(espessura / 100) * largura * comprimento',
            order: 0
          },
          {
            name: 'Área Pavimentada (m²)',
            ruleKey: 'area',
            formula: 'largura * comprimento',
            order: 1
          }
        ]
      }
    },
    include: {
      fields: true,
      rules: true
    }
  });

  const form2 = await prisma.form.create({
    data: {
      title: 'Ensaio de Compactação',
      description: 'Formulário para ensaio de compactação de solo',
      status: 'ACTIVE',
      createdById: engenheiro.id,
      fields: {
        create: [
          {
            label: 'Peso do Solo Úmido (kg)',
            fieldKey: 'peso_umido',
            type: 'NUMBER',
            required: true,
            order: 0
          },
          {
            label: 'Peso do Solo Seco (kg)',
            fieldKey: 'peso_seco',
            type: 'NUMBER',
            required: true,
            order: 1
          },
          {
            label: 'Volume do Cilindro (cm³)',
            fieldKey: 'volume_cilindro',
            type: 'NUMBER',
            required: true,
            order: 2
          },
          {
            label: 'Número de Golpes',
            fieldKey: 'golpes',
            type: 'NUMBER',
            required: true,
            order: 3
          }
        ]
      },
      rules: {
        create: [
          {
            name: 'Umidade (%)',
            ruleKey: 'umidade',
            formula: '((peso_umido - peso_seco) / peso_seco) * 100',
            order: 0
          },
          {
            name: 'Densidade Seca (g/cm³)',
            ruleKey: 'densidade_seca',
            formula: '(peso_seco * 1000) / volume_cilindro',
            order: 1
          }
        ]
      }
    },
    include: {
      fields: true,
      rules: true
    }
  });

  console.log('✅ Formulários criados:', {
    form1: form1.title,
    form2: form2.title
  });

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📝 Credenciais criadas:');
  console.log('');
  console.log('   SUPERADMIN:');
  console.log('   Email: rhuann.nunes@tecpav.com');
  console.log('   Senha: Rh021197@');
  console.log('');
  console.log('   ADMIN:');
  console.log('   Email: admin@tecpav.com');
  console.log('   Senha: admin123');
  console.log('');
  console.log('   ENGENHEIRO:');
  console.log('   Email: engenheiro@tecpav.com');
  console.log('   Senha: eng123');
  console.log('');
  console.log('   LABORATORISTA:');
  console.log('   Email: laboratorista@tecpav.com');
  console.log('   Senha: lab123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
