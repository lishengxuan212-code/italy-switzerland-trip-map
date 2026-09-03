# 独立餐厅清单网页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建可部署到 GitHub Pages 的独立 `restaurants.html`，让 8–12 人团队按日期查看 123 条餐厅候选、比较预约与餐标，并在手机上打开导航、菜单和官网。

**Architecture:** 使用 Python 从既有 `.xlsx` 导出经过字段校验的 ES module 数据；`restaurants.html` 作为原生 HTML/CSS/JavaScript 的静态客户端，按日期、锚点和预约筛选渲染内容。餐厅图片数据单独维护为第一方链接映射，页面懒加载并为失效图片提供官网替代操作。

**Tech Stack:** 静态 HTML、原生 CSS、ES modules、Node 内置测试、Python 3 + openpyxl（读取 Excel）。

**Spec:** `docs/superpowers/specs/2026-09-04-restaurants-page-design.md`

## Global Constraints

- 仅创建独立 `restaurants.html`，不得修改 `index.html` 的地图功能。
- 页面以日期为首要浏览维度，默认显示 9/4。
- 41 个锚点、123 条候选必须全部来自 `意大利瑞士行程_餐厅筛选清单.xlsx`。
- 9/9–9/11 不能呈现任何晚餐推荐；须展示民宿做饭提示。
- 每个餐厅均显示直线估算距离、预约等级、餐标、链接状态和至少一个外链。
- 图片只可使用餐厅官网或官方社媒的第一方公开链接；不下载、不重新托管、不使用无来源图库照片。
- 外链必须使用 `target="_blank"` 与 `rel="noopener"`。
- 所有主要触控操作不小于 44px，并实现 `prefers-reduced-motion` 降级。

---

## File Structure

- `scripts/export_restaurants_data.py`：读取 Excel 主清单并导出浏览器可导入的数据模块。
- `restaurants-data.mjs`：由导出脚本生成，导出 `RESTAURANT_DATA` 和 `DAY_ORDER`，不手工编辑。
- `restaurant-images.mjs`：维护每个日期 2–3 个第一方图片预览及其来源链接。
- `restaurants.html`：独立页面、样式与交互逻辑。
- `tests/restaurants-data.test.mjs`：验证导出数据、日期边界和链接字段。
- `tests/restaurants-page.test.mjs`：验证页面关键语义、外链安全属性与手机交互挂钩。

### Task 1: 建立 Excel 到网页数据的可验证导出

**Files:**
- Create: `scripts/export_restaurants_data.py`
- Create: `restaurants-data.mjs`
- Create: `tests/restaurants-data.test.mjs`

**Interfaces:**
- Consumes: `意大利瑞士行程_餐厅筛选清单.xlsx` 的 `逐点餐厅清单` 工作表。
- Produces: `restaurants-data.mjs`，导出 `DAY_ORDER: string[]`、`RESTAURANT_DATA: RestaurantAnchor[]` 和 `anchorsForDay(day): RestaurantAnchor[]`。
- `RestaurantAnchor` 结构为 `{ date, meal, anchorType, anchorName, restaurants }`；每个 `restaurants` 元素有 `rank`, `level`, `nameCn`, `name`, `address`, `distanceKm`, `arrivalHint`, `routeNote`, `freshScore`, `reason`, `dishes`, `menuStatus`, `menuUrl`, `siteUrl`, `mapUrl`, `directionsUrl`, `booking`, `bookingNote`, `priceLocal`, `currency`, `rateCny`, `priceCny`, `priceNote`, `verifiedAt`, `factBoundary`。

- [ ] **Step 1: 写失败的数据完整性测试**

```js
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
```

- [ ] **Step 2: 运行测试，确认在数据模块不存在时失败**

Run: `node --test tests/restaurants-data.test.mjs`

Expected: FAIL，提示 `restaurants-data.mjs` 不存在。

- [ ] **Step 3: 实现最小导出脚本和数据模块**

```python
from openpyxl import load_workbook
from pathlib import Path
import json

source = Path('意大利瑞士行程_餐厅筛选清单.xlsx')
rows = load_workbook(source, data_only=True)['逐点餐厅清单'].iter_rows(values_only=True)
headers = next(rows)
index = {name: i for i, name in enumerate(headers)}

def field(row, name):
    return row[index[name]]

# Group rows by (日期, 对应景点/酒店), sort by 序号, then write:
# export const DAY_ORDER = [...];
# export const RESTAURANT_DATA = [...];
# export function anchorsForDay(day) {
#     return RESTAURANT_DATA.filter(anchor =>
#         anchor.date == day or
#         (anchor.date == '9/9–9/11' and day in {'9/9', '9/10', '9/11'})
#     )
# }
```

