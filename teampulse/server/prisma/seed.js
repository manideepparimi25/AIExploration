import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Keep re-seeding idempotent for tasks/statuses/comments; users are upserted.
  await prisma.comment.deleteMany();
  await prisma.status.deleteMany();
  await prisma.task.deleteMany();

  const leadPass = await bcrypt.hash('password123', 10);
  const memberPass = await bcrypt.hash('password123', 10);

  const lead = await prisma.user.upsert({
    where: { email: 'lead@teampulse.dev' },
    update: {},
    create: {
      name: 'Avery Lead',
      email: 'lead@teampulse.dev',
      passwordHash: leadPass,
      role: 'LEAD',
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@teampulse.dev' },
    update: {},
    create: {
      name: 'Sam Member',
      email: 'member@teampulse.dev',
      passwordHash: memberPass,
      role: 'MEMBER',
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Set up CI pipeline',
        description: 'Add lint + test gates before deploys',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assigneeId: member.id,
        createdById: lead.id,
      },
      {
        title: 'Design status board',
        description: 'Cards for each member on the team board',
        status: 'TODO',
        priority: 'MEDIUM',
        assigneeId: member.id,
        createdById: lead.id,
      },
      {
        title: 'Seed the database',
        description: 'Sample data for the demo',
        status: 'DONE',
        priority: 'LOW',
        assigneeId: lead.id,
        createdById: lead.id,
      },
    ],
  });

  const today = new Date().toISOString().slice(0, 10);
  await prisma.status.upsert({
    where: { userId_date: { userId: member.id, date: today } },
    update: {},
    create: {
      userId: member.id,
      workingOn: 'Wiring up the Tasks page',
      blockers: 'Waiting on API review',
      date: today,
    },
  });
  await prisma.status.upsert({
    where: { userId_date: { userId: lead.id, date: today } },
    update: {},
    create: {
      userId: lead.id,
      workingOn: 'Reviewing the dashboard',
      blockers: '',
      date: today,
    },
  });

  console.log('Seed complete. Demo logins:');
  console.log('  lead@teampulse.dev / password123');
  console.log('  member@teampulse.dev / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
