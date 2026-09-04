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
  assert.match(html, /supplementedAnchorsForDay/);
  assert.match(html, /每点 5 个候选/);
  assert.match(html, /官网核验新增/);
  assert.match(html, /待官网确认/);
  assert.match(html, /需以导航确认/);
  assert.match(html, /prefers-reduced-motion/);
});
