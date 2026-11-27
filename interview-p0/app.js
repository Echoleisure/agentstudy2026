(function () {
  'use strict';
  const questions = Array.isArray(window.P0_QUESTIONS) ? window.P0_QUESTIONS : [];
  const topicInfo = {
    mysql:   {label:'MySQL',     desc:'索引 · 事务 · MVCC',  icon:'▤', tint:'#e9e8ff', ink:'#7165d4'},
    redis:   {label:'Redis',     desc:'缓存 · 锁 · 限流',    icon:'◇', tint:'#fff0e7', ink:'#da946c'},
    network: {label:'计算机网络',desc:'TCP · HTTP · DNS',  icon:'◎', tint:'#e4f3ff', ink:'#4c9dcb'},
    gateway: {label:'API 网关',  desc:'路由 · 熔断 · 契约',  icon:'⇄', tint:'#e5f7ed', ink:'#49a582'},
    llm:     {label:'LLM 专项',  desc:'Provider · SSE',    icon:'✳', tint:'#f7eaff', ink:'#a375ce'}
  };
  const keys = Object.keys(topicInfo);
  const STORAGE_KEY = 'agentstudy-p0-progress-v1';
  const THEME_KEY = 'agentstudy-p0-theme-v1';
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (x) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  let saved = {};
  let selectedTopic = 'all';
  let statusFilter = 'all';
  let searchTerm = '';
  let expanded = new Set();
  let mockLast = null;
  let mockCurrent = null;
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (_) { saved = {}; }
  try { document.documentElement.dataset.theme = localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; } catch (_) {}
  function getState(id) { return saved[id] || {}; }
  function setState(id, key, value) {
    saved[id] = {...getState(id), [key]:value};
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (_) {}
    renderAll();
  }
  function masteredCount(topic) { return questions.filter(q => (!topic || q.category === topic) && getState(q.id).mastered).length; }
  function favoritesCount() { return questions.filter(q=>getState(q.id).favorite).length; }
  function selectTopic(topic) {
    selectedTopic = topic;
    statusFilter = 'all';
    $('statusFilter').value = 'all';
    $('searchInput').value = '';
    searchTerm = '';
    expanded.clear();
    renderAll();
    closeMobileMenu();
    $('mainContent').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function chooseStatus(status) {
    selectedTopic = 'all';
    statusFilter = status;
    $('statusFilter').value = status;
    $('searchInput').value = '';
    searchTerm = '';
    expanded.clear();
    renderAll();
    closeMobileMenu();
    document.querySelector('.collection').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function renderNav() {
    const topics = [{key:'all',label:'全部专题',icon:'▦'}, ...keys.map(key=>({key,label:topicInfo[key].label,icon:topicInfo[key].icon}))];
    $('topicNav').innerHTML = topics.map(t => `<button class="side-link ${selectedTopic===t.key && statusFilter==='all' ? 'active':''}" data-topic="${t.key}"><span class="nav-icon">${esc(t.icon)}</span>${esc(t.label)}<span class="side-count">${t.key==='all' ? questions.length : questions.filter(q=>q.category===t.key).length}</span></button>`).join('');
    $('navFavorites').classList.toggle('active',statusFilter==='favorite');
    $('navUnmastered').classList.toggle('active',statusFilter==='pending');
    $('favoriteCount').textContent=favoritesCount();
    $('pendingCount').textContent=questions.length-masteredCount();
  }
  function renderStats() {
    const done=masteredCount(), all=questions.length, pct=all ? Math.round(100*done/all) : 0;
    $('totalNumber').textContent=all;
    $('masteredNumber').textContent=done;
    $('starredNumber').textContent=favoritesCount();
    $('masteredPercent').textContent=`进度 ${pct}%`;
    $('ringPercent').textContent=`${pct}%`;
    $('progressRing').style.background=`conic-gradient(#7970e4 ${pct*3.6}deg, var(--line) ${pct*3.6}deg)`;
    $('sidebarFill').style.width=pct+'%';
    $('sidebarProgressText').textContent=`${done} / ${all} 道已掌握 · ${pct}%`;
    $('sectionCount').textContent=`${all} 道`;
  }
  function renderTopics() {
    $('topicCards').innerHTML=keys.map(key=>{
      const t=topicInfo[key], count=questions.filter(q=>q.category===key).length, completed=masteredCount(key);
      return `<button class="topic-card ${selectedTopic===key?'active':''}" data-topic="${key}">
        <span class="topic-card-icon" style="background:${t.tint};color:${t.ink}">${esc(t.icon)}</span>
        <strong>${esc(t.label)}</strong><small>${esc(t.desc)}</small>
        <small>已掌握 ${completed}/${count}</small>
        <div class="topic-card-progress"><span style="width:${count?Math.round(100*completed/count):0}%"></span></div>
      </button>`;
    }).join('');
  }
  function matchingQuestions() {
    return questions.filter(q=>{
      if(selectedTopic!=='all' && q.category!==selectedTopic) return false;
      if(statusFilter==='pending' && getState(q.id).mastered) return false;
      if(statusFilter==='mastered' && !getState(q.id).mastered) return false;
      if(statusFilter==='favorite' && !getState(q.id).favorite) return false;
      if(searchTerm){
        const haystack=[q.question,q.answer,...q.followups,...q.testing,...q.tags,topicInfo[q.category].label].join(' ').toLowerCase();
        if(!haystack.includes(searchTerm.toLowerCase())) return false;
      }
      return true;
    });
  }
  function renderQuestions() {
    const results=matchingQuestions();
    const titles={all:'全部 · 高频必考',pending:'待掌握 · 优先复习',mastered:'已掌握 · 温故知新',favorite:'我的收藏 · 重点攻克'};
    $('resultTitle').textContent=selectedTopic==='all' ? titles[statusFilter] : `${topicInfo[selectedTopic].label} · P0 必考`;
    $('resultCount').textContent=`${results.length} 道题`;
    $('questionList').innerHTML=results.map((q,i)=>{
      const done=Boolean(getState(q.id).mastered),fav=Boolean(getState(q.id).favorite),isOpen=expanded.has(q.id);
      return `<article class="qa-card ${isOpen?'expanded':''}" id="question-${q.id}">
      <div class="qa-heading">
        <span class="qa-number">${String(i+1).padStart(2,'0')}</span>
        <div class="qa-info"><button class="qa-title" data-action="expand" data-id="${q.id}" aria-expanded="${isOpen}">${esc(q.question)}</button>
          <div class="qa-tagline"><span class="qa-category">${esc(topicInfo[q.category].label)}</span>${q.tags.slice(0,3).map(t=>`<span class="qa-tag">${esc(t)}</span>`).join('')}</div>
        </div>
        <div class="qa-actions"><button class="small-action ${fav?'selected':''}" title="${fav?'取消收藏':'收藏'}" aria-label="${fav?'取消收藏':'收藏'}" data-action="favorite" data-id="${q.id}">${fav?'★':'☆'}</button>
        <button class="small-action ${done?'done':''}" title="${done?'标记待掌握':'标记已掌握'}" aria-label="${done?'标记待掌握':'标记已掌握'}" data-action="mastered" data-id="${q.id}">${done?'●':'○'}</button>
        <button class="small-action" title="展开答案" aria-label="展开答案" data-action="expand" data-id="${q.id}">${isOpen?'⌃':'⌄'}</button></div>
      </div>
      ${isOpen ? `<div class="qa-expand"><section class="qa-block"><h4>✦ 标准口语回答</h4><div class="qa-answer"><p>${esc(q.answer)}</p></div></section>
        <section class="qa-block"><h4>↳ 面试官可能追问</h4><ul>${q.followups.map(v=>`<li>${esc(v)}</li>`).join('')}</ul></section>
        <section class="qa-block"><h4>⌁ 典型测试场景</h4><ul>${q.testing.map(v=>`<li>${esc(v)}</li>`).join('')}</ul></section>
        <div class="qa-bottom"><button class="mini-button ${done?'mastered':''}" data-action="mastered" data-id="${q.id}">${done?'✓ 已掌握 · 点击撤销':'✓ 标记已掌握'}</button><button class="mini-button" data-action="copy" data-id="${q.id}">复制面试回答</button></div>
      </div>` : ''}
      </article>`;
    }).join('');
    $('emptyState').hidden=results.length>0;
  }
  function renderAll() { renderNav();renderStats();renderTopics();renderQuestions(); }
  document.addEventListener('click', async e=>{
    const t=e.target.closest('[data-topic]');
    if(t){selectTopic(t.dataset.topic);return;}
    const a=e.target.closest('[data-action][data-id]');
    if(!a) return;
    const id=a.dataset.id, act=a.dataset.action, q=questions.find(x=>x.id===id);
    if(!q)return;
    if(act==='expand'){ expanded.has(id)?expanded.delete(id):expanded.add(id);renderQuestions();}
    if(act==='favorite')setState(id,'favorite',!getState(id).favorite);
    if(act==='mastered')setState(id,'mastered',!getState(id).mastered);
    if(act==='copy'){
      const message=`${q.question}\n\n【标准回答】${q.answer}\n\n【高频追问】${q.followups.join('；')}\n\n【测试场景】${q.testing.join('；')}`;
      try{await navigator.clipboard.writeText(message);a.textContent='已复制 ✓';}
      catch(_){a.textContent='复制失败，请手动选择文本';}
    }
  });
  $('searchInput').addEventListener('input',e=>{searchTerm=e.target.value.trim();renderQuestions();});
  $('statusFilter').addEventListener('change',e=>{statusFilter=e.target.value;renderNav();renderQuestions();});
  function reset(){selectedTopic='all';statusFilter='all';searchTerm='';$('searchInput').value='';$('statusFilter').value='all';expanded.clear();renderAll();}
  $('resetFilters').addEventListener('click',reset);
  $('emptyReset').addEventListener('click',reset);
  $('showPending').addEventListener('click',()=>chooseStatus('pending'));
  $('navFavorites').addEventListener('click',()=>chooseStatus('favorite'));
  $('navUnmastered').addEventListener('click',()=>chooseStatus('pending'));
  $('themeButton').addEventListener('click',()=>{
    const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
    document.documentElement.dataset.theme=next;
    try{localStorage.setItem(THEME_KEY,next);}catch(_){}
  });
  function closeMobileMenu(){ $('sidebar').classList.remove('open');$('mobileShade').hidden=true;$('menuButton').setAttribute('aria-expanded','false'); }
  $('menuButton').addEventListener('click',()=>{
    const open=!$('sidebar').classList.contains('open');$('sidebar').classList.toggle('open',open);$('mobileShade').hidden=!open;$('menuButton').setAttribute('aria-expanded',String(open));
  });
  $('mobileShade').addEventListener('click',closeMobileMenu);
  const dialog=$('interviewDialog');
  function nextMock(){
    const pool=matchingQuestions().length?matchingQuestions():questions;
    if(!pool.length)return;
    const choices=pool.length>1?pool.filter(q=>q.id!==mockLast):pool;
    mockCurrent=choices[Math.floor(Math.random()*choices.length)];
    mockLast=mockCurrent.id;
    $('mockTopic').textContent=topicInfo[mockCurrent.category].label;
    $('interviewTitle').textContent=mockCurrent.question;
    $('mockAnswer').hidden=true;
    $('mockAnswer').textContent='';
    $('revealMock').textContent='查看参考答案';
  }
  $('startInterview').addEventListener('click',()=>{nextMock();if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');});
  $('closeInterview').addEventListener('click',()=>dialog.close());
  $('nextMock').addEventListener('click',nextMock);
  $('revealMock').addEventListener('click',()=>{
    if(!mockCurrent)return;
    const out=$('mockAnswer');
    out.textContent=`标准回答：\n${mockCurrent.answer}\n\n核心追问：\n${mockCurrent.followups.map((s,i)=>`${i+1}. ${s}`).join('\n')}\n\n测试场景：\n${mockCurrent.testing.map((s,i)=>`${i+1}. ${s}`).join('\n')}`;
    out.hidden=false;$('revealMock').textContent='参考答案已展开';
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')closeMobileMenu();
    if(e.key==='/' && !dialog.open && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){
      e.preventDefault();$('searchInput').focus();
    }
  });
  renderAll();
})();
