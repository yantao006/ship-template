import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Miniflare } from 'miniflare';
import { createAuth, ensureSignupCredits } from '../src/lib/auth';
import { balance } from '../src/lib/ledger';
import type { Env } from '../src/lib/env';

test('local better-auth sign-up creates site-local user and grants signup credits exactly once', async () => {
  const mf = new Miniflare({ modules:true, script:'export default { fetch() { return new Response("ok") } }', d1Databases:{DB:'auth-test'} });
  try {
    const db = await mf.getD1Database('DB') as unknown as Env['DB'];
    for (const sql of readFileSync('migrations/0001_initial.sql','utf8').split(';').map(s=>s.trim()).filter(Boolean)) await db.prepare(sql).run();
    const env: Env = { DB: db, SITE_URL:'http://localhost:3000', LOCAL_AUTH_TEST:'1', BETTER_AUTH_SECRET:'this-is-only-a-local-test-secret-long-enough' };
    const auth = createAuth(env);
    assert.equal(auth.options.baseURL,'http://localhost:3000');
    assert.equal(createAuth({...env,SITE_URL:'http://localhost:8787'}).options.baseURL,'http://localhost:8787');
    assert.throws(() => createAuth({...env,LOCAL_AUTH_TEST:undefined,SITE_URL:'https://another.example',GOOGLE_CLIENT_ID:'test-id',GOOGLE_CLIENT_SECRET:'test-secret'}),/SITE_URL must match/);
    const result = await auth.api.signUpEmail({body:{ name:'Test User',email:'test@example.com',password:'a-long-local-test-password' }});
    assert.ok(result.user.id);
    assert.equal(await balance(db,result.user.id),30);
    assert.equal(await ensureSignupCredits(env,result.user.id),false);
    assert.equal(await balance(db,result.user.id),30);
    const users = await db.prepare('SELECT COUNT(*) AS n FROM user').first<{n:number}>();
    assert.equal(users?.n,1);
  } finally { await mf.dispose(); }
});
