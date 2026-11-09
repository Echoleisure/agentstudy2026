#!/usr/bin/env python3
"""Build portable, dependency-free data.js from the user's course notes.
Run: python scripts/generate_data.py
"""
from pathlib import Path
import json
import importlib.util
import shutil

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('study_content',ROOT/'scripts'/'content_source.py')
source=importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)

courses=[
 dict(id='mcp',no='01',title='MCP 工具接入',subtitle='Model Context Protocol',time='25 min',icon='plug',level='基础',one='模型做工具选择，Runtime 发起调用，MCP 负责标准化工具接入。',flow=['LLM 输出 tool_call','Runtime 校验与分发','MCP Client ↔ Server','业务结果反馈 LLM'],pitfalls=['MCP 不等于 Function Calling','HTTP 200 不等于工具业务成功','Schema 错误与业务错误必须分层'],code='''# MCP 工具调用示意：await 的是实际客户端 API\nresult = await mcp_client.call_tool(\n    "get_pods",\n    {"namespace": "demo-system"},\n)\n# 工具调用返回的业务内容仍需要检查''',check='缺失 namespace、非法类型、超时、权限和重复调用；同时检查调用链与业务结果。'),
 dict(id='runtime',no='02',title='Agent Runtime',subtitle='Agent Loop / Tool Dispatch',time='35 min',icon='repeat',level='核心',one='Agent Runtime 负责在模型决策、工具执行、上下文更新和终止条件之间循环调度。',flow=['构建 Context','LLM 决策','工具请求？执行并回填','满足停止条件 → Final'],pitfalls=['模型请求工具不等于工具已执行','必须有最大步骤/成本/超时预算','取消本地调用不等于远程执行被撤销'],code='''for step in range(MAX_STEPS):\n    response = await llm.generate(messages, tools)\n    if not response.tool_calls:\n        return response.text\n    for call in response.tool_calls:\n        result = await dispatch(call)\n        messages.append(tool_result(call.id, result))\nraise MaxStepsExceeded()''',check='非法工具名、参数校验、无穷循环、审批中断、工具报错、步骤级/任务级重试。'),
 dict(id='session',no='03',title='Session / Context',subtitle='Conversation / Token Budget',time='25 min',icon='messages',level='基础',one='Session 保存会话历史，Context 是本次实际发送给模型的可用信息集合。',flow=['用户身份 + Session','读取历史','选择/压缩消息','上下文组装 → 模型'],pitfalls=['Session 不是 Agent Instance','Context 不是全部历史','tool_call 和对应 result 不能被错误裁剪'],code='''session = sessions.get(session_id, user_id=user_id)\nhistory = session.messages\ncontext = context_builder.build(\n    history=history,\n    max_tokens=8000,\n)\n# 注意保留 tool_call_id 的配对''',check='跨用户授权、多轮指代、长历史 Token 限额、并发消息、历史顺序和 tool_call_id。'),
 dict(id='rag',no='04',title='RAG / 知识库',subtitle='Retrieval Augmented Generation',time='40 min',icon='database',level='核心',one='用检索给模型提供外部证据：入库、切分、向量化、索引、召回、可选重排、生成。',flow=['文档解析→Chunk→Embedding→索引','Query→召回 Top K','可选 Rerank','Context → LLM 回答'],pitfalls=['检索相关不等于事实正确','Recall@K 与 Faithfulness 不同','知识文档不是高权限指令'],code='''hits = retriever.search(query, top_k=5)\nselected = reranker.rank(query, hits)[:3]\ncontext = "\\n".join(hit.text for hit in selected)\nanswer = await llm.generate(\n    f"仅基于以下证据回答：\\n{context}\\n问题：{query}"\n)''',check='入库增删改、解析/Chunk、召回/排序、无答案、文档权限、来源引用、检索延迟。'),
 dict(id='memory',no='05',title='Memory 记忆',subtitle='Long-term Memory',time='25 min',icon='brain',level='进阶',one='将需长期保存的信息写入并按身份、任务相关性召回，不等于 Session 聊天历史。',flow=['判断可保存信息','去重/冲突/授权','持久化','新 Session 召回'],pitfalls=['不是全部聊天永久存储','删除需考虑索引与缓存','记忆属于低信任内容'],code='''memory.save("user-a", "cluster", "demo-system")\nassert memory.get("user-a", "cluster") == "demo-system"\nassert memory.get("user-b", "cluster") is None\n# 这是结构化 Memory 示例，不是语义检索''',check='跨 Session 召回、用户隔离、更新冲突、删除可见性、旧记忆和提示注入。'),
 dict(id='skill',no='06',title='Skill / 技能组',subtitle='SKILL.md / Progressive Disclosure',time='25 min',icon='layers',level='进阶',one='Skill 是可复用的任务说明包，按任务发现、选择和加载；文件存在不等于脚本已执行。',flow=['发现 name/description','选择相关 Skill','加载 SKILL.md','按需读取引用资源'],pitfalls=['Skill 不等于 MCP','read_file 不一定代表激活成功','Skill 指令不能授予工具权限'],code='''---\nname: k8s-diagnosis\ndescription: Diagnose abnormal Kubernetes Pods.\n---\n# Steps\n1. Call get_pods.\n2. Call get_pod_logs when necessary.\n3. Cite actual evidence; do not mutate resources.''',check='元数据、版本、实际读取路径、文件不存在、路径越界、引用和执行权限。'),
 dict(id='sandbox',no='07',title='Sandbox 沙箱',subtitle='Isolation / Resource Limits',time='35 min',icon='box',level='核心',one='Sandbox 是可选的隔离执行环境，限制代码执行时能看到、能写入、能访问和能消耗的资源。',flow=['Runtime 请求执行','创建/分配执行环境','隔离运行并采集结果','清理与归还资源'],pitfalls=['Session 不等于 Sandbox','Docker 限制不等于完整安全边界','客户端超时不代表容器已停止'],code='''docker run --rm --network none --read-only \\\n  --cpus 0.5 --memory 128m --pids-limit 64 \\\n  --cap-drop ALL --user 65534:65534 \\\n  python:3.12-slim python -B /app/report.py''',check='只读挂载、网络、非 root、OOM、超时清理、残留容器、共享实例权限。'),
 dict(id='multi',no='08',title='Multi-Agent 协作',subtitle='Fan-out / Fan-in / asyncio',time='40 min',icon='git-branch',level='核心',one='Coordinator 管理委托、依赖、并发与结果汇总；子 Agent 有独立任务和状态。',flow=['Pod Agent 定位异常','并发 Log + Knowledge','收集任务状态','汇总证据与失败'],pitfalls=['await 不是自动并发','父协程 cancel 不代表远程 Agent 停止','分布式迟到结果必须按 ID 关联'],code='''pod = await pod_agent.find_abnormal(namespace)\nlogs, knowledge = await asyncio.gather(\n    log_agent.inspect(namespace, pod["name"]),\n    knowledge_agent.lookup(pod["status"]),\n)\n# 依赖先串行；独立任务再并发''',check='任务分配、并发屏障、部分失败、任务超时、父任务取消、旧结果串 Run。'),
 dict(id='eval',no='09',title='Agent E2E / Trace / Eval',subtitle='Testing / Observability / Quality',time='50 min',icon='activity',level='核心',one='不仅测试 Run 成功，还要验证用户任务、工具轨迹、业务事实、质量、性能和安全。',flow=['Golden Dataset','执行 Agent 与收集 Trace','规则 + 语义评估','统计指标与发布门禁'],pitfalls=['HTTP 200 不是 Task Success','Trace 不等于模型全部推理','并行 Span 耗时不能简单加总'],code='''assert result.run_status == "COMPLETED"\nassert any(c.name == "get_pods" for c in result.calls)\nassert all(c.name != "delete_pod" for c in result.calls)\nassert expected_pod in result.evidence\n# 业务成功、来源与实际副作用还需独立验证''',check='Run/Task Success、工具参数、Golden、Span、P95、Token、Faithfulness、越权零容忍。')
]
# Preserve the hand-written module notes from the PDF's chapter for fuller study.
chapters=[]
for i,ch in enumerate(source.CHAPTERS):
    chapters.append(dict(id=i,title=ch['title'],intro=ch['intro'],sections=[dict(title=a,explain=b,test=c) for a,b,c in ch['sections']],cases=[dict(id=cid,title=t,step=s,expect=e) for cid,t,s,e in ch['cases']],diagram=ch['diagram']))
