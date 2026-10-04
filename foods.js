// =====================================================================
//  FOOD DATABASE
//  Values are APPROXIMATE, compiled from USDA FoodData Central and
//  typical IFCT 2017 (NIN, India) figures. Check & correct them over time.
//
//  INGREDIENTS: nutrients per 100 g, in this order:
//  [kcal, protein g, carbs g, fat g, fiber g,
//   calcium mg, iron mg, zinc mg, magnesium mg, potassium mg, sodium mg,
//   vitamin A mcg, vitamin C mg, folate mcg, vitamin B12 mcg]
//
//  DISHES: one "base" serving is a list of raw ingredient grams.
//  sizes  -> multipliers of the base
//  extra  -> the variable part (ghee, butter, oil, sugar...) chosen when logging
//  presets-> one-tap Home / Dhaba settings
// =====================================================================

const NUTRIENTS = [
  { key: "kcal",   name: "Calories",    unit: "kcal" },
  { key: "protein",name: "Protein",     unit: "g" },
  { key: "carbs",  name: "Carbs",       unit: "g" },
  { key: "fat",    name: "Fat",         unit: "g" },
  { key: "fiber",  name: "Fiber",       unit: "g" },
  { key: "ca",     name: "Calcium",     unit: "mg" },
  { key: "fe",     name: "Iron",        unit: "mg" },
  { key: "zn",     name: "Zinc",        unit: "mg" },
  { key: "mg",     name: "Magnesium",   unit: "mg" },
  { key: "k",      name: "Potassium",   unit: "mg" },
  { key: "na",     name: "Sodium",      unit: "mg" },
  { key: "vitA",   name: "Vitamin A",   unit: "mcg" },
  { key: "vitC",   name: "Vitamin C",   unit: "mg" },
  { key: "folate", name: "Folate",      unit: "mcg" },
  { key: "b12",    name: "Vitamin B12", unit: "mcg" }
];

