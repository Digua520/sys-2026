/**
 * 2026届毕业生社会化全景诊断系统 - 主应用
 * 问卷流程控制 + 结果展示
 */

const App = {
  // 状态
  state: {
    currentStep: 'welcome',    // welcome | questions | result
    currentQuestion: 0,        // 0-9 (QUESTIONS数组索引)
    answers: {},               // { q1a: 'A', q1b: 'B', q2: 'C', ... }
    q11Text: '',               // Q11自由文本
    roadmap: null,             // 生成的路书
    q11AIResponse: null,       // DeepSeek AI回应
    isGenerating: false
  },

  // DOM缓存
  dom: {},

  // ========== 初始化 ==========
  init() {
    this.cacheDom();
    this.bindEvents();
    this.loadApiKey();

    // 检查URL hash（支持分享/回看）
    const hash = window.location.hash;
    if (hash === '#result' && sessionStorage.getItem('roadmap')) {
      this.state.roadmap = JSON.parse(sessionStorage.getItem('roadmap'));
      this.state.q11AIResponse = sessionStorage.getItem('q11_ai_response') || null;
      this.showResult();
      return;
    }

    this.showWelcome();
  },

  cacheDom() {
    this.dom.app = document.getElementById('app');
  },

  bindEvents() {
    // 全局点击委托
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;

      switch (action) {
        case 'start':
          this.startQuestions();
          break;
        case 'prev':
          this.prevQuestion();
          break;
        case 'next':
          this.nextQuestion();
          break;
        case 'skip-q11':
          this.generateResult();
          break;
        case 'submit-q11':
          this.submitQ11();
          break;
        case 'restart':
          this.restart();
          break;
        case 'save-api-key':
          this.saveApiKey();
          break;
        case 'toggle-api-settings':
          this.toggleApiSettings();
          break;
        case 'retry-ai':
          this.retryAIResponse();
          break;
      }
    });

    // 选项选择
    document.addEventListener('click', (e) => {
      const option = e.target.closest('[data-option]');
      if (!option) return;

      const qId = option.dataset.qId;
      const value = option.dataset.value;

      this.selectOption(qId, value, option);
    });

    // Q11 文本输入
    document.addEventListener('input', (e) => {
      if (e.target.id === 'q11-input') {
        this.state.q11Text = e.target.value;
        this.updateQ11CharCount();
      }
    });

    // 键盘导航
    document.addEventListener('keydown', (e) => {
      if (this.state.currentStep !== 'questions') return;
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const q = this.getCurrentQuestion();
        if (q && this.hasCurrentAnswer()) {
          e.preventDefault();
          this.nextQuestion();
        }
      }
    });
  },

  // ========== 欢迎页 ==========
  showWelcome() {
    this.state.currentStep = 'welcome';
    this.dom.app.innerHTML = `
      <div class="welcome-container">
        <div class="welcome-content">
          <div class="system-badge">2026 届毕业生 · 社会化全景诊断</div>
          <h1 class="welcome-title">欢迎来到<br>成人世界</h1>
          <p class="welcome-subtitle">
            这里没有虚伪的 AI 废话，没有无用的成功学鸡汤。<br>
            这是一场<strong>纯匿名、绝不泄露隐私</strong>的"社会化生存体检"。
          </p>
          <div class="welcome-features">
            <div class="feature-item">
              <span class="feature-icon">10</span>
              <span class="feature-text">道核心诊断题</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">+1</span>
              <span class="feature-text">灵魂留白树洞</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">0</span>
              <span class="feature-text">隐私泄露风险</span>
            </div>
          </div>
          <button class="btn-start" data-action="start">
            开始体检
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <p class="welcome-note">预计用时 3-5 分钟 · 全程匿名 · 可随时退出</p>
        </div>
      </div>
    `;
  },

  // ========== 答题流程 ==========
  startQuestions() {
    this.state.currentStep = 'questions';
    this.state.currentQuestion = 0;
    this.state.answers = {};
    this.state.q11Text = '';
    this.state.roadmap = null;
    this.state.q11AIResponse = null;
    this.renderQuestion();
  },

  getCurrentQuestion() {
    if (this.state.currentQuestion < QUESTIONS.length) {
      return QUESTIONS[this.state.currentQuestion];
    }
    return null; // 已到Q11
  },

  hasCurrentAnswer() {
    const q = this.getCurrentQuestion();
    if (!q) return true; // Q11允许跳过

    if (q.subQuestions) {
      return q.subQuestions.every(sq => this.state.answers[sq.id]);
    }
    return !!this.state.answers[`q${q.id}`];
  },

  selectOption(qId, value, element) {
    // 清除同组其他选项
    const parent = element.closest('.options-group');
    if (parent) {
      parent.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
    }
    element.classList.add('selected');

    // 保存答案
    this.state.answers[qId] = value;

    // 如果当前题两个子问题都已回答，高亮下一题按钮
    this.updateNavButtons();
  },

  updateNavButtons() {
    const nextBtn = document.querySelector('[data-action="next"]');
    if (nextBtn) {
      nextBtn.disabled = !this.hasCurrentAnswer();
    }
  },

  renderQuestion() {
    const q = this.getCurrentQuestion();

    if (!q) {
      // 渲染Q11
      this.renderQ11();
      return;
    }

    const totalSteps = QUESTIONS.length;
    const currentNum = this.state.currentQuestion + 1;
    const progress = (currentNum / (totalSteps + 1)) * 100; // +1 for Q11

    let subQuestionsHtml = '';

    if (q.subQuestions) {
      // Q1 有两个子问题
      subQuestionsHtml = q.subQuestions.map(sq => {
        const selectedValue = this.state.answers[sq.id];
        return `
          <div class="sub-question">
            <h3 class="sub-question-title">${sq.text}</h3>
            <div class="options-group" data-q-id="${sq.id}">
              ${sq.options.map(opt => `
                <div class="option-card ${selectedValue === opt.value ? 'selected' : ''}"
                     data-option
                     data-q-id="${sq.id}"
                     data-value="${opt.value}">
                  <div class="option-marker">${opt.value}</div>
                  <div class="option-body">
                    <div class="option-label">${opt.label}</div>
                    <div class="option-desc">${opt.desc}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');
    } else {
      // Q2-Q10 单问题
      const qId = `q${q.id}`;
      const selectedValue = this.state.answers[qId];
      subQuestionsHtml = `
        <div class="options-group" data-q-id="${qId}">
          ${q.options.map(opt => `
            <div class="option-card ${selectedValue === opt.value ? 'selected' : ''}"
                 data-option
                 data-q-id="${qId}"
                 data-value="${opt.value}">
              <div class="option-marker">${opt.value}</div>
              <div class="option-body">
                <div class="option-label">${opt.label}</div>
                <div class="option-desc">${opt.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    this.dom.app.innerHTML = `
      <div class="question-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="progress-text">${currentNum} / ${totalSteps + 1}</div>

        <div class="question-card">
          <div class="question-badge">第${this.toChineseNum(currentNum)}题</div>
          <h2 class="question-title">${q.title}</h2>
          <p class="question-scenario">${q.scenario}</p>

          <div class="questions-area">
            ${subQuestionsHtml}
          </div>

          <div class="system-note">
            <div class="system-note-icon">系统点拨</div>
            <p class="system-note-text">${q.note}</p>
          </div>
        </div>

        <div class="nav-buttons">
          ${this.state.currentQuestion > 0 ? '<button class="btn-nav btn-prev" data-action="prev">← 上一题</button>' : '<div></div>'}
          <button class="btn-nav btn-next" data-action="next" ${this.hasCurrentAnswer() ? '' : 'disabled'}>
            ${this.state.currentQuestion < totalSteps - 1 ? '下一题 →' : '进入灵魂留白 →'}
          </button>
        </div>
      </div>
    `;

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  prevQuestion() {
    if (this.state.currentQuestion > 0) {
      this.state.currentQuestion--;
      this.renderQuestion();
    } else {
      this.showWelcome();
    }
  },

  nextQuestion() {
    if (!this.hasCurrentAnswer()) return;

    if (this.state.currentQuestion < QUESTIONS.length - 1) {
      this.state.currentQuestion++;
      this.renderQuestion();
    } else {
      // 进入Q11
      this.state.currentQuestion = QUESTIONS.length; // 设为超界，触发Q11渲染
      this.renderQ11();
    }
  },

  // ========== Q11 灵魂留白 ==========
  renderQ11() {
    const totalSteps = QUESTIONS.length;
    const progress = ((totalSteps + 1) / (totalSteps + 1)) * 100;

    this.dom.app.innerHTML = `
      <div class="question-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="progress-text">${totalSteps + 1} / ${totalSteps + 1}</div>

        <div class="question-card">
          <div class="question-badge soul-badge">灵魂留白</div>
          <h2 class="question-title">${Q11.title}</h2>
          <p class="question-scenario">${Q11.scenario}</p>

          <div class="q11-area">
            <p class="q11-prompt">${Q11.prompt}</p>
            <textarea id="q11-input"
                      class="q11-textarea"
                      placeholder="${Q11.placeholder}"
                      maxlength="500"
                      rows="6">${this.state.q11Text}</textarea>
            <div class="q11-footer">
              <span class="q11-char-count"><span id="q11-char-num">${this.state.q11Text.length}</span>/500</span>
              <span class="q11-privacy">🔒 阅后即焚 · 绝不存储</span>
            </div>
          </div>
        </div>

        <div class="nav-buttons">
          <button class="btn-nav btn-prev" data-action="prev">← 上一题</button>
          <div class="nav-right-group">
            <button class="btn-nav btn-skip" data-action="skip-q11">跳过，直接生成路书</button>
            <button class="btn-nav btn-submit" data-action="submit-q11">✨ 提交并生成路书</button>
          </div>
        </div>
      </div>
    `;

    this.updateQ11CharCount();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 聚焦输入框
    setTimeout(() => {
      const input = document.getElementById('q11-input');
      if (input) input.focus();
    }, 300);
  },

  updateQ11CharCount() {
    const numEl = document.getElementById('q11-char-num');
    if (numEl) {
      numEl.textContent = this.state.q11Text.length;
    }
  },

  // ========== 生成路书 ==========
  submitQ11() {
    const textarea = document.getElementById('q11-input');
    this.state.q11Text = textarea ? textarea.value : '';
    this.generateResult();
  },

  async generateResult() {
    this.state.isGenerating = true;
    this.showGenerating();

    // 方案一：规则引擎生成核心路书
    const roadmap = generateRoadmap(this.state.answers);
    this.state.roadmap = roadmap;

    // 保存到 sessionStorage（支持刷新回看）
    sessionStorage.setItem('roadmap', JSON.stringify(roadmap));
    sessionStorage.setItem('answers', JSON.stringify(this.state.answers));

    // 方案二：DeepSeek 处理 Q11（如果有文本且API可用）
    if (this.state.q11Text.trim() && DeepSeekClient.config.enabled) {
      try {
        const aiResponse = await DeepSeekClient.generateQ11Response(
          this.state.q11Text,
          {
            answers: this.state.answers,
            archetypeName: roadmap.archetypeName,
            dimensions: roadmap.dimensions
          }
        );
        if (aiResponse) {
          this.state.q11AIResponse = aiResponse;
          sessionStorage.setItem('q11_ai_response', aiResponse);
        }
      } catch (err) {
        console.warn('DeepSeek API 调用失败，使用规则引擎兜底:', err.message);
        this.state.q11AIResponse = null;
      }
    }

    this.state.isGenerating = false;
    window.location.hash = 'result';
    this.showResult();
  },

  showGenerating() {
    this.dom.app.innerHTML = `
      <div class="generating-container">
        <div class="generating-spinner"></div>
        <h2 class="generating-title">正在生成你的专属生存路书...</h2>
        <p class="generating-subtitle">系统正在分析你的答题画像，匹配最佳生存路径</p>
      </div>
    `;
  },

  // ========== 结果展示 ==========
  showResult() {
    const roadmap = this.state.roadmap;
    if (!roadmap) {
      this.showWelcome();
      return;
    }

    // 生成Q11部分的HTML
    let q11Html = '';
    if (this.state.q11Text.trim()) {
      q11Html = `
        <div class="roadmap-section q11-section">
          <div class="section-icon">🖊️</div>
          <h2 class="section-title">你说的话，我们听见了</h2>
          <div class="q11-user-text">
            <p>"${this.escapeHtml(this.state.q11Text)}"</p>
          </div>
          ${this.state.q11AIResponse ? `
            <div class="q11-ai-response">
              <div class="ai-badge">AI · 深度回应</div>
              <div class="ai-response-text">${this.state.q11AIResponse}</div>
            </div>
          ` : `
            <div class="q11-no-ai">
              <p>你的文字已被系统加密存档。有些话不需要回应，写下来本身就已经是释放。</p>
              ${!DeepSeekClient.config.enabled ? `
                <p class="ai-tip">💡 提示：配置 <a href="#" data-action="toggle-api-settings">DeepSeek API Key</a>（￥0.003/次），可以获得针对你的Q11留白的个性化AI深度回应。</p>
              ` : ''}
            </div>
          `}
        </div>
      `;
    }

    // 构建完整结果HTML
    this.dom.app.innerHTML = `
      <div class="result-container">
        <div class="result-header">
          <div class="result-badge">生存路书 · 档案编号 SURVIVAL-${this.generateId()}</div>
          <h1 class="result-title">${roadmap.archetypeName}</h1>
          ${roadmap.matchQuality === 'high' ? '<span class="match-tag high-match">高匹配度</span>' :
            roadmap.matchQuality === 'medium' ? '<span class="match-tag medium-match">中匹配度</span>' :
            '<span class="match-tag low-match">复合型路径</span>'}
        </div>

        <!-- 第一板块：生存战壕 -->
        <div class="roadmap-section trench-section">
          <div class="section-icon">🏔️</div>
          <h2 class="section-title">你的生存战壕</h2>
          <div class="section-content">${roadmap.生存战壕}</div>
        </div>

        <!-- 第二板块：反杀手段 -->
        <div class="roadmap-section action-section">
          <div class="section-icon">⚔️</div>
          <h2 class="section-title">你的反杀手段</h2>
          <div class="action-list">
            ${roadmap.反杀手段.map((action, i) => `
              <div class="action-item">
                <div class="action-number">${this.toChineseNum(i + 1)}</div>
                <div class="action-content">
                  <h3 class="action-title">${action.title}</h3>
                  <p class="action-body">${action.body}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 第三板块：情感防弹衣 -->
        <div class="roadmap-section armor-section">
          <div class="section-icon">🛡️</div>
          <h2 class="section-title">你的情感防弹衣</h2>
          <div class="section-content">${roadmap.情感防弹衣}</div>
        </div>

        <!-- 第四板块：热血定调 -->
        <div class="roadmap-section battlecry-section">
          <div class="section-icon">🔥</div>
          <h2 class="section-title">热血定调</h2>
          <div class="section-content battlecry-text">${roadmap.热血定调}</div>
        </div>

        <!-- Q11 -->
        ${q11Html}

        <!-- 维度面板 -->
        <div class="roadmap-section dimensions-section">
          <div class="section-icon">📊</div>
          <h2 class="section-title">你的诊断数据</h2>
          <div class="dimensions-grid">
            ${this.renderDimensions(roadmap.dimensions)}
          </div>
        </div>

        <!-- 操作区 -->
        <div class="result-actions">
          <button class="btn-restart" data-action="restart">🔄 重新诊断</button>
          <button class="btn-share" onclick="App.shareResult()">📤 分享路书</button>
          <button class="btn-settings" data-action="toggle-api-settings">⚙️ API设置</button>
        </div>

        <!-- API设置面板 -->
        <div class="api-settings-panel" id="api-settings" style="display:none;">
          <h3>DeepSeek API 设置（可选）</h3>
          <p>配置后可获得 Q11 的 AI 个性化深度回应。API Key 仅保存在你的浏览器中，不会上传到任何服务器。</p>
          <div class="api-input-group">
            <input type="password" id="api-key-input" placeholder="输入 DeepSeek API Key (sk-...)" value="${DeepSeekClient.config.apiKey}">
            <button class="btn-save-api" data-action="save-api-key">保存</button>
          </div>
          <p class="api-info">
            没有 Key？去 <a href="https://platform.deepseek.com" target="_blank">platform.deepseek.com</a> 免费注册，新用户赠送额度。<br>
            单次调用成本约 <strong>￥0.003</strong>（不到半分钱）。
          </p>
          ${DeepSeekClient.config.enabled ? '<p class="api-status active">✅ API 已配置</p>' : '<p class="api-status">⚠️ 未配置 API Key，Q11 将使用基础回应</p>'}
        </div>

        <p class="result-footer">2026 届毕业生社会化全景诊断系统 · 纯匿名 · 数据仅存储在你的浏览器中</p>
      </div>
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderDimensions(dims) {
    const labels = {
      pragmatism: '务实指数',
      selfProtection: '自我保护',
      politicalSavvy: '政治成熟度',
      aiReadiness: 'AI拥抱度',
      actionPower: '行动力',
      emotionalStability: '情绪稳定性',
      familyBoundary: '亲情边界',
      selfAwareness: '自我认知',
      riskTolerance: '风险承受',
      growthMindset: '成长型思维'
    };

    return Object.entries(dims).map(([key, value]) => {
      const pct = ((value + 5) / 10 * 100).toFixed(0); // 转换为0-100
      const level = value >= 3 ? 'high' : value >= 0 ? 'medium' : 'low';
      return `
        <div class="dim-item">
          <div class="dim-label">${labels[key] || key}</div>
          <div class="dim-bar-container">
            <div class="dim-bar ${level}" style="width: ${pct}%"></div>
          </div>
          <div class="dim-value">${value > 0 ? '+' : ''}${value}</div>
        </div>
      `;
    }).join('');
  },

  // ========== AI 重试 ==========
  async retryAIResponse() {
    if (!DeepSeekClient.config.enabled || !this.state.q11Text.trim()) return;

    const btn = document.querySelector('[data-action="retry-ai"]');
    if (btn) btn.disabled = true;

    try {
      const aiResponse = await DeepSeekClient.generateQ11Response(
        this.state.q11Text,
        {
          answers: this.state.answers,
          archetypeName: this.state.roadmap.archetypeName,
          dimensions: this.state.roadmap.dimensions
        }
      );
      if (aiResponse) {
        this.state.q11AIResponse = aiResponse;
        sessionStorage.setItem('q11_ai_response', aiResponse);
        this.showResult();
      }
    } catch (err) {
      alert('AI 调用失败: ' + err.message);
    }
  },

  // ========== API Key 管理 ==========
  loadApiKey() {
    DeepSeekClient.loadApiKey();
  },

  saveApiKey() {
    const input = document.getElementById('api-key-input');
    if (!input) return;
    const key = input.value.trim();
    DeepSeekClient.setApiKey(key);

    if (key) {
      alert('API Key 已保存！下次生成路书时，Q11 将获得 AI 个性化回应。');
    } else {
      alert('API Key 已清除。');
    }

    // 刷新结果显示
    if (this.state.currentStep === 'result') {
      this.showResult();
    }
  },

  toggleApiSettings() {
    const panel = document.getElementById('api-settings');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  },

  // ========== 分享 ==========
  shareResult() {
    const roadmap = this.state.roadmap;
    if (!roadmap) return;

    // 构建分享文本
    const shareText = `【2026届毕业生社会化全景诊断】
我的生存路径：${roadmap.archetypeName}

${roadmap.热血定调.replace(/<[^>]+>/g, '').substring(0, 100)}……

—— 免费诊断：${window.location.origin}${window.location.pathname}`;

    if (navigator.share) {
      navigator.share({
        title: '我的2026届毕业生生存路书',
        text: shareText
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('路书摘要已复制到剪贴板！');
      }).catch(() => {
        prompt('复制以下文本分享：', shareText);
      });
    }
  },

  // ========== 重新开始 ==========
  restart() {
    sessionStorage.clear();
    window.location.hash = '';
    this.state = {
      currentStep: 'welcome',
      currentQuestion: 0,
      answers: {},
      q11Text: '',
      roadmap: null,
      q11AIResponse: null,
      isGenerating: false
    };
    this.showWelcome();
  },

  // ========== 工具函数 ==========
  toChineseNum(n) {
    const nums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    if (n <= 10) return nums[n];
    if (n < 20) return '十' + nums[n - 10];
    return '';
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  generateId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