qa=[]
for area, questions in source.QUESTION_AREAS:
    for q,a,follow in questions:
        qa.append(dict(id=f'Q{len(qa)+1:02d}',area=area,question=q,answer=a,follow=follow))
assert len(qa)==80
metrics=[]
for name,formula,origin,caveat in source.METRICS:
    category=('检索与回答质量' if name in ['Recall@K','Precision@K','MRR','Faithfulness','Answer Correctness','Answer Relevancy'] else
              '性能与容量' if name in ['E2E Latency','User-visible First Output','Model TTFT','TPOT','Output TPS','P95/P99 Latency','Task Throughput','Concurrency','Queue Time'] else
              '稳定性与成本' if name in ['Retry Success Rate','Orphan Task Count','Trace Completeness','Cost Per Success'] else
              '功能与执行效果')
    metrics.append(dict(name=name,formula=formula,source=origin,pitfall=caveat,category=category))

# Questions the user specifically asked throughout the learning sequence.
followups=[
('MCP vs Function Calling','模型先提出工具调用意图；Runtime 负责执行路由；MCP 是与外部工具服务通信的协议。三者不是同一层。','mcp'),
('JSON-RPC/HTTP 成功，业务还可能失败？','是。HTTP 200 或 MCP 消息成功不代表目标 Namespace 存在、也不代表业务 success=true。','mcp'),
('get_pods 缺少 namespace、类型是 123 怎么测？','缺少必填/非法类型是 Schema 验证；不存在 namespace 是业务错误，断言类型和执行边界要分开。','mcp'),
('Runtime 为什么不能直接等同 LLM？','LLM 负责给出下一步决策；Runtime 管工具分发、消息反馈、停止条件、异常和状态。','runtime'),
('Session、Context、Memory、RAG 怎么区分？','Session 保存对话历史；Context 是当轮输入；Memory 是长期保存信息；RAG 提供外部知识证据。','session'),
('历史过长，工具结果能随便裁剪吗？','不能。必须保护 tool_call/tool_result 关联，按 token 预算裁剪和摘要，防止孤立工具消息。','session'),
('Chunk/Embedding/TopK/Rerank 各负责哪一步？','Chunk 切知识、Embedding 表示语义、TopK 召回候选、Rerank 精排，然后作为证据生成回答。','rag'),
('多模态检索与 RAG 的联系？','视觉/文本特征及语义匹配与多模态检索相关；RAG 还涉及检索增强生成与证据忠实度。','rag'),
('Skill 的 read_file 就是激活吗？','不一定。要核对读取的 Skill 文件路径、内容、版本和具体运行轨迹。','skill'),
('Skill 中有 Python 脚本会自动执行吗？','不会。读取文件与运行脚本是两回事，仍需要执行器、权限与沙箱。','skill'),
('Sandbox 与 Docker、Agent Runtime 的关系？','Runtime 调度任务，Sandbox 提供可选执行环境；容器借助 Namespace/Cgroups 等隔离，但并非绝对安全。','sandbox'),
('新 Session 会自动创建或清空 Sandbox 吗？','不应这样假设。Sandbox 资源生命周期取决于实例关联和产品运行策略。','sandbox'),
('async def 调用后为什么得到 coroutine？','调用 async def 创建协程对象；需要 await 或在事件循环中调度执行才能取得业务结果。','multi'),
('连续两个 await 会并发吗？','不会自动并发。相互独立的工作可用 asyncio.gather/create_task；依赖任务先 await。','multi'),
('gather vs create_task vs TaskGroup？','gather 收集并发结果；create_task 返回可管理的 Task；TaskGroup 强调结构化并发与失败传播。','multi'),
('time.sleep 与 asyncio.sleep 为什么不同？','time.sleep 阻塞线程及 Event Loop；await asyncio.sleep 在等待期让其他协程运行。','multi'),
('取消父协程会杀掉远程 Agent 吗？','不能保证。远端后台任务需按 task_id 请求取消、查询最终状态和实际副作用。','multi'),
('如何测真正的并发？','用 asyncio.Event 屏障要求两个 Mock worker 都开始后再继续，比严格比较 wall-clock 更稳定。','multi'),
('Run Success 和 Task Success 为什么不同？','前者是运行成功终态；后者是业务目标满足。模型运行结束但回答错，属于 Run 成功、Task 失败。','eval'),
('TTFT、TPOT、TPS 与 E2E 到底区别？','TTFT 首 token、TPOT 后续 token 间隔、Output TPS 每秒输出 token、E2E 从任务发起到终态。区分模型和用户可见时刻。','eval'),
('为何 P95 不能用平均值代替？','Agent 执行路径长且波动大，部分任务因重试/排队极慢；P95/P99 能暴露尾部体验。','eval'),
('Trace 成功为什么任务还可能失败？','Trace 反映操作执行，不保证工具选择/证据使用/最终答案符合业务验收。','eval'),
('LLM-as-a-Judge 能当唯一评分吗？','不行。判断可能偏差；确定性权限、状态、参数优先用规则断言和业务审计。','eval'),
('AgentWorks 指标都是官方定义的吗？','不是。Trace/使用量是平台能力，OpenTelemetry 定义遥测语义，Ragas 给出评测概念；业务 KPI 需团队明确计算口径。','eval'),
('Run 关联的 HTTP、WebSocket 怎么处理？','消息提交不代表完成。需要将 context_key/sid、msg_id/mid 与主 Agent lifecycle 关联，断线续传时按 seq 去重。','eval'),
('真实模型非确定性怎样测？','Mock 保证确定性回归；真实模型固定版本/数据集多次测量成功率、方差和合法路径。','eval'),
('MCP 创建操作超时，能直接重试吗？','不能假设未成功。需要查询真实资源状态和幂等机制，区分步骤级与任务级重试。','runtime'),
('子代理任务完成但父任务没结束？','子代理终态只是子任务完成，主 Agent 还需消费结果并生成主 Run 的终态。','multi'),
('如何将云网络测试经验迁移到 Agent？','状态机/负例→Runtime；pytest 参数化→Golden；K8s→Sandbox；性能压测→E2E/P95；租户隔离→Session/RAG/Memory。','eval'),
('如何向 AgentWorks 研发核对架构？','问 Runtime 是否自研、状态机如何持久化、Mock/真实模型测试怎么分层、Trace 如何贯通、线上典型 Bug 与性能瓶颈。','runtime'),
]