const INGREDIENTS = {
  // ---- grains & flours ----
  atta:        { name: "Whole wheat atta",  v: [340,13.2,72,2.5,10.7, 34,3.6,2.6,137,363,2, 0,0,44,0] },
  maida:       { name: "Maida",             v: [364,10.3,76,1.0,2.7, 15,1.2,0.7,22,107,2, 0,0,26,0] },
  makki:       { name: "Makki atta",        v: [362,8.1,77,3.6,7.3, 6,3.5,1.8,127,287,5, 11,0,25,0] },
  besan:       { name: "Besan",             v: [387,22,58,6.7,10.8, 45,4.9,2.8,166,846,64, 2,0,437,0] },
  suji:        { name: "Suji / rava",       v: [360,12.7,73,1.1,3.9, 17,1.2,1.1,47,186,1, 0,0,72,0] },
  rice_raw:    { name: "Rice (raw)",        v: [360,6.6,79,0.6,1.3, 9,0.8,1.1,25,86,5, 0,0,8,0] },
  rice_cooked: { name: "Rice (cooked)",     v: [130,2.7,28,0.3,0.4, 10,0.2,0.5,12,35,1, 0,0,3,0],
                 units: [{ name: "katori (150 g)", g: 150 }, { name: "serving spoon (60 g)", g: 60 }] },
  pasta_cooked:{ name: "Pasta/noodles (cooked)", v: [158,5.8,31,0.9,1.8, 7,0.5,0.5,18,44,1, 0,0,7,0] },
  bread:       { name: "Bread",             v: [265,8.8,49,3.3,2.4, 50,1.8,0.7,25,115,490, 0,0,30,0],
                 units: [{ name: "slice (25 g)", g: 25 }] },

  // ---- pulses ----
  urad_whole:  { name: "Urad (whole, raw)", v: [341,25,59,1.6,18, 138,7.6,3.4,267,983,38, 3,0,216,0] },
  rajma:       { name: "Rajma (raw)",       v: [333,24,60,0.8,25, 143,8.2,2.8,140,1406,24, 0,4.5,394,0] },
  chana:       { name: "Kabuli chana (raw)",v: [364,19,61,6.0,17, 105,6.2,3.4,115,875,24, 3,4,557,0] },
  toor:        { name: "Toor dal (raw)",    v: [343,22,63,1.5,15, 130,5.2,2.8,183,1392,17, 1,0,456,0] },
  moong:       { name: "Moong dal (raw)",   v: [348,24.5,59,1.2,8, 75,3.9,2.7,160,1000,15, 5,0,145,0] },
  masoor:      { name: "Masoor dal (raw)",  v: [352,25,63,1.1,11, 35,6.5,3.3,47,677,6, 2,1.5,479,0] },

  // ---- vegetables ----
  potato:      { name: "Potato",            v: [87,1.9,20,0.1,1.8, 5,0.3,0.3,22,379,4, 0,13,10,0] },
  cauliflower: { name: "Cauliflower",       v: [25,1.9,5,0.3,2.0, 22,0.4,0.3,15,299,30, 0,48,57,0] },
  radish:      { name: "Mooli",             v: [16,0.7,3.4,0.1,1.6, 25,0.3,0.3,10,233,39, 0,15,25,0] },
  onion:       { name: "Onion",             v: [40,1.1,9.3,0.1,1.7, 23,0.2,0.2,10,146,4, 0,7.4,19,0] },
  tomato:      { name: "Tomato",            v: [18,0.9,3.9,0.2,1.2, 10,0.3,0.2,11,237,5, 42,14,15,0] },
  peas:        { name: "Green peas",        v: [81,5.4,14.5,0.4,5.7, 25,1.5,1.2,33,244,5, 38,40,65,0] },
  sarson:      { name: "Mustard greens",    v: [27,2.9,4.7,0.4,3.2, 115,1.6,0.25,32,384,20, 151,70,12,0] },
  spinach:     { name: "Spinach (palak)",   v: [23,2.9,3.6,0.4,2.2, 99,2.7,0.5,79,558,79, 469,28,194,0] },
  methi:       { name: "Methi leaves",      v: [49,4.4,6,0.9,4.9, 395,1.9,0.5,67,300,76, 190,52,57,0] },
  okra:        { name: "Bhindi",            v: [33,1.9,7.5,0.2,3.2, 82,0.6,0.6,57,299,7, 36,23,60,0] },
  carrot:      { name: "Carrot",            v: [41,0.9,9.6,0.2,2.8, 33,0.3,0.24,12,320,69, 835,5.9,19,0] },

  // ---- dairy, eggs, meat ----
  milk_cow:    { name: "Cow milk",          v: [61,3.2,4.8,3.3,0, 113,0,0.4,10,132,43, 46,0,5,0.45],
                 units: [{ name: "glass (250 ml)", g: 250 }, { name: "cup (150 ml)", g: 150 }] },
  milk_buffalo:{ name: "Buffalo milk",      v: [97,3.75,5.2,6.9,0, 169,0.1,0.2,31,178,52, 53,2.3,6,0.36],
                 units: [{ name: "glass (250 ml)", g: 250 }, { name: "cup (150 ml)", g: 150 }] },
  curd:        { name: "Dahi",              v: [61,3.5,4.7,3.3,0, 121,0.05,0.6,12,155,46, 27,0.5,7,0.37],
                 units: [{ name: "katori (150 g)", g: 150 }] },
  paneer:      { name: "Paneer",            v: [265,18.3,1.2,20.8,0, 480,0.2,2.5,20,100,20, 150,0,10,0.5],
                 units: [{ name: "piece (20 g)", g: 20 }] },
  cream:       { name: "Cream / malai",     v: [250,2.5,3.5,25,0, 90,0.05,0.2,8,100,30, 250,0.5,4,0.2] },
  cheese:      { name: "Cheese (mozzarella)",v:[300,22,2.2,22,0, 505,0.4,2.9,20,76,627, 179,0,7,2.3],
                 units: [{ name: "slice (20 g)", g: 20 }] },
  egg:         { name: "Egg",               v: [143,12.6,0.7,9.5,0, 56,1.75,1.3,12,138,142, 160,0,47,0.89],
                 units: [{ name: "egg (50 g)", g: 50 }] },
  chicken:     { name: "Chicken (raw, no bone)", v: [130,21,0,5,0, 11,0.8,1.5,25,280,80, 15,0,6,0.4] },
  mutton:      { name: "Mutton (raw, no bone)",  v: [109,20.6,0,2.3,0, 13,2.8,4.0,23,385,82, 0,0,5,1.13] },
  fish:        { name: "Fish (rohu-type, raw)",  v: [100,18,0,3,0, 30,0.6,0.5,30,350,60, 20,0,10,2.0] },

  // ---- fats, sugar, salt ----
  ghee:        { name: "Ghee",              v: [900,0,0,100,0, 4,0,0,0,5,2, 840,0,0,0],
                 units: [{ name: "tsp (5 g)", g: 5 }, { name: "tbsp (14 g)", g: 14 }] },
  butter:      { name: "Butter / makhan",   v: [717,0.9,0.1,81,0, 24,0.02,0.1,2,24,576, 684,0,3,0.2],
                 units: [{ name: "tsp (5 g)", g: 5 }, { name: "cube (10 g)", g: 10 }] },
  oil:         { name: "Oil (any)",         v: [884,0,0,100,0, 0,0,0,0,0,0, 0,0,0,0],
                 units: [{ name: "tsp (5 g)", g: 5 }, { name: "tbsp (14 g)", g: 14 }] },
  sugar:       { name: "Sugar",             v: [387,0,100,0,0, 1,0.05,0,0,2,1, 0,0,0,0],
                 units: [{ name: "tsp (5 g)", g: 5 }] },
  jaggery:     { name: "Gur",               v: [383,0.4,95,0.1,0, 80,2.6,0.2,70,450,30, 0,0,0,0],
                 units: [{ name: "piece (10 g)", g: 10 }] },
  cola:        { name: "Cold drink (cola etc.)", cat: "Drinks", v: [42,0,10.6,0,0, 2,0.1,0,0,2,4, 0,0,0,0],
                 units: [{ name: "can (300 ml)", g: 300 }, { name: "glass (250 ml)", g: 250 }, { name: "bottle (600 ml)", g: 600 }] },
  chips:       { name: "Potato chips", cat: "Snacks", v: [536,7,53,35,4.4, 24,1.6,1.1,67,1275,525, 0,19,45,0],
                 units: [{ name: "small pack (25 g)", g: 25 }, { name: "big pack (50 g)", g: 50 }] },
  salt:        { name: "Salt",              v: [0,0,0,0,0, 0,0,0,0,0,38758, 0,0,0,0] },

  // ---- fruits & nuts ----
  banana:      { name: "Banana",            v: [89,1.1,22.8,0.3,2.6, 5,0.26,0.15,27,358,1, 3,8.7,20,0],
                 units: [{ name: "medium (118 g)", g: 118 }] },
  apple:       { name: "Apple",             v: [52,0.3,13.8,0.2,2.4, 6,0.12,0.04,5,107,1, 3,4.6,3,0],
                 units: [{ name: "medium (180 g)", g: 180 }] },
  mango:       { name: "Mango",             v: [60,0.8,15,0.4,1.6, 11,0.16,0.09,10,168,1, 54,36,43,0],
                 units: [{ name: "whole (200 g pulp)", g: 200 }] },
  kinnow:      { name: "Kinnow / orange",   v: [47,0.9,11.8,0.1,2.4, 40,0.1,0.07,10,181,0, 11,53,30,0],
                 units: [{ name: "one (130 g)", g: 130 }] },
  guava:       { name: "Amrood",            v: [68,2.6,14.3,1,5.4, 18,0.26,0.23,22,417,2, 31,228,49,0],
                 units: [{ name: "one (100 g)", g: 100 }] },
  almonds:     { name: "Badam",             v: [579,21,21.6,50,12.5, 269,3.7,3.1,270,733,1, 0,0,44,0],
                 units: [{ name: "5 badam (6 g)", g: 6 }, { name: "handful (20 g)", g: 20 }] },
  peanuts:     { name: "Moongphali",        v: [567,25.8,16,49,8.5, 92,4.6,3.3,168,705,18, 0,0,240,0],
                 units: [{ name: "handful (30 g)", g: 30 }] }
};

