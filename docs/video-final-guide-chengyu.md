# 录视频最终指南 + 完整台词 —— Chengyu Gao

> 这是唯一需要看的一份。之前的 `video-run-sheet-chengyu.docx`（含 v2）和
> `postman-guide-chengyu.docx` 都被这份取代。
>
> **目标 13–14 分钟**（上限 15）。台词可以直接念。

---

# 第一部分：开录前（5 分钟，不计入视频）

## 1.1 服务（已跑好，出问题再看）

| 服务 | 地址 | 状态确认 |
|---|---|---|
| API | http://localhost:3000/api/health | 显示 `database: connected`，13 / 16 / 6 |
| 客户端 | http://localhost:4200/ | 首页有卡片 |
| 管理端 | http://localhost:4201/ | 列表有行 |

> 某个页面突然打不开 → 双击 **`D:\PROG2002-A3\start-all.bat`** 等 25 秒。
> 它会开最多四个黑窗口（MySQL / API / 客户端 / 管理端），**都是后台服务，别关**。
> 已经跑着时再双击会报 `Port 4200 is already in use` / `EADDRINUSE` —— 不是故障，
> 把报错的窗口关掉即可。

## 1.2 数据库已清空（重要，决定了 201 能不能演示）

已重置为样例数据：`13 events / 16 registrations / 6 categories`。
`postman.tester@example.com` 不在库里，所以 **`new booking` 第一次会返回 201**。

> ⚠️ **这条 201 一个邮箱只能成功一次。** 如果这段讲砸要重录，
> 必须先让数据库重新清空，否则第二次点就是 409。

## 1.3 五个标签页按顺序开好

| # | 页面 | 地址 | 什么时候用 |
|---|---|---|---|
| 1 | 首页 | http://localhost:4200/ | 0:00–0:45 |
| 2 | 活动详情 | http://localhost:4200/event/5 | 3:30–5:00 |
| 3 | 报名页 | **录到 5:00 时从详情页点 Register 进去** | 5:00–6:30 |
| 4 | 管理端编辑页 | http://localhost:4201/events/5/edit | 7:00–9:00 |
| 5 | 管理端列表 | http://localhost:4201/ | 9:00–10:00 |

## 1.4 代码窗口（2.5 节要用）

VS Code 里打开 **`D:\PROG2002-A3\api\routes\registrations.js`**

