// Taiwanese crop types with water coefficients and seasonal factors
export const CROP_TYPES = [
  {
    id: 'rice',
    name: '水稻',
    waterCoefficient: 1.2,
    seasonalFactors: {
      spring: 0.9,
      summer: 1.3,
      autumn: 1.0,
      winter: 0.7,
    },
    description: '適用於稻米種植，需水量高',
  },
  {
    id: 'leafy_greens',
    name: '葉菜類',
    waterCoefficient: 0.8,
    seasonalFactors: {
      spring: 1.0,
      summer: 1.2,
      autumn: 0.9,
      winter: 0.8,
    },
    description: '如高麗菜、萵苣等葉菜',
  },
  {
    id: 'root_vegetables',
    name: '根莖類',
    waterCoefficient: 0.9,
    seasonalFactors: {
      spring: 0.95,
      summer: 1.1,
      autumn: 1.0,
      winter: 0.85,
    },
    description: '如蘿蔔、馬鈴薯等根莖作物',
  },
  {
    id: 'citrus',
    name: '柑橘類',
    waterCoefficient: 1.0,
    seasonalFactors: {
      spring: 1.1,
      summer: 1.4,
      autumn: 0.9,
      winter: 0.6,
    },
    description: '如柳丁、橘子等柑橘果樹',
  },
  {
    id: 'mango',
    name: '芒果',
    waterCoefficient: 1.1,
    seasonalFactors: {
      spring: 1.2,
      summer: 1.5,
      autumn: 0.8,
      winter: 0.5,
    },
    description: '芒果果樹，夏季需水量大',
  },
  {
    id: 'banana',
    name: '香蕉',
    waterCoefficient: 1.3,
    seasonalFactors: {
      spring: 1.0,
      summer: 1.4,
      autumn: 1.1,
      winter: 0.9,
    },
    description: '香蕉種植，全年需水量高',
  },
]
