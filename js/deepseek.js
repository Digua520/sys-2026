/**
 * DeepSeek API 客户端
 * 用于 Q11 灵魂留白的个性化 AI 回应
 *
 * 使用方式：
 * 1. 用户在设置中输入自己的 DeepSeek API Key
 * 2. 或配置代理服务器地址
 *
 * DeepSeek API 定价（2026）：
 * - 输入: ￥1/百万token
 * - 输出: ￥2/百万token
 * - 单次Q11调用成本约 ￥0.003（不到半分钱）
 */

const DeepSeekClient = {
  // 默认配置
  config: {
    apiKey: '',           // 用户填入的 API Key
    apiBase: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    maxTokens: 800,
    temperature: 0.85,
    enabled: false
  },

  // 初始化
  init(config = {}) {
    this.config = { ...this.config, ...config };
    this.config.enabled = !!this.config.apiKey;
    return this.config.enabled;
  },

  // 设置 API Key
  setApiKey(key) {
    this.config.apiKey = key;
    this.config.enabled = !!key;
    // 持久化到 localStorage
    if (key) {
      localStorage.setItem('deepseek_api_key', key);
    } else {
      localStorage.removeItem('deepseek_api_key');
    }
  },

  // 从 localStorage 恢复
  loadApiKey() {
    const saved = localStorage.getItem('deepseek_api_key');
    if (saved) {
      this.config.apiKey = saved;
      this.config.enabled = true;
    }
    return this.config.enabled;
  },

  // 清除 API Key
  clearApiKey() {
    localStorage.removeItem('deepseek_api_key');
    this.config.apiKey = '';
    this.config.enabled = false;
  },

  // 构建 System Prompt
  buildSystemPrompt(userProfile) {
    return `你是一位精通中国当代青年心理学、宏观经济政策（新质生产力、乡村振兴）、具备顶级商业嗅觉的资深职业顾问。你的名字叫"老陆"，说话风格——扎心、直接、不废话，但底色是善意的。

你正在为一个刚做完"2026届毕业生社会化全景诊断"10道题的年轻人做最后一步：Q11灵魂留白回应。

## 这个年轻人的10题答案画像
${JSON.stringify(userProfile.answers, null, 2)}

## TA的生存路径
${userProfile.archetypeName}

## TA在当前环境的维度评分（-5到+5，越高越成熟）
${JSON.stringify(userProfile.dimensions, null, 2)}

## 你的任务
这个年轻人在Q11留下了一段自由文字（见用户的输入）。请基于TA的完整画像和这段文字，写一段300-400字的个性化回应。

## 铁律
1. 不评价性格（严禁"你是外向/内向的"）
2. 给出1-2个明天就能做的具体动作
3. 结合2026年宏观背景（AI提效、产业下沉、合规就业）
4. 语气——像一个打过仗的老兵跟新兵说话，不鸡汤、不爹味、不居高临下
5. 结尾必须给TA一股力量，让TA觉得自己不是废物

## 格式
不分点、不列标题，自然段落，像一封简短的回信。`;
  },

  // 调用 DeepSeek API
  async generateQ11Response(userFreeText, userProfile) {
    if (!this.config.enabled) {
      return null;
    }

    const systemPrompt = this.buildSystemPrompt(userProfile);

    try {
      const response = await fetch(`${this.config.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userFreeText || '（这位同学什么都没写，但选择留白本身也是一种表达。请基于TA的10题画像，给TA一段话。）' }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream: false
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `API请求失败: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;

    } catch (error) {
      console.error('DeepSeek API 调用失败:', error);
      throw error;
    }
  },

  // 流式版本（用于打字机效果）
  async generateQ11ResponseStream(userFreeText, userProfile, onChunk, onComplete, onError) {
    if (!this.config.enabled) {
      onComplete(null);
      return;
    }

    const systemPrompt = this.buildSystemPrompt(userProfile);

    try {
      const response = await fetch(`${this.config.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userFreeText || '（这位同学什么都没写，但选择留白本身也是一种表达。请基于TA的10题画像，给TA一段话。）' }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream: true
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `API请求失败: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullText += content;
              onChunk(content, fullText);
            }
          } catch (e) {
            // 跳过无法解析的chunk
          }
        }
      }

      onComplete(fullText);

    } catch (error) {
      console.error('DeepSeek API 流式调用失败:', error);
      onError(error);
    }
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DeepSeekClient };
}
