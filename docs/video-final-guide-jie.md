# 录视频最终指南 + 完整台词 —— Jie Bao（包杰）

> 这是包杰那份。**你（Chengyu）已经录完了，这是给他的。**
> 和你的那份结构一样：检查清单 + 逐分钟台词 + 代码段 + 排错 + 追问。
>
> **目标 13–14 分钟**（上限 15）。英文台词可直接念。
> 两人**不要讲重复内容**：你讲的是「报名之后发生的一切」，他讲的是「数据和事件的骨架」。

---

# 第一部分：开录前（5 分钟，不计入视频）

## 1.1 服务

双击 **`D:\PROG2002-A3\start-all.bat`**，等 25 秒。确认三个地址：

| 地址 | 应该看到 |
|---|---|
| http://localhost:4200/ | 首页，13 张活动卡片 |
| http://localhost:4201/ | 管理端列表 |
| http://localhost:3000/api/health | `database: connected`，13 / 16 / 6 |

> 它会开最多四个黑窗口（MySQL / API / 客户端 / 管理端），**都是后台服务，别关**。
> 报错 `Port 4200 is already in use` 不是故障，把那个窗口关掉即可。

## 1.2 五个标签页

| # | 页面 | 地址 | 什么时候用 |
|---|---|---|---|
| 1 | 首页 | http://localhost:4200/ | 0:00–0:45 |
| 2 | 搜索页 | http://localhost:4200/search | 3:30–5:30 |
| 3 | 客户端代码 | VS Code：`clientside/src/app/pages/home/` | 5:30–6:30 |
| 4 | 管理端列表 | http://localhost:4201/ | 7:00–9:30 |
| 5 | 你的线上站点 | https://24831941.it.scu.edu.au/ | 11:00–12:30 |

## 1.3 代码窗口（要跳的行号）

VS Code 打开这两个文件：

| 文件 | 跳到 | 是什么 |
|---|---|---|
| `database/charityevents-db.sql` | **131** | `CREATE TABLE registrations` |
| 同上 | **149** | `UNIQUE (event_id, email)` |
| `api/routes/events.js` | **646** | `DELETE /api/events/:id` |
| 同上 | **669** | `if (event.registration_count > 0)` ← 删除规则的第一次执行 |

