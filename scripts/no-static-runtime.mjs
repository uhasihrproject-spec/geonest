import fs from 'node:fs';
import assert from 'node:assert/strict';

const runtimeFiles = [
  'lib/mart/productsLocal.ts',
  'app/api/mart/products/route.ts',
  'app/api/mart/admin/products/route.ts',
  'app/api/mart/search/route.ts',
  'app/api/mart/assistant/route.ts',
];

for (const file of runtimeFiles) {
  const src = fs.readFileSync(file, 'utf8');
  assert.equal(src.includes('PRODUCTS'), false, `${file} still references static PRODUCTS`);
  assert.equal(src.includes('FEATURED_PRODUCTS'), false, `${file} still references static FEATURED_PRODUCTS`);
}

console.log('no static runtime data references detected');
