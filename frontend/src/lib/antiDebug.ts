// 反调试保护
export function initAntiDebug() {
  if (typeof window === 'undefined') return;
  
  // 生产环境强制启用，开发/测试环境根据配置
  const isProduction = process.env.NODE_ENV === 'production';
  const enabled = isProduction || process.env.NEXT_PUBLIC_ANTI_DEBUG === 'true';
  
  if (!enabled) {
    console.log('[AntiDebug] Disabled in development mode');
    return;
  }

  // 1. 禁用右键
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // 2. 禁用F12和常用快捷键
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && e.key === 'I') ||
      (e.ctrlKey && e.shiftKey && e.key === 'J') ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
      return false;
    }
  });

  // 3. 检测DevTools
  const detectDevTools = () => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
      // DevTools打开
      document.body.innerHTML = '<h1 style="text-align:center;margin-top:50px;">请关闭开发者工具</h1>';
    }
  };

  // 4. 定时检测
  setInterval(detectDevTools, 1000);

  // 5. 禁用console
  if (isProduction) {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.info = () => {};
    console.debug = () => {};
  }
}

// 防止代码被复制
export function preventCopy() {
  if (typeof window === 'undefined') return;
  
  // 生产环境强制启用，开发/测试环境根据配置
  const isProduction = process.env.NODE_ENV === 'production';
  const enabled = isProduction || process.env.NEXT_PUBLIC_PREVENT_COPY === 'true';
  
  if (!enabled) {
    console.log('[PreventCopy] Disabled in development mode');
    return;
  }

  document.addEventListener('copy', (e) => {
    e.preventDefault();
    return false;
  });

  document.addEventListener('cut', (e) => {
    e.preventDefault();
    return false;
  });

  // 禁用选择
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';
}