> ⚠️ **别开错成 A2！** `D:\PROG2002-A2\api\routes\` 里只有 `categories.js` 和
> `events.js`，没有 `registrations.js`。看一眼窗口左下角确认是 **PROG2002-A3**。

## 1.5 Postman（已导入、已选环境）

- 已导入 23 个请求，右上角环境 **Giving Coast A3**
- 如果看不到：`Ctrl + O` 导入 `docs\postman\` 下两个 json；环境在右上角选

## 1.6 桌面

- 录屏 **1080p**，浏览器**全屏**
- **关掉微信 / QQ / 邮件弹窗通知**
- 关掉无关标签页
- 稿子（本文档）打印或放第二块屏

---

# 第二部分：逐分钟台词 + 动作

## 0:00 – 0:45 开场

**画面**：标签页 1（首页）。慢慢往下滚，露出 13 张卡片。

**念**：

> "Hello. This is Giving Coast, my Assessment 3 project for PROG2002 Web
> Development II. It is a charity events site for the Gold Coast, and it is
> really two websites: the public site that visitors use, and a staff admin
> site. Both are Angular 22 with TypeScript, and both talk to one Express API
> over MySQL.
>
> My teammate Jie Bao and I split the work by layer. He built the database and
> the event endpoints. I built everything that happens after somebody decides
> to attend: the registration endpoint, the registration form, the event page
> that shows who is coming, the weather feature, and the staff screens for
> creating and editing an event. I also deployed the whole stack to my own
> cPanel account.
>
> In this video I will cover three things: the design of the database and the
> API, how data flows from a click through to the screen, and then a demo of
> both websites. I will say which parts are mine as I go."

---

## 0:45 – 3:30 数据库与 API（Postman）

### 0:45 – 1:30 报名表结构

**画面**：Postman 点开 `Registrations - new booking (201)`，只看请求体，不发送。

**念**：

> "The table this part writes to is called registrations. The shape of it came
> from two rules in the brief that pull against each other: there is no user
> table, and one person may register for many events but only once per event.
> With no account to identify a person, their email is the only identity we
> have — so 'once per event' is really a rule about the pair of event and email,
> and that pair is a UNIQUE key in the database rather than a check in
> JavaScript. My teammate designed that table; what I built on top of it is the
> endpoint that writes to it."

### 1:30 – 2:45 三条拒绝规则 ★核心

**画面**：依次点开并 **Send**：

| 顺序 | 请求 | 你看到 | 你说 |
|---|---|---|---|
| ① | `Registrations - new booking (201)` | **201** | "先成功一次" |
| ② | `Registrations - duplicate booking (409)` | **409** "already registered" | 重复报名 |
| ③ | `Registrations - booking a finished event (409)` | **409** "already finished" | 已结束 |
| ④ | `Registrations - booking a suspended event (409)` | **409** "closed" | 已暂停 |

> ⚠️ **① 必须在 ② 之前**（同一个邮箱）。顺序反了 ② 会返回 201。

**念**：

> "A booking can be refused for three quite different reasons. The event has
> been suspended. The event has already taken place. Or this email address has
> already booked this event.
>
> All three answer with **409 Conflict**, and that is a deliberate choice, not a
> default. A 400 would mean 'your request is malformed' — but none of these
> requests is malformed. The JSON is fine, every field is valid. The request
> cannot be carried out because of the state the world is in. That is what 409
> means, and the difference matters to the front end: a 409 can be printed
> straight to the user as an explanation, whereas a 400 means the form itself
> needs correcting."

**顺带一句**（2:45）：

> "There is one more thing about the duplicate rule. The route checks first so
> you get a friendly message, but two people could still submit in the same
> instant and both pass that check. So it also catches MySQL error 1062 and
> turns it into the same 409 — the unique key gets the last word."

### 2:45 – 3:15（可选，建议）展示代码

**画面**：切到 VS Code 的 `registrations.js`，**Ctrl + G** 跳行：

| 跳到 | 代码 | 你说 |
|---|---|---|
| 194 | `if (event.status !== 'active')` | "这条拦暂停的活动" |
| 201 | `if (eventDate < todayString())` | "这条拦已经结束的" |
| 231 | `if (duplicate.length > 0)` | "这条查同一个人报没报过" |
| 261 | `err.errno === 1062` | "这条兜并发" |

**念**：

> "Let me show you the code behind that, because the same status code is the
> interesting part. Three checks, three different reasons — suspended, finished,
> already booked — and all three return 409. I could have used 400 for all three
> and nobody would have noticed, but then the front end could not tell the
> difference between 'you filled the form in wrong' and 'this event is closed',
> and those need completely different messages."

> ⚠️ **指到就走，别逐行念，控制在 1 分钟内。**

### 3:15 – 3:30 天气

**画面**：浏览器打开 http://localhost:3000/api/weather/5（会显示 23.8° / 17.3°，Moderate rain showers）

**念**：

> "The weather panel is the other API feature I built. It is a proxy: the
> browser asks our API, our API asks Open-Meteo, and we return only the few
> values the panel needs. Three reasons — the third party stays out of the
> browser, the response can be trimmed to what the page shows, and if Open-Meteo
> is unreachable the page says there is no forecast instead of showing an empty
> box. An optional feature must never be able to break a required one."

---

## 3:30 – 7:00 数据流与前端

### 3:30 – 5:00 详情页「谁要来」

**画面**：标签页 2。屏幕真实数据：

```
Twilight 10K for Families
2026-10-24 · Main Beach, Gold Coast
天气 23.8° / 17.3°  Moderate rain showers

Who is going
  Priya N.   2 张   2026-10-16
  Chloe W.   1 张   2026-10-01
  Jack M.    3 张   2026-09-15
