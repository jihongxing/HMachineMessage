# 二维码分享模块 - 任务列表

## 后端任务

### Phase 1: 二维码服务
- [ ] 安装qrcode库
- [ ] 创建QRCodeService
- [ ] GET /equipment/:id/qrcode - 获取二维码
- [ ] 设备发布时自动生成二维码

### Phase 2: 扫码统计
- [ ] 创建ScanService
- [ ] POST /equipment/:id/scan - 记录扫码
- [ ] GET /equipment/:id/scan-stats - 扫码统计
- [ ] User-Agent解析

### Phase 3: 分享页面
- [ ] GET /share/:id - 分享页面数据
- [ ] 分享页面元数据生成

### Phase 4: 海报生成
- [ ] 安装canvas库
- [ ] 创建PosterService
- [ ] GET /equipment/:id/poster - 生成海报

## 前端任务

### Phase 1: 分享页面
- [ ] 分享页面布局
- [ ] 设备信息展示
- [ ] 联系按钮
- [ ] 引导注册/发布

### Phase 2: 二维码展示
- [ ] 设备详情页二维码展示
- [ ] 二维码下载功能
- [ ] 分享按钮

### Phase 3: 海报功能
- [ ] 海报预览
- [ ] 海报下载
- [ ] 海报分享

## 优先级

P0（必须）：
- 二维码生成
- 分享页面
- 扫码统计

P1（重要）：
- 扫码来源识别
- 统计数据展示

P2（可选）：
- 海报生成
- 海报分享
