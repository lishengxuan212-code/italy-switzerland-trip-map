import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('restaurant page declares mobile controls and safe external links', async () => {
  const html = await readFile('restaurants.html', 'utf8');
  assert.match(html, /<main id="restaurant-app"/);
  assert.match(html, /aria-label="按日期查看餐厅"/);
  assert.match(html, /data-filter="team"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener"/);
  assert.match(html, /图片：\$\{escapeHtml\(preview\.restaurantName\)\} 官网/);
  assert.match(html, /prefers-reduced-motion/);
});
