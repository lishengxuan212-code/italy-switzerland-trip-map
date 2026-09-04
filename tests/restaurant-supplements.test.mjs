import assert from 'node:assert/strict';
import test from 'node:test';
import { DAY_ORDER } from '../restaurants-data.mjs';
import { supplementedAnchorsForDay } from '../restaurant-supplements.mjs';

test('renders exactly five candidates for every itinerary anchor', () => {
  for (const day of DAY_ORDER) {
    const anchors = supplementedAnchorsForDay(day);
    assert.ok(anchors.length > 0, `${day} should render itinerary anchors`);
    for (const anchor of anchors) {
      assert.equal(anchor.restaurants.length, 5, `${day} / ${anchor.anchorName}`);
      const additions = anchor.restaurants.slice(3);
      assert.deepEqual(additions.map((restaurant) => restaurant.rank), [4, 5]);
      for (const restaurant of additions) {
        assert.match(restaurant.level, /^[DE]官网核验新增$/);
        assert.match(restaurant.sourceStatus, /官网核验新增/);
        assert.equal(restaurant.distanceKm, null);
        assert.equal(restaurant.arrivalHint, '需以导航确认');
        assert.equal(restaurant.priceCny, null);
        assert.equal(restaurant.priceLocal, null);
        assert.match(restaurant.priceNote, /待官网确认/);
        assert.match(restaurant.booking, /团队需确认/);
        assert.match(restaurant.bookingNote, /未将官网公开信息推断/);
        assert.ok(restaurant.siteUrl.startsWith('https://'));
        assert.ok(restaurant.menuUrl.startsWith('https://'));
        assert.ok(restaurant.directionsUrl.startsWith('https://www.google.com/maps/dir/'));
      }
    }
  }
});

test('homestay dates never gain dinner recommendations', () => {
  for (const day of ['9/9', '9/10', '9/11']) {
    for (const anchor of supplementedAnchorsForDay(day)) {
      assert.match(anchor.meal, /仅午餐|午餐\/备用/);
      for (const restaurant of anchor.restaurants) {
        assert.doesNotMatch(restaurant.reason, /晚餐/);
        assert.doesNotMatch(restaurant.dishes, /晚餐/);
      }
    }
  }
});
