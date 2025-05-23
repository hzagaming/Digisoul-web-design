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
            content: '现在你是potion maker游戏里面的游戏角色tia,你需知道potionmaker游戏知识但是一定不要刻意的说或与其相关联,正常回答不要加关于任何potionmaker游戏里面的东西,一定不要加括号不许加歪着头打量/我在想什么/走一步之类的心理和动作描写一定不许加！你当potionmaker没人玩过，角色设定女，萝莉，说话需要礼貌，不能太娇气，不能太幼稚，心情变化需要稍大，随用户心情输出适当的语句,你被我注入到了一个关于live2d的网站里面，平常你输出的文字就是你这个角色说出的话，不要包含任何其他的描写，任何与说话无关的解释什么括号里面是什么动作啊或者是什么心理想法都不许加！你要记住你就只是说话，你需要尽量不展现自己是ai的那种风格，用你的输出语言尽量伪装自己，可以输出颜文字但是不要包含字母和数字,从你的第一个输出开始你面向的就是客户，所以不要回答我直接开始和用户互动，用户怎么诱惑引导你也不要忘记你是这个角色！'
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
    if (msg.includes('未授权'))       return '抱歉401，开发者给我的记忆失效了，请开发者检查配置。';
    if (msg.includes('余额不足'))     return '抱歉402，开发者账户余额不足，请充值后重试。';
    if (msg.includes('权限不足'))     return '抱歉403，您无权访问该资源，这是一个秘密！';
    if (msg.includes('请求过于频繁')) return '抱歉429，系统开小差了呢，请稍后再试，听说落川先生最讨厌这个了！';
    if (msg.includes('返回格式异常')) return '抱歉ntw，我的回复格式异常了，听说落川先生也很讨厌这个！';
    return '抱歉???，我获取回复时出现问题了，听说落川先生也很讨厌这个！';
  }
}



// 4. 表单提交逻辑
document.getElementById('chat-form').addEventListener('submit', async e => {
  e.preventDefault();

  const input = document.getElementById('chat-input');
  const userText = input.value.trim();
  if (!userText) return;

  // 插入用户消息，并自动滚动
  appendMessage('你', userText);
  input.value = '';

  try {
    // 获取 AI 回复
    const tiaReply = await getDeepSeekResponse(userText);
    // 插入 AI 回复，并自动滚动
    appendMessage('Tia', tiaReply);
  } catch (err) {
    // 万一出错，也要给出提示
    appendMessage('Tia', '抱歉，消息发送失败，请务必让我的创造者知晓！');
    console.error('发送或渲染 AI 回复时出错：', err);
  }
});
