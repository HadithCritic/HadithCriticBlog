import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('browser source does not contain server credentials, publication tokens or server module imports',async()=>{
  for(const path of ['../public/studio.js','../public/editor.js','../public/index.html','../public/dashboard.js','../public/views/common.js','../public/views/newsletter.js','../public/views/analytics.js','../public/views/health.js','../public/views/activity.js']){
    const source=await readFile(new URL(path,import.meta.url),'utf8');
    for(const marker of ['STUDIO_GITHUB_PRIVATE_KEY','STUDIO_GITHUB_APP_ID','access_tokens','src/auth.mjs','src/worker.mjs','BEGIN PRIVATE KEY','STUDIO_RESEND_API_KEY','STUDIO_CF_ANALYTICS_TOKEN','api.resend.com','api.cloudflare.com'])assert.ok(!source.includes(marker),`${path}: ${marker}`);
  }
});
test('config runs authorization before assets and enables publication only with its preconditions',async()=>{
  const config=await readFile(new URL('../wrangler.toml',import.meta.url),'utf8');
  assert.match(config,/run_worker_first = true/);assert.match(config,/workers_dev = false/);assert.match(config,/preview_urls = false/);
  if(/STUDIO_PUBLISH_ENABLED = "true"/.test(config)){
    assert.match(config,/STUDIO_BRANCH_PROTECTION_VERIFIED = "true"/);assert.match(config,/STUDIO_PUBLISH_BRANCH = "[\w./-]+"/);
  }
  // The config is public: credentials and identity belong in Worker secrets.
  for(const marker of ['STUDIO_GITHUB_','STUDIO_OWNER_','STUDIO_AUD','STUDIO_TEAM_DOMAIN','PRIVATE KEY','@'])assert.ok(!config.includes(marker),marker);
});