```

**念**：

> "This page is mine. The list of who is going is sorted by the date the tickets
> were bought, most recent first — October 16th at the top, September 15th at the
> bottom. That ordering happens in the API, not in the browser, so the same list
> comes back in the same order whoever asks for it.
>
> Next to it is the weather panel you just saw the API for. If there is no
> forecast, this panel is simply not rendered — the rest of the page still
> works."

### 5:00 – 6:30 报名表单

**画面**：点详情页的 **Register** 进去。先填正确的：

| 字段 | 值 |
|---|---|
| First name | Chengyu |
| Last name | Gao |
| Email | chengyu.demo@example.com |
| Phone | 0400000000 |
| Tickets | 2 |
| Registration date | 今天 |

**念**：

> "The form is a Reactive Form. Every field carries its own message underneath
> it, rather than one generic alert at the top, so the visitor knows which box
> to fix. The ticket total updates as I type, so the cost is visible before they
> commit. And the Register button passed the event through the URL rather than
> through a JavaScript variable — that is why this page survives a refresh, or a
> bookmark, or being sent to somebody."

**然后故意填错**：Email 改成 `abc`，Tickets 改成 `99`

> "Break the email and ask for ninety-nine tickets, and each field reports its
> own problem. And there is a ceiling: you cannot book more than fifty at once."

**最后**（6:15）：

> "One thing I want to be honest about, because it is the mistake I made. I
> assumed the max attribute on a date input meant the server would refuse a wrong
> date. It does not — that attribute is a hint to the browser and disappears
> entirely if somebody posts straight to the API. So I added a server-side check
> for it, then removed it again: a booking cannot be dated in the future, and a
> finished event is refused anyway, so that case was already impossible. The
> lesson is narrower than I first wrote down: check whether a rule is needed
> before adding one."

⚠️ **别真的提交**（免得污染数据）。

---

## 7:00 – 10:30 管理端

### 7:00 – 9:00 编辑页

**画面**：标签页 4

**念**：

> "On the staff site I built the new-event and edit-event screens, and both use
> the same form component — this is the edit screen, but the fields, the
> validation and the messages are literally the same component the new screen
> uses. That matters because the validation rules then exist once. If we change
> a rule, both screens change together and cannot drift apart.
>
> Below the form, this screen loads that event's registrations and shows a total
> ticket count, so a staff member can see how full an event is before they move a
> date or a venue — which is the whole reason the list is here."

### 9:00 – 10:00 状态筛选

**画面**：标签页 5，点 **Suspended**

**念**：

> "The list has a status filter with counts, and the numbers come from the rows
> actually on screen rather than a separate query, so a filter button can never
> claim a number the table does not show. Filter to suspended: one row, and the
> count says one."

点回 **All**。

### 10:00 – 10:30

> "The delete flow on this list is my teammate's — it is the one that answers
> 409 and tells you how many bookings are blocking it. I will show that in the
> Postman run in a moment, because the error path is the interesting part."

---

## 10:30 – 12:30 跑 Postman 全集

**画面**：Postman → 集合右侧 **⋯ → Run collection → Run**

**念**（跑的时候说）：

> "This is the collection I wrote. Twenty-three requests, and the ones I care
> about are the failures — 400 for a malformed request, 404 for an unknown event,
> and the 409s for a blocked delete and the three booking refusals. A collection
> that only tests the happy path does not prove anything, so those cases are
> asserted here rather than left to memory."

**跑完展示全绿**：

> "All green. That is the whole API re-checked in one click, and it runs the same
> against localhost and against my cPanel deployment — there is only one variable,
> base_url."

---

## 12:30 – 13:30 收尾

**画面**：切回首页

**念**：

> "To summarise what is mine: the registration endpoint and its three refusals,
> the registration form, the event detail page, the weather proxy, the new and
> edit screens on the staff site with their shared form, the status filter, and
> this Postman collection. The database design, the event CRUD endpoints, the
> public site's shell and search, and the staff event list are my teammate Jie
> Bao's.
>
> I deployed the whole stack to my own cPanel account at 24832054.it.scu.edu.au,
> and the health endpoint there reports the database as connected.
>
> Thank you."

---

# 第三部分：出问题怎么办

| 状况 | 怎么办 |
|---|---|
| 页面空白 / 打不开 | 双击 `start-all.bat` 重开，等 25 秒 |
| Postman 全红 | 右上角确认环境是 **Giving Coast A3**，`base_url` 是 `http://localhost:3000` |
| 天气面板没出来 | Open-Meteo 偶尔超时。直接说 "the panel degrades by design" —— **当作降级演示讲，反而加分** |
| `new booking` 返回 409 | 这个邮箱已经报过了。跳过去，从 duplicate 开始；或让数据库重新清空 |
| 讲错一段 | 停 2 秒，从那句开头重讲，后期剪掉 |
| 时间超了 | 砍掉 2:45（并发）和 10:00（补一句），省约 1 分半 |

---

# 第四部分：三个老师最可能追问的问题

**Q1：为什么报名被拒是 409 而不是 400？**
> 请求本身没毛病 —— JSON 合法、字段齐全。不能执行是因为「世界状态」不允许
> （活动暂停 / 结束 / 已报过名）。400 表示请求格式错，用在这里是错的。

**Q2：`max` 属性为什么不够？**
> 它只是给浏览器的提示，改 DOM 或用 curl 都能绕过。我一开始加了服务端校验，
> 后来删了 —— 因为「不能是未来日期」加上「已结束活动拒绝」已经让那种情况不可能发生。

**Q3：天气为什么走你们自己的服务器？**
> 第三方不暴露在前端、响应能裁剪成页面要的几个字段、Open-Meteo 挂了页面还能
> 显示「暂无预报」而不是空框。可选功能绝不能拖垮必需功能。

---

# 第五部分：录完之后

1. 导出 MP4（1080p）
2. 上传 **SCU OneDrive**，共享设成 **Anyone with the link**
3. 复制链接 → 填进 Blackboard
4. 黑窗口可以关了
