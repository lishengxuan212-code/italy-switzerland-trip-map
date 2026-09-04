// Supplemental D/E candidates. Kept separate from the workbook export so the
// original A/B/C research remains traceable and reproducible.
import { anchorsForDay } from './restaurants-data.mjs';

const ITALY_RATE_NOTE = '餐标待官网确认（不以猜测价格替代）；请查看菜单并询问 coperto / 团体套餐。';
const SWISS_RATE_NOTE = '餐标待官网确认（不以猜测价格替代）；请查看菜单并询问 8–12 人是否可同桌。';

const pools = {
  termini: [
    ['拉·法米利亚餐厅', 'La Famiglia dal 1968', 'Via Gaeta 66, Roma', 'https://www.ristorantelafamiglia.it/en/', 'https://www.ristorantelafamiglia.it/en/booking/'],
    ['米诺餐厅', 'Ristorante Mino', 'Via Milazzo 18 / Via Magenta 48, Roma', 'https://www.ristorantemino.it/', 'https://www.ristorantemino.it/ristorante/'],
  ],
  colosseum: [
    ['达·克莱托餐厅', 'Ristorante da Cleto', 'Via del Cardello 28, Roma', 'https://www.ristorantecleto.it/', 'https://www.ristorantecleto.it/menu/'],
    ['沃拉雷餐厅', 'Ristorante Volare', 'Via di San Giovanni in Laterano 48, Roma', 'https://www.ristorantevolareroma.com/restaurant', 'https://www.ristorantevolareroma.com/it/men%C3%B9'],
  ],
  trevi: [
    ['酸甜餐厅', 'Agrodolce Ristorante', 'Via dei Crociferi 25, Roma', 'https://www.agrodolceroma.it/', 'https://www.agrodolceroma.it/'],
    ['特里维奥古老披萨餐厅', 'L’Antica Pizzeria di Trevi', 'Via dei Lucchesi 27/28, Roma', 'https://ristorantetrivioroma.com/en/about/', 'https://ristorantetrivioroma.com/en/menu/'],
  ],
  vatican: [
    ['松果庭小酒馆', 'Bistrot La Pigna', 'Viale Vaticano, 00165 Roma（梵蒂冈博物馆内）', 'https://www.museivaticani.va/content/museivaticani/en/organizza-visita/servizi-per-i-visitatori/ristorazione/caffe-la-pigna.html', 'https://www.museivaticani.va/content/museivaticani/en/organizza-visita/servizi-per-i-visitatori/ristorazione/caffe-la-pigna.html'],
    ['伊尔·福尔诺咖啡厅', 'Caffetteria Il Forno', 'Viale Vaticano, Vatican Museums 服务区（具体位置以馆内指引为准）', 'https://www.museivaticani.va/content/museivaticani/en/organizza-visita/servizi-per-i-visitatori/ristorazione.html', 'https://www.museivaticani.va/content/museivaticani/en/organizza-visita/servizi-per-i-visitatori/ristorazione.html'],
  ],
  pienza: [
    ['拉班迪塔联排别墅餐厅', 'La Bandita Townhouse', 'Corso il Rossellino 111, Pienza', 'https://www.labanditatownhouse.com/', 'https://www.labanditatownhouse.com/'],
    ['伊尔·罗塞利诺餐厅', 'Il Rossellino', 'Piazza di Spagna 4, Pienza', 'https://ilrossellinopienza.com/', 'https://ilrossellinopienza.com/'],
  ],
  montepulciano: [
    ['拉格罗塔餐厅', 'La Grotta', 'Via San Biagio 15, Montepulciano', 'https://www.lagrottamontepulciano.com/', 'https://www.lagrottamontepulciano.com/'],
    ['巴科之门小酒馆', 'Osteria Porta di Bacco', 'Via di Gracciano nel Corso 94, Montepulciano', 'https://portadibacco.it/', 'https://portadibacco.it/'],
  ],
  siena: [
    ['莱洛杰小酒馆', 'Osteria Le Logge', 'Via del Porrione 33, Siena', 'https://osterialelogge.it/home-osteria', 'https://osterialelogge.it/home-osteria'],
    ['伊尔维纳约小酒馆', 'Osteria Alimentari Il Vinaio', 'Via Camollia 138, Siena', 'https://osteriailvinaio.it/en/', 'https://osteriailvinaio.it/en/'],
  ],
  sangimignano: [
    ['佩鲁卡餐厅', 'Perucà', 'Via Capassi 16, San Gimignano', 'https://www.peruca.eu/en', 'https://www.peruca.eu/en'],
    ['露台餐厅', 'Le Terrazze', 'Piazza della Cisterna 23, San Gimignano', 'https://www.hotelcisterna.it/en/le-terrazze-restaurant.html', 'https://www.hotelcisterna.it/en/le-terrazze-restaurant.html'],
  ],
  florence: [
    ['扎扎小馆', 'Trattoria Za Za', 'Piazza del Mercato Centrale 26r, Firenze', 'https://www.trattoriazaza.it/', 'https://www.trattoriazaza.it/'],
    ['圣·贝维托雷餐厅', 'Il Santo Bevitore', 'Via Santo Spirito 64/66r, Firenze', 'https://www.ilsantobevitore.com/', 'https://www.ilsantobevitore.com/'],
  ],
  piazzale: [
    ['丰塔纳木屋餐厅', 'Chalet Fontana', 'Viale Galileo Galilei 7, Firenze', 'https://www.chalet-fontana.com/', 'https://www.chalet-fontana.com/'],
    ['科拉别墅小酒馆', 'Le Bistrot at Villa Cora', 'Viale Machiavelli 18, Firenze', 'https://villacora.it/en/dining-bar/restaurant-le-bistrot', 'https://villacora.it/en/dining-bar/restaurant-le-bistrot'],
  ],
  mestre: [
    ['乌尼科·梅斯特餐厅', 'Unico Mestre', 'Viale Ancona 12, Mestre', 'https://www.unicoristoranti.it/mestre', 'https://www.unicoristoranti.it/mestre'],
    ['55小酒馆', 'Bistrot55', 'Mestre 中心，具体门牌请以官网/导航为准', 'https://www.bistrot55.it/', 'https://www.bistrot55.it/'],
  ],
  venice: [
    ['马里奥·阿拉法瓦餐厅', 'Da Mario alla Fava', 'Calle dei Stagneri 5242, Venezia', 'https://www.ristorantemarioallafava.it/en/', 'https://www.ristorantemarioallafava.it/en/'],
    ['威尼斯中央餐厅', 'Ristorante Centrale Venice', 'Venice 中心，具体门牌请以官网/导航为准', 'https://www.centralevenice.com/', 'https://www.centralevenice.com/'],
  ],
  interlaken: [
    ['乔蒂瓦拉餐厅', 'Chotivala', 'Centralstrasse 29, Interlaken', 'https://www.chotivalaswiss.com/', 'https://www.chotivalaswiss.com/'],
    ['3a 餐厅', 'Restaurant 3a', 'Untere Bönigstrasse 3, Interlaken', 'https://www.3a-interlaken.ch/deutsch/home/home.html?a=35&level=1', 'https://3a-interlaken.ch/downloads/Menukarte_3a.pdf'],
  ],
  spiez: [
    ['普里莫·阿莫雷餐厅', 'Primo Amore', 'Spiez 区，具体门牌请以官网/导航为准', 'https://www.primoamore.ch/', 'https://www.primoamore.ch/'],
    ['阿巴卢萨餐厅', 'Appaloosa', 'Thunstrasse 45, Spiez', 'https://www.appaloosa-saloon.ch/', 'https://www.appaloosa-saloon.ch/'],
  ],
  lungern: [
    ['坎蒂纳·卡维尔纳餐厅', 'Cantina Caverna', 'Lungern 区，具体门牌请以官网/导航为准', 'https://www.cantinacaverna.ch/', 'https://www.cantinacaverna.ch/'],
    ['图伦餐厅', 'Turren', 'Turren / Lungern 区，具体门牌请以官网/导航为准', 'https://www.turren.ch/', 'https://www.turren.ch/'],
  ],
  grindelwald: [
    ['格伦德餐厅', 'Restaurant Grund', 'Grundstrasse 63, Grindelwald', 'https://restaurant-grund.ch/angebot/restaurant/', 'https://restaurant-grund.ch/angebot/restaurant/'],
    ['贝尔维德餐厅', 'Restaurant Belvedere', 'Dorfstrasse 53, Grindelwald', 'https://www.belvedere-grindelwald.ch/en/restaurant/restaurant-belvedere/', 'https://www.belvedere-grindelwald.ch/en/restaurant/restaurant-belvedere/'],
  ],
  zurich: [
    ['新小酒馆', 'Neue Taverne', 'Werdmühlestrasse 3, Zürich', 'https://neuetaverne.ch/', 'https://neuetaverne.ch/'],
    ['市场厨房', 'Marktküche', 'Feldstrasse 98, Zürich', 'https://marktkueche.ch/', 'https://marktkueche.ch/'],
  ],
  airport: [
    ['巴别餐厅', 'Babel', 'The Circle 41, 8058 Zürich', 'https://www.hyattrestaurants.com/en/zurich-airport/restaurant/babel-restaurant-zurich-the-circle', 'https://www.hyattrestaurants.com/en/zurich-airport/restaurant/babel-restaurant-zurich-the-circle'],
    ['祖姆餐厅', 'ZOOM Restaurant', 'The Circle 1, 8058 Zürich', 'https://www.hyattrestaurants.com/en/zurich-airport/restaurant/zoom-restaurant-the-circle-zurich-airport', 'https://www.hyattrestaurants.com/en/zurich-airport/restaurant/zoom-restaurant-the-circle-zurich-airport'],
  ],
};

