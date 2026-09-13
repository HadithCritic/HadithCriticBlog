import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'node:fs';

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

console.log('Testing R2 connection...');
console.log('Endpoint:', endpoint);
console.log('AccessKeyId exists:', Boolean(accessKeyId));
console.log('SecretKey exists:', Boolean(secretAccessKey));

const s3 = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

try {
  const data = await s3.send(new ListBucketsCommand({}));
  console.log('Buckets found:', data.Buckets?.map(b => b.Name));
} catch (err) {
  console.error('R2 list failed:', err);
}
