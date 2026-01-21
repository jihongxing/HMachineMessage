// 价格单位类型
export type PriceUnitType = 
  | 'hour'      // 元/小时
  | 'day'       // 元/天
  | 'mu'        // 元/亩
  | 'km'        // 元/公里
  | 'm3'        // 元/立方米
  | 'ton'       // 元/吨
  | 'sqm'       // 元/平方米
  | 'meter'     // 元/米
  | 'time'      // 元/次
  | 'shift'     // 元/台班
  | 'tonkm';    // 元/吨公里

// 价格单位显示文本
export const PRICE_UNIT_TEXT: Record<PriceUnitType, string> = {
  hour: '元/小时',
  day: '元/天',
  mu: '元/亩',
  km: '元/公里',
  m3: '元/立方米',
  ton: '元/吨',
  sqm: '元/平方米',
  meter: '元/米',
  time: '元/次',
  shift: '元/台班',
  tonkm: '元/吨公里'
};

// 价格单位简称
export const PRICE_UNIT_SHORT: Record<PriceUnitType, string> = {
  hour: '时',
  day: '天',
  mu: '亩',
  km: '公里',
  m3: '方',
  ton: '吨',
  sqm: '㎡',
  meter: '米',
  time: '次',
  shift: '台班',
  tonkm: '吨公里'
};

// 根据设备分类获取可用的价格单位
export function getPriceUnitsByCategory(category1: string, category2: string): PriceUnitType[] {
  const categoryMap: Record<string, Record<string, PriceUnitType[]>> = {
    '农业机械': {
      '耕整地机械': ['mu', 'hour', 'day'],
      '播种/插秧机械': ['mu', 'hour', 'day'],
      '收获机械': ['mu', 'hour', 'day'],
      '植保机械': ['mu', 'hour', 'day'],
      '灌溉机械': ['hour', 'day', 'mu']
    },
    '工程机械': {
      '挖掘机械': ['hour', 'day', 'shift'],
      '装载机械': ['hour', 'day', 'shift'],
      '起重机械': ['hour', 'day', 'shift', 'time'],
      '压实机械': ['hour', 'day', 'shift'],
      '混凝土机械': ['m3', 'day', 'shift']
    },
    '运输机械': {
      '载货汽车': ['ton', 'km', 'day'],
      '专用运输车': ['tonkm', 'km', 'time'],
      '叉车': ['hour', 'day', 'shift'],
      '牵引车': ['hour', 'day', 'km']
    },
    '其他机械': {
      '林业机械': ['hour', 'day', 'mu'],
      '畜牧机械': ['hour', 'day', 'ton'],
      '园林机械': ['sqm', 'hour', 'day'],
      '矿山机械': ['ton', 'day', 'shift']
    }
  };

  // 获取该分类的价格单位
  const units = categoryMap[category1]?.[category2];
  
  // 如果没有匹配，返回通用单位
  if (!units) {
    return ['hour', 'day', 'shift'];
  }
  
  return units;
}

// 获取价格单位显示文本
export function getPriceUnitText(unit: string): string {
  return PRICE_UNIT_TEXT[unit as PriceUnitType] || unit;
}

// 获取价格单位简称
export function getPriceUnitShort(unit: string): string {
  return PRICE_UNIT_SHORT[unit as PriceUnitType] || unit;
}