const zoneByAnchor = new Map([
  ['Best Western Plus Hotel Universo', 'termini'], ['斗兽场 Colosseo', 'colosseum'], ['许愿池 Fontana di Trevi', 'trevi'], ['梵蒂冈博物馆 Musei Vaticani', 'vatican'], ['西斯廷礼拜堂 Cappella Sistina', 'vatican'],
  ['皮恩扎 Pienza / Piazza Pio II', 'pienza'], ['Madonna di Vitaleta 小教堂', 'pienza'], ["奥尔恰谷 Val d'Orcia 观景区", 'pienza'], ['蒙特普尔恰诺 Montepulciano', 'montepulciano'], ['Piazza Grande, Montepulciano', 'montepulciano'], ['蒙特普尔恰诺民宿｜Via di Collazzi 78', 'montepulciano'],
  ['Piazza del Campo 贝壳广场', 'siena'], ['锡耶纳大教堂 Duomo di Siena', 'siena'], ['曼吉亚塔 Torre del Mangia', 'siena'], ['Piazza della Cisterna 水井广场', 'sangimignano'], ['Torre Grossa 格罗萨塔楼', 'sangimignano'], ['Wine Apartments Florence Bolgheri', 'florence'],
  ['圣母百花大教堂 Duomo', 'florence'], ['共和广场 Piazza della Repubblica', 'florence'], ['乌菲兹美术馆 Uffizi', 'florence'], ['米开朗琪罗广场 Piazzale Michelangelo', 'piazzale'],
  ['Campanile Venice Mestre', 'mestre'], ["Ca' d'Oro 黄金宫", 'venice'], ['里亚托桥 Ponte di Rialto', 'venice'], ["学院桥 Ponte dell'Accademia", 'venice'], ['圣马可广场 Piazza San Marco', 'venice'], ['叹息桥 Ponte dei Sospiri', 'venice'], ['里亚托市场 Mercato di Rialto', 'venice'],
  ['CityChalet｜Marktgasse 66', 'interlaken'], ['Spiez Bahnhof / 观景点', 'spiez'], ['施皮茨城堡 Schloss Spiez', 'spiez'], ['图恩老城 Thun Altstadt', 'spiez'], ['图恩城堡 Schloss Thun', 'spiez'], ['龙疆 Lungern（备选）', 'lungern'], ['Grindelwald First', 'grindelwald'], ['First Cliff Walk', 'grindelwald'],
  ['利马特河滨河步道', 'zurich'], ['苏黎世大教堂 Grossmünster', 'zurich'], ['Sprüngli Paradeplatz', 'zurich'], ['Bürkliplatz / 苏黎世湖湖滨', 'zurich'], ['Hilton Rome Airport', 'airport'],
]);

