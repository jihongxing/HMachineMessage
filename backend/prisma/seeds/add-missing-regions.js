// 补充缺失的台湾省、香港特别行政区、澳门特别行政区
const fs = require('fs');
const path = require('path');

const regionsPath = path.join(__dirname, 'regions.json');
const data = JSON.parse(fs.readFileSync(regionsPath, 'utf-8'));

// 台湾省数据（简化版，包含主要城市）
const taiwan = {
  name: '台湾省',
  code: '710000',
  children: [
    {
      name: '台北市',
      code: '710100',
      children: [
        { name: '中正区', code: '710101' },
        { name: '大同区', code: '710102' },
        { name: '中山区', code: '710103' },
        { name: '松山区', code: '710104' },
        { name: '大安区', code: '710105' },
        { name: '万华区', code: '710106' },
        { name: '信义区', code: '710107' },
        { name: '士林区', code: '710108' },
        { name: '北投区', code: '710109' },
        { name: '内湖区', code: '710110' },
        { name: '南港区', code: '710111' },
        { name: '文山区', code: '710112' }
      ]
    },
    {
      name: '高雄市',
      code: '710200',
      children: [
        { name: '新兴区', code: '710201' },
        { name: '前金区', code: '710202' },
        { name: '苓雅区', code: '710203' },
        { name: '盐埕区', code: '710204' },
        { name: '鼓山区', code: '710205' },
        { name: '旗津区', code: '710206' },
        { name: '前镇区', code: '710207' },
        { name: '三民区', code: '710208' },
        { name: '左营区', code: '710209' }
      ]
    },
    {
      name: '台中市',
      code: '710300',
      children: [
        { name: '中区', code: '710301' },
        { name: '东区', code: '710302' },
        { name: '南区', code: '710303' },
        { name: '西区', code: '710304' },
        { name: '北区', code: '710305' },
        { name: '北屯区', code: '710306' },
        { name: '西屯区', code: '710307' },
        { name: '南屯区', code: '710308' }
      ]
    },
    {
      name: '台南市',
      code: '710400',
      children: [
        { name: '中西区', code: '710401' },
        { name: '东区', code: '710402' },
        { name: '南区', code: '710403' },
        { name: '北区', code: '710404' },
        { name: '安平区', code: '710405' },
        { name: '安南区', code: '710406' }
      ]
    },
    {
      name: '新竹市',
      code: '710500',
      children: [
        { name: '东区', code: '710501' },
        { name: '北区', code: '710502' },
        { name: '香山区', code: '710503' }
      ]
    },
    {
      name: '嘉义市',
      code: '710600',
      children: [
        { name: '东区', code: '710601' },
        { name: '西区', code: '710602' }
      ]
    }
  ]
};

// 香港特别行政区数据
const hongkong = {
  name: '香港特别行政区',
  code: '810000',
  children: [
    {
      name: '香港岛',
      code: '810100',
      children: [
        { name: '中西区', code: '810101' },
        { name: '湾仔区', code: '810102' },
        { name: '东区', code: '810103' },
        { name: '南区', code: '810104' }
      ]
    },
    {
      name: '九龙',
      code: '810200',
      children: [
        { name: '油尖旺区', code: '810201' },
        { name: '深水埗区', code: '810202' },
        { name: '九龙城区', code: '810203' },
        { name: '黄大仙区', code: '810204' },
        { name: '观塘区', code: '810205' }
      ]
    },
    {
      name: '新界',
      code: '810300',
      children: [
        { name: '北区', code: '810301' },
        { name: '大埔区', code: '810302' },
        { name: '沙田区', code: '810303' },
        { name: '西贡区', code: '810304' },
        { name: '元朗区', code: '810305' },
        { name: '屯门区', code: '810306' },
        { name: '荃湾区', code: '810307' },
        { name: '葵青区', code: '810308' },
        { name: '离岛区', code: '810309' }
      ]
    }
  ]
};

// 澳门特别行政区数据
const macau = {
  name: '澳门特别行政区',
  code: '820000',
  children: [
    {
      name: '澳门半岛',
      code: '820100',
      children: [
        { name: '花地玛堂区', code: '820101' },
        { name: '圣安多尼堂区', code: '820102' },
        { name: '大堂区', code: '820103' },
        { name: '望德堂区', code: '820104' },
        { name: '风顺堂区', code: '820105' }
      ]
    },
    {
      name: '离岛',
      code: '820200',
      children: [
        { name: '嘉模堂区', code: '820201' },
        { name: '圣方济各堂区', code: '820202' }
      ]
    }
  ]
};

// 检查是否已存在
const existingNames = data.provinces.map(p => p.name);

if (!existingNames.includes('台湾省')) {
  data.provinces.push(taiwan);
  console.log('✓ 添加台湾省');
}

if (!existingNames.includes('香港特别行政区')) {
  data.provinces.push(hongkong);
  console.log('✓ 添加香港特别行政区');
}

if (!existingNames.includes('澳门特别行政区')) {
  data.provinces.push(macau);
  console.log('✓ 添加澳门特别行政区');
}

// 保存
fs.writeFileSync(regionsPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`\n✓ 完成！现在共有 ${data.provinces.length} 个省级行政区`);
