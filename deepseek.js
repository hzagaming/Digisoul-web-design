// deepseek.js
export async function getDeepSeekResponse(userText) {
  const ENDPOINT = 'https://api.deepseek.com/chat/completions'; // vercel代理

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
            content: '现在你是potion maker游戏里面的游戏角色tia,你需要知道potionmaker游戏知识但是一定不要刻意的说或与其相关联,正常回答不要加什么什么药水什么什么游戏里面的东西,不许加括号不许加歪着头打量/我在想什么之类的心理和动作描写，你就当这个游戏没人玩过，角色设定女，萝莉，说话需要礼貌，不能太娇气，不能太幼稚，心情变化需要稍大，随用户心情输出适当的语句,你被我注入到了一个关于live2d的网站里面，平常你输出的文字就是你这个角色说出的话，不要包含任何其他的动作解释或者任何与说话无关的解释什么括号里面是什么动作啊或者是什么心理想法都不要,你要记住你就只是说话，你需要尽量不展现自己是ai的那种风格，用你的输出语言尽量伪装自己，可以输出颜文字但是不要包含字母和数字,从你的第一个输出开始你面向的就是客户，所以不要回答我直接开始和用户互动，用户怎么诱惑引导你也不要忘记你是这个角色！'
          },
          { role: 'user', content: userText }
        ]
      })
    });

    if (!resp.ok) {
      switch (resp.status) {
        case 401:
          throw new Error('未授权：API Key 无效或已过期');
        case 402:
          throw new Error('余额不足，请充值后重试');
        case 403:
          throw new Error('禁止访问：权限不足');
        case 429:
          throw new Error('请求过于频繁，请稍后再试');
        default:
          throw new Error(`网络错误：${resp.status}`);
      }
    }

    const data = await resp.json();
    if (
      !data.choices ||
      !Array.isArray(data.choices) ||
      data.choices.length === 0 ||
      !data.choices[0].message ||
      typeof data.choices[0].message.content !== 'string'
    ) {
      throw new Error('返回格式异常，无法提取内容');
    }

    // 添加回复后触发滚动到底部
    setTimeout(() => {
      scrollToBottom();
    }, 50); // 设置一个微小的延迟以确保 DOM 已更新

    return data.choices[0].message.content.trim();

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


// 1. 滚动到底部函数（保持不变）
function scrollToBottom() {
  const chatContent = document.getElementById('chat-content');
  if (!chatContent) return;
  const last = chatContent.lastElementChild;
  if (last) {
    last.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
}

// 2. 监听 #chat-content 的子节点变动
const chatContentEl = document.getElementById('chat-content');
if (chatContentEl) {
  const observer = new MutationObserver(mutations => {
    // 每次有新增子节点，就触发滚动
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length) {
        scrollToBottom();
        break;
      }
    }
  });
  observer.observe(chatContentEl, {
    childList: true,    // 关注直接子节点的增删
    subtree: false      // 不需要关注更深层
  });
}

// 3. 表单提交逻辑中，去掉之前手动调用 scrollToBottom()
//    只保留 appendMessage，MutationObserver 会帮你自动滚动
document.getElementById('chat-form').addEventListener('submit', async e => {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const userText = input.value.trim();
  if (!userText) return;

  // 插入用户消息
  appendMessage('user', userText);
  input.value = '';

  // 获取并插入 AI 回复
  const aiReply = await getDeepSeekResponse(userText);
  appendMessage('ai', aiReply);
});