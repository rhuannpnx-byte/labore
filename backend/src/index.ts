import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { formRoutes } from './routes/form.routes';
import { submissionRoutes } from './routes/submission.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import companyRoutes from './routes/company.routes';
import projectRoutes from './routes/project.routes';
import reportRoutes from './routes/report.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Labore Forms API is running' });
});

// Seed endpoint (TEMPORÁRIO - remover depois do primeiro uso)
app.post('/api/seed', async (req, res) => {
  try {
    const prisma = new PrismaClient();
    console.log('🌱 Executando seed...');

    // Criar empresa
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

    // Criar usuários
    const users = [
      {
        email: 'rhuann.nunes@tecpav.com',
        password: await bcrypt.hash('Rh021197@', 10),
        name: 'Rhuann Nunes',
        role: 'SUPERADMIN',
        companyId: null
      },
      {
        email: 'admin@tecpav.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Administrador TECPAV',
        role: 'ADMIN',
        companyId: company.id
      },
      {
        email: 'engenheiro@tecpav.com',
        password: await bcrypt.hash('eng123', 10),
        name: 'João Engenheiro',
        role: 'ENGENHEIRO',
        companyId: company.id
      },
      {
        email: 'laboratorista@tecpav.com',
        password: await bcrypt.hash('lab123', 10),
        name: 'Maria Laboratorista',
        role: 'LABORATORISTA',
        companyId: company.id
      }
    ];

    for (const userData of users) {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: { password: userData.password },
        create: userData
      });
    }

    await prisma.$disconnect();

    console.log('✅ Seed executado com sucesso!');
    res.json({
      success: true,
      message: 'Seed executado com sucesso! Usuários criados.',
      users: users.map(u => ({ email: u.email, role: u.role }))
    });
  } catch (error: any) {
    console.error('❌ Erro no seed:', error);
    res.status(500).json({ error: 'Erro ao executar seed', details: error.message });
  }
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api/health`);
});