sources=[dict(id=i,title=t,url=u) for i,t,u in source.SOURCES]
# Add verified platform privacy guidance and official sites.
sources.append(dict(id='G1',title='GitHub Pages：仓库私有不意味着站点私有',url='https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site'))
quick20=source.QUICK_20

code_lab=[
 dict(title='MCP：缺失参数与业务错误',tag='MCP',cmd='python -m pytest tests/test_mcp_mock.py -v',desc='Schema 错误与业务返回分层验证，避免把 HTTP 成功当业务成功。',code='''import pytest\n\n@pytest.mark.parametrize("namespace, expected", [\n    ("demo-system", "ok"),\n    ("missing-ns", "not_found"),\n])\ndef test_mcp_business(mock_mcp, namespace, expected):\n    result = mock_mcp.get_pods(namespace=namespace)\n    assert result["status"] == expected'''),
 dict(title='异步：先依赖，再 gather',tag='asyncio',cmd='python -m pytest tests/test_asyncio.py -v',desc='前置 Pod 查询串行，独立日志与知识库并发。',code='''import asyncio\n\nasync def diagnose(namespace, pod_agent, log_agent, rag_agent):\n    pod = await pod_agent.find_abnormal(namespace)\n    logs, docs = await asyncio.gather(\n        log_agent.inspect(namespace, pod["name"]),\n        rag_agent.lookup(pod["status"]),\n    )\n    return {"pod": pod, "logs": logs, "docs": docs}'''),
 dict(title='asyncio.Event：证明任务真的并发',tag='asyncio',cmd='python -m pytest tests/test_asyncio.py -v',desc='用同步屏障避免单纯比较耗时的偶发不稳定。',code='''started = set()\nready = asyncio.Event()\n\nasync def worker(name):\n    started.add(name)\n    if len(started) == 2:\n        ready.set()\n    await asyncio.wait_for(ready.wait(), timeout=1)\n\nawait asyncio.gather(worker("logs"), worker("rag"))'''),
 dict(title='Memory：跨用户隔离',tag='Memory',cmd='python -m pytest tests/test_memory.py -v',desc='记忆存储 CRUD 只是第一层，查询必须按可靠的认证身份过滤。',code='''store.save("user-a", "cluster", "demo-system")\nassert store.get("user-a", "cluster") == "demo-system"\nassert store.get("user-b", "cluster") is None\nstore.delete("user-a", "cluster")\nassert store.get("user-a", "cluster") is None'''),
 dict(title='Golden Dataset：规则评测',tag='Eval',cmd='python -m pytest tests/test_eval.py -v',desc='工具选择、参数、证据和禁止操作必须独立断言。',code='''tool_ok = any(\n    c["name"] == "get_pods"\n    and c["arguments"] == {"namespace": "demo-system"}\n    for c in run["tool_calls"]\n)\nsafe = all(c["name"] != "delete_pod" for c in run["tool_calls"])\nassert tool_ok and safe'''),
 dict(title='Trace：父子 Span 校验',tag='Trace',cmd='python -m pytest tests/test_trace.py -v',desc='关注同一 trace_id、父子关系和时序，不能将并行耗时简单加总。',code='''assert len({s.span_id for s in spans}) == len(spans)\nassert len({s.trace_id for s in spans}) == 1\nfor span in spans:\n    assert span.end >= span.start\n    if span.parent_span_id:\n        assert span.parent_span_id in {s.span_id for s in spans}'''),
]

payload=dict(title='Agent QA 学习站',version='2026-11-06',courses=courses,chapters=chapters,questions=qa,metrics=metrics,followups=followups,sources=sources,quick20=quick20,codeLab=code_lab,examples=[dict(title=t,scenario=s,result=r,notice=n) for t,s,r,n in source.CALC_EXAMPLES],deepDives=[dict(title=t,setup=setup,steps=[dict(title=a,action=b,expect=c) for a,b,c in steps],note=note) for t,setup,steps,note in source.DEEP_DIVES])
out='window.AGENT_QA_DATA = '+json.dumps(payload,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\n'
(ROOT/'data.js').write_text(out,encoding='utf-8')
print('Generated',ROOT/'data.js','size',len(out),'Q',len(qa),'metric',len(metrics))
