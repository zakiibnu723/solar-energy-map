import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const datasetDir = path.join(process.cwd(), 'public', 'dataset', 'Provinsi');

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function main() {
  console.log('🚀 Starting SolarMap database seeding...');

  if (!fs.existsSync(datasetDir)) {
    console.error('❌ Dataset directory not found at:', datasetDir);
    return;
  }

  const provFolders = fs.readdirSync(datasetDir).filter((f) => {
    const fullPath = path.join(datasetDir, f);
    return fs.lstatSync(fullPath).isDirectory() && !f.includes('copy');
  });

  console.log(`📁 Found ${provFolders.length} provinces to seed.`);

  for (const provName of provFolders) {
    const provPath = path.join(datasetDir, provName);
    const yearlyFile = path.join(provPath, `${provName}_Yearly.json`);
    const monthlyFile = path.join(provPath, `${provName}_Monthly.json`);
    const dailyFile = path.join(provPath, `${provName}_Daily.json`);

    let avgGhi = 0;
    let numKab = 0;

    if (fs.existsSync(yearlyFile)) {
      try {
        const provYearlyData = JSON.parse(fs.readFileSync(yearlyFile, 'utf8'));
        numKab = provYearlyData.num_kab || 0;
        const shortwave = provYearlyData.data?.shortwave_radiation || [];
        if (shortwave.length > 0) {
          avgGhi = shortwave.reduce((sum: number, v: number) => sum + v, 0) / shortwave.length;
        }

        // Seed Province SolarData for Yearly
        await prisma.solarData.upsert({
          where: {
            locationType_locationName_frequency: {
              locationType: 'PROVINCE',
              locationName: provName,
              frequency: 'Yearly',
            },
          },
          update: {
            dataJson: JSON.stringify(provYearlyData.data),
          },
          create: {
            locationType: 'PROVINCE',
            locationName: provName,
            provName: provName,
            frequency: 'Yearly',
            dataJson: JSON.stringify(provYearlyData.data),
          },
        });
      } catch (err) {
        console.warn(`Warning reading yearly data for ${provName}:`, err);
      }
    }

    if (fs.existsSync(monthlyFile)) {
      try {
        const provMonthlyData = JSON.parse(fs.readFileSync(monthlyFile, 'utf8'));
        await prisma.solarData.upsert({
          where: {
            locationType_locationName_frequency: {
              locationType: 'PROVINCE',
              locationName: provName,
              frequency: 'Monthly',
            },
          },
          update: {
            dataJson: JSON.stringify(provMonthlyData.data),
          },
          create: {
            locationType: 'PROVINCE',
            locationName: provName,
            provName: provName,
            frequency: 'Monthly',
            dataJson: JSON.stringify(provMonthlyData.data),
          },
        });
      } catch (e) {}
    }

    if (fs.existsSync(dailyFile)) {
      try {
        const provDailyData = JSON.parse(fs.readFileSync(dailyFile, 'utf8'));
        await prisma.solarData.upsert({
          where: {
            locationType_locationName_frequency: {
              locationType: 'PROVINCE',
              locationName: provName,
              frequency: 'Daily',
            },
          },
          update: {
            dataJson: JSON.stringify(provDailyData.data),
          },
          create: {
            locationType: 'PROVINCE',
            locationName: provName,
            provName: provName,
            frequency: 'Daily',
            dataJson: JSON.stringify(provDailyData.data),
          },
        });
      } catch (e) {}
    }

    // Upsert Province
    await prisma.province.upsert({
      where: { name: provName },
      update: {
        avgGhi,
        numKab,
      },
      create: {
        name: provName,
        slug: slugify(provName),
        avgGhi,
        numKab,
      },
    });

    // Sub-districts
    const kabFolders = fs.readdirSync(provPath).filter((f) => {
      return fs.lstatSync(path.join(provPath, f)).isDirectory();
    });

    for (const kabName of kabFolders) {
      const kabPath = path.join(provPath, kabName);
      const kabYearlyFile = path.join(kabPath, `${kabName}_Yearly.json`);
      const kabMonthlyFile = path.join(kabPath, `${kabName}_Monthly.json`);
      const kabDailyFile = path.join(kabPath, `${kabName}_Daily.json`);

      let kabAvgGhi = 0;
      let latitude: number | null = null;
      let longitude: number | null = null;

      if (fs.existsSync(kabYearlyFile)) {
        try {
          const kabData = JSON.parse(fs.readFileSync(kabYearlyFile, 'utf8'));
          latitude = kabData.latitude ? Number(kabData.latitude) : null;
          longitude = kabData.longitude ? Number(kabData.longitude) : null;
          const shortwave = kabData.data?.shortwave_radiation || [];
          if (shortwave.length > 0) {
            kabAvgGhi = shortwave.reduce((s: number, v: number) => s + v, 0) / shortwave.length;
          }

          await prisma.solarData.upsert({
            where: {
              locationType_locationName_frequency: {
                locationType: 'DISTRICT',
                locationName: kabName,
                frequency: 'Yearly',
              },
            },
            update: {
              dataJson: JSON.stringify(kabData.data),
            },
            create: {
              locationType: 'DISTRICT',
              locationName: kabName,
              provName: provName,
              frequency: 'Yearly',
              dataJson: JSON.stringify(kabData.data),
            },
          });
        } catch (err) {}
      }

      if (fs.existsSync(kabMonthlyFile)) {
        try {
          const kabData = JSON.parse(fs.readFileSync(kabMonthlyFile, 'utf8'));
          await prisma.solarData.upsert({
            where: {
              locationType_locationName_frequency: {
                locationType: 'DISTRICT',
                locationName: kabName,
                frequency: 'Monthly',
              },
            },
            update: {
              dataJson: JSON.stringify(kabData.data),
            },
            create: {
              locationType: 'DISTRICT',
              locationName: kabName,
              provName: provName,
              frequency: 'Monthly',
              dataJson: JSON.stringify(kabData.data),
            },
          });
        } catch (err) {}
      }

      if (fs.existsSync(kabDailyFile)) {
        try {
          const kabData = JSON.parse(fs.readFileSync(kabDailyFile, 'utf8'));
          await prisma.solarData.upsert({
            where: {
              locationType_locationName_frequency: {
                locationType: 'DISTRICT',
                locationName: kabName,
                frequency: 'Daily',
              },
            },
            update: {
              dataJson: JSON.stringify(kabData.data),
            },
            create: {
              locationType: 'DISTRICT',
              locationName: kabName,
              provName: provName,
              frequency: 'Daily',
              dataJson: JSON.stringify(kabData.data),
            },
          });
        } catch (err) {}
      }

      await prisma.district.upsert({
        where: {
          provName_name: {
            provName,
            name: kabName,
          },
        },
        update: {
          avgGhi: kabAvgGhi,
          latitude,
          longitude,
        },
        create: {
          name: kabName,
          slug: slugify(kabName),
          provName,
          latitude,
          longitude,
          avgGhi: kabAvgGhi,
        },
      });
    }

    console.log(`✅ Seeded ${provName} with ${kabFolders.length} districts.`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
