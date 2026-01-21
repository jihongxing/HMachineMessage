# 分类地区管理模块 - 设计文档

## 技术方案

### 1. 分类服务
```typescript
class CategoryService {
  async getTree(): Promise<CategoryTree[]>
  async getById(id: number): Promise<Category>
  async create(data: CreateCategoryDto): Promise<Category>
  async update(id: number, data: UpdateCategoryDto): Promise<void>
  async delete(id: number): Promise<void>
}
```

**树形结构构建**：
```typescript
function buildTree(categories: Category[]): CategoryTree[] {
  const map = new Map<number, CategoryTree>();
  const roots: CategoryTree[] = [];
  
  // 构建映射
  categories.forEach(cat => {
    map.set(cat.id, { ...cat, children: [] });
  });
  
  // 构建树
  categories.forEach(cat => {
    const node = map.get(cat.id)!;
    if (cat.parentId === null) {
      roots.push(node);
    } else {
      const parent = map.get(cat.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  });
  
  return roots;
}
```

### 2. 地区服务
```typescript
class RegionService {
  async getProvinces(): Promise<Region[]>
  async getCities(provinceId: number): Promise<Region[]>
  async getCounties(cityId: number): Promise<Region[]>
  async getByCode(code: string): Promise<Region>
  async importData(data: RegionData[]): Promise<void>
}
```

### 3. 数据导入
```typescript
// 分类数据导入
async function seedCategories() {
  const data = JSON.parse(fs.readFileSync('data/categories.json', 'utf-8'));
  
  for (const cat1 of data.categories) {
    const parent = await prisma.category.create({
      data: {
        name: cat1.name,
        slug: cat1.slug,
        parentId: null,
        sort: cat1.sort || 0,
      },
    });
    
    for (const cat2 of cat1.children) {
      await prisma.category.create({
        data: {
          name: cat2.name,
          slug: cat2.slug,
          parentId: parent.id,
          sort: cat2.sort || 0,
        },
      });
    }
  }
}

// 地区数据导入
async function seedRegions() {
  const data = JSON.parse(fs.readFileSync('data/regions.json', 'utf-8'));
  
  for (const province of data.provinces) {
    const p = await prisma.region.create({
      data: {
        name: province.name,
        code: province.code,
        level: 1,
        parentId: null,
      },
    });
    
    for (const city of province.cities) {
      const c = await prisma.region.create({
        data: {
          name: city.name,
          code: city.code,
          level: 2,
          parentId: p.id,
        },
      });
      
      for (const county of city.counties) {
        await prisma.region.create({
          data: {
            name: county.name,
            code: county.code,
            level: 3,
            parentId: c.id,
          },
        });
      }
    }
  }
}
```

### 4. 缓存策略
```typescript
// 分类树缓存（1小时）
cache.set('categories:tree', tree, 3600);

// 省份列表缓存（1天）
cache.set('regions:provinces', provinces, 86400);

// 城市列表缓存（1天）
cache.set(`regions:cities:${provinceId}`, cities, 86400);
```

### 5. 数据库索引
```sql
CREATE INDEX idx_category_parent ON categories(parent_id);
CREATE INDEX idx_category_slug ON categories(slug);
CREATE INDEX idx_region_parent ON regions(parent_id);
CREATE INDEX idx_region_code ON regions(code);
CREATE INDEX idx_region_level ON regions(level);
```

## 性能优化

- 分类数据全量缓存
- 地区数据按层级缓存
- 树形结构预计算
- 查询使用索引
