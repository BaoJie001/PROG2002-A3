# 录视频逐分钟执行表 —— Chengyu Gao

> 这篇是**你按着做就能录完**的手册：每一分钟说什么、点什么、演示什么，
> 台词可以直接念。所有数据都是你系统里的真实数据，不是编的。
>
> 时长目标 **13–14 分钟**（上限 15，留一点余量）。

---

# 第 0 部分：开录之前（5 分钟准备，不计入视频）

## 0.1 把服务跑起来

双击 **`D:\PROG2002-A3\start-all.bat`**。

它最多开**四个黑窗口** —— MySQL、API、客户端、管理端。它们是后台服务程序，
没有图形界面，只有一个黑色命令行窗口：**关掉哪个，哪个就停了**。

**已经跑着的时候不用再双击**：端口被占用会报 `Port 4200 is already in use`
或 `EADDRINUSE :::3000`，这不是故障，只是说明已经有一个在跑了 ——
把报错的窗口关掉即可。只有某个页面突然打不开时，才双击它重启一次（等 25 秒）。

确认三个地址都能开：

| 地址 | 应该看到 |
|---|---|
| http://localhost:4200/ | 首页，活动卡片 |
| http://localhost:4201/ | 管理端，活动列表 |
| http://localhost:3000/api/health | `database: connected`，13 events / 16 registrations |

## 0.2 按顺序开好 5 个浏览器标签页

| # | 标签 | 地址 | 什么时候用 |
|---|---|---|---|
| 1 | 首页 | http://localhost:4200/ | 0:00–0:45 |
| 2 | 活动详情 | http://localhost:4200/event/5 | 3:30–6:30 |
| 3 | 报名页 | 从详情页点 Register 进去（**录的时候再点**） | 5:00–6:30 |
| 4 | 管理端编辑页 | http://localhost:4201/events/5/edit | 7:00–9:30 |
| 5 | 管理端列表 | http://localhost:4201/ | 9:30–10:30 |

## 0.3 Postman 准备好（别在录的时候才导入）

1. 打开 Postman → **Import** → 选这两个文件：
   - `D:\PROG2002-A3\docs\postman\Giving-Coast-A3.postman_collection.json`
   - `D:\PROG2002-A3\docs\postman\Giving-Coast-A3.postman_environment.json`
2. 右上角环境下拉选 **Giving Coast A3**
3. 确认 `base_url` = `http://localhost:3000`
4. 点集合名右侧 **⋯ → Run**，窗口先开着别点，等到 11:00 再跑

## 0.4 录屏设置

- 分辨率 **1080p**，浏览器**全屏**
- 关掉微信/邮件弹窗通知（录进去很难看）
- 麦克风离嘴近一点
- 随时可以停，讲错就重讲那一段，**后期剪掉比现场卡壳好看**

---

# 第 1 部分：开场（0:00 – 0:45）

**画面**：标签页 1，首页。慢慢往下滚一下，让 13 张卡片露出来。

**念**（照念就行）：

> "Hello. This is Giving Coast, my Assessment 3 project for PROG2002 Web
> Development II. It is a charity events site for the Gold Coast, and it is
> really two websites: the public site that visitors use, and a staff admin
> site. Both are Angular 22 with TypeScript, and both talk to one Express API
> over MySQL.
>
> My teammate Jie Bao and I split the work by layer. He built the database
> and the event endpoints. I built everything that happens after somebody
> decides to attend: the registration endpoint, the registration form, the
> event page that shows who is coming, the weather feature, and the staff
> screens for creating and editing an event. I also deployed the whole stack
> to my own cPanel account.
>
> In this video I will cover three things: the design of the database and the
> API, how data flows from a click through to the screen, and then a demo of
> both websites. I will say which parts are mine as I go."

**动作**：说到 "two websites" 时手指一下地址栏；说到 "my teammate" 时语气平常就行，别念得像背书。

---

# 第 2 部分：数据库与 API（0:45 – 3:30）

## 2.1 先讲报名表的结构（0:45 – 1:30）

**画面**：切到 Postman，点开 `Registrations - new booking (201)`，只看请求体，不发送。

**念**：

> "The table this part writes to is called registrations. The shape of it came
> from two rules in the brief that pull against each other: there is no user
> table, and one person may register for many events but only once per event.
> With no account to identify a person, their email is the only identity we
> have — so 'once per event' is really a rule about the pair of event and
> email, and that pair is a UNIQUE key in the database rather than a check in
> JavaScript.
>
> My teammate designed that table. What I built on top of it is the endpoint
> that writes to it."

## 2.2 三条拒绝规则（1:30 – 2:45）★ 这段最重要

**画面**：Postman 里依次点开这三个请求，**每个都点 Send，看响应**：

