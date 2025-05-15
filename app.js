// app.js
import { getDeepSeekResponse } from './deepseek.js';

window.addEventListener('DOMContentLoaded', async () => {
  const chatBox = document.getElementById('chatbox1');
  const userText = '在这里和我聊天哦';

  try {
    const raw = await getDeepSeekResponse(userText);
    // 假如 getDeepSeekResponse 返回的是完整的 JSON 对象
    // 先判断 raw 是否为字符串，尝试解析
    let data;
    if (typeof raw === 'string') {
      data = JSON.parse(raw);
    } else {
      data = raw;
    }
    // 只提取 AI 的回答文本
    const reply = data.choices[0].message.content;

    chatBox.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = reply;
    chatBox.appendChild(p);

  } catch (err) {
    console.error('DeepSeek 主逻辑出错：', err);
    chatBox.textContent = '抱歉，我可能有点迟钝了，不知道该如何回复您呐！';
  }
});



// gpt式逐字渐显动画（AI端）
function typewriterEffect(containerId, text, charDelay = 50) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';  // 清空

  // 为每个字符创建 span，并设置动画延迟
  text.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.animationDelay = `${i * charDelay}ms`;
    container.appendChild(span);
  });
}

// 示例：页面加载完或拿到 AI 回复后调用
document.addEventListener('DOMContentLoaded', () => {
  const replyText = '啊啦~欢迎光临呢！(◕‿◕✿) 今天天气真好呢……';
  typewriterEffect('chatbox1-info', replyText, 50);     //50ms决定每个字符出现的间隔，值越小效果越快；
});
