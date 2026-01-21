import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

// 设备名称模板
const equipmentNames = {
  '耕整地机械': ['拖拉机', '旋耕机', '深松机', '起垄机', '平地机'],
  '播种/插秧机械': ['播种机', '插秧机', '精量播种机', '免耕播种机'],
  '收获机械': ['联合收割机', '玉米收获机', '花生收获机', '棉花采摘机'],
  '植保机械': ['喷雾机', '植保无人机', '弥雾机', '施肥机'],
  '灌溉机械': ['水泵', '喷灌设备', '滴灌设备', '移动式灌溉机'],
  '挖掘机械': ['挖掘机', '小型挖掘机', '轮式挖掘机', '履带挖掘机'],
  '装载机械': ['装载机', '滑移装载机', '挖掘装载机', '轮式装载机'],
  '起重机械': ['汽车吊', '塔吊', '履带吊', '随车吊', '门式起重机'],
  '压实机械': ['压路机', '振动压路机', '冲击压路机', '平板夯'],
  '混凝土机械': ['混凝土搅拌车', '混凝土泵车', '搅拌站', '布料机'],
  '载货汽车': ['自卸车', '厢式货车', '平板车', '重型卡车'],
  '专用运输车': ['冷藏车', '油罐车', '散装水泥车', '清障车'],
  '叉车': ['电动叉车', '内燃叉车', '前移式叉车', '侧面叉车'],
  '牵引车': ['半挂牵引车', '全挂牵引车', '重型牵引车'],
  '林业机械': ['伐木机', '集材机', '削片机', '木材粉碎机'],
  '畜牧机械': ['饲料搅拌机', '青贮机', '挤奶机', '剪毛机'],
  '园林机械': ['割草机', '绿篱机', '油锯', '打草机'],
  '矿山机械': ['破碎机', '球磨机', '振动筛', '输送机']
};

// 品牌
const brands = ['徐工', '三一', '中联', '柳工', '山推', '临工', '龙工', '厦工', '约翰迪尔', '久保田', '洋马', '雷沃'];

// 姓氏
const surnames = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗'];

// 名字
const names = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀兰', '霞', '平'];

// 街道/乡镇
const streets = ['人民路', '建设路', '解放路', '中山路', '文化路', '工业路', '振兴路', '幸福路', '团结路', '和平路', 
  '新华街', '光明街', '胜利街', '红旗街', '东风街', '向阳街', '朝阳街', '曙光街'];

