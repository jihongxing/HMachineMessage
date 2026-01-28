'use client';

export default function AgreementPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">用户注册协议</h1>
          <p className="text-sm text-gray-500 mb-6">生效日期：2026年1月22日</p>
          
          <div className="prose dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
            <p>欢迎使用重型机械信息中介平台（以下简称"本平台"）。在注册成为本平台用户前，请您仔细阅读并充分理解本协议的全部内容。</p>

            <h2 className="text-lg font-bold mt-6">一、协议接受</h2>
            <p>1.1 本协议是您与本平台之间关于使用本平台服务所订立的协议。</p>
            <p>1.2 您点击"同意"或"注册"按钮，即表示您已阅读、理解并同意接受本协议的全部内容。</p>
            <p>1.3 如果您不同意本协议的任何内容，请立即停止注册或使用本平台服务。</p>

            <h2 className="text-lg font-bold mt-6">二、服务说明</h2>
            <p>2.1 <strong>服务性质</strong>：本平台是重型机械信息展示和撮合服务平台，仅提供信息发布、展示和查询服务，不参与任何交易、作业调度或结算。</p>
            <p>2.2 <strong>服务范围</strong>：机械信息发布和展示、机械信息搜索和筛选、联系方式查看、二维码分享、增值排名服务。</p>
            <p>2.3 <strong>免责声明</strong>：本平台不对用户发布的信息真实性、准确性、合法性负责，不对用户之间的交易承担任何责任。</p>

            <h2 className="text-lg font-bold mt-6">三、用户注册</h2>
            <p>3.1 <strong>注册资格</strong>：年满18周岁，具有完全民事行为能力；提供真实、准确、完整的注册信息；遵守中华人民共和国相关法律法规。</p>
            <p>3.2 <strong>账号安全</strong>：您应妥善保管账号和密码，不得转让或出借。因您保管不善导致的损失由您自行承担。</p>

            <h2 className="text-lg font-bold mt-6">四、用户权利与义务</h2>
            <p>4.1 您有权免费使用本平台的基础服务，包括浏览机械信息、发布机械信息（需审核）、搜索和筛选机械、查看联系方式（有限额）。</p>
            <p>4.2 您有权选择购买增值服务，包括推荐位展示和置顶位展示。</p>
            <p>4.3 发布的机械信息必须真实、准确、完整，不得发布虚假、误导性信息。</p>

            <h2 className="text-lg font-bold mt-6">五、违规处理</h2>
            <p>5.1 轻微违规（信息不完整、图片质量差）：警告 + 要求修改。</p>
            <p>5.2 中度违规（虚假信息、重复发布）：下架信息 + 降级。</p>
            <p>5.3 严重违规（违法内容、恶意刷单）：永久封号 + 黑名单。</p>

            <h2 className="text-lg font-bold mt-6">六、免责声明</h2>
            <p>6.1 本平台不对用户发布的信息真实性、准确性、合法性负责。</p>
            <p>6.2 用户之间的交易由用户自行承担风险，本平台不承担任何责任。</p>
            <p>6.3 因不可抗力导致的服务中断，本平台不承担责任。</p>

            <h2 className="text-lg font-bold mt-6">七、联系方式</h2>
            <p>客服邮箱：jhx800@163.com</p>
            <p>客服电话：400-855-1985</p>
            <p>工作时间：周一至周五 9:00-18:00</p>

            <p className="mt-8 text-gray-500">本协议自您点击"同意"或"注册"按钮之日起生效。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
