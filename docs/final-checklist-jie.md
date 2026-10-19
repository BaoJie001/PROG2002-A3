# 包杰（Jie Bao）完整作业指南 —— 从现在到交完

> 这份是给包杰的**总清单**，覆盖还剩下的全部事项。
> 视频台词另看 `docs/video-final-guide-jie.docx`，那份才是逐分钟脚本。
>
> 前提：代码、报告、zip、GitHub、部署**全都已经做完了**。
> 你真正要做的只有三件事：**录视频、传视频、交作业**。

---

# 第一部分：你不用做的事（都已经做完了）

| 事项 | 状态 |
|---|---|
| 生成报告和 storyboard | ✅ `jbao14A3-report.docx`（30 页）、`jbao14A3-storyboard.docx`（14 页） |
| 打三个 zip | ✅ `jbao14A3-api.zip`、`-clientside.zip`、`-adminside.zip` |
| 推 GitHub | ✅ 已同步，0 待推，远程有你 36 个提交 |
| 填 Student ID / Cohort / Team ID | ✅ 已填（24831941 / 10 / Team 30） |
| 部署到你自己的 cPanel | ✅ https://24831941.it.scu.edu.au/ 三个地址都 200 |
| 写部署文档 | ✅ `docs/deployment.md` 第 6 节是你的 |
| 修 Postman 集合的两个断言 bug | ✅ Chengyu 已修并推送 |
| 写 Postman 集合 | ❌ **不用你写** —— 那是 Chengyu 的分工（B9） |

---

# 第二部分：Postman 你要不要用？（答案：用，但很简单）

## 2.1 账号问题 —— 不用换，也无所谓

**Postman 登录的是谁的账号，老师完全不看。** 评分看的是：

- 你视频里的演示画面
- 仓库里那两个 json 文件
- 报告里写的测试

**直接用这台电脑上已经装好的 Postman**（集合已导入、环境已选），不用注册、不用重新导入。

> 如果你介意界面上显示 Chengyu 的名字，可以自己注册一个账号登录 ——
> 但**纯属可选，不加分也不减分**。

## 2.2 你要点的请求（就这几条）

| 请求 | 期望 | 为什么是你的 |
|---|---|---|
| **`Admin - delete blocked because people booked (409)`** | **409**，提示里写几条报名 | ★ 你的删除规则，必须演示 |
| `Admin - create an event (201)` | 201 | 你的事件 CRUD |
| `Admin - update that event (200)` | 200 | 同上 |
| `Admin - delete that event (200)` | 200 | 同上 |
| `Health - is the API and database up` | 200 + connected | 你的连接池和健康检查 |
| `Events - list / search / detail / 404` | 200 / 404 | 你的读取端点 |

**不用管**注册那几条 409（那是 Chengyu 的），跑全集时它们会自动过。

## 2.3 结尾跑全集（建议做）

`⋯ → Run collection → Start run` → 23 个请求 / 57 条断言全绿。

开场说一句 **"the collection my teammate wrote"** 就不会显得抢他的活。

> ⚠️ **跑之前让数据库是干净的**（喊 Chengyu 重置，或自己导入一次 SQL），
> 否则 `new booking` 那条会红 2 条断言。

---

# 第三部分：你要做的三件事

## ① 录视频（≤15 分钟）

**用这份脚本**：`docs/video-final-guide-jie.docx`

### 开录前

1. 双击 **`D:\PROG2002-A3\start-all.bat`** 起服务（等 25 秒，四个黑窗口别关）
2. 确认三个地址能开：`4200` / `4201` / `3000/api/health`
3. 开好五个标签页（指南 1.2 节有列表）
4. VS Code 打开两个文件备查行号：
   - `database/charityevents-db.sql` → **131 / 149 行**
   - `api/routes/events.js` → **646 / 669 行**
5. **关掉微信弹窗**，录屏 1080p、浏览器全屏

### 内容（13–14 分钟）