Map every field named in the interface exactly once; keep `priceCny` as the cached Excel value. `DAY_ORDER` 必须为 9/4 至 9/12 的单日数组；保留原始 `9/9–9/11` 酒店记录，只由 `anchorsForDay('9/9'|'9/10'|'9/11')` 在三个页面复用。Fail with `ValueError` if the source lacks a required header, a group is not exactly three rows, or a URL is blank.

- [ ] **Step 4: 运行导出与数据测试**

Run: `python scripts/export_restaurants_data.py && node --test tests/restaurants-data.test.mjs`

Expected: PASS；输出 41 个锚点、123 家候选。

- [ ] **Step 5: 提交数据导出功能**

```bash
git add scripts/export_restaurants_data.py restaurants-data.mjs tests/restaurants-data.test.mjs
git commit -m "feat: export restaurant workbook data for web"
```

### Task 2: 加入第一方餐厅图片预览数据

**Files:**
- Create: `restaurant-images.mjs`
- Create: `tests/restaurant-images.test.mjs`

**Interfaces:**
- Consumes: `DAY_ORDER` 与 `RESTAURANT_DATA`。
- Produces: `DAY_PREVIEWS: Record<string, Preview[]>`，`Preview` 为 `{ restaurantName, imageUrl, sourceUrl, alt }`。
- 每个有用餐页面的日期至少 2 张预览，最多 3 张；每张的 `sourceUrl` 必须等于该餐厅的 `siteUrl` 或其官方社媒主页。

- [ ] **Step 1: 写失败的图片来源测试**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { DAY_ORDER } from '../restaurants-data.mjs';
import { DAY_PREVIEWS } from '../restaurant-images.mjs';

test('offers 2–3 source-labelled previews for each shown date', () => {
  for (const day of DAY_ORDER) {
    const previews = DAY_PREVIEWS[day];
    assert.ok(previews.length >= 2 && previews.length <= 3);
    for (const preview of previews) {
      assert.ok(preview.imageUrl.startsWith('https://'));
      assert.ok(preview.sourceUrl.startsWith('https://'));
      assert.match(preview.alt, /餐厅|菜品/);
    }
  }
});
```

- [ ] **Step 2: 运行测试，确认缺少图片模块时失败**

Run: `node --test tests/restaurant-images.test.mjs`

Expected: FAIL，提示 `restaurant-images.mjs` 不存在。

- [ ] **Step 3: 研究并填写来源可追溯的图片映射**

对每个日期从当日 A 候选中选 2–3 家，优先使用官网 `<meta property="og:image">` 或官方社媒公开图片链接。每条记录使用如下结构：

```js
export const DAY_PREVIEWS = {
  '9/4': [
    {
      restaurantName: 'Ristoro della Salute',
      imageUrl: 'https://www.ristorantecolosseo.it/wp/wp-content/uploads/2017/08/home-anteprima-facebook.jpg',
      sourceUrl: 'https://www.ristorantecolosseo.it/',
      alt: 'Ristoro della Salute 餐厅官网菜品或环境图'
    }
  ]
};
```

对图片 URL 执行 `curl.exe -L --max-time 15 -o NUL -w "%{http_code}"` 检查。只保留 200–399 状态的图片；找不到可用第一方图片的日期使用该餐厅官网的 `<img>` 页面链接作为 `sourceUrl`，并在页面显示“查看官网图片”替代项，不填第三方或生成图。

- [ ] **Step 4: 运行图片来源测试**

Run: `node --test tests/restaurant-images.test.mjs`

Expected: PASS；所有预览均有 HTTPS 图片、可点击第一方来源和可读替代文本。

- [ ] **Step 5: 提交图片预览数据**

```bash
git add restaurant-images.mjs tests/restaurant-images.test.mjs
git commit -m "feat: add sourced restaurant image previews"
```

### Task 3: 实现独立的手机优先餐厅决策页面

**Files:**
- Create: `restaurants.html`
- Modify: `restaurants-data.mjs`（只在导出字段不足时通过 Task 1 脚本重生成）
- Modify: `restaurant-images.mjs`（只在 Task 2 所有预览均没有匹配餐厅名时修正）
- Create: `tests/restaurants-page.test.mjs`

**Interfaces:**
- Consumes: `RESTAURANT_DATA`, `DAY_ORDER`, `DAY_PREVIEWS`, `anchorsForDay(day)`。
- Produces: 页面函数 `renderDay(day)`, `setBookingFilter(value)`, `toggleAnchor(key)`, `renderPreviews(day)`。
- `setBookingFilter` 接受 `all | walkin | reserve | team`；筛选只隐藏餐厅候选，不删除锚点标题。

- [ ] **Step 1: 写失败的页面结构测试**

```js
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
  assert.match(html, /prefers-reduced-motion/);
});
```

- [ ] **Step 2: 运行测试，确认页面尚不存在**

Run: `node --test tests/restaurants-page.test.mjs`

Expected: FAIL，提示 `restaurants.html` 不存在。

- [ ] **Step 3: 实现页面的语义结构与渲染逻辑**

构建 `restaurants.html`，使用 `type="module"` 导入数据和图片模块。实现：

```js
function renderDay(day) {
  const anchors = anchorsForDay(day);
  dayTitle.textContent = day;
  homestayNotice.hidden = !['9/9', '9/10', '9/11'].includes(day);
  previewRegion.replaceChildren(...renderPreviews(day));
  anchorList.replaceChildren(...anchors.map(renderAnchor));
}

