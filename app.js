// app.js
import { getDeepSeekResponse } from './deepseek.js';

window.addEventListener('DOMContentLoaded', async () => {
  const chatBox = document.getElementById('chatbox1');
  if (!chatBox) return console.error('哎呀有点小差错等我一下（chatbox1 元素未找到）');

  // 你现在是希望页面一打开就调用，可以直接写在这里
  const userText = '在这里和我聊天哦';

  // 调用并显示
  const reply = await getDeepSeekResponse(userText);
  chatBox.innerHTML = '';          // 清空
  const p = document.createElement('p');
  p.textContent = reply;
  chatBox.appendChild(p);
});
