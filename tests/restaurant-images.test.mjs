import assert from 'node:assert/strict';
import test from 'node:test';
import { DAY_ORDER } from '../restaurants-data.mjs';
import { DAY_PREVIEWS } from '../restaurant-images.mjs';

test('uses only sourced previews and retains a meaningful image selection', () => {
  let count = 0;
  for (const day of DAY_ORDER) {
    const previews = DAY_PREVIEWS[day] ?? [];
    assert.ok(previews.length <= 3);
    count += previews.length;
    for (const preview of previews) {
      assert.ok(preview.imageUrl.startsWith('https://'));
      assert.ok(preview.sourceUrl.startsWith('https://'));
      assert.match(preview.alt, /餐厅|菜品/);
    }
  }
  assert.ok(count >= 12);
});