function setBookingFilter(value) {
  activeBookingFilter = value;
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === value));
  });
  renderDay(activeDay);
}
```

每个锚点用 `<details>`/`<summary>` 实现无 JavaScript 时仍可展开的基本行为，并只让当天第一个锚点默认 `open`。每家餐厅须有：A/B/C 标签、距离、到达提示、预约、双币餐标、爽口菜、推荐理由、菜单状态、导航/菜单/官网三种操作。对“本次未核通”菜单状态，把菜单按钮文字改为“出发前核对”，且保留官网按钮。

- [ ] **Step 4: 实现移动优先样式与动效降级**

使用 CSS 变量 `--ink`, `--paper`, `--tomato`, `--sage` 定义暖白、深海军蓝、番茄红和草本绿。移动端单列、日期和筛选器横向滑动、按钮最小高度 44px；桌面端最大内容宽度 1100px，候选餐厅以三列比较但内容顺序不变。实现 `@media (prefers-reduced-motion: reduce)`，将过渡与动画设为 `none`。

图片预览必须使用：

```html
<a class="preview" href="${preview.sourceUrl}" target="_blank" rel="noopener">
  <img src="${preview.imageUrl}" loading="lazy" alt="${preview.alt}">
  <span>图片来自餐厅官网</span>
</a>
```

在 `img.onerror` 时隐藏图片、显示同一锚点内的“查看官网图片”文字链接；不得回退到非第一方图片。

- [ ] **Step 5: 运行页面结构与数据测试**

Run: `node --test tests/restaurants-data.test.mjs tests/restaurant-images.test.mjs tests/restaurants-page.test.mjs`

Expected: PASS。

- [ ] **Step 6: 提交独立餐厅网页**

```bash
git add restaurants.html restaurants-data.mjs restaurant-images.mjs tests/restaurants-page.test.mjs
git commit -m "feat: add mobile restaurant decision page"
```

### Task 4: 本地交互、响应式和部署前验证

**Files:**
- Modify: `restaurants.html`（只修复验证发现的问题）
- Modify: `tests/restaurants-page.test.mjs`（只补充发现问题的回归断言）

**Interfaces:**
- Consumes: Task 1–3 产物。
- Produces: 通过 375px 手机视口和桌面视口检查的静态页面。

- [ ] **Step 1: 启动静态服务器并检查页面加载**

Run: `python -m http.server 4173`

Expected: `http://localhost:4173/restaurants.html` 返回 200，模块数据正常加载。

- [ ] **Step 2: 用浏览器自动化检查核心交互**

验证以下操作：打开 9/4 默认页、切换到 9/10、选择“团队必须预订”、展开锚点、点击导航链接。断言 9/10 页面提示“晚餐民宿做饭”，页面不存在“晚餐推荐”，外链具备 `target=_blank` 与 `rel=noopener`。

- [ ] **Step 3: 检查 375px 与 1280px 布局**

在 375×812 下验证日期栏与筛选器可横向滚动、没有页面横向溢出、所有主要按钮高度至少 44px；在 1280×900 下验证候选比较布局可读。

- [ ] **Step 4: 检查图片降级和动效偏好**

临时阻止一张图片 URL，验证显示“查看官网图片”；开启 `prefers-reduced-motion: reduce`，验证 computed animation/transition 不产生非零持续时间。

- [ ] **Step 5: 运行完整测试并检查工作区差异**

Run: `node --test tests/*.test.mjs && git diff --check && git status --short`

Expected: 所有测试 PASS，`git diff --check` 无输出，未提交的文件仅为本任务预期产物。

- [ ] **Step 6: 提交验证修复**

```bash
git add restaurants.html tests/restaurants-page.test.mjs
git commit -m "test: verify restaurant page mobile interactions"
```

## Spec Coverage Review

- 日期优先、41 锚点、123 候选：Task 1 数据测试与 Task 3 渲染。
- 民宿做饭、预约与餐标边界：Task 1 测试、Task 3 提示与文案。
- 真实第一方餐厅图片、懒加载与失败降级：Task 2 和 Task 3。
- 手机端交互、可访问性、外链安全与减弱动效：Task 3 和 Task 4。
- 不修改现有地图：所有任务仅创建独立页面及其数据/测试文件。
