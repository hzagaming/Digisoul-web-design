import { getDeepSeekResponse } from './deepseek.js';

window.addEventListener('DOMContentLoaded', () => {
  const form    = document.getElementById('chat-form');
  const input   = document.getElementById('chat-input');
  const content = document.getElementById('chat-content');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userText = input.value.trim();
    if (!userText) return;
    input.value = '';
    input.focus();

    // 用户消息
    const userP = document.createElement('p');
    userP.textContent = `你：${userText}`;
    content.appendChild(userP);

    // AI 回复
    const reply = await getDeepSeekResponse(userText);
    const botP = document.createElement('p');
    botP.textContent = `Tia：${reply}`;
    content.appendChild(botP);

    // 滚动到底部
    content.scrollTop = content.scrollHeight;
  });
});

