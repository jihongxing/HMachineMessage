'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">隐私政策</h1>
          <p className="text-sm text-gray-500 mb-6">生效日期：2026年1月22日</p>
          
          <div className="prose dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
            <p>重型机械信息中介平台（以下简称"我们"或"本平台"）深知个人信息对您的重要性，我们将按照法律法规要求，采取相应的安全保护措施，保护您的个人信息安全可控。</p>

            <h2 className="text-lg font-bold mt-6">一、我们收集的信息</h2>
            <h3 className="font-bold">1.1 您主动提供的信息</h3>
            <p><strong>注册信息</strong>：手机号码（必需）、密码（必需）、昵称（可选）、头像（可选）</p>
            <p><strong>机械信息</strong>：设备分类、型号、所在地区、详细地址、价格、联系方式、设备图片、描述</p>
            
            <h3 className="font-bold">1.2 我们自动收集的信息</h3>
            <p><strong>设备信息</strong>：设备型号、操作系统、浏览器类型和版本</p>
            <p><strong>日志信息</strong>：IP地址、访问时间、访问页面、操作记录</p>
            <p><strong>位置信息</strong>（需授权）：GPS定位信息，用于计算距离和地图展示</p>

            <h2 className="text-lg font-bold mt-6">二、我们如何使用信息</h2>
            <p>2.1 <strong>提供服务</strong>：用户注册和登录、机械信息发布和展示、搜索和筛选功能、联系方式查看、距离计算和地图展示、支付和订单管理</p>
            <p>2.2 <strong>改进服务</strong>：分析用户行为，优化产品功能；统计访问数据，改进用户体验</p>
            <p>2.3 <strong>安全保障</strong>：防止欺诈、滥用和违法行为；检测和防范安全事件；验证用户身份</p>
            <p>2.4 <strong>通知和推送</strong>：审核结果通知、付费到期提醒、互动通知、系统公告</p>

            <h2 className="text-lg font-bold mt-6">三、我们如何共享信息</h2>
            <p>我们不会与第三方共享您的个人信息，除非：</p>
            <p>3.1 获得您的明确同意后共享</p>
            <p>3.2 业务合作伙伴：短信服务商（发送验证码）、支付服务商（处理支付）、云存储服务商（存储图片）、地图服务商（计算距离）</p>
            <p>注：我们会与合作伙伴签订严格的保密协议。</p>

            <h2 className="text-lg font-bold mt-6">四、我们如何保护信息</h2>
            <p>4.1 <strong>技术措施</strong>：数据加密（SSL/TLS加密传输，敏感数据加密存储）、访问控制、安全审计、防火墙、数据备份</p>
            <p>4.2 <strong>管理措施</strong>：员工培训、保密协议、访问审批、应急响应</p>
            <p>4.3 <strong>数据脱敏</strong>：身份证号仅显示前6位和后4位；手机号仅显示前3位和后4位</p>

            <h2 className="text-lg font-bold mt-6">五、您的权利</h2>
            <p>5.1 <strong>访问权</strong>：您有权访问您的个人信息</p>
            <p>5.2 <strong>更正权</strong>：您有权更正不准确或不完整的个人信息</p>
            <p>5.3 <strong>删除权</strong>：您有权要求删除个人信息</p>
            <p>5.4 <strong>注销权</strong>：您有权注销账号，注销后数据保留30天（可恢复），30天后永久删除</p>

            <h2 className="text-lg font-bold mt-6">六、信息存储</h2>
            <p>6.1 <strong>存储地点</strong>：您的个人信息存储在中华人民共和国境内</p>
            <p>6.2 <strong>存储期限</strong>：账户信息（账号存续期间）、机械信息（发布后180天）、订单信息（3年）、日志信息（6个月）</p>

            <h2 className="text-lg font-bold mt-6">七、未成年人保护</h2>
            <p>本平台服务对象为年满18周岁的成年人。如您是未成年人，请在监护人指导下使用本平台服务。</p>

            <h2 className="text-lg font-bold mt-6">八、联系我们</h2>
            <p>客服邮箱：jhx800@163.com</p>
            <p>客服电话：400-855-1985</p>
            <p>工作时间：周一至周五 9:00-18:00</p>
            <p>我们将在15个工作日内回复您的请求。</p>

            <p className="mt-8 text-gray-500">本政策自您点击"同意"或使用本平台服务之日起生效。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
