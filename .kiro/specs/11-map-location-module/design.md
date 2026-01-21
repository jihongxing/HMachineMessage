# 地图定位模块 - 设计文档

## 技术方案

### 1. 距离计算
```typescript
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 地球半径（公里）
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
```

### 2. 地理编码服务
```typescript
class GeocodingService {
  async geocode(address: string): Promise<Coordinates> {
    // 检查缓存
    const cached = await this.getCache(address);
    if (cached) return cached;
    
    // 调用高德API
    const response = await fetch(
      `https://restapi.amap.com/v3/geocode/geo?address=${address}&key=${key}`
    );
    const data = await response.json();
    
    const [lon, lat] = data.geocodes[0].location.split(',');
    const coords = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    
    // 缓存结果
    await this.setCache(address, coords);
    
    return coords;
  }
  
  async reverseGeocode(lat: number, lon: number): Promise<string> {
    const key = `${lat},${lon}`;
    const cached = await this.getCache(key);
    if (cached) return cached.address;
    
    const response = await fetch(
      `https://restapi.amap.com/v3/geocode/regeo?location=${lon},${lat}&key=${key}`
    );
    const data = await response.json();
    
    const address = data.regeocode.formatted_address;
    await this.setCache(key, { address, latitude: lat, longitude: lon });
    
    return address;
  }
}
```

### 3. 附近设备查询
```typescript
async function getNearbyEquipment(
  lat: number,
  lon: number,
  radius: number = 50
): Promise<Equipment[]> {
  // 简单实现：查询所有设备，计算距离，过滤
  const equipment = await prisma.equipment.findMany({
    where: {
      status: 1,
      latitude: { not: null },
      longitude: { not: null },
    },
  });
  
  return equipment
    .map(e => ({
      ...e,
      distance: calculateDistance(lat, lon, e.latitude!, e.longitude!),
    }))
    .filter(e => e.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}

// 优化版：使用空间索引（PostGIS）
async function getNearbyEquipmentOptimized(
  lat: number,
  lon: number,
  radius: number = 50
): Promise<Equipment[]> {
  return prisma.$queryRaw`
    SELECT *,
      ST_Distance(
        ST_MakePoint(longitude, latitude)::geography,
        ST_MakePoint(${lon}, ${lat})::geography
      ) / 1000 as distance
    FROM equipment
    WHERE status = 1
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
      AND ST_DWithin(
        ST_MakePoint(longitude, latitude)::geography,
        ST_MakePoint(${lon}, ${lat})::geography,
        ${radius * 1000}
      )
    ORDER BY distance
  `;
}
```

### 4. 前端地图组件
```typescript
'use client';

import { useEffect, useRef } from 'react';

export function MapView({ equipment, center, onMarkerClick }) {
  const mapRef = useRef<any>(null);
  
  useEffect(() => {
    // 初始化高德地图
    const map = new AMap.Map('map-container', {
      center: [center.longitude, center.latitude],
      zoom: 12,
    });
    
    mapRef.current = map;
    
    // 添加标记
    equipment.forEach(item => {
      const marker = new AMap.Marker({
        position: [item.longitude, item.latitude],
        title: item.model,
      });
      
      marker.on('click', () => onMarkerClick(item));
      map.add(marker);
    });
    
    return () => map.destroy();
  }, [equipment, center]);
  
  return <div id="map-container" style={{ width: '100%', height: '600px' }} />;
}
```

## 缓存策略

```typescript
// 地理编码结果缓存（7天）
cache.set(`geocode:${address}`, coords, 604800);

// 逆向编码结果缓存（7天）
cache.set(`reverse:${lat},${lon}`, address, 604800);
```

## 性能优化

- 地理编码结果缓存
- 空间索引优化查询
- 地图懒加载
- 标记聚合（大量标记时）
