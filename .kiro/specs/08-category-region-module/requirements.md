# 分类地区管理模块 - 需求文档

## 功能范围

### 1. 分类管理
- 一级分类：农业机械、工程机械、运输机械、其他机械
- 二级分类：每个一级分类下3-5个子分类
- 分类列表查询
- 分类树形结构

### 2. 地区管理
- 三级联动：省/市/县
- 地区列表查询
- 地区树形结构
- 地区坐标数据

### 3. 初始数据
- 分类初始数据（JSON配置）
- 地区初始数据（国家统计局数据）
- 数据导入脚本

### 4. 后台管理
- 分类增删改查
- 分类排序
- 分类启用/禁用
- 地区数据更新

## 数据模型

### Category表
- id, parentId, name, slug
- description, icon, sort
- isActive, createdAt

### Region表
- id, parentId, name, code
- level, latitude, longitude
- createdAt

## API接口

### 分类
1. GET /api/v1/categories - 分类列表（树形）
2. GET /api/v1/categories/:id - 分类详情
3. POST /api/v1/admin/categories - 创建分类
4. PUT /api/v1/admin/categories/:id - 更新分类
5. DELETE /api/v1/admin/categories/:id - 删除分类

### 地区
6. GET /api/v1/regions - 地区列表
7. GET /api/v1/regions/:id/children - 子地区列表
8. POST /api/v1/admin/regions/import - 导入地区数据

## 初始数据结构

### 分类数据
```json
{
  "categories": [
    {
      "name": "农业机械",
      "slug": "agricultural",
      "children": [
        {"name": "耕整地", "slug": "tillage"},
        {"name": "播种/插秧", "slug": "planting"},
        {"name": "收获", "slug": "harvester"}
      ]
    }
  ]
}
```

### 地区数据
- 数据来源：国家统计局行政区划代码
- 格式：省市县三级JSON

## 验收标准

- 分类数据完整
- 地区数据准确（省市县三级）
- 树形结构正确
- 查询性能良好
- 缓存机制有效