// 随机生成手机号
function randomPhone(): string {
  const prefixes = ['130', '131', '132', '133', '135', '136', '137', '138', '139', 
    '150', '151', '152', '153', '155', '156', '157', '158', '159',
    '180', '181', '182', '183', '185', '186', '187', '188', '189'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + suffix;
}

// 随机生成姓名
function randomName(): string {
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const name = names[Math.floor(Math.random() * names.length)];
  return surname + name;
}

// 随机生成价格（根据分类）
function randomPrice(categoryName: string): number {
  const priceRanges: Record<string, [number, number]> = {
    '耕整地机械': [50, 300],
    '播种/插秧机械': [30, 200],
    '收获机械': [100, 500],
    '植保机械': [20, 150],
    '灌溉机械': [10, 80],
    '挖掘机械': [200, 1500],
    '装载机械': [150, 800],
    '起重机械': [300, 2000],
    '压实机械': [100, 600],
    '混凝土机械': [200, 1200],
    '载货汽车': [150, 800],
    '专用运输车': [200, 1000],
    '叉车': [50, 300],
    '牵引车': [200, 800],
    '林业机械': [80, 400],
    '畜牧机械': [30, 200],
    '园林机械': [5, 50],
    '矿山机械': [100, 800]
  };
  
  const range = priceRanges[categoryName] || [50, 500];
  return Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
}

async function seedEquipment() {
  console.log('开始生成设备测试数据...');

  // 1. 获取所有分类
  const categories = await prisma.category.findMany({
    where: { parentId: { not: null } } // 获取所有二级分类
  });

  console.log(`✓ 找到 ${categories.length} 个二级分类`);

  // 获取一级分类用于显示
  const parentCategories = await prisma.category.findMany({
    where: { parentId: null }
  });
  
  const categoryMap = new Map(parentCategories.map(c => [c.id, c]));

  // 2. 获取安徽省滁州市的所有区县
  const anhui = await prisma.region.findFirst({
    where: { name: '安徽省', parentId: null }
  });

  if (!anhui) {
    throw new Error('未找到安徽省');
  }

  const chuzhou = await prisma.region.findFirst({
    where: { name: '滁州市', parentId: anhui.id }
  });

  if (!chuzhou) {
    throw new Error('未找到滁州市');
  }

  const counties = await prisma.region.findMany({
    where: { parentId: chuzhou.id }
  });

  console.log(`✓ 找到滁州市 ${counties.length} 个区县`);

  if (counties.length === 0) {
    throw new Error('滁州市没有区县数据');
  }

  // 3. 创建测试用户（设备所有者）
  const testUser = await prisma.user.upsert({
    where: { phone: '13800000000' },
    update: {},
    create: {
      phone: '13800000000',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      nickname: '测试用户',
      balance: 0
    }
  });

  console.log(`✓ 创建测试用户: ${testUser.nickname}`);

  // 4. 生成1000条设备数据
  const totalEquipment = 1000;
  const equipmentData = [];

  for (let i = 0; i < totalEquipment; i++) {
    // 循环使用分类，确保全覆盖
    const category = categories[i % categories.length];
    const parentCategory = categoryMap.get(category.parentId!);
    const county = counties[i % counties.length];
    
    // 获取该分类的设备名称模板
    const nameTemplates = equipmentNames[category.name] || ['设备'];
    const nameTemplate = nameTemplates[Math.floor(Math.random() * nameTemplates.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const modelCode = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 900 + 100)}`;
    
    const model = `${brand}${modelCode}${nameTemplate}`;
    const price = randomPrice(category.name);
    const street = streets[Math.floor(Math.random() * streets.length)];
    const streetNumber = Math.floor(Math.random() * 500 + 1);
    const address = `${street}${streetNumber}号`;
    const phone = randomPhone();
    
    equipmentData.push({
      userId: testUser.id,
      category1: parentCategory?.name || '其他机械',
      category2: category.name,
      model,
      province: anhui.name,
      city: chuzhou.name,
      county: county.name,
      address,
      latitude: 32.3 + Math.random() * 0.5,
      longitude: 118.3 + Math.random() * 0.5,
      price,
      priceUnit: 'day',
      phone,
      images: [],
      description: `${model}，性能良好，手续齐全。适用于各类工程项目，欢迎咨询。`,
      capacity: `作业能力：${Math.floor(Math.random() * 100 + 50)}m³/h`,
      status: 1, // 已发布
      viewCount: Math.floor(Math.random() * 1000),
      contactCount: Math.floor(Math.random() * 100),
      favoriteCount: Math.floor(Math.random() * 50),
      scanCount: Math.floor(Math.random() * 200),
      rating: Math.floor(Math.random() * 20 + 30) / 10, // 3.0-5.0
      ratingCount: Math.floor(Math.random() * 50)
    });

    if ((i + 1) % 100 === 0) {
      console.log(`  生成进度: ${i + 1}/${totalEquipment}`);
    }
  }

  console.log('✓ 数据生成完成，开始批量插入...');

  // 5. 批量插入
  const batchSize = 100;
  for (let i = 0; i < equipmentData.length; i += batchSize) {
    const batch = equipmentData.slice(i, i + batchSize);
    await prisma.equipment.createMany({
      data: batch
    });
    console.log(`  插入进度: ${Math.min(i + batchSize, totalEquipment)}/${totalEquipment}`);
  }

  console.log('✓ 设备数据导入完成！');
  
  // 6. 统计信息
  const stats = await prisma.equipment.groupBy({
    by: ['category1', 'category2'],
    _count: true
  });

  console.log('\n=== 数据统计 ===');
  for (const stat of stats) {
    console.log(`${stat.category1} > ${stat.category2}: ${stat._count} 条`);
  }
}

seedEquipment()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
