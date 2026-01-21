# UI规范文档

**重型机械信息中介平台**

---

## 一、核心原则

**强制要求**：
1. 全端自适应（移动端优先）
2. 字体大小可调整
3. 明暗主题切换

---

## 二、响应式设计规范

### 2.1 断点定义

| 设备类型 | 屏幕宽度 | 优先级 |
|---------|---------|--------|
| 移动端 | < 768px | 最高 |
| 平板端 | 768px - 1024px | 中 |
| 桌面端 | > 1024px | 低 |

### 2.2 布局规则

**移动端（< 768px）**
- 单列布局
- 内容宽度：100%
- 左右边距：16px
- 卡片间距：12px
- 导航：底部固定导航栏

**平板端（768px - 1024px）**
- 双列布局（列表页）
- 单列布局（详情页）
- 内容宽度：100%
- 左右边距：24px
- 卡片间距：16px

**桌面端（> 1024px）**
- 三列布局（列表页）
- 居中布局（详情页，最大宽度1200px）
- 左右边距：32px
- 卡片间距：20px
- 导航：顶部固定导航栏

### 2.3 图片适配

- 使用响应式图片（srcset）
- 移动端加载小图（宽度750px）
- 桌面端加载大图（宽度1920px）
- 图片懒加载
- 占位图显示

### 2.4 触控优化

**移动端**
- 按钮最小尺寸：48px × 48px
- 按钮间距：≥ 8px
- 可点击区域：≥ 44px × 44px
- 滑动操作支持
- 长按操作支持

**桌面端**
- 按钮最小尺寸：32px × 32px
- 鼠标悬停效果
- 键盘导航支持

---

## 三、字体规范

### 3.1 字体大小档位

| 档位 | 移动端 | 桌面端 | 说明 |
|------|--------|--------|------|
| 小 | 12px | 13px | 辅助文字 |
| 标准 | 14px | 15px | 正文（默认） |
| 中 | 16px | 17px | 强调文字 |
| 大 | 18px | 19px | 标题 |
| 特大 | 20px | 22px | 主标题 |

### 3.2 字体调整功能

**调整入口**
- 页面右上角"字体大小"按钮
- 个人中心"显示设置"

**调整档位**
- 小号（90%）
- 标准（100%，默认）
- 中号（110%）
- 大号（120%）
- 特大号（130%）

**实现方式**
- 使用CSS变量控制
- 根元素font-size动态调整
- 所有字体使用rem单位
- 保存用户偏好到localStorage

**代码示例**
```css
:root {
  --font-size-base: 14px; /* 移动端 */
  --font-scale: 1; /* 默认缩放比例 */
}

@media (min-width: 1024px) {
  :root {
    --font-size-base: 15px; /* 桌面端 */
  }
}

html {
  font-size: calc(var(--font-size-base) * var(--font-scale));
}

body {
  font-size: 1rem; /* 14px * 缩放比例 */
}

h1 {
  font-size: 1.5rem; /* 21px * 缩放比例 */
}
```

### 3.3 字体家族

**中文字体**
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", 
             "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", 
             "Helvetica Neue", Helvetica, Arial, sans-serif;
```

**数字字体**
```css
font-family: "SF Pro Display", "Roboto", "Helvetica Neue", Arial, sans-serif;
```

### 3.4 行高规范

- 正文行高：1.6
- 标题行高：1.3
- 按钮文字行高：1.2

---

## 四、主题规范

### 4.1 主题切换功能

**切换入口**
- 页面右上角"主题切换"按钮（太阳/月亮图标）
- 个人中心"显示设置"

**主题选项**
- 浅色主题（默认）
- 深色主题
- 跟随系统

**实现方式**
- 使用CSS变量定义颜色
- 通过data-theme属性切换
- 保存用户偏好到localStorage
- 支持系统主题自动切换

### 4.2 浅色主题配色

**主色调**
- 主色：#1890ff（蓝色）
- 成功色：#52c41a（绿色）
- 警告色：#faad14（橙色）
- 错误色：#f5222d（红色）

**背景色**
- 页面背景：#f5f5f5
- 卡片背景：#ffffff
- 悬停背景：#fafafa
- 禁用背景：#f5f5f5

**文字色**
- 主文字：#262626
- 次要文字：#595959
- 辅助文字：#8c8c8c
- 禁用文字：#bfbfbf

**边框色**
- 默认边框：#d9d9d9
- 分割线：#f0f0f0

### 4.3 深色主题配色

**主色调**
- 主色：#177ddc（蓝色）
- 成功色：#49aa19（绿色）
- 警告色：#d89614（橙色）
- 错误色：#d32029（红色）

**背景色**
- 页面背景：#141414
- 卡片背景：#1f1f1f
- 悬停背景：#262626
- 禁用背景：#1f1f1f

**文字色**
- 主文字：#e8e8e8
- 次要文字：#a6a6a6
- 辅助文字：#737373
- 禁用文字：#595959

**边框色**
- 默认边框：#434343
- 分割线：#303030

### 4.4 CSS变量定义

```css
/* 浅色主题 */
:root[data-theme="light"] {
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #f5222d;
  
  --bg-page: #f5f5f5;
  --bg-card: #ffffff;
  --bg-hover: #fafafa;
  --bg-disabled: #f5f5f5;
  
  --text-primary: #262626;
  --text-secondary: #595959;
  --text-tertiary: #8c8c8c;
  --text-disabled: #bfbfbf;
  
  --border-default: #d9d9d9;
  --border-divider: #f0f0f0;
}