// Reusable "extra" option sets
const GHEE = (a, b, c, d) => ({ label: "Ghee / oil", options: [
  { name: "Dry", items: {} },
  { name: "Light", items: { ghee: a } },
  { name: "Normal", items: { ghee: b } },
  { name: "Heavy", items: { ghee: c } },
  ...(d ? [{ name: "Heavy + makhan", items: { ghee: c, butter: d } }] : [])
]});
const OIL = (a, b, c) => ({ label: "Oil", options: [
  { name: "Light", items: { oil: a } }, { name: "Normal", items: { oil: b } }, { name: "Heavy", items: { oil: c } }
]});
const BUTTER = (a, b, c) => ({ label: "Butter", options: [
  { name: "Light", items: { butter: a } }, { name: "Normal", items: { butter: b } }, { name: "Dhaba style", items: { butter: c } }
]});
const FRY = (a, b) => ({ label: "Frying", options: [
  { name: "Normal", items: { oil: a } }, { name: "Very oily", items: { oil: b } }
]});
const SUGAR = (vals) => ({ label: "Sugar", options: [
  { name: "None", items: {} }, ...vals.map(([n, g]) => ({ name: n, items: { sugar: g } }))
]});

const ROTI_SIZES = { Small: 0.75, Medium: 1, Large: 1.5 };
const KATORI = { "Half katori": 0.5, "1 katori": 1, "Big katori": 1.5 };
const PLATE = { "Half plate": 0.6, "Full plate": 1 };

