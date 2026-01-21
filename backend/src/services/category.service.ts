import { prisma } from './prisma';
import { cache } from './cache';
import { NotFoundError, BadRequestError } from '../utils/errors';

interface CategoryTree {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort: number;
  isActive: boolean;
  children: CategoryTree[];
}

interface CreateCategoryDto {
  parentId?: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sort?: number;
}

interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  sort?: number;
  isActive?: boolean;
}

export class CategoryService {
  private readonly CACHE_KEY = 'categories:tree';
  private readonly CACHE_TTL = 3600; // 1小时

  async getTree(): Promise<CategoryTree[]> {
    // 尝试从缓存获取
    const cached = await cache.get(this.CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    // 从数据库查询
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });

    // 构建树形结构
    const tree = this.buildTree(categories);

    // 缓存结果
    await cache.set(this.CACHE_KEY, JSON.stringify(tree), this.CACHE_TTL);

    return tree;
  }

  async getById(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    return category;
  }

  async create(data: CreateCategoryDto) {
    // 检查父分类是否存在
    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) {
        throw new BadRequestError('父分类不存在');
      }
    }

    // 检查slug是否重复
    const existing = await prisma.category.findFirst({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new BadRequestError('分类标识已存在');
    }

    const category = await prisma.category.create({
      data: {
        parentId: data.parentId || null,
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        icon: data.icon || null,
        sort: data.sort || 0,
      },
    });

    // 清除缓存
    await cache.del(this.CACHE_KEY);

    return category;
  }

  async update(id: number, data: UpdateCategoryDto) {
    const category = await this.getById(id);

    // 检查slug是否重复
    if (data.slug && data.slug !== category.slug) {
      const existing = await prisma.category.findFirst({
        where: { slug: data.slug },
      });
      if (existing) {
        throw new BadRequestError('分类标识已存在');
      }
    }

    await prisma.category.update({
      where: { id },
      data,
    });

    // 清除缓存
    await cache.del(this.CACHE_KEY);
  }

  async delete(id: number) {
    // 检查是否有子分类
    const children = await prisma.category.findMany({
      where: { parentId: id },
    });
    if (children.length > 0) {
      throw new BadRequestError('该分类下有子分类，无法删除');
    }

    await prisma.category.delete({
      where: { id },
    });

    // 清除缓存
    await cache.del(this.CACHE_KEY);
  }

  private buildTree(categories: any[]): CategoryTree[] {
    const map = new Map<number, CategoryTree>();
    const roots: CategoryTree[] = [];

    // 构建映射
    categories.forEach((cat) => {
      map.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        sort: cat.sort,
        isActive: cat.isActive,
        children: [],
      });
    });

    // 构建树
    categories.forEach((cat) => {
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
}