| 顺序 | 请求 | 你看到 | 你说 |
|---|---|---|---|
| ① | `Registrations - new booking (201)` | 201 + "You are registered for..." | **先成功一次** |
| ② | `Registrations - duplicate booking (409)` | 409 + "already registered" | **再点同一个** → 重复报名 |
| ③ | `Registrations - booking a finished event (409)` | 409 + "already finished" | 已结束 |
| ④ | `Registrations - booking a suspended event (409)` | 409 + "closed" | 已暂停 |

> ⚠️ **① 必须在 ② 之前**：两条用的是同一个邮箱（postman.tester@example.com，
> 活动 6）。先发"新建"它才算第一次报名；再发"重复"才撞得上 UNIQUE 约束。
> 顺序反了，"重复"那条会返回 201，演示就露馅了。
> 重录一遍时如果 ① 变成了 409，把两个请求体里的邮箱末尾加个 2
> （postman.tester2@example.com），两边改成一样的即可。

**念**（边点边说）：

> "A booking can be refused for three quite different reasons. The event has
> been suspended. The event has already taken place. Or this email address has
> already booked this event.
>
> All three answer with **409 Conflict**, and that is a deliberate choice, not
> a default. A 400 would mean 'your request is malformed' — but none of these
> requests is malformed. The JSON is fine, every field is valid. The request
> cannot be carried out because of the state the world is in. That is what 409
> means, and the difference matters to the front end: a 409 can be printed
> straight to the user as an explanation, whereas a 400 means the form itself
> needs correcting."

**动作**：说到 "409 Conflict" 时手指响应状态码那一行。

## 2.3 顺带提一句并发（2:45 – 3:00）

**念**：

> "There is one more thing worth saying about the duplicate rule. The endpoint
> checks first so you get a friendly message, but two people could still submit
> the same address in the same instant and both pass that check. So the
> endpoint also catches MySQL error 1062 and turns it into the same 409. The
> unique key gets the last word."

## 2.4 天气为什么走服务端（3:00 – 3:30）

**画面**：浏览器新标签打开 http://localhost:3000/api/weather/5

**念**（屏幕上会显示 23.8° / 17.3°，Moderate rain showers）：

> "The weather panel is the other API feature I built. It is a proxy: the
> browser asks our API, our API asks Open-Meteo, and we return only the few
> values the panel needs. I did it this way for three reasons — the third party
> stays out of the browser, the response can be trimmed to what the page
> actually shows, and when Open-Meteo is unreachable the page says there is no
> forecast instead of showing an empty box. An optional feature must never be
> able to break a required one."

---

# 第 3 部分：数据流与前端（3:30 – 7:00）

## 3.1 活动详情页的「谁要来」（3:30 – 5:00）

**画面**：切到标签页 2（http://localhost:4200/event/5）

屏幕上真实数据是：

```
Twilight 10K for Families
2026-10-24 · Main Beach, Gold Coast
天气：23.8° / 17.3°，Moderate rain showers

Who is going
  Priya N.   2 张   2026-10-16
  Chloe W.   1 张   2026-10-01
  Jack M.    3 张   2026-09-15
```

**念**：

> "This page is mine. Two things on it are worth looking at.
>
> The first is the list of who is going. It is sorted by the date the tickets
> were bought, most recent first — you can see October 16th at the top and
> September 15th at the bottom. That ordering happens in the API, not in the
> browser, so the same list comes back in the same order no matter who asks
> for it.
>
> The second is the weather panel you just saw the API for. If the forecast is
> unavailable, this panel is simply not rendered — the rest of the page still
> works."

**动作**：手指着名单从第一条划到最后一条，边念边划。

## 3.2 报名表单（5:00 – 6:30）

**画面**：点详情页上的 **Register** 按钮进去。

**先演示正常的**：填一个真实的数据

| 字段 | 填 |
|---|---|
| First name | Chengyu |
| Last name | Gao |
| Email | chengyu.demo@example.com |
| Phone | 0400000000 |
| Tickets | 2 |
| Registration date | 今天日期 |

**念**（边填边说）：

> "The registration form is a Reactive Form. Every field carries its own
> message underneath it, rather than one generic alert at the top, so the
> visitor knows which box to fix. The ticket total updates as I type, so the
> cost is visible before they commit.
>
> And the Register button on the previous page passed the event through the
> URL rather than through a JavaScript variable. That is why this page
> survives a refresh — or a bookmark, or being sent to somebody."

**然后演示报错**：把 Email 改成 `abc`，Tickets 改成 `99`

**念**：

> "If I break the email and ask for ninety-nine tickets, each field reports
> its own problem. And notice the ceiling: I cannot ask for more than fifty in
> one booking."

**动作**：把鼠标停在那两条红色提示上停两秒。

**最后**：**不要真的提交**（免得污染数据）。想演示成功提交的话，改回正常值提交一次，然后说：

> "Submitting returns 201 and the confirmation I just got back is the row that
> was saved."

## 3.3 一句话讲校验的两层（6:30 – 7:00）

**念**：