> ⚠️ **别开成 A2**：`D:\PROG2002-A2\api\routes\` 里只有 `categories.js` 和 `events.js`。
> 确认窗口里是 **PROG2002-A3**。

## 1.4 Postman

- 已导入 23 个请求，右上角环境 **Giving Coast A3**
- 跑之前**让数据库是干净的**（喊 Chengyu 或包杰自己重置），否则 `new booking` 会红

## 1.5 桌面

- 录屏 **1080p**，浏览器全屏
- **关掉微信 / QQ / 邮件弹窗**
- 本文档打印或放第二块屏

---

# 第二部分：逐分钟台词 + 动作

## 0:00 – 0:45 开场

**画面**：标签页 1（首页），往下滚露出 13 张卡片。

**念**：

> "Hello. This is Giving Coast, my Assessment 3 project for PROG2002 Web
> Development II. Two websites — the public site and a staff admin site — both
> Angular 22 with TypeScript, both talking to one Express API over MySQL.
>
> My teammate Chengyu Gao and I split the work by layer. He built everything
> that happens after somebody decides to attend: the registration endpoint, the
> registration form, the weather proxy and the staff's new and edit screens.
> I built what everything else stands on: the database, the event endpoints,
> the Angular shell with the typed models and the service layer, the Home and
> Search pages, the staff event list, and the deployment guide.
>
> I will cover the database design, the API, how data reaches the screen, and
> then show both sites and my own cPanel deployment. I will say which parts are
> mine as I go."

---

## 0:45 – 3:30 数据库与 API

### 0:45 – 2:00 表结构设计（★ 这段是你的核心）

**画面**：切到 VS Code 的 `database/charityevents-db.sql`，跳到 **131 行**。

**念**：

> "The part I want to start with is the registrations table, because its shape
> came from two rules in the brief that pull against each other. There is no
> user table — no login — and yet one person may register for many events but
> only once per event.
>
> With no account to identify a person, their email address is the only identity
> we have. So 'once per event' is not really a rule about a person, it is a rule
> about the pair of event and email."

**动作**：跳到 **149 行**，指着 `UNIQUE (event_id, email)`。

> "And that is why this is a UNIQUE key on the pair, rather than a check in
> JavaScript. A check in JavaScript can be raced — two requests in the same
> instant can both pass it. A unique key cannot: the database decides, and the
> loser gets an error."

**动作**：手指 `ON DELETE RESTRICT` 那行（外键）。

> "There is also a foreign key from registrations to events with ON DELETE
> RESTRICT. That is the rule that stops an event with bookings from being
> deleted, and I will come back to it in a moment."

### 2:00 – 3:30 删除规则（双重执行）

**画面**：跳到 `api/routes/events.js` 的 **669 行**。

**念**：

> "Now the delete rule. An event with bookings cannot be deleted — but I enforce
> that twice, on purpose.
>
> The first place is here in the endpoint. Before deleting, it counts the
> registrations, and if there are any it answers 409 with a sentence the staff
> member can act on: 'this event has four registrations, remove them or suspend
> the event instead.' That is a message a person can use.
>
> The second place is the foreign key with ON DELETE RESTRICT — the backstop. If
> something later goes around my endpoint and deletes straight from the
> database, the rule still holds. Writing it twice was the moment the difference
> between validating input and protecting data became concrete for me: one of
> those is for the user, the other is for the data."

**动作**：切到 Postman，点 **`Admin - delete blocked because people booked (409)`** → **Send**

**念**：

> "Here it is in Postman. 409, and the body names the number of registrations
> and the number of tickets — so the staff screen can print a real reason rather
> than 'something went wrong'."

---

## 3:30 – 6:30 前端：骨架与数据流

### 3:30 – 5:30 搜索页（筛选条件留在 URL 里）

**画面**：标签页 2（http://localhost:4200/search）

**动作**：
1. 选一个日期 / 地点 / 分类
2. 手指**地址栏** —— URL 变成带参数的
3. 按 **F5 刷新** —— 筛选还在
4. 复制地址栏，新标签打开 —— 结果一样

**念**：

> "This is the Search page, and the thing worth looking at is the address bar.
> The filters are query-string parameters, not component state. That is a
> deliberate choice: it means a search result can be refreshed, bookmarked, or
> sent to somebody, and it still comes back the same. If the filters lived in a
> JavaScript variable, none of that would work.
>
> The page asks the service layer, which asks the API, which builds the WHERE
> clause from those parameters. Every query is parameterised — there is no
> string concatenation of user input anywhere in the codebase."

### 5:30 – 6:30 代码：分层结构

**画面**：切到 VS Code，指着这几个文件（**不念代码，只念为什么这么分**）：

| 文件 | 说 |
|---|---|
| `clientside/src/app/models/models.ts` | "typed models — the API shape is written down in one place" |
| `clientside/src/app/services/events-api.service.ts` | "one service every page calls; pages never touch HTTP" |
| `clientside/src/app/pages/home/`, `search/` | "pages only bind data to a template" |

**念**：

> "The client is deliberately layered: typed models, one service that owns every
> HTTP call, and pages that only bind data to a template. The reason is that a
> page cannot quietly invent its own request — if an endpoint changes, there is
> one file to change."

---

## 6:30 – 7:00 数据怎么到屏幕（一句话）

**念**：

> "So the path for any page is: the Angular router matches a URL, the component
> asks the service, the service calls the API, and the response is typed into a
> model and rendered. Nothing in a page talks to the database, and nothing in a
> page builds SQL."

---

## 7:00 – 9:30 管理端：列表与删除流程

**画面**：标签页 4（http://localhost:4201/）

**动作**：
1. 指着 13 行（含 Suspended 和 Past）
2. 点某个**有报名**的活动（活动 5）的 **Delete** → 出现被挡住的提示
3. 手指提示里那句「3 registration(s) are attached」

**念**：

> "On the staff site I built the event list and its delete flow. The list shows
> every event including suspended and past ones, because staff have to be able
> to see what the public cannot.
>
> The delete flow is the interesting part. I did not want a generic failure
> message, so the endpoint reports a blocked delete as its own outcome — 409
> with the number of registrations attached — and this screen has a branch that
> prints that reason instead. The staff member is told what to do: remove the
> registrations, or suspend the event instead. Suspending is always available,
> and it is the answer that loses no data."

---

## 9:30 – 11:00 部署（★ 你的独有部分）

**画面**：切到标签页 5（**你自己的线上站点** https://24831941.it.scu.edu.au/）

**动作**：
1. 展示首页
2. 打开 `/api/health`，指着 `dbName: jbao14_charityevents`

**念**：

> "Each of us deployed the whole stack to our own cPanel account, as the brief
> requires. Mine is at 24831941.it.scu.edu.au: the MySQL database
> jbao14_charityevents, the API registered as a Node.js application mounted at
> /api, and both Angular builds uploaded — the admin one with a base href of
> /admin/, without which every menu link 404s.
>
> Three things went wrong, and all three happened one layer below where I was
> looking. The emoji icons arrived as question marks, which was the character
> set in the CREATE TABLE trusting the database default instead of saying
> utf8mb4. The staff site served a blank page, which was a missing base href in
> the build, not in the code. And the API connected as the wrong user, because
> the environment variables had been typed into the cPanel form but never
> applied — that one produced 'Access denied for user root@localhost', which is
> the error you get when no credentials are found and the defaults are used."

**动作**：指着 health 返回。

> "Which is why the first endpoint I wrote was a health check that names the
> database it is actually connected to. That one line turned the third problem
> from a mystery into a five-minute fix, and I would add it to any API from the
> start now."

---

## 11:00 – 12:30 跑 Postman 全集

**画面**：Postman → **⋯ → Run collection → Run**
（**先点 Run，跑完再开口**，别录干等）

**念**：

> "This is the collection my teammate wrote, twenty-three requests and
> fifty-seven assertions. The ones I care about are the event CRUD ones and the
> blocked delete — the 409 that tells you how many bookings are attached. A
> collection that only tests the happy path does not prove anything.
>
> All green. And there is only one variable, base_url, so the same file runs
> against localhost and against my cPanel deployment."

---

## 12:30 – 13:30 收尾

**画面**：切回首页

**念**：

> "To summarise what is mine: the database design including the registrations
> table and its unique key, the event CRUD endpoints and the delete rule that is
> enforced twice, the Angular shell with its typed models and service layer, the
> Home and Search pages, the staff event list and its delete flow, the
> repository setup and the deployment guide. The registration endpoint, the
> registration form, the weather proxy and the staff's new and edit screens are
> my teammate Chengyu Gao's.
>
> Thank you."

---

# 第三部分：出问题怎么办

| 状况 | 怎么办 |
|---|---|
| 页面空白 / 打不开 | 双击 `start-all.bat`，等 25 秒 |
| Postman 全红 | 右上角确认环境 **Giving Coast A3**，`base_url` = `http://localhost:3000` |
| `new booking` 那条红 | 数据库里已有该报名 → 跑之前重置数据库 |
| 线上站点打不开 | 稍等再刷；cPanel 偶发重启。可改讲 localhost 版本 |
| 讲错 | 停 2 秒，从那句开头重讲，后期剪掉 |
| 超时 | 按顺序砍：6:30 数据路径那段 → 5:30 分层结构 → 收尾里的部署 |

