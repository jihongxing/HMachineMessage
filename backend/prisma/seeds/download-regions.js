// 下载完整行政区划数据
const https = require('https');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/modood/Administrative-divisions-of-China/master/dist/pcas-code.json';

console.log('正在下载完整行政区划数据...');

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const regions = JSON.parse(data);
      
      // 转换为我们的格式
      const formatted = {
        provinces: Object.entries(regions).map(([code, province]) => ({
          name: province.name,
          code: code,
          children: Object.entries(province.children || {}).map(([cityCode, city]) => ({
            name: city.name,
            code: cityCode,
            children: Object.entries(city.children || {}).map(([countyCode, county]) => ({
              name: county,
              code: countyCode
            }))
          }))
        }))
      };
      
      fs.writeFileSync(
        __dirname + '/regions.json',
        JSON.stringify(formatted, null, 2),
        'utf-8'
      );
      
      console.log('✓ 数据下载完成！');
      console.log(`✓ 共 ${formatted.provinces.length} 个省级行政区`);
    } catch (error) {
      console.error('数据解析失败:', error);
    }
  });
}).on('error', (error) => {
  console.error('下载失败:', error);
  console.log('\n备用方案：手动下载');
  console.log('1. 访问: https://github.com/modood/Administrative-divisions-of-China');
  console.log('2. 下载 pcas-code.json');
  console.log('3. 放到 backend/prisma/seeds/ 目录');
});