const DISHES = [
  // ---------------- Breads ----------------
  { id: "roti", name: "Roti / phulka", cat: "Breads", unit: "roti",
    base: { atta: 30 }, sizes: ROTI_SIZES,
    extra: { label: "Ghee", options: [{ name: "Dry", items: {} }, { name: "With ghee", items: { ghee: 3 } }, { name: "Extra ghee", items: { ghee: 6 } }] },
    presets: { Home: ["Medium", "Dry"] } },
  { id: "tandoori_roti", name: "Tandoori roti", cat: "Breads", unit: "roti",
    base: { atta: 35, maida: 15, salt: 0.5 }, sizes: ROTI_SIZES,
    extra: { label: "Butter", options: [{ name: "Plain", items: {} }, { name: "Butter", items: { butter: 5 } }, { name: "Extra butter", items: { butter: 10 } }] },
    presets: { Dhaba: ["Medium", "Butter"] } },
  { id: "plain_paratha", name: "Plain paratha", cat: "Breads", unit: "paratha",
    base: { atta: 45, salt: 0.3 }, sizes: ROTI_SIZES, extra: GHEE(4, 8, 14),
    presets: { Home: ["Medium", "Light"], Dhaba: ["Large", "Heavy"] } },
  { id: "aloo_paratha", name: "Aloo paratha", cat: "Breads", unit: "paratha",
    base: { atta: 50, potato: 60, onion: 5, salt: 1 }, sizes: ROTI_SIZES, extra: GHEE(4, 8, 15, 10),
    presets: { Home: ["Medium", "Light"], Dhaba: ["Large", "Heavy + makhan"] } },
  { id: "gobhi_paratha", name: "Gobhi paratha", cat: "Breads", unit: "paratha",
    base: { atta: 50, cauliflower: 60, onion: 5, salt: 1 }, sizes: ROTI_SIZES, extra: GHEE(4, 8, 15, 10),
    presets: { Home: ["Medium", "Light"], Dhaba: ["Large", "Heavy + makhan"] } },
  { id: "mooli_paratha", name: "Mooli paratha", cat: "Breads", unit: "paratha",
    base: { atta: 50, radish: 60, salt: 1 }, sizes: ROTI_SIZES, extra: GHEE(4, 8, 15, 10),
    presets: { Home: ["Medium", "Light"], Dhaba: ["Large", "Heavy + makhan"] } },
  { id: "paneer_paratha", name: "Paneer paratha", cat: "Breads", unit: "paratha",
    base: { atta: 50, paneer: 40, onion: 5, salt: 1 }, sizes: ROTI_SIZES, extra: GHEE(4, 8, 15, 10),
    presets: { Home: ["Medium", "Light"], Dhaba: ["Large", "Heavy + makhan"] } },
  { id: "methi_paratha", name: "Methi paratha", cat: "Breads", unit: "paratha",
    base: { atta: 50, methi: 25, salt: 0.8 }, sizes: ROTI_SIZES, extra: GHEE(4, 8, 15, 10),
    presets: { Home: ["Medium", "Light"], Dhaba: ["Large", "Heavy + makhan"] } },
  { id: "missi_roti", name: "Missi roti", cat: "Breads", unit: "roti",
    base: { atta: 25, besan: 25, onion: 5, salt: 0.8 }, sizes: ROTI_SIZES, extra: GHEE(3, 6, 10),
    presets: { Home: ["Medium", "Light"] } },
  { id: "makki_roti", name: "Makki di roti", cat: "Breads", unit: "roti",
    base: { makki: 50, salt: 0.3 }, sizes: ROTI_SIZES, extra: GHEE(5, 10, 15, 10),
    presets: { Home: ["Medium", "Normal"], Dhaba: ["Large", "Heavy + makhan"] } },
  { id: "naan", name: "Naan", cat: "Breads", unit: "naan",
    base: { maida: 80, curd: 8, oil: 3, salt: 1 }, sizes: ROTI_SIZES,
    extra: { label: "Butter", options: [{ name: "Plain", items: {} }, { name: "Butter naan", items: { butter: 7 } }, { name: "Extra butter", items: { butter: 14 } }] } },
  { id: "kulcha", name: "Amritsari kulcha", cat: "Breads", unit: "kulcha",
    base: { maida: 90, potato: 50, onion: 10, salt: 1.5 }, sizes: ROTI_SIZES, extra: BUTTER(5, 10, 20),
    presets: { Dhaba: ["Medium", "Dhaba style"] } },
  { id: "bhatura", name: "Bhatura", cat: "Breads", unit: "bhatura",
    base: { maida: 70, curd: 10, salt: 1 }, sizes: ROTI_SIZES, extra: FRY(15, 22) },
  { id: "puri", name: "Puri", cat: "Breads", unit: "puri",
    base: { atta: 25, salt: 0.2 }, sizes: { Small: 0.7, Normal: 1, Big: 1.5 }, extra: FRY(6, 9) },

  // ---------------- Dal & sabzi ----------------
  { id: "dal_makhani", name: "Dal makhani", cat: "Dal & sabzi", unit: "katori",
    base: { urad_whole: 28, rajma: 5, tomato: 30, onion: 10, cream: 8, salt: 1.3 }, sizes: KATORI,
    extra: { label: "Butter", options: [{ name: "Light", items: { butter: 4 } }, { name: "Normal", items: { butter: 8 } }, { name: "Dhaba style", items: { butter: 15, cream: 10 } }] },
    presets: { Home: ["1 katori", "Light"], Dhaba: ["1 katori", "Dhaba style"] } },
  { id: "dal_tadka", name: "Dal tadka (toor)", cat: "Dal & sabzi", unit: "katori",
    base: { toor: 30, tomato: 15, onion: 10, salt: 1.2 }, sizes: KATORI, extra: GHEE(3, 6, 10),
    presets: { Home: ["1 katori", "Light"], Dhaba: ["1 katori", "Heavy"] } },
  { id: "moong_dal", name: "Moong dal", cat: "Dal & sabzi", unit: "katori",
    base: { moong: 30, tomato: 10, salt: 1.2 }, sizes: KATORI, extra: GHEE(3, 5, 8) },
  { id: "masoor_dal", name: "Masoor dal", cat: "Dal & sabzi", unit: "katori",
    base: { masoor: 30, tomato: 15, onion: 10, salt: 1.2 }, sizes: KATORI, extra: GHEE(3, 5, 8) },
  { id: "rajma", name: "Rajma", cat: "Dal & sabzi", unit: "katori",
    base: { rajma: 35, onion: 20, tomato: 30, salt: 1.3 }, sizes: KATORI, extra: OIL(4, 8, 12),
    presets: { Home: ["1 katori", "Light"], Dhaba: ["1 katori", "Heavy"] } },
  { id: "chole", name: "Chole", cat: "Dal & sabzi", unit: "katori",
    base: { chana: 40, onion: 20, tomato: 25, salt: 1.4 }, sizes: KATORI, extra: OIL(5, 9, 14),
    presets: { Home: ["1 katori", "Light"], Dhaba: ["1 katori", "Heavy"] } },
  { id: "kadhi", name: "Kadhi pakora", cat: "Dal & sabzi", unit: "katori",
    base: { curd: 80, besan: 24, onion: 10, salt: 1.3 }, sizes: KATORI, extra: OIL(6, 10, 15) },
  { id: "saag", name: "Sarson da saag", cat: "Dal & sabzi", unit: "katori",
    base: { sarson: 110, spinach: 30, makki: 8, onion: 5, salt: 1.3 }, sizes: KATORI, extra: GHEE(5, 10, 18, 10),
    presets: { Home: ["1 katori", "Normal"], Dhaba: ["1 katori", "Heavy + makhan"] } },
  { id: "palak_paneer", name: "Palak paneer", cat: "Dal & sabzi", unit: "katori",
    base: { spinach: 90, paneer: 50, onion: 15, tomato: 10, cream: 5, salt: 1.3 }, sizes: KATORI, extra: OIL(5, 8, 12) },
  { id: "paneer_butter", name: "Paneer butter masala / shahi paneer", cat: "Dal & sabzi", unit: "katori",
    base: { paneer: 70, tomato: 50, onion: 15, cream: 15, salt: 1.4 }, sizes: KATORI, extra: BUTTER(6, 10, 16),
    presets: { Home: ["1 katori", "Light"], Dhaba: ["1 katori", "Dhaba style"] } },
  { id: "matar_paneer", name: "Matar paneer", cat: "Dal & sabzi", unit: "katori",
    base: { paneer: 50, peas: 40, tomato: 40, onion: 15, salt: 1.3 }, sizes: KATORI, extra: OIL(5, 8, 12) },
  { id: "aloo_gobhi", name: "Aloo gobhi", cat: "Dal & sabzi", unit: "katori",
    base: { potato: 70, cauliflower: 70, onion: 10, tomato: 10, salt: 1.2 }, sizes: KATORI, extra: OIL(5, 8, 12) },
  { id: "aloo_matar", name: "Aloo matar", cat: "Dal & sabzi", unit: "katori",
    base: { potato: 70, peas: 40, tomato: 30, onion: 10, salt: 1.2 }, sizes: KATORI, extra: OIL(4, 7, 10) },
  { id: "mix_veg", name: "Mix veg", cat: "Dal & sabzi", unit: "katori",
    base: { potato: 30, cauliflower: 30, peas: 30, carrot: 20, tomato: 20, onion: 10, salt: 1.2 }, sizes: KATORI, extra: OIL(4, 7, 10) },
  { id: "bhindi", name: "Bhindi masala", cat: "Dal & sabzi", unit: "katori",
    base: { okra: 110, onion: 20, salt: 1 }, sizes: KATORI, extra: OIL(6, 10, 14) },
  { id: "raita", name: "Raita", cat: "Dal & sabzi", unit: "katori",
    base: { curd: 120, onion: 10, tomato: 10, salt: 1 }, sizes: KATORI },

  // ---------------- Rice ----------------
  { id: "plain_rice", name: "Plain rice", cat: "Rice", unit: "katori",
    base: { rice_cooked: 150 }, sizes: KATORI,
    extra: { label: "Ghee", options: [{ name: "Plain", items: {} }, { name: "With ghee", items: { ghee: 5 } }] } },
  { id: "jeera_rice", name: "Jeera rice", cat: "Rice", unit: "katori",
    base: { rice_cooked: 150, salt: 1 }, sizes: KATORI, extra: GHEE(4, 7, 11) },
  { id: "pulao", name: "Veg pulao", cat: "Rice", unit: "katori",
    base: { rice_cooked: 130, peas: 20, carrot: 10, onion: 10, salt: 1 }, sizes: KATORI, extra: OIL(4, 7, 11) },
  { id: "khichdi", name: "Khichdi", cat: "Rice", unit: "katori",
    base: { rice_raw: 25, moong: 20, salt: 1 }, sizes: KATORI, extra: GHEE(3, 5, 10) },
  { id: "chicken_biryani", name: "Chicken biryani", cat: "Rice", unit: "plate",
    base: { rice_cooked: 180, chicken: 90, onion: 25, curd: 15, tomato: 10, salt: 2.5 }, sizes: PLATE, extra: GHEE(8, 12, 20) },
  { id: "kheer", name: "Kheer", cat: "Sweets", unit: "katori",
    base: { milk_buffalo: 130, rice_raw: 10 }, sizes: KATORI, extra: SUGAR([["Less", 10], ["Normal", 15], ["Very sweet", 22]]) },

  // ---------------- Non-veg & eggs ----------------
  { id: "butter_chicken", name: "Butter chicken", cat: "Non-veg", unit: "katori",
    base: { chicken: 100, tomato: 60, cream: 20, salt: 1.6 }, sizes: KATORI, extra: BUTTER(8, 12, 20),
    presets: { Home: ["1 katori", "Light"], Dhaba: ["1 katori", "Dhaba style"] } },
  { id: "chicken_curry", name: "Chicken curry", cat: "Non-veg", unit: "katori",
    base: { chicken: 110, onion: 40, tomato: 40, curd: 10, salt: 1.5 }, sizes: KATORI, extra: OIL(6, 10, 15),
    presets: { Home: ["1 katori", "Light"], Dhaba: ["1 katori", "Heavy"] } },
  { id: "tandoori_chicken", name: "Tandoori chicken", cat: "Non-veg", unit: "half (4 pcs)",
    base: { chicken: 170, curd: 20, salt: 2 }, sizes: { Quarter: 0.5, Half: 1, Full: 2 },
    extra: { label: "Butter", options: [{ name: "Dry", items: { oil: 3 } }, { name: "Butter basted", items: { butter: 8 } }, { name: "Extra butter", items: { butter: 15 } }] } },
  { id: "mutton_curry", name: "Mutton curry", cat: "Non-veg", unit: "katori",
    base: { mutton: 100, onion: 40, tomato: 30, curd: 10, salt: 1.5 }, sizes: KATORI, extra: OIL(8, 12, 18) },
  { id: "fish_curry", name: "Fish curry", cat: "Non-veg", unit: "katori",
    base: { fish: 100, onion: 30, tomato: 40, salt: 1.4 }, sizes: KATORI, extra: OIL(5, 8, 12) },
  { id: "egg_curry", name: "Egg curry (2 eggs)", cat: "Non-veg", unit: "serving",
    base: { egg: 100, onion: 30, tomato: 40, salt: 1.3 }, sizes: { "1 egg": 0.5, "2 eggs": 1, "3 eggs": 1.5 }, extra: OIL(5, 8, 12) },
  { id: "bhurji", name: "Anda bhurji (2 eggs)", cat: "Non-veg", unit: "serving",
    base: { egg: 100, onion: 20, tomato: 20, salt: 0.8 }, sizes: { "2 eggs": 1, "3 eggs": 1.5, "4 eggs": 2 }, extra: OIL(4, 7, 12) },
  { id: "omelette", name: "Omelette (2 eggs)", cat: "Non-veg", unit: "omelette",
    base: { egg: 100, onion: 15, salt: 0.6 }, sizes: { "1 egg": 0.5, "2 eggs": 1, "3 eggs": 1.5 }, extra: OIL(3, 5, 8) },

  // ---------------- Snacks ----------------
  { id: "samosa", name: "Samosa", cat: "Snacks", unit: "piece",
    base: { maida: 25, potato: 35, peas: 5, salt: 0.6 }, sizes: { Small: 0.7, Normal: 1, Large: 1.4 }, extra: FRY(12, 17) },
  { id: "veg_pakora", name: "Veg pakora", cat: "Snacks", unit: "piece",
    base: { besan: 8, onion: 6, potato: 3, salt: 0.2 }, sizes: { Small: 0.7, Normal: 1, Big: 1.5 }, extra: FRY(3, 5) },
  { id: "paneer_pakora", name: "Paneer pakora", cat: "Snacks", unit: "piece",
    base: { paneer: 15, besan: 6, salt: 0.2 }, sizes: { Normal: 1, Big: 1.5 }, extra: FRY(3, 5) },
  { id: "aloo_tikki", name: "Aloo tikki", cat: "Snacks", unit: "tikki",
    base: { potato: 60, peas: 5, salt: 0.6 }, sizes: { Small: 0.7, Normal: 1, Large: 1.4 }, extra: OIL(5, 8, 12) },

  // ---------------- Sweets ----------------
  { id: "gajar_halwa", name: "Gajar halwa", cat: "Sweets", unit: "katori",
    base: { carrot: 150, milk_buffalo: 80, sugar: 18 }, sizes: KATORI, extra: GHEE(5, 10, 15) },
  { id: "pinni", name: "Pinni", cat: "Sweets", unit: "piece",
    base: { atta: 15, sugar: 10, almonds: 4, ghee: 11 }, sizes: { Small: 0.7, Normal: 1, Big: 1.5 } },
  { id: "gulab_jamun", name: "Gulab jamun", cat: "Sweets", unit: "piece",
    base: { milk_buffalo: 60, maida: 3, sugar: 15, oil: 5 }, sizes: { Small: 0.7, Normal: 1, Big: 1.4 } },
  { id: "jalebi", name: "Jalebi", cat: "Sweets", unit: "100 g",
    base: { maida: 35, sugar: 40, oil: 20 }, sizes: { "2 pieces (50 g)": 0.5, "100 g": 1, "250 g": 2.5 } },

  // ---------------- Drinks ----------------
  { id: "chai", name: "Chai", cat: "Drinks", unit: "cup",
    base: { milk_cow: 60 }, sizes: { "Small cup": 0.7, "Cup": 1, "Big mug": 1.6 },
    extra: SUGAR([["1 tsp", 5], ["2 tsp", 10], ["3 tsp", 15]]) },
  { id: "coffee_milk", name: "Coffee with milk", cat: "Drinks", unit: "cup",
    base: { milk_cow: 100 }, sizes: { "Small cup": 0.7, "Cup": 1, "Big mug": 1.6 },
    extra: SUGAR([["1 tsp", 5], ["2 tsp", 10], ["3 tsp", 15]]) },
  { id: "black_coffee", name: "Black coffee", cat: "Drinks", unit: "cup",
    base: {}, sizes: { "Cup": 1, "Big mug": 1.6 },
    extra: SUGAR([["1 tsp", 5], ["2 tsp", 10]]) },
  { id: "sweet_lassi", name: "Sweet lassi", cat: "Drinks", unit: "glass",
    base: { curd: 220, milk_cow: 30 }, sizes: { "Small glass": 0.7, "Glass": 1, "Dhaba glass": 1.5 },
    extra: { label: "Sugar / malai", options: [{ name: "Less sugar", items: { sugar: 15 } }, { name: "Normal", items: { sugar: 25 } }, { name: "With malai", items: { sugar: 25, cream: 25 } }] },
    presets: { Dhaba: ["Dhaba glass", "With malai"] } },
  { id: "namkeen_lassi", name: "Namkeen lassi / chaas", cat: "Drinks", unit: "glass",
    base: { curd: 150, salt: 1.5 }, sizes: { "Small glass": 0.7, "Glass": 1, "Big glass": 1.5 } },
  { id: "milk_glass", name: "Glass of milk", cat: "Drinks", unit: "glass",
    base: { milk_cow: 250 }, sizes: { "Half glass": 0.5, "Glass": 1 },
    extra: SUGAR([["1 tsp", 5], ["2 tsp", 10]]) },
  { id: "buffalo_milk_glass", name: "Glass of buffalo milk", cat: "Drinks", unit: "glass",
    base: { milk_buffalo: 250 }, sizes: { "Half glass": 0.5, "Glass": 1 },
    extra: SUGAR([["1 tsp", 5], ["2 tsp", 10]]) },

  // ---------------- Other cuisines ----------------
  { id: "plain_dosa", name: "Plain dosa", cat: "Other cuisines", unit: "dosa",
    base: { rice_raw: 40, urad_whole: 10, salt: 0.6 }, sizes: { Small: 0.7, Normal: 1, Large: 1.4 }, extra: OIL(3, 6, 10) },
  { id: "masala_dosa", name: "Masala dosa", cat: "Other cuisines", unit: "dosa",
    base: { rice_raw: 40, urad_whole: 10, potato: 70, onion: 10, salt: 1.2 }, sizes: { Small: 0.7, Normal: 1, Large: 1.4 }, extra: OIL(5, 8, 12) },
  { id: "idli", name: "Idli", cat: "Other cuisines", unit: "idli",
    base: { rice_raw: 15, urad_whole: 5, salt: 0.3 }, sizes: { Small: 0.7, Normal: 1 } },
  { id: "sambar", name: "Sambar", cat: "Other cuisines", unit: "katori",
    base: { toor: 15, tomato: 20, onion: 15, okra: 15, carrot: 15, salt: 1.2 }, sizes: KATORI, extra: OIL(3, 5, 8) },
  { id: "upma", name: "Upma", cat: "Other cuisines", unit: "plate",
    base: { suji: 50, onion: 15, peas: 10, salt: 1 }, sizes: PLATE, extra: OIL(5, 8, 12) },
  { id: "chowmein", name: "Veg chowmein / hakka noodles", cat: "Other cuisines", unit: "plate",
    base: { pasta_cooked: 200, onion: 20, carrot: 20, peas: 10, salt: 2.2 }, sizes: PLATE, extra: OIL(8, 12, 18) },
  { id: "fried_rice", name: "Veg fried rice", cat: "Other cuisines", unit: "plate",
    base: { rice_raw: 60, peas: 15, carrot: 15, onion: 15, salt: 1.8 }, sizes: PLATE, extra: OIL(8, 12, 16) },
  { id: "pizza", name: "Pizza (veg/margherita)", cat: "Other cuisines", unit: "slice",
    base: { maida: 35, cheese: 15, tomato: 10, oil: 2, salt: 0.6 }, sizes: { "Small pizza slice": 0.75, "Medium pizza slice": 1, "Large pizza slice": 1.3 },
    extra: { label: "Cheese", options: [{ name: "Normal", items: {} }, { name: "Extra cheese", items: { cheese: 10 } }] } },
  { id: "white_pasta", name: "White sauce pasta", cat: "Other cuisines", unit: "plate",
    base: { pasta_cooked: 180, milk_cow: 80, maida: 5, cheese: 15, butter: 8, salt: 1.5 }, sizes: PLATE },
  { id: "veg_sandwich", name: "Grilled veg sandwich", cat: "Other cuisines", unit: "sandwich",
    base: { bread: 50, potato: 30, tomato: 20, onion: 10 }, sizes: { "1 sandwich": 1 },
    extra: { label: "Butter / cheese", options: [{ name: "Light butter", items: { butter: 5 } }, { name: "Butter", items: { butter: 10 } }, { name: "Butter + cheese", items: { butter: 10, cheese: 20 } }] } }
];

window.FOOD_DB = { NUTRIENTS, INGREDIENTS, DISHES };
