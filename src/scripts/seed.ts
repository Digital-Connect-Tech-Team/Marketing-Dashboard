import { execSync } from 'child_process';

async function main() {
  console.log('🌱 Running Seed Scripts...');

  try {
    execSync('tsx src/scripts/create-master-account.ts', { stdio: 'inherit' });
    execSync('tsx src/scripts/seed-domains.ts', { stdio: 'inherit' });
    execSync('tsx src/scripts/seed-roles.ts', { stdio: 'inherit' });

    console.log('✅ Seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();
