import assert from 'node:assert/strict';
import test from 'node:test';
import { DAY_ORDER, RESTAURANT_DATA } from '../restaurants-data.mjs';

test('exports all itinerary anchors and candidates', () => {
  assert.equal(RESTAURANT_DATA.length, 41);
  assert.equal(RESTAURANT_DATA.flatMap(item => item.restaurants).length, 123);
  assert.deepEqual(DAY_ORDER, ['9/4','9/5','9/6','9/7','9/8','9/9','9/10','9/11','9/12']);
});

test('contains required decision fields and no dinner recommendation during homestay nights', () => {
  for (const anchor of RESTAURANT_DATA) {
    assert.equal(anchor.restaurants.length, 3);
    for (const restaurant of anchor.restaurants) {
      assert.ok(restaurant.distanceKm !== null);
      assert.ok(restaurant.booking);
      assert.ok(restaurant.priceCny > 0);
      assert.ok(restaurant.directionsUrl.startsWith('https://www.google.com/maps/'));
    }
    if (['9/9–9/11', '9/10', '9/11'].includes(anchor.date)) {
      assert.match(anchor.meal, /仅午餐|午餐\/备用/);
    }
  }
});