function directionsUrl(origin, destination) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
}

function mapUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function makeCandidate(tuple, anchor, rank) {
  const [nameCn, name, address, siteUrl, menuUrl] = tuple;
  const swiss = anchor.anchorName.includes('Interlaken') || anchor.anchorName.includes('Spiez') || anchor.anchorName.includes('图恩') || anchor.anchorName.includes('Lungern') || anchor.anchorName.includes('Grindelwald') || anchor.anchorName.includes('First') || anchor.anchorName.includes('苏黎世') || anchor.anchorName.includes('Sprüngli') || anchor.anchorName.includes('Bürkliplatz');
  return {
    rank,
    level: rank === 4 ? 'D官网核验新增' : 'E官网核验新增',
    sourceStatus: '官网核验新增：官网入口已附；菜单、营业与 8–12 人同桌规则均需出发前再次确认。',
    nameCn,
    name,
    address,
    distanceKm: null,
    arrivalHint: '需以导航确认',
    routeNote: '相邻行程点复用该餐区备选；未做路线测算，不展示猜测距离。',
    freshScore: null,
    reason: `位于「${anchor.anchorName}」所在餐区或其顺路区域，作为团队 D/E 备选；以官网与实时导航复核后再决定。`,
    dishes: '官网菜单/当日出品需出发前核对；如选择，请优先询问蔬菜、沙拉、海鲜或清淡做法。',
    menuStatus: '官网入口已核验；菜单、价格与营业时段需出发前核对',
    menuUrl,
    siteUrl,
    mapUrl: mapUrl(`${name} ${address}`),
    directionsUrl: directionsUrl(anchor.anchorName, `${name} ${address}`),
    booking: '建议预订（团队需确认）',
    bookingNote: '未将官网公开信息推断为可接待 8–12 人；请通过官网/电话确认日期、同桌、菜单和取消规则。',
    priceLocal: null,
    currency: null,
    rateCny: null,
    priceCny: null,
    priceNote: swiss ? SWISS_RATE_NOTE : ITALY_RATE_NOTE,
    verifiedAt: '2026-09-04',
    factBoundary: '官网链接与餐区归属为本次核验范围；距离、菜单细节、实时营业、价格及团队桌位不作未经官网确认的断言。',
  };
}

export function supplementedAnchorsForDay(day) {
  return anchorsForDay(day).map((anchor) => {
    const zone = zoneByAnchor.get(anchor.anchorName);
    if (!zone || !pools[zone]) throw new Error(`No vetted supplement pool for: ${anchor.anchorName}`);
    const additions = pools[zone].map((tuple, index) => makeCandidate(tuple, anchor, index + 4));
    return { ...anchor, restaurants: [...anchor.restaurants, ...additions] };
  });
}

export const SUPPLEMENT_POOL_COUNT = Object.keys(pools).length;