> "One thing I want to be honest about, because it is the mistake I made. I
> assumed the max attribute on a date input meant the server would refuse a
> wrong date. It does not — that attribute is a hint to the browser, and it
> disappears entirely if somebody posts straight to the API. So I went and
> added a server-side check for it, and then I removed it again, because a
> booking cannot be dated in the future and a finished event is refused
> anyway — which together already make that case impossible. The lesson I
> actually took is narrower than I first wrote down: check whether a rule is
> needed before adding one."

---

# 第 4 部分：管理端（7:00 – 10:30）

## 4.1 编辑页（7:00 – 9:00）

**画面**：切到标签页 4（http://localhost:4201/events/5/edit）

**念**：

> "On the staff site I built the new-event and edit-event screens. Both use
> the same form component — this is the edit screen, but the fields, the
> validation and the messages are literally the same component the new screen
> uses. That matters because it means the validation rules exist once. If we
> change a rule, both screens change together and they cannot drift apart.
>
> Below the form, this screen also loads that event's registrations and shows
> a total ticket count. A staff member can see how full an event is before
> they move a date or a venue — which is the whole reason the list is here."

**动作**：手指从表单划到下面的报名名单，停一下。

## 4.2 状态筛选（9:00 – 10:00）

**画面**：切到标签页 5（http://localhost:4201/），点筛选按钮

**念**：

> "The list has a status filter with counts. The numbers are taken from the
> rows actually on screen, not from a separate query — so a filter button can
> never claim a number the table does not show. If I filter to suspended,
> there is one, and the count says one."

**动作**：点 **Suspended**，确认只剩 1 条、计数显示 1；再点回 **All**。

## 4.3 补一句（10:00 – 10:30）

**念**：

> "The delete flow on this list is my teammate's — it is the one that answers
> 409 and tells you how many bookings are blocking the delete. I will show
> that in the Postman run in a moment, because the error path is the
> interesting part of it."

---

# 第 5 部分：跑 Postman 全集（10:30 – 12:30）

**画面**：切回 Postman，点 **Run Giving Coast A3** → **Run**

**念**（跑的过程中说）：

> "This is the collection I wrote. Twenty-three requests, and the ones I care
> about are the failures — a 400 for a malformed request, a 404 for an unknown
> event, and the 409s for a blocked delete and the three booking refusals. A
> collection that only tests the happy path does not prove anything, so those
> cases are asserted here rather than left to memory."

**跑完看结果**：全绿

**念**：

> "All green. That is the whole API re-checked in one click, and it runs the
> same against localhost and against my cPanel deployment — there is only one
> variable, base_url."

---

# 第 6 部分：收尾（12:30 – 13:30）

**画面**：切回标签页 1 首页

**念**：

> "To summarise what is mine: the registration endpoint and its three
> refusals, the registration form, the event detail page, the weather proxy,
> the new and edit screens on the staff site with their shared form, the
> status filter, and this Postman collection. The database design, the event
> CRUD endpoints, the public site's shell and search, and the staff event list
> are my teammate Jie Bao's.
>
> I deployed the whole stack to my own cPanel account, at
> 24832054.it.scu.edu.au, and the health endpoint there reports the database
> as connected.
>
> Thank you."

---

# 第 7 部分：万一出状况

| 状况 | 怎么办 |
|---|---|
| 页面空白 / 打不开 | 某个后台服务停了。双击 `start-all.bat` 重开，等 25 秒 |
| API 报 `database: error` | MySQL 没起来。重跑 `start-all.bat` |
| Postman 全红 | 环境选错了。右上角确认是 **Giving Coast A3**，`base_url` 是 `http://localhost:3000` |
| 天气面板不显示 | Open-Meteo 偶尔超时。直接说 "the panel degrades by design" **反而是加分**，把它讲成降级演示 |
| 讲错一段 | 停 2 秒，从那句开头重讲。后期剪掉 |
| 超时 | 砍掉 2.3（并发）和 4.3（补一句），能省 1 分半 |

---

# 第 8 部分：录完之后

1. 导出视频（MP4，1080p）
2. 上传 **SCU OneDrive** → 共享设成 **Anyone with the link**
3. 复制链接 → 填进 Blackboard
4. 那几个黑窗口可以关了（关掉即停服务）

---

# 附：三个老师最可能追问的问题（背下来）

**Q1：为什么报名被拒是 409 而不是 400？**
> 因为请求本身没毛病 —— JSON 合法、字段齐全。不能执行是因为「世界状态」不允许（活动暂停了、结束了、或者你已经报过名了）。400 表示请求格式错，用它就错了。

**Q2：max 属性为什么不够？**
> 它只是给浏览器的一个提示，改 DOM 或者用 curl 直接发请求都能绕过。我一开始还专门加了服务端校验，后来删了 —— 因为「购票日期不能是未来」加上「已结束活动拒绝」这两条，已经让那种情况不可能发生了。

**Q3：天气为什么走你们自己的服务器？**
> 三个原因：第三方不暴露在前端、响应能裁剪成页面要的几个字段、Open-Meteo 挂了页面还能显示「暂无预报」而不是空框。可选功能绝不能拖垮必需功能。
