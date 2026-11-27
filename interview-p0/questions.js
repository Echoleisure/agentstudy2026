/* AgentStudy2026 P0 interview question bank — editable data */
window.P0_QUESTIONS = [
  {
    "id": "mysql-01",
    "category": "mysql",
    "question": "为什么 MySQL 的 InnoDB 索引主要使用 B+Tree？",
    "answer": "B+Tree 非叶子节点主要存索引键和子节点指针，扇出高、树高低，磁盘页访问次数少；叶子节点有序且相互链接，既适合等值查询，也适合范围查询。",
    "followups": [
      "与 Hash 索引相比优势是什么？",
      "为什么不直接用二叉树？"
    ],
    "testing": [
      "对等值、范围、排序查询分别执行 EXPLAIN，观察索引使用及扫描行数。"
    ],
    "tags": [
      "索引",
      "B+Tree"
    ]
  },
  {
    "id": "mysql-02",
    "category": "mysql",
    "question": "聚簇索引和二级索引有什么区别？",
    "answer": "InnoDB 聚簇索引的叶子节点保存整行记录，一张表只有一种聚簇组织方式，通常由主键决定。二级索引叶子节点保存索引列和主键值，查其他列时通常需要根据主键回到聚簇索引。",
    "followups": [
      "没有主键时 InnoDB 怎么组织记录？",
      "什么叫回表？"
    ],
    "testing": [
      "构建只查索引列、查询非索引列两组 SQL，对比 EXPLAIN 和耗时。"
    ],
    "tags": [
      "索引",
      "回表"
    ]
  },
  {
    "id": "mysql-03",
    "category": "mysql",
    "question": "什么是覆盖索引，为什么能提高查询性能？",
    "answer": "若查询需要的列都可以从某个索引取得，就形成覆盖索引，不必再次读取聚簇索引中的完整记录，通常能降低随机访问开销。",
    "followups": [
      "SELECT * 为什么不利于覆盖索引？"
    ],
    "testing": [
      "针对组合索引分别查询索引内列和非索引列，通过 EXPLAIN Extra 判断覆盖情况。"
    ],
    "tags": [
      "覆盖索引"
    ]
  },
  {
    "id": "mysql-04",
    "category": "mysql",
    "question": "联合索引最左前缀原则是什么？",
    "answer": "联合索引按照索引列的先后顺序排列，例如 (a,b,c)，优先满足从最左列开始的匹配条件；是否继续利用后续列还与范围条件、排序、优化器决策有关。不是简单说遇到范围查询所有后续列都完全失效。",
    "followups": [
      "(a,b,c) 只按 b 查询一定不走索引吗？",
      "OR 一定让索引失效吗？"
    ],
    "testing": [
      "构造不同 WHERE/ORDER BY 组合，使用 EXPLAIN 验证实际执行计划。"
    ],
    "tags": [
      "联合索引"
    ]
  },
  {
    "id": "mysql-05",
    "category": "mysql",
    "question": "哪些 SQL 写法容易导致索引利用不佳？",
    "answer": "常见风险有对索引列使用函数或隐式类型转换、模糊查询以通配符开头、选择性太低、条件与索引顺序不匹配，以及返回数据量过大。最终要看 EXPLAIN，不能绝对化地说一定失效。",
    "followups": [
      "LIKE \"abc%\" 与 LIKE \"%abc\" 有什么区别？"
    ],
    "testing": [
      "建立大数据量测试表，对比 SQL 改写前后扫描行数和 P95 延迟。"
    ],
    "tags": [
      "SQL优化"
    ]
  },
  {
    "id": "mysql-06",
    "category": "mysql",
    "question": "事务 ACID 指什么？",
    "answer": "原子性是事务要么整体提交，要么回滚；一致性是事务前后满足数据库约束与业务规则；隔离性是并发事务互不产生不允许的干扰；持久性是提交成功的数据按数据库的持久化保证保存。",
    "followups": [
      "原子性和持久性靠什么实现？"
    ],
    "testing": [
      "构造事务中途失败、唯一键冲突、服务重启场景，验证提交和回滚边界。"
    ],
    "tags": [
      "事务",
      "ACID"
    ]
  },
  {
    "id": "mysql-07",
    "category": "mysql",
    "question": "四种事务隔离级别有什么区别？",
    "answer": "从低到高是读未提交、读已提交、可重复读、串行化。脏读是读到未提交数据；不可重复读是同一事务两次读取同一行得到不同已提交结果；幻读涉及同一范围条件下行集合变化。MySQL InnoDB 默认通常是可重复读。",
    "followups": [
      "RC 与 RR 的 Read View 创建时机有什么区别？"
    ],
    "testing": [
      "两个数据库连接交错插入、更新、读取，分别验证脏读、不可重复读和范围查询行为。"
    ],
    "tags": [
      "事务",
      "隔离"
    ]
  },
  {
    "id": "mysql-08",
    "category": "mysql",
    "question": "MVCC 是什么，解决了什么问题？",
    "answer": "多版本并发控制通过历史版本、Undo Log 和 Read View，让普通一致性读在不加行锁的情况下按可见性规则读取数据，提高读写并发能力；它并不能替代所有锁。",
    "followups": [
      "RR 快照读与 SELECT FOR UPDATE 区别？"
    ],
    "testing": [
      "两个事务并发修改同一行，验证 RC/RR 的一致性读和当前读差异。"
    ],
    "tags": [
      "MVCC"
    ]
  },
  {
    "id": "mysql-09",
    "category": "mysql",
    "question": "RC 和 RR 下 Read View 有什么区别？",
    "answer": "对 InnoDB 的普通一致性读，RC 通常每条语句建立新的 Read View；RR 通常在事务首次一致性读时建立快照并在后续一致性读中复用。所以 RC 可能发生不可重复读，而 RR 的普通快照读能保持一致。",
    "followups": [
      "在 RR 下为什么当前读仍可能看到新提交的数据？"
    ],
    "testing": [
      "控制两个连接事务提交时序，读取同一行观察不同隔离级别表现。"
    ],
    "tags": [
      "MVCC",
      "RC",
      "RR"
    ]
  },
  {
    "id": "mysql-10",
    "category": "mysql",
    "question": "行锁、间隙锁和 Next-Key Lock 是什么？",
    "answer": "Record Lock 锁住索引记录；Gap Lock 锁住索引记录之间的间隙，限制插入；Next-Key Lock 可以理解为记录锁加前面的间隙锁。具体加锁范围受隔离级别、索引和 SQL 条件影响。",
    "followups": [
      "为什么范围 UPDATE 可能阻塞 INSERT？"
    ],
    "testing": [
      "两个会话分别执行范围 SELECT FOR UPDATE 与 INSERT，记录锁等待与事务提交后的恢复。"
    ],
    "tags": [
      "锁"
    ]
  },
  {
    "id": "mysql-11",
    "category": "mysql",
    "question": "什么是死锁？发生后怎么处理？",
    "answer": "两个或多个事务循环等待彼此持有的资源即形成死锁。InnoDB 能检测常见死锁并回滚其中一个事务。业务端应安全重试整个事务，优化锁顺序、缩短事务时间，并用死锁日志定位。",
    "followups": [
      "死锁和锁等待超时有什么区别？"
    ],
    "testing": [
      "设计交叉更新两行的事务，验证错误码、回滚行为和幂等重试。"
    ],
    "tags": [
      "死锁"
    ]
  },
  {
    "id": "mysql-12",
    "category": "mysql",
    "question": "如何使用 EXPLAIN 分析慢 SQL？",
    "answer": "先定位慢查询和真实执行时间，再看 EXPLAIN 的 type、key、rows、Extra 等，判断是否全表扫描、回表、临时表或额外排序，然后结合业务数据分布优化索引和 SQL，并用同规模数据验证。",
    "followups": [
      "type=ALL 是否一定不能接受？",
      "Using filesort 是否必然很慢？"
    ],
    "testing": [
      "对同一条 SQL 做优化前后压测，比较执行计划、P95/P99、DB CPU 和扫描行数。"
    ],
    "tags": [
      "EXPLAIN",
      "SQL优化"
    ]
  },
  {
    "id": "mysql-13",
    "category": "mysql",
    "question": "慢 SQL 导致 API 网关 P99 增高，怎么排查？",
    "answer": "先从请求 Trace 确定耗时落在应用、连接池还是数据库，再查慢日志、连接数、锁等待和执行计划；定位具体 SQL 后优化索引或查询逻辑，同时做端到端压测验证 P99 和数据库资源。",
    "followups": [
      "为什么平均耗时正常但 P99 很高？"
    ],
    "testing": [
      "模拟热点请求、慢查询与连接池耗尽，验证网关超时及恢复。"
    ],
    "tags": [
      "场景题",
      "P99"
    ]
  },
  {
    "id": "mysql-14",
    "category": "mysql",
    "question": "读写分离可能带来什么一致性问题？",
    "answer": "主库写入后，从库复制可能存在延迟；若随后从库读，就可能读到旧数据。对读己之写要求高的业务，可以按场景走主库、使用会话一致性机制或做显式版本校验。",
    "followups": [
      "如何测试主从延迟？"
    ],
    "testing": [
      "写入后立即读不同节点，测量可见延迟并验证降级与路由策略。"
    ],
    "tags": [
      "一致性"
    ]
  },
  {
    "id": "redis-01",
    "category": "redis",
    "question": "Redis 为什么快？真的是单线程吗？",
    "answer": "Redis 核心命令执行主要采用单线程模型，内存访问快，常用数据结构高效，并通过 IO 多路复用处理连接；但网络 IO、持久化和部分后台任务可能使用其他线程或进程。",
    "followups": [
      "为什么不能说 Redis 所有工作都是单线程？"
    ],
    "testing": [
      "压测不同命令、请求量、连接数，观察 P99 和 CPU。"
    ],
    "tags": [
      "基础"
    ]
  },
  {
    "id": "redis-02",
    "category": "redis",
    "question": "Redis 五种常见数据类型和场景？",
    "answer": "String 用于缓存、计数和配额；Hash 存对象字段；List 存有序元素；Set 去重；ZSet 按分数排序，可用于排行榜和滑动窗口限流。",
    "followups": [
      "滑动窗口限流为什么可能使用 ZSet？"
    ],
    "testing": [
      "覆盖计数、过期、集合去重和排序边界。"
    ],
    "tags": [
      "数据结构"
    ]
  },
  {
    "id": "redis-03",
    "category": "redis",
    "question": "缓存穿透、击穿、雪崩分别是什么？",
    "answer": "穿透是不断请求数据库也不存在的数据，可用空值缓存、布隆过滤器；击穿是单个热点 Key 失效引起并发回源，可用互斥重建和热点预热；雪崩是大量 Key 集中失效或 Redis 故障，可用 TTL 抖动、高可用和限流降级。",
    "followups": [
      "布隆过滤器是否会误判？"
    ],
    "testing": [
      "分别模拟不存在 ID、热点 Key 过期、批量 Key 过期，观察 DB QPS。"
    ],
    "tags": [
      "缓存"
    ]
  },
  {
    "id": "redis-04",
    "category": "redis",
    "question": "如何保证 Redis 与 MySQL 缓存一致性？",
    "answer": "典型 Cache Aside 读流程是缓存未命中后回源并回填；写流程通常是先更新数据库，再删除缓存。该方式不能天然提供强一致，并发旧值回填和删缓存失败仍需重试、版本号、TTL 或消息补偿。",
    "followups": [
      "为什么不先删缓存再写 DB？"
    ],
    "testing": [
      "高并发读写、删除失败、延迟回填和 TTL 到期，验证最终状态。"
    ],
    "tags": [
      "一致性"
    ]
  },
  {
    "id": "redis-05",
    "category": "redis",
    "question": "什么是 Redis 分布式锁？",
    "answer": "使用 SET key token NX PX ttl 原子获得带过期时间的锁。token 要唯一，释放时使用 Lua 等原子方式比较 token 再删除，避免误删别人持有的锁；锁过期后旧持有者仍可能继续执行，关键写操作还需额外防护。",
    "followups": [
      "锁过期后 A 继续执行怎么办？"
    ],
    "testing": [
      "并发抢锁、提前过期、持锁进程崩溃、误删和 fencing 场景。"
    ],
    "tags": [
      "分布式锁"
    ]
  },
  {
    "id": "redis-06",
    "category": "redis",
    "question": "RDB 和 AOF 有什么区别？",
    "answer": "RDB 定期保存快照，文件较紧凑、恢复通常较快，但可能丢失快照间数据；AOF 记录写命令，数据丢失窗口受刷盘策略影响。实际根据恢复时间与数据可靠性目标选择，也可组合。",
    "followups": [
      "Redis 重启是否一定不丢数据？"
    ],
    "testing": [
      "模拟异常重启及不同持久化策略，核对恢复的数据量和耗时。"
    ],
    "tags": [
      "持久化"
    ]
  },
  {
    "id": "redis-07",
    "category": "redis",
    "question": "如何使用 Redis 实现网关分布式限流？",
    "answer": "按用户或租户维护限流状态，使用 Redis 原子计数或 Lua 处理计数与 TTL，或使用 ZSet 维护时间窗口。超过阈值时按策略返回 429，多个网关实例共享计数。",
    "followups": [
      "为什么 INCR 后单独 EXPIRE 有风险？"
    ],
    "testing": [
      "多实例临界并发、窗口边界、租户隔离和 Redis 故障。"
    ],
    "tags": [
      "限流"
    ]
  },
  {
    "id": "redis-08",
    "category": "redis",
    "question": "Redis 不可用时缓存服务如何降级？",
    "answer": "先区分 Redis 的角色：缓存故障可能触发 DB 回源；限流故障需要明确放行还是拒绝；锁故障可能导致一致性问题。应限制超时、回源量和重试，监控连接池及依赖服务健康。",
    "followups": [
      "什么是 fail-open 和 fail-closed？"
    ],
    "testing": [
      "模拟断连、超时和主从切换，检查 P99、DB QPS、错误率和恢复。"
    ],
    "tags": [
      "故障"
    ]
  },
  {
    "id": "redis-09",
    "category": "redis",
    "question": "Redis Key 过期后是不是立即删除？",
    "answer": "不是。Redis 综合使用惰性删除和定期过期扫描；Key 逻辑过期后不一定马上释放物理内存，过期和内存淘汰是两个不同机制。",
    "followups": [
      "缓存过期与 maxmemory 淘汰有什么区别？"
    ],
    "testing": [
      "大量不同 TTL Key 过期，观察内存、命中率和回源行为。"
    ],
    "tags": [
      "TTL"
    ]
  },
  {
    "id": "redis-10",
    "category": "redis",
    "question": "热点 Key 会造成什么问题？",
    "answer": "单个 Key 的访问量过大可能造成网络带宽、单实例 CPU 或连接压力热点。可用热点检测、本地缓存、请求合并、复制读等手段缓解，同时关注一致性成本。",
    "followups": [
      "本地缓存有什么一致性风险？"
    ],
    "testing": [
      "模拟同一 Key 极高并发和失效重建，观察请求放大与延迟。"
    ],
    "tags": [
      "热点"
    ]
  },
  {
    "id": "redis-11",
    "category": "redis",
    "question": "缓存命中率高，为什么系统仍可能慢？",
    "answer": "可能是热点 Key、网络 RTT、序列化开销、大 Value、慢命令、连接池等待，或者缓存命中后仍执行复杂下游逻辑。要结合端到端 Trace 和 Redis 命令耗时分析，不能只看命中率。",
    "followups": [
      "什么是慢命令？"
    ],
    "testing": [
      "模拟大 Value 和连接池拥塞，定位瓶颈并建立基线。"
    ],
    "tags": [
      "性能"
    ]
  },
  {
    "id": "redis-12",
    "category": "redis",
    "question": "Redis 主从切换时要重点测试什么？",
    "answer": "关注故障检测和切换时长、短时不可用、数据复制延迟、客户端重连、旧主恢复和请求重试。若用于锁或配额，需要特别验证切换时的一致性语义。",
    "followups": [
      "Redis 主从复制能否保证已确认写在故障后不丢？"
    ],
    "testing": [
      "故障期间压测并统计请求失败率、恢复耗时与数据状态。"
    ],
    "tags": [
      "高可用"
    ]
  },
  {
    "id": "network-01",
    "category": "network",
    "question": "TCP 三次握手为什么不能简单变成两次？",
    "answer": "SYN、SYN+ACK、ACK 三次交换让双方协商初始序列号并确认相互接收能力；最后一个 ACK 让服务端确认客户端收到服务端的 SYN，避免旧的连接请求错误建立连接。",
    "followups": [
      "丢失第三次 ACK 会怎样？"
    ],
    "testing": [
      "注入丢包/连接超时，验证重传和网关错误映射。"
    ],
    "tags": [
      "TCP"
    ]
  },
  {
    "id": "network-02",
    "category": "network",
    "question": "TCP 四次挥手和 TIME_WAIT 是什么？",
    "answer": "全双工的两个方向通常分别关闭，所以常见 FIN、ACK、FIN、ACK 四步；主动关闭方通常进入 TIME_WAIT，以确保能重传最终 ACK 并让旧报文在网络中消失。",
    "followups": [
      "大量 TIME_WAIT 可能导致什么？"
    ],
    "testing": [
      "短连接压测，监控端口、连接复用和 TIME_WAIT 数量。"
    ],
    "tags": [
      "TCP"
    ]
  },
  {
    "id": "network-03",
    "category": "network",
    "question": "TCP 和 UDP 有什么区别？",
    "answer": "TCP 提供面向连接、可靠有序的字节流和拥塞/流量控制；UDP 以数据报为单位，不保证到达或顺序，但协议开销更小。HTTP/3 使用 UDP 上的 QUIC，在 QUIC 层实现可靠传输。",
    "followups": [
      "UDP 就一定比 TCP 快吗？"
    ],
    "testing": [
      "验证丢包下吞吐、延迟及业务层重传策略。"
    ],
    "tags": [
      "TCP",
      "UDP"
    ]
  },
  {
    "id": "network-04",
    "category": "network",
    "question": "HTTP/1.1、HTTP/2、HTTP/3 的区别？",
    "answer": "HTTP/1.1 支持持久连接，但缺乏 HTTP/2 式多路复用；HTTP/2 采用二进制分帧、头部压缩和多路复用，但仍受 TCP 丢包影响；HTTP/3 基于 QUIC/UDP，改善跨流队头阻塞。",
    "followups": [
      "HTTP/2 多路复用后还有队头阻塞吗？"
    ],
    "testing": [
      "跨协议版本压测连接复用、丢包、并发流和网关兼容。"
    ],
    "tags": [
      "HTTP"
    ]
  },
  {
    "id": "network-05",
    "category": "network",
    "question": "HTTPS 和 HTTP 有什么区别？TLS 做什么？",
    "answer": "HTTPS 通常是 HTTP over TLS，使用证书完成服务端身份认证，通过密钥协商建立会话密钥，对应用数据提供保密性与完整性保护。",
    "followups": [
      "为什么数据加密常用对称密钥？"
    ],
    "testing": [
      "测试证书过期、域名不匹配、TLS 版本不兼容和证书链缺失。"
    ],
    "tags": [
      "TLS",
      "HTTPS"
    ]
  },
  {
    "id": "network-06",
    "category": "network",
    "question": "DNS 解析流程是什么？",
    "answer": "客户端优先检查本地缓存和系统解析器，递归 DNS 解析器若未命中缓存，会按需要查询根、顶级域和权威 DNS，取得域名解析结果并按 TTL 缓存。",
    "followups": [
      "DNS TTL 会带来什么故障切换问题？"
    ],
    "testing": [
      "构造解析失败、旧缓存、多个 A 记录与服务迁移场景。"
    ],
    "tags": [
      "DNS"
    ]
  },
  {
    "id": "network-07",
    "category": "network",
    "question": "502、503、504、429 有什么区别？",
    "answer": "502 是网关收到无效上游响应；503 是服务临时不可用；504 是网关等待上游超时；429 是请求超过配额。实际错误到状态码的映射还取决于网关产品配置。",
    "followups": [
      "连接拒绝一定是 502 吗？"
    ],
    "testing": [
      "分别模拟连接重置、过载、超时、限流并验证状态码与告警。"
    ],
    "tags": [
      "HTTP",
      "状态码"
    ]
  },
  {
    "id": "network-08",
    "category": "network",
    "question": "连接超时、读超时、总超时怎么区分？",
    "answer": "连接超时限制建立网络连接的等待时间；读超时约束等待读取响应数据的等待；总超时限制完整请求的预算。流式响应尤其要区分首字节超时、空闲读超时与请求总时长。",
    "followups": [
      "SSE 每隔几秒有数据是否仍可能触发总超时？"
    ],
    "testing": [
      "Mock 延迟建连、延迟首字节、分片停顿，校验不同超时配置。"
    ],
    "tags": [
      "超时"
    ]
  },
  {
    "id": "network-09",
    "category": "network",
    "question": "HTTP Keep-Alive 与 TCP Keepalive 的区别？",
    "answer": "HTTP Keep-Alive 指复用持久 TCP 连接处理多次 HTTP 请求；TCP Keepalive 是操作系统 TCP 层用于探测长时间空闲连接状态的机制，目标和触发条件不同。",
    "followups": [
      "连接池为什么能减少延迟？"
    ],
    "testing": [
      "对比长短连接压测、连接复用率与握手次数。"
    ],
    "tags": [
      "长连接"
    ]
  },
  {
    "id": "network-10",
    "category": "network",
    "question": "什么是 TCP 重传？为什么影响 P99？",
    "answer": "当 TCP 判断数据可能丢失时，会通过超时或快速重传等机制补发，保证可靠交付，但重传等待可能把少数请求延迟拉高，因此 P99 常比均值更敏感。",
    "followups": [
      "如何区分重传导致的慢请求和应用慢？"
    ],
    "testing": [
      "结合抓包、TCP 指标、应用 Trace，对比高分位延迟。"
    ],
    "tags": [
      "TCP",
      "P99"
    ]
  },
  {
    "id": "network-11",
    "category": "network",
    "question": "什么是连接池耗尽？",
    "answer": "连接池对并发可复用的连接数设置上限。如果请求变慢或连接未及时释放，新请求需要等待可用连接，最终表现为排队、超时和错误率增加。",
    "followups": [
      "连接池满和服务 CPU 高一定同时发生吗？"
    ],
    "testing": [
      "设置小连接池、Mock 慢下游，监控活跃/等待连接和 P99。"
    ],
    "tags": [
      "连接池"
    ]
  },
  {
    "id": "network-12",
    "category": "network",
    "question": "为什么请求超时后不能立即无限重试？",
    "answer": "超时只代表调用方没在期限内拿到结果，服务端可能已经处理成功。无限重试会放大流量，并可能造成重复创建、重复扣费，应限制次数、设置退避与幂等保护。",
    "followups": [
      "指数退避为什么要加随机抖动？"
    ],
    "testing": [
      "故障注入后统计总尝试量、重试分布和重复副作用。"
    ],
    "tags": [
      "重试"
    ]
  },
  {
    "id": "network-13",
    "category": "network",
    "question": "SSE 和 WebSocket 的区别？",
    "answer": "SSE 通常基于 HTTP 持续向客户端单向推送事件，适合模型 Token 流式输出；WebSocket 建连后支持双向消息。SSE 需要正确处理事件分隔、断连和缓存代理行为。",
    "followups": [
      "SSE 返回 200 后生成失败如何通知客户端？"
    ],
    "testing": [
      "测试分片解析、断流、重连策略、取消和服务端资源释放。"
    ],
    "tags": [
      "SSE"
    ]
  },
  {
    "id": "gateway-01",
    "category": "gateway",
    "question": "API Gateway 是什么？如何设计测试方案？",
    "answer": "网关是请求统一入口，负责鉴权、路由、限流、负载均衡和可观测性等。测试按功能、异常容错、兼容性、性能、安全和稳定性分层，重点检查多服务调用链路的失败处理和故障隔离。",
    "followups": [
      "网关返回 504 从哪里查？"
    ],
    "testing": [
      "覆盖路由、Token、429、上游 5xx、超时、熔断和性能基线。"
    ],
    "tags": [
      "JD",
      "场景题"
    ]
  },
  {
    "id": "gateway-02",
    "category": "gateway",
    "question": "固定窗口、滑动窗口、令牌桶、漏桶区别？",
    "answer": "固定窗口简单但容易边界突发；滑动窗口统计滚动时间范围，限流更平滑；令牌桶定速补充令牌允许一定突发；漏桶强调固定处理速率。",
    "followups": [
      "固定窗口每秒100次，任意连续1秒一定不超过100次吗？"
    ],
    "testing": [
      "临界值、窗口边界、突发请求和多节点一致性。"
    ],
    "tags": [
      "限流"
    ]
  },
  {
    "id": "gateway-03",
    "category": "gateway",
    "question": "怎样测试分布式限流？",
    "answer": "先明确限流粒度、窗口和配额；在多个网关节点并发请求，检查全局通过/拒绝数量、租户隔离、Redis 原子性、429 响应及故障退化策略。",
    "followups": [
      "Redis 宕机限流应该放行还是拒绝？"
    ],
    "testing": [
      "三节点同时压测，聚合统计总配额，并测试临界瞬间。"
    ],
    "tags": [
      "限流"
    ]
  },
  {
    "id": "gateway-04",
    "category": "gateway",
    "question": "熔断三种状态是什么？",
    "answer": "Closed 正常转发，失败率或超时达到阈值后转 Open 快速拒绝，冷却后转 Half-Open 允许少量探测；探测成功恢复 Closed，否则继续 Open。阈值与半开行为由具体熔断器配置决定。",
    "followups": [
      "如何证明熔断生效而非下游持续超时？"
    ],
    "testing": [
      "Mock 连续超时并观察实际下游调用数、状态转换与恢复探测。"
    ],
    "tags": [
      "熔断"
    ]
  },
  {
    "id": "gateway-05",
    "category": "gateway",
    "question": "限流、熔断、降级、重试的区别？",
    "answer": "限流控制进入系统的流量；熔断隔离持续故障的下游；降级提供替代或简化服务；重试应对短暂失败，但需受总时限、次数、退避和幂等限制。",
    "followups": [
      "为什么熔断后还要考虑降级？"
    ],
    "testing": [
      "联合模拟过载和 Provider 失败，验证策略优先级。"
    ],
    "tags": [
      "容错"
    ]
  },
  {
    "id": "gateway-06",
    "category": "gateway",
    "question": "什么是接口幂等性，怎么验证？",
    "answer": "同一业务操作执行多次与执行一次的最终业务效果一致。可用 Idempotency-Key、唯一约束或幂等状态记录保护，重点覆盖请求超时但服务端已成功、重复提交与高并发。",
    "followups": [
      "HTTP PUT 幂等就一定没有副作用吗？"
    ],
    "testing": [
      "重复创建、并发同 Key、不同参数复用 Key、结果丢失再重试。"
    ],
    "tags": [
      "幂等"
    ]
  },
  {
    "id": "gateway-07",
    "category": "gateway",
    "question": "契约测试是什么？",
    "answer": "验证消费者和提供者对请求、响应、字段类型、必填项、错误码和语义的约定。可使用 OpenAPI/JSON Schema/Pact，将契约校验前移到 CI，发现服务独立发布引发的破坏性变更。",
    "followups": [
      "新增可选字段一定兼容吗？"
    ],
    "testing": [
      "模拟删除字段、修改类型、修改错误码并跑新旧端组合。"
    ],
    "tags": [
      "契约"
    ]
  },
  {
    "id": "gateway-08",
    "category": "gateway",
    "question": "向前兼容与向后兼容怎么理解？",
    "answer": "先定义新旧谁与谁兼容：常见说法中，新服务能支持旧客户端称为向后兼容；旧客户端能处理新服务输出称为向前兼容。命名在不同语境有差异，面试时要说清版本关系。",
    "followups": [
      "删除响应字段为什么高风险？"
    ],
    "testing": [
      "新旧客户端×新旧服务组合验证。"
    ],
    "tags": [
      "兼容"
    ]
  },
  {
    "id": "gateway-09",
    "category": "gateway",
    "question": "怎样测试网关路由和负载均衡？",
    "answer": "验证按路径、Header、租户、模型等规则准确路由，结合加权分流、健康检查、实例下线、灰度和会话保持要求检查请求分布、成功率及回退逻辑。",
    "followups": [
      "实例异常后流量多久摘除？"
    ],
    "testing": [
      "配置多个 Mock upstream，记录每个实例实际收到的请求。"
    ],
    "tags": [
      "路由"
    ]
  },
  {
    "id": "gateway-10",
    "category": "gateway",
    "question": "如何进行网关的异常故障注入？",
    "answer": "用 MockServer/WireMock 等注入连接拒绝、慢响应、间歇 5xx、429、响应畸形和断流；配合延迟、丢包、实例终止，验证错误映射、重试、熔断、隔离和恢复。",
    "followups": [
      "为什么不能只通过 HTTP 500 测试所有异常？"
    ],
    "testing": [
      "设计错误类型矩阵，每类异常检查日志、Trace 和可观测指标。"
    ],
    "tags": [
      "故障注入"
    ]
  },
  {
    "id": "gateway-11",
    "category": "gateway",
    "question": "如何给网关定义性能测试验收指标？",
    "answer": "分阶段压测不同请求模型，关注吞吐 QPS、并发连接、P95/P99、错误率、CPU/内存、连接池、队列、重试率和资源恢复。验收阈值要基于业务 SLA 和容量设计，不随意拍脑袋。",
    "followups": [
      "QPS 高但 P99 恶化说明什么？"
    ],
    "testing": [
      "阶梯、突发、长稳和混合故障压测，记录拐点。"
    ],
    "tags": [
      "性能"
    ]
  },
  {
    "id": "gateway-12",
    "category": "gateway",
    "question": "API 网关遇到上游故障，如何保证故障隔离？",
    "answer": "按上游 Provider 或服务区分超时、连接池、并发限制和熔断状态，避免故障节点占满共享队列；同时对健康上游观察成功率和 P99，必要时按能力兼容性切换。",
    "followups": [
      "什么是 bulkhead 舱壁隔离？"
    ],
    "testing": [
      "让 A 持续超时，B/C 正常并发，检查 B/C 性能变化。"
    ],
    "tags": [
      "隔离"
    ]
  },
  {
    "id": "gateway-13",
    "category": "gateway",
    "question": "大促或重保前如何做质量验收？",
    "answer": "风险驱动地划定关键链路，执行自动化冒烟、契约回归、异常故障注入、容量与长稳基线，设定可量化发布门禁，并准备灰度、观测、告警和回滚预案。",
    "followups": [
      "为什么不能把长稳测试都放到上线当天？"
    ],
    "testing": [
      "按 P0/P1 分层验收，输出覆盖矩阵、风险清单和可追溯报告。"
    ],
    "tags": [
      "质量体系"
    ]
  },
  {
    "id": "llm-01",
    "category": "llm",
    "question": "多 Provider 大模型网关中，一个 Provider 超时，怎么做专项测试？",
    "answer": "先梳理路由和容错配置，Mock 延迟、5xx、429、连接拒绝、SSE 断流；验证超时、熔断、重试、备用 Provider 切换、健康 Provider 隔离；在高并发下观察成功率、P99、重试数、连接池、队列和恢复时间，最后进入 CI 回归。",
    "followups": [
      "怎么证明不是单纯返回了错误码，而是故障已隔离？"
    ],
    "testing": [
      "检查故障 Provider 实际调用数下降和健康 Provider P99 基线。"
    ],
    "tags": [
      "Provider",
      "场景题"
    ]
  },
  {
    "id": "llm-02",
    "category": "llm",
    "question": "什么是 TTFT、Token/s、端到端延迟？",
    "answer": "TTFT 是从请求开始到首个生成 Token 的时间；Token/s 是 Token 输出速率；E2E 是从请求发起到整个响应结束的耗时。不同实现对首 Token 和首字节定义可能不同，要先统一指标口径。",
    "followups": [
      "TTFB 和 TTFT 一样吗？"
    ],
    "testing": [
      "对不同上下文长度、输出长度、并发测量各指标。"
    ],
    "tags": [
      "性能"
    ]
  },
  {
    "id": "llm-03",
    "category": "llm",
    "question": "怎么测试 SSE 流式推理链路？",
    "answer": "验证事件格式、分片边界、内容拼接顺序、首 Token 延迟、正常结束标识、服务端错误事件、半途断连、取消、背压和连接资源释放；同时校验流式/非流式语义一致性。",
    "followups": [
      "为什么 HTTP 200 不一定代表流式请求成功？"
    ],
    "testing": [
      "Mock 一个事件拆成多个 TCP chunk、空闲停顿和中途断流。"
    ],
    "tags": [
      "SSE"
    ]
  },
  {
    "id": "llm-04",
    "category": "llm",
    "question": "模型输出了一半断流，网关还能返回 500 吗？",
    "answer": "HTTP 响应头已经发送后，通常不能再改变状态码。需要用约定的流内错误事件、异常结束或客户端状态标识传达失败，并检查是否释放请求资源和处理计费。",
    "followups": [
      "如果重试，能直接拼接备用模型输出吗？"
    ],
    "testing": [
      "模拟首个 Token 前/后失败，验证差异化策略。"
    ],
    "tags": [
      "断流"
    ]
  },
  {
    "id": "llm-05",
    "category": "llm",
    "question": "模型调用超时后，为什么不能无条件重试？",
    "answer": "调用方超时并不代表 Provider 没有开始推理或计费。盲目重试可能重复推理、重复计费，甚至多次触发下游副作用。要结合幂等键、调用状态、重试预算和供应商语义设计。",
    "followups": [
      "什么条件下可切换备用 Provider？"
    ],
    "testing": [
      "模拟模型已开始执行但响应丢失，核查调用数和账单记录。"
    ],
    "tags": [
      "幂等",
      "计费"
    ]
  },
  {
    "id": "llm-06",
    "category": "llm",
    "question": "Provider A 切换到 B，要验证哪些兼容问题？",
    "answer": "除接口能否连通，还要验证模型能力、参数支持、上下文长度、工具调用格式、错误码、SSE 格式、Token 使用量以及计费口径。不能默认不同 Provider 完全等价。",
    "followups": [
      "temperature、tools 等参数不同 Provider 处理方式是否相同？"
    ],
    "testing": [
      "对相同输入分别调用 A/B，比较 Schema、功能语义和降级策略。"
    ],
    "tags": [
      "兼容"
    ]
  },
  {
    "id": "llm-07",
    "category": "llm",
    "question": "如何验证 Provider 故障不会拖慢健康 Provider？",
    "answer": "同时发 A/B/C 请求并设置各自基线，让 A 持续超时；重点检查 B/C 的成功率、P99、队列等待、连接池，以及 A 的熔断与请求下降情况，排除共享资源耗尽。",
    "followups": [
      "为什么只看整体成功率不够？"
    ],
    "testing": [
      "双流量组对比测试，按 Provider 分指标并看 Trace。"
    ],
    "tags": [
      "隔离"
    ]
  },
  {
    "id": "llm-08",
    "category": "llm",
    "question": "模型调用链路如何做 Trace 排查？",
    "answer": "给每次请求使用统一 trace_id，把鉴权、网关路由、队列、Provider 请求、首 Token、生成结束等阶段关联。对比 Span 耗时定位连接、排队、推理或输出瓶颈，并确保敏感输入输出遵守脱敏要求。",
    "followups": [
      "首 Token 慢一定是模型算力问题吗？"
    ],
    "testing": [
      "注入排队、DNS、连接池慢与推理慢，验证 Span 可区分。"
    ],
    "tags": [
      "Trace"
    ]
  },
  {
    "id": "llm-09",
    "category": "llm",
    "question": "大模型数据生产质量如何测试？",
    "answer": "从数据正确性、完整性、重复率、字段 Schema、标注一致性、敏感信息、抽样审核和数据版本可追溯性设计校验；对数据变更建立质量门禁，防止错误样本流入训练或评测链路。",
    "followups": [
      "如何衡量标注一致性和脏数据？"
    ],
    "testing": [
      "构造缺字段、重复、标签冲突、敏感信息、编码异常的样本集。"
    ],
    "tags": [
      "数据生产"
    ]
  },
  {
    "id": "llm-10",
    "category": "llm",
    "question": "如何测试模型路由的限流与配额？",
    "answer": "按用户、租户、模型、Provider 等维度验证配额隔离、并发与 Token 计量规则；重点检查多实例下配额准确性、429 处理、不同 Provider 使用量换算和失败时是否错误扣费。",
    "followups": [
      "按 QPS 和按 Token 配额有何不同？"
    ],
    "testing": [
      "模拟短/长 Prompt、流式取消、重复请求、Provider 429 与配额恢复。"
    ],
    "tags": [
      "限流",
      "计费"
    ]
  },
  {
    "id": "llm-11",
    "category": "llm",
    "question": "如何做完整的模型调用 E2E 质量门禁？",
    "answer": "建立正常、异常、性能和兼容性四类基线：鉴权路由、Provider 成功调用、SSE 解析、超时重试熔断、额度计费、日志 Trace 和多供应商切换；接入 pytest/CI，分层执行冒烟、回归、压力和长稳。",
    "followups": [
      "怎样平衡模型结果非确定性与自动化断言？"
    ],
    "testing": [
      "断言结构、状态、工具调用与规则性指标；语义质量用评测集和阈值，避免只比对固定文本。"
    ],
    "tags": [
      "E2E"
    ]
  }
];