| 时间 | 讲什么 |
|---|---|
| 0:00–0:45 | 开场 + 分工 |
| 0:45–2:00 | registrations 表：为什么「一人一次」是 **UNIQUE** 而不是代码判断 |
| 2:00–3:30 | 删除规则**双重执行**（接口 409 + 外键 RESTRICT） |
| 3:30–5:30 | 搜索页：筛选留在 URL（可刷新/收藏/分享） |
| 5:30–6:30 | 客户端分层：models / service / pages |
| 7:00–9:30 | 管理端列表 + 删除流程的友好提示 |
| 9:30–11:00 | **你自己**的 cPanel 部署 + 三个故障 |
| 11:00–12:30 | 跑 Postman 全集 |
| 12:30–13:30 | 收尾 |

**和 Chengyu 零重叠** —— 别讲报名端点、报名表单、天气代理、管理端新建/编辑页，那些是他的。

## ② 传视频拿链接

1. 导出 **MP4（1080p）**
2. 上传 **SCU OneDrive**
3. 共享设置改成 **Anyone with the link**（最容易忘的一步）
4. 复制链接保存

## ③ Blackboard 提交 + 发 peer evaluation

### Blackboard 交这些

| 交什么 | 文件（都在 `D:\PROG2002-A3\submission\`） |
|---|---|
| 代码 zip ×3 | `jbao14A3-api.zip`、`jbao14A3-clientside.zip`、`jbao14A3-adminside.zip` |
| 报告 | `jbao14A3-report.docx` |
| Storyboard | `jbao14A3-storyboard.docx` |
| GitHub 链接 | https://github.com/BaoJie001/PROG2002-A3 |
| 视频链接 | 第 ② 步拿到的 |

⚠️ **前缀必须是 `jbao14`**（你的 SCU 用户名），别交成 `cgao15` 的。

### Peer evaluation（保密）

用这份：`D:\PROG2002-A3\private\Peer-Evaluation-JieBao-Team30.docx`

| 项目 | 值 |
|---|---|
| 收件人 | 你的 **tutor**（**不是 UA**） |
| 标题 | `PROG2002_A3_Team30_JieBao` |
| 附件 | 上面那个 docx |

⚠️ **别给 Chengyu 看，也别告诉他你打了几分**（表单要求保密、各自单独填）。

---

# 第四部分：两个必须注意的坑

## 4.1 Git 身份（最容易出错）

这台仓库现在的身份是 **Chengyu Gao**。你如果要提交，必须先改回自己：

```cmd
cd /d D:\PROG2002-A3
git config user.name "Jie Bao"
git config user.email "1822675871@qq.com"
```

**每次提交前都确认一次**：`git config user.name`

## 4.2 别开错文件夹

VS Code 里确认打开的是 **PROG2002-A3**，不是 PROG2002-A2。
（A2 的 `api/routes/` 里只有 `categories.js` 和 `events.js`，没有你要的文件。）

---

# 第五部分：最终检查清单

- [ ] 视频录完（≤15 分钟，讲的是你那半）
- [ ] 视频传到 OneDrive，共享 = Anyone with the link
- [ ] Blackboard 交了 3 个 zip（jbao14 前缀）+ 报告 + storyboard
- [ ] Blackboard 填了 GitHub 链接 + 视频链接
- [ ] Peer evaluation **单独**发给 tutor，标题 `PROG2002_A3_Team30_JieBao`
- [ ] 所有提交在截止前完成

---

# 附：你和 Chengyu 的分工（别讲串）

| 模块 | 你 | Chengyu |
|---|---|---|
| 数据库 | ✅ 表结构、UNIQUE、外键 | 复核 |
| API | ✅ 事件 CRUD、删除规则、连接池、共享校验 | ✅ 报名端点、天气代理、字典接口 |
| 公开站 | ✅ 骨架、models、service、Home、Search | ✅ 详情页、报名页、卡片 |
| 管理端 | ✅ 列表、删除流程 | ✅ 新建/编辑页、共用表单 |
| 部署 | ✅ 部署指南、三个故障排查 | ✅ 跟做自己的部署 |
| 测试 | — | ✅ Postman 23 请求 / 57 断言 |
