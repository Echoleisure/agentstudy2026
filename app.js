/* Agent QA 学习站 — dependency-free client app. All personal state stays in this browser. */
(() => {
  'use strict';
  const D = window.AGENT_QA_DATA;
  if (!D) { document.getElementById('content').textContent = '学习数据未加载。请确认 data.js 与 index.html 位于同一目录。'; return; }
  const STORE_KEY = 'agent-qa-learning-v1';
  const icon = (id, cls='i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"></use></svg>`;
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const nl = v => esc(v).replace(/\n/g,'<br>');
  const courses = D.courses;
  const stateDefault = {masteredCourses:[],questionStatus:{},favorites:[],notes:{},theme:'light'};
  const safe = (v) => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  let state;
  try { state = {...stateDefault,...safe(JSON.parse(localStorage.getItem(STORE_KEY)))}; } catch { state = {...stateDefault}; }
  state.masteredCourses = Array.isArray(state.masteredCourses) ? state.masteredCourses : [];
  state.questionStatus = safe(state.questionStatus);
  state.notes = safe(state.notes);
  state.favorites = Array.isArray(state.favorites) ? state.favorites : [];
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {} updateProgress(); };
  const ui = {filter:'全部', q:'', showOnly:'all', expanded:new Set(), lessonFilter:'', caseQ:'', caseChapter:'all', metricFilter:'全部', metricQ:'', view:'list', flashIndex:0, flashFlip:false, noteKey:'overview', chapterTab:'notes'};
  let toastTimer;
  const toast = msg => { const el=document.getElementById('toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2100); };
  const plainText = (text) => (text||'').replace(/<[^>]+>/g,'').slice(0,160);
  const slug = path => (path||'').replace(/^#\/?/,'').split('/').filter(Boolean);
  const url = (...parts)=>'#/'+parts.map(encodeURIComponent).join('/');
  const getRoute=()=>slug(decodeURIComponent(location.hash||'#/home'));
  const content=()=>document.getElementById('content');
  const pagehead=(eyebrow,title,subtitle) => `<div class="page-head"><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1><p>${esc(subtitle||'')}</p></div>`;
  const btn=(text,action,extra='',cls='')=>`<button class="btn ${cls}" data-action="${esc(action)}" ${extra}>${text}</button>`;
  const chunk=(code,lang='PYTHON',id='')=>`<div class="code-wrap"><div class="code-top"><span class="lang">${esc(lang)}</span><button class="copy-btn" data-action="copy-code" data-code="${esc(id)}">${icon('copy')} 复制代码</button></div><pre><code>${esc(code)}</code></pre></div>`;
  const link=(href,text,cls='')=>`<a class="${cls}" href="${esc(href)}">${esc(text)}</a>`;
  const noteKey = id=>'lesson-'+id;
  const courseCard=c=>`<a class="course-card" href="${url('lesson',c.id)}"><div class="course-upper"><span class="course-icon">${esc(c.no)}</span><span class="course-number">${state.masteredCourses.includes(c.id)?'<span class="tag green">已复习</span>':'课程已学习'}</span></div><h3>${esc(c.title)}</h3><p class="subtitle">${esc(c.subtitle)}</p><p class="desc">${esc(c.one)}</p><div class="course-bottom"><span>${icon('clock')} ${esc(c.time)} · ${esc(c.level)}</span><span>进入复习 ${icon('chevron')}</span></div></a>`;
  const flow=(items)=>`<div class="flow-steps">${items.map((x,i)=>`${i?'<span class="flow-arrow">→</span>':''}<span class="flow-item">${esc(x)}</span>`).join('')}</div>`;
  const stat=(label,big,sub)=>`<div class="stat"><small>${esc(label)}</small><strong>${big}</strong><div class="hint">${esc(sub||'')}</div></div>`;
  const miniNote=(key,placeholder)=>`<textarea class="note-editor" data-note="${esc(key)}" placeholder="${esc(placeholder||'写下自己的理解、测试思路和想问研发的问题…')}">${esc(state.notes[key]||'')}</textarea><div class="source-note">自动保存在当前浏览器 · 可在「个人笔记」页导出备份</div>`;

  const nav=[
    ['home','总览','home'],['path','学习路径','layers'],['followups','我的追问','help'],
    ['chapter','系统笔记','book'],['cases','功能测试案例','list'],['metrics','指标与性能','target'],
    ['questions','面试题库','book'],['flash','随机抽题','refresh'],['lab','Python 实操','code'],['notes','个人笔记','notes'],['resources','资料与部署','external']
  ];
  const navHtml=()=> nav.map(([id,label,ico],i)=>`${i===3||i===8?'<div class="nav-sep"></div>':''}<a href="${url(id)}" class="nav-link" data-nav="${id}">${icon(ico)}<span>${label}</span>${id==='questions'?'<span class="nav-count">80</span>':id==='metrics'?'<span class="nav-count">24</span>':''}</a>`).join('');
  document.getElementById('nav-list').innerHTML=navHtml();
  function updateProgress(){
    const percent=Math.round(state.masteredCourses.length/courses.length*100);
    document.getElementById('sidebar-percent').textContent=percent+'%';
    document.getElementById('sidebar-progress-bar').style.width=percent+'%';
  }
  function setNav(route){
    const root=route[0]||'home';
    document.querySelectorAll('[data-nav]').forEach(el=>{const selected=el.getAttribute('data-nav')=== (root==='lesson'?'path':root); el.classList.toggle('active',selected); if(selected)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
    const title = root==='lesson' ? courses.find(c=>c.id===route[1])?.title : root==='chapter' && route.length>1 ? '系统笔记' : nav.find(n=>n[0]===root)?.[1];
    document.getElementById('breadcrumb-current').textContent=title||'总览';
  }
  function renderHome(){
    const known=Object.values(state.questionStatus).filter(v=>v==='known').length;
    return `<div class="hero"><div class="hero-main"><div class="eyebrow">YOUR STUDY COMPANION / 2026</div><h1>把 Agent 平台，<br>学成一套可验证的系统。</h1><p>从 MCP 到 Agent E2E，沿着真实的 Kubernetes 故障排查场景复习原理、测试策略、代码和面试表达。学习过的内容在这里有序沉淀。</p><div class="hero-actions"><a href="#/path" class="btn primary">继续知识复习 ${icon('arrow')}</a><a href="#/flash" class="btn dark-ghost">随机面试抽题 ${icon('refresh')}</a></div></div><div class="hero-visual" aria-hidden="true"><div class="orbit"></div><div class="orbit"></div><div class="orbit-center">Agent</div><div class="orbit-node">MCP</div><div class="orbit-node">RAG</div><div class="orbit-node">Eval</div><div class="orbit-node">Skill</div></div></div>
    <div class="stats">${stat('已经覆盖的课程','9<span>/ 9</span>','从 MCP 到 Agent Eval')}${stat('课程复习进度',state.masteredCourses.length+'<span>/ 9</span>','由你自己标记复习完成')}${stat('面试题库',`80<span>题</span>`,`${known} 道已掌握`)}${stat('评测指标',`24<span>项</span>`,'含公式、采集来源与误区')}</div>
    <div class="subheading"><h2>课程知识地图</h2><a class="btn flat" href="#/path">查看全部 ${icon('arrow')}</a></div><div class="course-grid">${courses.slice(0,6).map(courseCard).join('')}</div>
    <div class="subheading"><h2>你近期重点追问过</h2><a class="btn flat" href="#/followups">全部 30 个问题 ${icon('arrow')}</a></div><div class="three-col">${D.followups.slice(12,15).concat(D.followups.slice(18,21)).map(([q,a,id])=>`<a class="panel" href="${url('lesson',id)}"><span class="tag">${esc(courses.find(c=>c.id===id)?.title||id)}</span><h3 style="margin:12px 0 7px">${esc(q)}</h3><p style="font-size:12px;line-height:1.8">${esc(a)}</p></a>`).join('')}</div>
    <div class="subheading"><h2>优先复习顺序</h2><small>面试前 30 分钟</small></div><div class="two-col"><div class="panel"><span class="small-label">01 / 最重要的工程问题</span><h3>Runtime 状态与错误定位</h3><p>Run 成功与 Task 成功的区别、工具调用参数、HTTP/WS 生命周期、Trace 错误归因。</p><a class="btn small" href="#/lesson/eval">复习评测与 Trace ${icon('arrow')}</a></div><div class="panel"><span class="small-label">02 / 最值得实际写代码</span><h3>asyncio + pytest 故障注入</h3><p>从串行 await，到 gather、wait_for、Event 并发验证，再到跨用户和幂等测试。</p><a class="btn small" href="#/lab">查看代码速查 ${icon('arrow')}</a></div></div>`;
  }
  function renderPath(){return `${pagehead('LEARNING ROADMAP','九节课程 · 复习路线','课程内容已系统学习，下面按从协议到质量保障的顺序复习。每一节可单独标记“本轮复习完成”，状态只保存在本机。')}<div class="course-grid">${courses.map(courseCard).join('')}</div><div class="subheading"><h2>整体业务链路</h2></div><div class="panel">${flow(['用户 / API / 渠道','Agent Instance + Session','Runtime / LLM Loop','MCP · RAG · Memory · Skill','可选 Sandbox / 子代理','Final + Trace + Eval'])}<div class="notice info">这是业务逻辑层，不等于 AgentWorks 内部微服务拓扑。平台实际使用哪些能力取决于 Agent 配置和具体任务。</div><a href="#/chapter/0" class="btn small">阅读整体架构笔记 ${icon('arrow')}</a></div>`;}
  function renderLesson(id){
    const c=courses.find(x=>x.id===id); if(!c)return render404();
    const sourceSec=D.chapters[1].sections.find(s=>s.title.toLowerCase().includes(id==='runtime'?'agent runtime':id==='session'?'session':id==='rag'?'rag':id==='multi'?'multi-agent':id==='eval'?'e2e':id==='mcp'?'mcp':id==='memory'?'memory':id==='skill'?'skill':'sandbox'));
    const related=D.followups.filter(x=>x[2]===id).slice(0,5);
    const isKnown=state.masteredCourses.includes(id);
    return `<div class="page-head"><div class="eyebrow">LESSON ${c.no} / ${esc(c.subtitle)}</div><h1>${esc(c.title)}</h1><p>建议复习时长 ${esc(c.time)} · ${esc(c.level)} · 包含底层原理、常见误区、可执行测试思路和代码记忆</p></div>
      <div class="lead-box">${esc(c.one)}</div><div class="two-col"><div class="panel"><span class="small-label">核心调用 / 数据流</span><h3>从输入到输出</h3>${flow(c.flow)}</div><div class="panel"><span class="small-label">容易混淆</span><h3>3 个必记边界</h3><ul class="plain-list">${c.pitfalls.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div>
      <div class="subheading"><h2>记忆代码片段</h2><span class="tag">教学示意 · 对接真实 SDK 需要适配</span></div>${chunk(c.code, c.id==='skill'?'MARKDOWN':c.id==='sandbox'?'SHELL':'PYTHON',c.id)}
      <div class="subheading"><h2>怎么把它测出来？</h2></div><div class="panel"><span class="small-label">P0 TEST IDEAS</span><p style="color:var(--ink)">${esc(c.check)}</p>${sourceSec?`<div class="notice info"><strong>深入理解：</strong>${esc(sourceSec.explain)}</div><div class="callout-row"><span class="dot"></span><p><strong>补充测试：</strong>${esc(sourceSec.test)}</p></div>`:''}<div class="pill-row"><a href="#/cases" class="btn small">相关测试案例 ${icon('arrow')}</a><a href="#/questions" class="btn small">面试题库 ${icon('arrow')}</a><a href="#/lab" class="btn small">代码实操 ${icon('arrow')}</a></div></div>
      <div class="subheading"><h2>你曾追问过</h2></div><div class="section-list">${related.map(([q,a])=>`<div class="section-card"><h3>${esc(q)}</h3><p>${esc(a)}</p></div>`).join('')||'<div class="empty-state">暂无专项追问，先阅读模块笔记。</div>'}</div>
      <div class="subheading"><h2>留下你的复习笔记</h2></div><div class="panel">${miniNote(noteKey(id),'自己复述原理、记下测试场景、面试时如何回答…')}<div class="notes-toolbar"><button class="btn ${isKnown?'active':''}" data-action="toggle-course" data-id="${esc(id)}">${icon('check')} ${isKnown?'已标记本轮复习完成 · 点击撤销':'标记本轮复习完成'}</button><a class="btn small" href="#/path">返回学习路径 ${icon('arrow')}</a></div></div>`;
  }
  function renderFollowups(){
    let arr=D.followups.map(([q,a,id],idx)=>({q,a,id,idx}));
    if(ui.q)arr=arr.filter(x=>(x.q+' '+x.a+' '+x.id).toLowerCase().includes(ui.q.toLowerCase()));
    return `${pagehead('PERSONAL FOLLOW-UPS','我曾经追问过的概念','从我们的学习过程整理出的易混淆点：MCP 和 Function Calling、Context 和 Memory、asyncio 并发、Agent E2E 质量指标等。')}<div class="toolbar"><input id="focus-search" class="field search-field" placeholder="搜索追问，例如 await、Session、Trace…" value="${esc(ui.q)}"><span class="item-count">${arr.length} / ${D.followups.length} 条</span></div><div class="focus-list">${arr.map(x=>`<div class="focus-card"><div class="focus-head"><span class="qa-num">${String(x.idx+1).padStart(2,'0')}</span><div class="qa-title"><strong>${esc(x.q)}</strong><small>${esc(courses.find(c=>c.id===x.id)?.title||x.id)}</small></div><a class="btn small" href="${url('lesson',x.id)}">复习本节 ${icon('chevron')}</a></div><div class="qa-body" style="display:block"><p>${esc(x.a)}</p></div></div>`).join('')||empty('没找到匹配的追问','试试换个关键词。')}</div>`;
  }
  function renderChapters(){
    return `${pagehead('SYSTEM NOTES','完整系统笔记','从业务架构、九大能力、pytest、测试矩阵到质量门禁与综合实战。内容依据你此前确认的七篇复习手册整理。')}<div class="section-list">${D.chapters.map((c,i)=>`<a href="${url('chapter',String(i))}" class="panel" style="display:block"><span class="small-label">CHAPTER ${String(i+1).padStart(2,'0')}</span><h3 style="font-size:17px;margin:9px 0">${esc(c.title)}</h3><p>${esc(c.intro)}</p><div class="pill-row"><span class="pill">${c.sections.length} 个核心知识点</span><span class="pill">${c.cases.length} 条代表性 Case</span></div></a>`).join('')}</div>`;
  }
  function renderChapter(idx){
    const c=D.chapters[idx]; if(!c)return render404();
    return `${pagehead('SYSTEM NOTES / CHAPTER '+String(idx+1).padStart(2,'0'),c.title,c.intro)}<div class="tabbar"><button class="tab ${ui.chapterTab==='notes'?'active':''}" data-action="chapter-tab" data-tab="notes">知识点</button><button class="tab ${ui.chapterTab==='cases'?'active':''}" data-action="chapter-tab" data-tab="cases">测试案例 (${c.cases.length})</button><button class="tab ${ui.chapterTab==='flow'?'active':''}" data-action="chapter-tab" data-tab="flow">流程图</button></div>
    ${ui.chapterTab==='notes'?`<div class="section-list">${c.sections.map((s,i)=>`<div class="section-card"><div class="small-label">${String(i+1).padStart(2,'0')}</div><h3>${esc(s.title)}</h3><p>${esc(s.explain)}</p><div class="test-idea"><strong>测试关注：</strong>${esc(s.test)}</div></div>`).join('')}</div>`:ui.chapterTab==='cases'?`<div class="case-list">${c.cases.map(caseCard).join('')||empty('本篇以面试回答和思路为主','测试 Case 请到其他篇章查看。')}</div>`:`<div class="panel"><div class="diagram-stack">${c.diagram.map((t,i)=>`${i?'<div class="diagram-arrow">↓</div>':''}<div class="diagram-step">${esc(t)}</div>`).join('')}</div></div>`}<div class="subheading"><a href="#/chapter" class="btn small">返回七篇目录 ${icon('arrow')}</a></div>`;
  }
  function caseCard(c){return `<div class="case-card"><div class="case-top"><span class="case-id">${esc(c.id)}</span><h3>${esc(c.title)}</h3></div><p class="step"><strong>场景 / 操作：</strong>${esc(c.step)}</p><p class="expect"><strong>预期 / 断言：</strong>${esc(c.expect)}</p></div>`;}
  function renderCases(){
    const base=D.chapters.flatMap((c,i)=>c.cases.map(x=>({...x,chapter:i})));let arr=base;
    if(ui.caseQ)arr=arr.filter(c=>(c.id+' '+c.title+' '+c.step+' '+c.expect).toLowerCase().includes(ui.caseQ.toLowerCase()));
    if(ui.caseChapter!=='all')arr=arr.filter(c=>String(c.chapter)===ui.caseChapter);
    return `${pagehead('P0 / P1 TEST MATRIX','功能测试与故障注入','沿用云网络测试方法：生命周期、正常路径、负例、并发、状态机、权限和真实资源验收。教学 Case 均为设计方案，非 AgentWorks 已运行的真实 Case。')}<div class="toolbar"><input id="case-search" class="field search-field" placeholder="搜索超时、越权、重试、RAG…" value="${esc(ui.caseQ)}"><select id="case-chapter" class="field select"><option value="all">全部章节</option>${D.chapters.map((c,i)=>`<option value="${i}" ${ui.caseChapter===String(i)?'selected':''}>${esc('第'+(i+1)+'篇')}</option>`).join('')}</select><span class="item-count">${arr.length} 条</span></div><div class="case-list">${arr.map(caseCard).join('')||empty('暂无符合条件的案例','重置筛选后重试。')}</div><div class="subheading"><h2>更深入的专项故障设计</h2></div><div class="section-list">${D.deepDives.map((d,i)=>`<details class="section-card"><summary style="cursor:pointer;font-weight:750;font-size:14px">${String(i+1).padStart(2,'0')} · ${esc(d.title)}</summary><p style="margin-top:12px">${esc(d.setup)}</p><div class="table-wrap"><table class="data-table"><thead><tr><th>场景</th><th>操作</th><th>预期</th></tr></thead><tbody>${d.steps.map(s=>`<tr><td>${esc(s.title)}</td><td>${esc(s.action)}</td><td>${esc(s.expect)}</td></tr>`).join('')}</tbody></table></div><div class="notice info">${esc(d.note)}</div></details>`).join('')}</div>`;
  }
  function renderMetrics(){
    let arr=D.metrics;
    if(ui.metricFilter!=='全部')arr=arr.filter(x=>x.category===ui.metricFilter);
    if(ui.metricQ)arr=arr.filter(x=>(x.name+' '+x.formula+' '+x.pitfall).toLowerCase().includes(ui.metricQ.toLowerCase()));
    const groups=[...new Set(D.metrics.map(x=>x.category))];
    return `${pagehead('EVALUATION & PERFORMANCE','指标与性能压测速查','统一掌握“定义 / 公式 / 从哪儿采 / 怎么判错”。尤其分清 AgentWorks 公开能力、OpenTelemetry 遥测约定和团队自定义 KPI。')}
    <div class="notice info"><strong>来源边界：</strong>AgentWorks 公开 Trace 与运行数据，OpenTelemetry 提供 GenAI 遥测语义，Ragas 提供部分质量评估定义；Run/Task 成功率、发布门槛和 Tool Accuracy 的具体分母需要团队自行约定。</div>
    <div class="subheading"><h2>10 秒指标计算器</h2><small>教学示例，可修改数字</small></div><div class="panel"><div class="calc-controls"><div class="calc-field"><label>评测任务数</label><input type="number" min="1" max="100000" class="field" id="calc-total" value="100"></div><div class="calc-field"><label>正常结束 Run 数</label><input type="number" min="0" max="100000" class="field" id="calc-runs" value="95"></div><div class="calc-field"><label>满足业务验收的任务数</label><input type="number" min="0" max="100000" class="field" id="calc-tasks" value="80"></div></div><div class="calc-output" id="calc-output"></div></div>
    <div class="subheading"><h2>24 项核心指标</h2></div><div class="toolbar"><input id="metric-search" class="field search-field" value="${esc(ui.metricQ)}" placeholder="搜索 TTFT、P95、Faithfulness、Tokens…"><select id="metric-group" class="field select"><option value="全部">全部分类</option>${groups.map(x=>`<option ${ui.metricFilter===x?'selected':''}>${esc(x)}</option>`).join('')}</select><span class="item-count">${arr.length} / 24 项</span></div><div class="metric-group">${arr.map(m=>`<div class="metric-card"><span class="tag">${esc(m.category)}</span><h3 style="margin-top:10px">${esc(m.name)}</h3><div class="formula">${esc(m.formula)}</div><p><strong>采集来源：</strong>${esc(m.source)}</p><p><strong>容易误判：</strong>${esc(m.pitfall)}</p></div>`).join('')||empty('没有匹配指标','尝试重置筛选。')}</div>
    <div class="subheading"><h2>算一遍，才真正记住</h2></div><div class="section-list">${D.examples.map((x,i)=>`<div class="section-card"><span class="small-label">EXAMPLE ${i+1}</span><h3>${esc(x.title)}</h3><p>${esc(x.scenario)}</p><div class="test-idea"><strong>计算：</strong>${esc(x.result)}</div><div class="source-note">注意：${esc(x.notice)}</div></div>`).join('')}</div>`;
  }
  function calcUpdate(){const t=Math.max(0,Number(document.getElementById('calc-total')?.value||0)),r=Math.max(0,Number(document.getElementById('calc-runs')?.value||0)),s=Math.max(0,Number(document.getElementById('calc-tasks')?.value||0));const pct=x=>t>0?(x/t*100).toFixed(1)+'%':'—';const el=document.getElementById('calc-output');if(!el)return;el.innerHTML=`<div class="calc-num"><small>Run Success Rate</small><strong>${r<=t?pct(r):'无效'}</strong></div><div class="calc-num"><small>Task Success Rate</small><strong>${s<=t?pct(s):'无效'}</strong></div><div class="calc-num"><small>业务成功与运行成功差距</small><strong>${s<=t&&r<=t?(r/t*100-s/t*100).toFixed(1)+'pp':'—'}</strong></div>`;}
  function questionCard(item){
    const expanded=ui.expanded.has(item.id),status=state.questionStatus[item.id]||'',fav=state.favorites.includes(item.id);
    return `<div class="qa-card" id="card-${esc(item.id)}"><div class="qa-head"><span class="qa-num">${esc(item.id)}</span><div class="qa-title"><strong>${esc(item.question)}</strong><small>${esc(item.area)} · ${status==='known'?'已掌握':status==='review'?'待复习':'未标记'}</small></div><div class="qa-actions"><button class="qa-small ${fav?'active':''}" data-action="fav-question" data-id="${esc(item.id)}" aria-label="收藏题目" title="收藏">${icon('star')}</button><button class="btn small" data-action="toggle-question" data-id="${esc(item.id)}">${expanded?'收起':'看答案'} ${icon('chevron')}</button></div></div>${expanded?`<div class="qa-body"><p>${esc(item.answer)}</p><div class="qa-follow"><strong>深入追问：</strong>${esc(item.follow)}</div><div class="notes-toolbar"><div class="qa-review"><button class="${status==='known'?'active ok':''}" data-action="rate-question" data-id="${esc(item.id)}" data-rate="known">${icon('check')} 已掌握</button><button class="${status==='review'?'active again':''}" data-action="rate-question" data-id="${esc(item.id)}" data-rate="review">需要再看</button></div><button class="qa-small" data-action="copy-answer" data-id="${esc(item.id)}">${icon('copy')} 复制回答</button></div></div>`:''}</div>`;
  }
  function renderQuestions(){
    const groups=['全部',...D.questions.map(q=>q.area).filter((x,i,a)=>a.indexOf(x)===i)];
    let arr=D.questions;
    if(ui.filter!=='全部')arr=arr.filter(x=>x.area===ui.filter);
    if(ui.q)arr=arr.filter(x=>(x.question+' '+x.answer+' '+x.follow+' '+x.area).toLowerCase().includes(ui.q.toLowerCase()));
    if(ui.showOnly==='favorite')arr=arr.filter(x=>state.favorites.includes(x.id));
    if(ui.showOnly==='review')arr=arr.filter(x=>state.questionStatus[x.id]!=='known');
    return `${pagehead('INTERVIEW PLAYBOOK','80 道专业面试题','每道题都包含 30～90 秒回答要点和深入追问。建议先口述，再看答案；允许将题目标记为已掌握、待复习或收藏。')}
      <div class="stats" style="margin:0 0 18px">${stat('题库总数','80','10 大技术领域')}${stat('已掌握',Object.values(state.questionStatus).filter(x=>x==='known').length+'','答题后标记')}${stat('待复习',Object.values(state.questionStatus).filter(x=>x==='review').length+'','下次优先看')}${stat('收藏题目',state.favorites.length+'','个人重点题')}</div>
      <div class="toolbar"><input id="question-search" class="field search-field" value="${esc(ui.q)}" placeholder="搜索 Run Success、MCP、并发、架构…"><select id="question-group" class="field select">${groups.map(x=>`<option ${ui.filter===x?'selected':''}>${esc(x)}</option>`).join('')}</select><select id="question-only" class="field select"><option value="all" ${ui.showOnly==='all'?'selected':''}>全部题目</option><option value="review" ${ui.showOnly==='review'?'selected':''}>未掌握 / 待复习</option><option value="favorite" ${ui.showOnly==='favorite'?'selected':''}>只看收藏</option></select><span class="item-count">${arr.length} 题</span></div><div class="q-list">${arr.map(questionCard).join('')||empty('这里暂时没有题目','试着清空搜索词或更换筛选条件。')}</div>`;
  }
  function renderFlash(){const q=D.questions[ui.flashIndex%D.questions.length],status=state.questionStatus[q.id]||'';return `${pagehead('INTERVIEW DRILL','随机抽题 · 面试模拟','闭眼先说出 30～60 秒的回答，之后翻开参考答案，再决定是否掌握。这个页面刻意只放一道题。')}
    <div class="quiz-meta"><span>已掌握 ${Object.values(state.questionStatus).filter(x=>x==='known').length} / 80</span><span>当前 ${q.id} · ${esc(q.area)}</span></div><div class="flash-card"><div class="q-mark">${esc(q.id)} / ${esc(q.area)}</div><h2>${esc(q.question)}</h2>${ui.flashFlip?`<div class="flash-answer"><p>${esc(q.answer)}</p><div class="qa-follow"><strong>追问：</strong>${esc(q.follow)}</div></div>`:`<p class="muted">先尝试自己回答，再点击「翻开答案」。</p>`}</div><div class="flash-actions"><button class="btn primary" data-action="flash-flip">${ui.flashFlip?'收起答案':'翻开答案'}</button><button class="btn ${status==='known'?'active':''}" data-action="flash-rate" data-rate="known">${icon('check')} 掌握了</button><button class="btn" data-action="flash-rate" data-rate="review">需要再看</button><button class="btn" data-action="flash-next">${icon('refresh')} 随机下一题</button></div><div class="subheading"><h2>回答提示</h2></div><div class="panel"><p>用四步组织语言：<strong>一句话定义 → 关键执行链 → 典型风险/测试 → 指标与定位方式</strong>。适当引用你的 K8s / pytest 经验，但不要把本地实验称作已经上线的生产项目。</p></div>`;}
  function renderLab(){return `${pagehead('PYTHON / PYTEST','可以反复照着写的实操','把课程的代码记忆缩成轻量片段：asyncio、MCP 参数、Memory 隔离、Golden Dataset 和 Trace。完整的通用 pytest 示例工程可在资料页下载。')}<div class="notice safe"><strong>使用方式：</strong>片段用于复习和理解，部分依赖 Mock Fixture、Agent 接口或上下文，不能单独当完整脚本运行。配套的 28 条 pytest 教学测试已验证；可在下方下载匿名示例工程。</div><div class="section-list">${D.codeLab.map((x,i)=>`<div class="panel"><span class="tag">${esc(x.tag)}</span><h3 style="margin:10px 0">${esc(x.title)}</h3><p>${esc(x.desc)}</p>${chunk(x.code,'PYTHON','lab-'+i)}<div class="source-note"><strong>参考命令：</strong><code>${esc(x.cmd)}</code>（具体以完整代码包目录为准）</div></div>`).join('')}</div><div class="subheading"><h2>完整实战工程</h2></div><div class="panel"><p>代码包保留更完整的 fixture、Mock 模块与可运行的测试目录。你可以在自己 Mac 的项目里按模块迁移，无需复制整个工程。</p><a class="btn primary" href="assets/agent-qa-pytest-lab.zip" download>${icon('download')} 下载 pytest 代码包</a></div>`;}
  function renderNotes(){
    const choices=[['overview','全局学习总结'],...courses.map(c=>[noteKey(c.id),c.title]),['interview','面试表达与补充'],['developer','向研发确认的问题']];
    const sel=choices.find(x=>x[0]===ui.noteKey)||choices[0];
    return `${pagehead('YOUR OWN NOTES','我的私人笔记','学习进度、题目掌握状态、收藏和笔记都存在浏览器 localStorage 中，网站没有后端。建议定期导出备份。')}<div class="notes-layout"><div class="note-nav">${choices.map(([id,title])=>`<button class="note-choice ${ui.noteKey===id?'active':''}" data-action="choose-note" data-id="${esc(id)}">${esc(title)} ${state.notes[id]?'·':''}</button>`).join('')}</div><div class="panel"><h3>${esc(sel[1])}</h3>${miniNote(sel[0],'试着用自己的语言解释知识点，记下实际踩坑、面试追问和研发反馈…')}<div class="notes-toolbar"><button class="btn" data-action="export-state">${icon('download')} 导出所有复习记录</button><label class="btn" for="import-state">导入备份</label><input type="file" id="import-state" accept="application/json,.json" hidden></div></div></div><div class="notice"><strong>隐私提示：</strong>浏览器换设备、清理站点数据或无痕模式可能导致本地记录丢失；GitHub 代码仓库不会自动同步你的笔记。请用导出/导入备份。不要在笔记中写 API Key、生产凭证或客户敏感数据。</div>`;
  }
  function renderResources(){return `${pagehead('REFERENCE & DELIVERY','资料来源与 GitHub Pages','本站仅发布通用技术学习资料，包含可搜索的知识点、80 道面试题、24 项指标和匿名 pytest 示例。')}
    <div class="two-col"><div class="panel"><span class="small-label">OPEN STUDY PACK</span><h3>课程配套练习</h3><p>本网站的正文、知识点和面试题可以在线阅读，无需额外下载个人文档。这里提供不包含真实集群、账号与生产环境信息的匿名 pytest 练习代码。</p><div class="resource-list"><a class="resource-link" href="assets/agent-qa-pytest-lab.zip" download><span class="course-icon">ZIP</span><span><span class="title">Python / pytest 通用示例</span><small>Golden Dataset、MCP Mock、Trace、Session、asyncio</small></span>${icon('download')}</a></div><p>本项目无后端、无外部字体或 CDN；课程源码可在 GitHub 查看。</p></div><div class="panel"><span class="small-label">GITHUB PAGES</span><h3>公开网站与本地学习进度</h3><p>部署目标：<a href="https://github.com/Echoleisure/agentstudy2026" target="_blank" rel="noopener noreferrer">Echoleisure/agentstudy2026</a>。使用 GitHub Pages 的 <strong>main / (root)</strong> 分支发布。</p><p>GitHub Pages 页面通常对互联网公开，不要上传真实集群配置、账号密钥或内部业务文档。</p><div class="notice safe"><strong>本地记录：</strong>收藏、笔记、已掌握状态仅写入当前浏览器的 localStorage，不会上传到 GitHub；可在“我的笔记”导出并备份。</div><a class="btn small" href="https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site" target="_blank" rel="noopener noreferrer">GitHub 官方 Pages 部署指南 ${icon('external')}</a></div></div>
    <div class="subheading"><h2>官方文档与行业规范</h2><small>${D.sources.length} 个参考入口</small></div><div class="resource-list">${D.sources.map(x=>`<a class="resource-link" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer"><span class="tag">${esc(x.id)}</span><span class="title">${esc(x.title)}</span>${icon('external')}</a>`).join('')}</div><div class="source-note">内容是技术复习示意，非 AgentWorks 内部架构文档；产品具体实现和部分质量指标口径应以官方最新文档或实际研发确认结果为准。</div>`;}
  function empty(title,desc){return `<div class="empty-state"><h3>${esc(title)}</h3><p>${esc(desc)}</p></div>`;}
  function render404(){return `${pagehead('NOT FOUND','找不到该页面','可能是地址有误。')}<a class="btn primary" href="#/home">返回首页</a>`;}
  function render(scroll=true){
    const route=getRoute();setNav(route);
    const r=route[0]||'home';let html;
    switch(r){
      case 'home': html=renderHome();break;
      case 'path': html=renderPath();break;
      case 'lesson': html=renderLesson(route[1]);break;
      case 'followups': html=renderFollowups();break;
      case 'chapter': html=route[1]!==undefined?renderChapter(Number(route[1])):renderChapters();break;
      case 'cases': html=renderCases();break;
      case 'metrics': html=renderMetrics();break;
      case 'questions': html=renderQuestions();break;
      case 'flash': html=renderFlash();break;
      case 'lab': html=renderLab();break;
      case 'notes': html=renderNotes();break;
      case 'resources': html=renderResources();break;
      default: html=render404();
    }
    content().innerHTML=html;updateProgress();if(r==='metrics')calcUpdate();if(scroll)window.scrollTo({top:0,behavior:'instant'});
    document.getElementById('sidebar').classList.remove('open');document.getElementById('mobile-backdrop').classList.remove('open');
  }
  async function copy(text){try{await navigator.clipboard.writeText(text);toast('已复制到剪贴板');}catch{toast('当前浏览器不允许复制，请手动选择文本');}}
  const findQ=id=>D.questions.find(x=>x.id===id);
  function setQuestion(id,rate){const s=state.questionStatus[id];if(s===rate)delete state.questionStatus[id];else state.questionStatus[id]=rate;save();render(false);}
  document.addEventListener('click',async e=>{
    const btn=e.target.closest('[data-action]');if(!btn)return;
    const a=btn.dataset.action,id=btn.dataset.id;
    switch(a){
      case 'toggle-course':state.masteredCourses=state.masteredCourses.includes(id)?state.masteredCourses.filter(x=>x!==id):[...state.masteredCourses,id];save();render(false);toast('复习进度已保存');break;
      case 'chapter-tab':ui.chapterTab=btn.dataset.tab;render(false);break;
      case 'toggle-question':ui.expanded.has(id)?ui.expanded.delete(id):ui.expanded.add(id);render(false);break;
      case 'fav-question':state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];save();render(false);break;
      case 'rate-question':setQuestion(id,btn.dataset.rate);break;
      case 'copy-answer':await copy(`${findQ(id)?.question}\n\n${findQ(id)?.answer}\n\n追问：${findQ(id)?.follow}`);break;
      case 'copy-code':{const p=btn.closest('.code-wrap')?.querySelector('code')?.textContent||'';await copy(p);break;}
      case 'flash-flip':ui.flashFlip=!ui.flashFlip;render(false);break;
      case 'flash-next':{const n=Math.floor(Math.random()*(D.questions.length-1));ui.flashIndex=(ui.flashIndex+1+n)%D.questions.length;ui.flashFlip=false;render(false);break;}
      case 'flash-rate':{const q=D.questions[ui.flashIndex%D.questions.length];ui.flashFlip=true;setQuestion(q.id,btn.dataset.rate);break;}
      case 'choose-note':ui.noteKey=id;render(false);break;
      case 'export-state':{const blob=new Blob([JSON.stringify({app:'Agent QA Learning',version:1,exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='agent-qa-study-backup.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);toast('已导出本地笔记和进度');break;}
    }
  });
  // Let filter inputs update their lists without navigating or losing state.
  document.addEventListener('input',e=>{
    const id=e.target.id;
    if(e.target.matches('[data-note]')){state.notes[e.target.dataset.note]=e.target.value;save();return;}
    if(['calc-total','calc-runs','calc-tasks'].includes(id)){calcUpdate();return;}
    const mappings={'focus-search':['q'],'case-search':['caseQ'],'metric-search':['metricQ'],'question-search':['q']};
    if(mappings[id]){const pos=e.target.selectionStart,val=e.target.value;ui[mappings[id][0]]=val;render(false);const el=document.getElementById(id);el?.focus();if(el?.setSelectionRange)el.setSelectionRange(pos,pos);}
  });
  document.addEventListener('change',async e=>{
    const id=e.target.id;
    if(id==='question-group'){ui.filter=e.target.value;render(false);}else if(id==='question-only'){ui.showOnly=e.target.value;render(false);}else if(id==='metric-group'){ui.metricFilter=e.target.value;render(false);}else if(id==='case-chapter'){ui.caseChapter=e.target.value;render(false);}else if(id==='import-state'){
      const f=e.target.files?.[0];if(!f)return;
      try{const obj=JSON.parse(await f.text());if(obj?.app!=='Agent QA Learning'||!obj?.state)throw Error('格式不符');if(!confirm('导入后将覆盖当前浏览器学习记录，继续吗？'))return;
        const incoming=safe(obj.state);state={...stateDefault,...incoming};state.notes=safe(state.notes);state.questionStatus=safe(state.questionStatus);state.favorites=Array.isArray(state.favorites)?state.favorites:[];state.masteredCourses=Array.isArray(state.masteredCourses)?state.masteredCourses:[];save();applyTheme();render(false);toast('已恢复备份');
      }catch{toast('备份文件格式错误，未执行导入');}
    }
  });
  const searchModal=document.getElementById('search-modal'),searchInput=document.getElementById('global-search');
  const searchIndex=[...D.courses.map(x=>({kind:'课程',title:x.title,desc:x.one,url:url('lesson',x.id)})),...D.followups.map(x=>({kind:'我的追问',title:x[0],desc:x[1],url:url('followups')})),...D.questions.map(x=>({kind:'面试',title:x.question,desc:x.answer,url:url('questions')})),...D.metrics.map(x=>({kind:'指标',title:x.name,desc:x.formula,url:url('metrics')})),...D.chapters.flatMap((c,i)=>c.cases.map(x=>({kind:'测试',title:x.id+' '+x.title,desc:x.step+' '+x.expect,url:url('chapter',String(i))})))];
  function searchOpen(){searchModal.hidden=false;searchInput.value='';searchResult('');setTimeout(()=>searchInput.focus(),0);}
  function searchClose(){searchModal.hidden=true;}
  function searchResult(query){const q=query.trim().toLowerCase();const arr=q?searchIndex.filter(x=>(x.title+' '+x.desc+' '+x.kind).toLowerCase().includes(q)).slice(0,20):searchIndex.slice(0,9);document.getElementById('search-results').innerHTML=arr.length?arr.map(x=>`<a href="${esc(x.url)}" class="search-result" data-search-link><strong>${esc(x.title)}</strong><span>${esc(x.kind)} · ${esc(plainText(x.desc))}</span></a>`).join(''):empty('没有匹配结果','试试更短的关键词');}
  document.getElementById('open-search').addEventListener('click',searchOpen);
  document.getElementById('close-search').addEventListener('click',searchClose);
  document.getElementById('search-shade').addEventListener('click',searchClose);
  searchInput.addEventListener('input',e=>searchResult(e.target.value));
  searchInput.addEventListener('keydown',e=>{if(e.key==='Enter'){const first=document.querySelector('[data-search-link]');if(first){searchClose();location.hash=first.getAttribute('href');}}});
  searchModal.addEventListener('click',e=>{if(e.target.closest('[data-search-link]'))searchClose();});
  document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();searchModal.hidden?searchOpen():searchClose();}if(e.key==='Escape'&&!searchModal.hidden)searchClose();});
  function applyTheme(){document.body.dataset.theme=state.theme==='dark'?'dark':'light';document.getElementById('theme-toggle').innerHTML=icon(state.theme==='dark'?'sun':'moon');}
  document.getElementById('theme-toggle').addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';save();applyTheme();});
  document.getElementById('menu-button').addEventListener('click',()=>{document.getElementById('sidebar').classList.add('open');document.getElementById('mobile-backdrop').classList.add('open');});
  document.getElementById('mobile-backdrop').addEventListener('click',()=>{document.getElementById('sidebar').classList.remove('open');document.getElementById('mobile-backdrop').classList.remove('open');});
  window.addEventListener('hashchange',()=>render(true));
  if(!location.hash) location.replace('#/home'); else render(true);
  applyTheme();
})();