---

# 第四部分：三个老师最可能追问的问题

**Q1：为什么删除规则要执行两次？**
> 一次在接口里、为了给用户一句能行动的话；一次在外键 `ON DELETE RESTRICT` 上、
> 保证以后有人绕过接口直接删库时也删不掉。前者是给用户的，后者是给数据的。

**Q2：为什么「一人一次」用 UNIQUE 而不是代码判断？**
> 代码判断能被测出来吗 —— 两个请求同一瞬间都查不到、都通过。唯一索引不能，
> 数据库来做决定，输的那个收到错误。这是保护数据，不是校验输入。

**Q3：部署那三个故障的根因有什么共同点？**
> 都发生在我看的那一层的下面一层：字符集在 CREATE TABLE 里、base href 在构建里、
> 环境变量根本没被应用。共同点是它们都不是"代码写错了"，而是"配置没生效"，
> 所以排查得往下看一层。health 接口命名了实际连的库，才让第三个五分钟就解决了。

---

# 第五部分：录完之后

1. 导出 MP4（1080p）
2. 上传 **SCU OneDrive**，共享设成 **Anyone with the link**
3. 复制链接 → Blackboard
4. **用 `jbao14` 前缀**交三个 zip + `jbao14A3-report.docx` + `jbao14A3-storyboard.docx`
5. 发他那份 peer evaluation（标题 `PROG2002_A3_Team30_JieBao`，发给 tutor）

---

# 附：包杰与 Chengyu 的分工对照（别讲串了）

| 模块 | 包杰 | Chengyu |
|---|---|---|
| 数据库 | ✅ 表结构、UNIQUE、外键 | 复核 |
| API | ✅ 事件 CRUD、删除规则、连接池 | ✅ 报名端点、天气代理、字典接口 |
| 公开站 | ✅ 骨架、models、service、Home、Search | ✅ 详情页、报名页、卡片 |
| 管理端 | ✅ 列表、删除流程 | ✅ 新建/编辑页、共用表单 |
| 部署 | ✅ 部署指南、三个故障排查 | ✅ 跟做自己的部署 |
| 测试 | — | ✅ Postman 23 请求 / 57 断言 |
