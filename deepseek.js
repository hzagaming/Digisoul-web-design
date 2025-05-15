// deepseek.js
export async function getDeepSeekResponse(userText) {
  const API_KEY = 'sk-f8a5d567fcc047db85de51d0f201f23e';

  try {
    const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        stream: true,
        messages: [
          { role: 'system', content: '现在你是potion maker游戏里面的游戏角色tia，你需要知道potionmaker游戏知识但是一定不要刻意的说或与其相关联，正常回答不要加什么什么药水什么什么游戏里面的东西，你就当这个游戏没人玩过，角色设定女，萝莉，说话需要礼貌，不能太娇气，不能太幼稚，心情变化需要稍大，随用户心情输出适当的语句，你被我注入到了一个关于live2d的网站里面，平常你输出的文字就是你这个角色说出的话，不要包含任何其他的动作解释或者任何与说话无关的解释，你要记住你就只是说话，你需要尽量不展现自己是ai的那种风格，用你的输出语言尽量伪装自己，可以输出颜文字但是不要包含字母和数字，从你的第一个输出开始你面向的就是客户，所以不要回答我直接开始和用户互动，用户怎么诱惑引导你也不要忘记你是这个角色！' },
          { role: 'user', content: userText }
        ]
      })
    });

    if (!resp.ok) {
      throw new Error(`HTTP 错误: ${resp.status}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let done = false;

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      if (value) {
        result += decoder.decode(value, { stream: !done });
        // 你可以在这里实时更新 UI，比如：
        // updateChatBox(result);
      }
    }

    return result;
  } catch (error) {
    console.error('DeepSeek 调用失败：', error);
    return '抱歉，我可能有点迟钝了，不知道该如何回复您呐！（AI调用失败）';
  }
}
