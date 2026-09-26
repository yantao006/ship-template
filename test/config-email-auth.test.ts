import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { check } from '../scripts/site-check';
import { site, googleCallback, githubCallback } from '../src/lib/config';
import { FakeEmail, createEmailProvider } from '../src/lib/email';
import { notifyGenerationComplete, notifyCreditsExpiring, notifyRenewalFailed, notifyVerification } from '../src/lib/notifications';
import { verifyTurnstile } from '../src/lib/turnstile';

test('second site only changes site, wrangler resource names and env, not business code', async () => {
  const first = await check(resolve('.'));
  const second = await check(resolve('fixtures/second-site'));
  assert.deepEqual(first.errors,[]);
  assert.deepEqual(second.errors,[]);
  assert.equal(googleCallback(site), 'https://awesomejev.link/api/auth/callback/google');
  assert.equal(githubCallback(site), 'https://awesomejev.link/api/auth/callback/github');
  assert.equal(first.githubCallback, githubCallback(site));
  assert.equal(second.callback,'https://other.example/api/auth/callback/google');
  assert.notEqual(first.config.deploy.d1,second.config.deploy.d1);
  assert.notEqual(first.config.email.provider,second.config.email.provider);
  assert.ok((await check(resolve('.'),{},true)).errors.includes('GOOGLE_CLIENT_SECRET missing'));
  const strictEnv = {BETTER_AUTH_SECRET:'test',GOOGLE_CLIENT_ID:'test',GOOGLE_CLIENT_SECRET:'test',TURNSTILE_SECRET:'test',RESEND_API_KEY:'test',WAFFO_MERCHANT_ID:'test',WAFFO_PRIVATE_KEY:'test',WAFFO_PRODUCT_ID:'test',WAFFO_CALLBACK_PUBLIC_KEY:'test',SITE_URL:'https://other.example'};
  assert.deepEqual((await check(resolve('fixtures/second-site'),strictEnv,true)).errors,[]);
});

test('live Worker binds only the owned hostname, with per-site D1 and required auth secrets', () => {
  const config = JSON.parse(readFileSync('wrangler.jsonc','utf8'));
  assert.equal(config.name,'awesomejev-test');
  assert.deepEqual(config.routes,[{pattern:'awesomejev.link',custom_domain:true}]);
  assert.equal(config.vars.SITE_URL,'https://awesomejev.link');
  assert.equal(config.d1_databases[0].database_name,'awesomejev-db');
  assert.deepEqual(config.secrets.required,['BETTER_AUTH_SECRET','GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','WAFFO_MERCHANT_ID','WAFFO_PRIVATE_KEY','WAFFO_PRODUCT_ID','WAFFO_CALLBACK_PUBLIC_KEY']);
});

test('three notification functions dispatch to fake provider without real email', async () => {
  const email = new FakeEmail();
  await notifyGenerationComplete(email,site,'user@example.com');
  await notifyCreditsExpiring(email,site,'user@example.com',20,'2026-10-01');
  await notifyRenewalFailed(email,site,'user@example.com');
  assert.equal(email.sent.length,3);
  assert.match(email.sent[0].text,/history/);
  assert.match(email.sent[1].html,/20 credits/);
  assert.match(email.sent[2].subject,/Renewal failed/);
});

test('verification mail selects callback language and escapes dynamic HTML once', async () => {
  const email = new FakeEmail();
  const link = 'https://awesomejev.link/api/auth/verify-email?token=a&callbackURL=%2Fzh%2Fdashboard';
  await notifyVerification(email, { ...site, brand: '<Video & Co>' }, 'user@example.com', link);
  assert.equal(email.sent[0].subject, '验证 <Video & Co> 邮箱');
  assert.match(email.sent[0].text, /打开此链接以验证邮箱/);
  assert.match(email.sent[0].html, /href="https:\/\/awesomejev.link\/api\/auth\/verify-email\?token=a&amp;callbackURL=/);
  assert.doesNotMatch(email.sent[0].html, /&amp;amp;/);
  assert.doesNotMatch(email.sent[0].html, /<Video & Co>/);
});

test('provider selection fails closed and Resend propagates failure', async () => {
  assert.throws(() => createEmailProvider(site,{DB:null as never}),/EMAIL binding missing/);
  const other = (await check(resolve('fixtures/second-site'))).config;
  assert.throws(() => createEmailProvider(other,{DB:null as never}),/RESEND_API_KEY missing/);
  const provider = createEmailProvider(other,{DB:null as never, RESEND_API_KEY:'local-not-real'},async () => new Response(JSON.stringify({id:'mock-id'}),{status:200}));
  assert.equal((await notifyRenewalFailed(provider,other,'user@example.com')).id,'mock-id');
});

test('Turnstile local token restricted to localhost and fail closed elsewhere', async () => {
  const env = { DB:null as never, LOCAL_AUTH_TEST:'1',SITE_URL:'http://localhost:3000' };
  assert.equal(await verifyTurnstile(env,'local-test-token','localhost'),true);
  assert.equal(await verifyTurnstile(env,'local-test-token','awesomejev.link'),false);
  assert.equal(await verifyTurnstile({...env,SITE_URL:'https://awesomejev.link'},'local-test-token','localhost'),false);
});
