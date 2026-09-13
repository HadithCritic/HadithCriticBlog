import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, createReadStream, statSync } from 'node:fs';
import { join } from 'node:path';

const BUCKET = 'hadithcritic-corpus';

const fromDevVars = (name) => {
  try {
    for (const line of readFileSync('.dev.vars', 'utf8').split(/\r?\n/)) {
      const eq = line.indexOf('=');
      if (eq > 0 && line.slice(0, eq).trim() === name) return line.slice(eq + 1).trim();
    }
  } catch {}
  return process.env[name];
};

const endpoint = fromDevVars('CLOUDFLARE_S3_API_ENDPOINT');
const accessKeyId = fromDevVars('CLOUDFLARE_ACCESS_KEY_ID');
const secretAccessKey = fromDevVars('CLOURDLARE_SECRET_ACCESS_KEY') || fromDevVars('CLOUDFLARE_SECRET_ACCESS_KEY');

if (!endpoint || !accessKeyId || !secretAccessKey) {
  console.error('Missing R2 credentials in .dev.vars');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const ROOT = process.cwd();
const CHUNKS_DIR = join(ROOT, 'dist-db', 'chunks');
const CONFIG_FILE = join(ROOT, 'dist-db', 'hadith-config.json');

async function uploadFile(key, filePath, contentType = 'application/octet-stream') {
  const fileStream = createReadStream(filePath);
  const size = statSync(filePath).size;
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileStream,
      ContentLength: size,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );
}

async function main() {
  console.log('='.repeat(60));
  console.log(`  UPLOADING CHUNKS TO CLOUDFLARE R2 (${BUCKET})`);
  console.log('='.repeat(60));

  // 1. Upload manifest config
  console.log('\n[1/2] Uploading hadith-config.json...');
  await uploadFile('hadith-config.json', CONFIG_FILE, 'application/json');
  console.log('  Uploaded hadith-config.json.');

  // 2. Upload chunk files
  const chunkFiles = readdirSync(CHUNKS_DIR).filter((f) => f.startsWith('silsilah.chunk.'));
  console.log(`\n[2/2] Uploading ${chunkFiles.length} chunk files...`);

  const t0 = Date.now();
  let completed = 0;
  const CONCURRENCY = 6;

  async function worker(files) {
    for (const file of files) {
      const fullPath = join(CHUNKS_DIR, file);
      const key = `chunks/${file}`;
      await uploadFile(key, fullPath, 'application/octet-stream');
      completed += 1;
      if (completed % 10 === 0 || completed === chunkFiles.length) {
        const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
        console.log(`  Uploaded ${completed}/${chunkFiles.length} chunks (${elapsed}s)...`);
      }
    }
  }

  // Partition files into concurrent batches
  const batches = Array.from({ length: CONCURRENCY }, () => []);
  chunkFiles.forEach((file, index) => {
    batches[index % CONCURRENCY].push(file);
  });

  await Promise.all(batches.map((batch) => worker(batch)));

  const totalTime = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('\n' + '='.repeat(60));
  console.log(`  UPLOAD COMPLETE: ${completed} chunks + manifest in ${totalTime}s`);
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('Upload failed:', err);
  process.exit(1);
});