/* 深色主题 */
:root[data-theme="dark"] {
  --color-primary: #177ddc;
  --color-success: #49aa19;
  --color-warning: #d89614;
  --color-error: #d32029;
  
  --bg-page: #141414;
  --bg-card: #1f1f1f;
  --bg-hover: #262626;
  --bg-disabled: #1f1f1f;
  
  --text-primary: #e8e8e8;
  --text-secondary: #a6a6a6;
  --text-tertiary: #737373;
  --text-disabled: #595959;
  
  --border-default: #434343;
  --border-divider: #303030;
}
```

### 4.5 主题切换动画

```css
* {
  transition: background-color 0.3s ease, 
              color 0.3s ease, 
              border-color 0.3s ease;
}
```

---

## 五、组件规范

### 5.1 按钮

**尺寸**
- 小：移动端32px，桌面端28px
- 中：移动端40px，桌面端32px（默认）
- 大：移动端48px，桌面端40px

**圆角**
- 默认：4px
- 圆形按钮：50%

**状态**
- 默认
- 悬停（桌面端）
- 激活
- 禁用

### 5.2 输入框

**高度**
- 移动端：48px
- 桌面端：40px

**圆角**：4px

**边框**：1px solid var(--border-default)

**聚焦**：边框色变为主色

### 5.3 卡片

**圆角**：8px

**阴影**
- 浅色主题：0 2px 8px rgba(0, 0, 0, 0.1)
- 深色主题：0 2px 8px rgba(0, 0, 0, 0.3)

**内边距**
- 移动端：16px
- 桌面端：24px

### 5.4 导航栏

**高度**
- 移动端：56px
- 桌面端：64px

**背景**
- 浅色主题：#ffffff
- 深色主题：#1f1f1f

**固定**：顶部固定（桌面端）/ 底部固定（移动端）

---

## 六、图标规范

### 6.1 图标尺寸

- 小：16px
- 中：20px（默认）
- 大：24px
- 特大：32px

### 6.2 图标颜色

- 默认：var(--text-secondary)
- 激活：var(--color-primary)
- 禁用：var(--text-disabled)

### 6.3 图标库

- 使用统一图标库（如：Ant Design Icons / Heroicons）
- 支持SVG格式
- 支持主题色自动适配

---

## 七、动画规范

### 7.1 过渡时间

- 快速：0.15s
- 标准：0.3s（默认）
- 慢速：0.5s

### 7.2 缓动函数

- 标准：ease
- 进入：ease-out
- 退出：ease-in
- 进入退出：ease-in-out

### 7.3 常用动画

**淡入淡出**
```css
.fade-enter {
  opacity: 0;
}
.fade-enter-active {
  opacity: 1;
  transition: opacity 0.3s ease;
}
```

**滑动**
```css
.slide-enter {
  transform: translateY(20px);
  opacity: 0;
}
.slide-enter-active {
  transform: translateY(0);
  opacity: 1;
  transition: all 0.3s ease;
}
```

---

## 八、无障碍规范

### 8.1 语义化HTML

- 使用正确的HTML标签
- 使用ARIA属性
- 表单元素关联label

### 8.2 键盘导航

- 所有交互元素可通过Tab键访问
- 焦点样式清晰可见
- 支持Enter/Space触发操作

### 8.3 对比度

**浅色主题**
- 正文文字对比度：≥ 4.5:1
- 大号文字对比度：≥ 3:1

**深色主题**
- 正文文字对比度：≥ 7:1
- 大号文字对比度：≥ 4.5:1

---

## 九、性能规范

### 9.1 首屏加载

- 关键CSS内联
- 非关键CSS异步加载
- 字体异步加载

### 9.2 图片优化

- 使用WebP格式
- 图片懒加载
- 响应式图片

### 9.3 动画性能

- 使用transform和opacity
- 避免使用width/height动画
- 使用will-change提示浏览器

---

## 十、开发规范

### 10.1 CSS组织

- 使用CSS变量
- 使用CSS Modules或Scoped CSS
- 避免全局样式污染

### 10.2 命名规范

- 使用BEM命名法
- 类名语义化
- 避免使用ID选择器

### 10.3 浏览器兼容

- 支持Chrome 90+
- 支持Safari 14+
- 支持Firefox 88+
- 支持Edge 90+
- 移动端支持iOS 14+、Android 10+

---

## 十一、测试检查清单

### 11.1 响应式测试

- [ ] 移动端（375px、414px）
- [ ] 平板端（768px、1024px）
- [ ] 桌面端（1280px、1920px）
- [ ] 横屏/竖屏切换

### 11.2 字体测试

- [ ] 小号字体显示正常
- [ ] 标准字体显示正常
- [ ] 中号字体显示正常
- [ ] 大号字体显示正常
- [ ] 特大号字体显示正常
- [ ] 字体设置持久化

### 11.3 主题测试

- [ ] 浅色主题显示正常
- [ ] 深色主题显示正常
- [ ] 主题切换动画流畅
- [ ] 主题设置持久化
- [ ] 跟随系统主题

### 11.4 交互测试

- [ ] 触控操作流畅
- [ ] 键盘导航正常
- [ ] 焦点样式清晰
- [ ] 动画性能良好

---

**文档版本**：v1.0  
**发布日期**：2026-01-21  
**适用范围**：重型机械信息中介平台所有前端页面
