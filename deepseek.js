// deepseek.js

// 1. 插入消息函数
function appendMessage(role, text) {
  const chatContent = document.getElementById('chat-content');
  if (!chatContent) return;
  const p = document.createElement('p');
  p.className = role === 'user' ? 'user-msg' : 'ai-msg';
  p.textContent = text;
  chatContent.appendChild(p);
}

// 2. 自动滚动到底部
function scrollToBottom() {
  const chatContent = document.getElementById('chat-content');
  if (!chatContent) return;
  const last = chatContent.lastElementChild;
  if (last) {
    last.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
}
const chatContentEl = document.getElementById('chat-content');
if (chatContentEl) {
  new MutationObserver(scrollToBottom).observe(chatContentEl, {
    childList: true,
    subtree: false
  });
}

// 3. 获取 DeepSeek 回复
export async function getDeepSeekResponse(userText) {
  // ——改动：使用 Vercel 部署时的绝对 URL——
  const ENDPOINT = 'https://deepseek-proxy-git-main-hahas-projects-bce15795.vercel.app/api/chat';

  try {
    const resp = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        stream: false,
        messages: [
          {
            role: 'system',
            content: '现在你是potion maker游戏里面的游戏角色tia…（省略角色设定）…'
          },
          { role: 'user', content: userText }
        ]
      })
    });

    if (!resp.ok) {
      switch (resp.status) {
        case 401: throw new Error('未授权：API Key 无效或已过期');
        case 402: throw new Error('余额不足，请充值后重试');
        case 403: throw new Error('禁止访问：权限不足');
        case 429: throw new Error('请求过于频繁，请稍后再试');
        default:  throw new Error(`网络错误：${resp.status}`);
      }
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new Error('返回格式异常，无法提取内容');
    }
    return content.trim();

  } catch (error) {
    console.error('DeepSeek 调用失败：', error);
    const msg = error.message || '';
    if (msg.includes('未授权'))       return '抱歉，开发者给我的记忆失效了，请开发者检查配置。';
    if (msg.includes('余额不足'))     return '抱歉，开发者账户余额不足，请充值后重试。';
    if (msg.includes('权限不足'))     return '抱歉，您无权访问该资源。';
    if (msg.includes('请求过于频繁')) return '系统开小差了呢，请稍后再试。';
    if (msg.includes('返回格式异常')) return '抱歉，我的回复格式突然异常了。';
    return '抱歉，我获取回复时出现问题了。';
  }
}

// 4. 表单提交逻辑
document.getElementById('chat-form').addEventListener('submit', async e => {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  appendMessage('user', text);
  input.value = '';
  const reply = await getDeepSeekResponse(text);
  appendMessage('ai', reply);
});
