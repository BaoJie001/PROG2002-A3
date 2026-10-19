# Postman 完整指南 —— Chengyu（照着点就行）

> 从「从来没用过 Postman」到「视频里演示完」，一步一步。
> 全程 **5 分钟**，录视频之前先做完第 1–4 步，别在录的时候才装。

---

## 0. 先确认它装好了

双击桌面上的 **Postman** 图标。第一次打开会让你登录 —— **可以跳过**（底部小字
"Skip and go to the app"），不登录也能用本地集合。

---

## 1. 导入两个文件（1 分钟）

1. 左上角点 **Import**（或者 `Ctrl + O`）
2. 在弹出的窗口里，直接把这两个文件**拖进去**，或者点 **Upload Files** 选：
   - `D:\PROG2002-A3\docs\postman\Giving-Coast-A3.postman_collection.json`
   - `D:\PROG2002-A3\docs\postman\Giving-Coast-A3.postman_environment.json`
3. 两个都勾上，点 **Import**

导入成功后，左边 **Collections** 里会出现 **Giving Coast A3**（23 个请求）。

---

## 2. 选环境（10 秒，最容易忘的一步）

**右上角**有个下拉框（默认写着 "No Environment"）—— 点它，选 **Giving Coast A3**。

> ⚠️ **不选这个，`{{base_url}}` 全是灰的、跑一个红一个。**

---

## 3. 三个变量是什么意思

| 变量 | 现在的值 | 干什么 |
|---|---|---|
| `base_url` | `http://localhost:3000` | 打向哪里。改成你的 cPanel 地址就能测线上 |
| `event_id` | `5` | 一个**有报名**的活动，详情页、报名列表、天气都用它 |
| `new_event_id` | 空 | **不用管** —— "Admin - create an event" 会自动填上，后面的修改和删除读它 |

想看这些变量：点集合名 → 右边 **Variables** 标签。

---

## 4. 先单独跑一个，确认通了

1. 左边展开 **Giving Coast A3**
2. 点第一个 **Health - is the API and database up**
3. 右边点蓝色 **Send**
4. 下面应该出现：

```json
{"api":"running","database":"connected","dbName":"charityevents_db",
 "counts":{"events":13,"registrations":16,"categories":6}}
```

状态码右上角显示 **200 OK**。

> 如果这里就红 → 看第 8 节排错。

---

## 5. 视频里要演示的 5 个请求（重点）

这几个是**你那半的活**，逐个点 Send，边点边讲：

| # | 请求名 | 期望 | 你讲什么 |
|---|---|---|---|
| ① | `Registrations - duplicate booking (409)` | **409** + "already registered" | 同一个人重复报名 |
| ② | `Registrations - booking a finished event (409)` | **409** + "already finished" | 活动已结束 |
| ③ | `Registrations - booking a suspended event (409)` | **409** + "closed" | 活动被暂停 |
| ④ | `Registrations - booking dated in the future (400)` | **400** + fields 里点名 `registration_date` | 日期不合法 → 这是 400 不是 409 |
| ⑤ | `Weather - Open-Meteo forecast for an event` | **200** + 温度、描述 | 天气代理，走我们自己的服务器 |

**①②③ 讲一句核心台词**：

> "三种拒绝都用 409，因为请求本身没毛病 —— JSON 合法、字段齐全。不能执行是因为
> 世界状态不允许。400 才表示请求格式错，比如第 ④ 个。"

**⑤ 讲**：

> "注意它是走我们自己的 API，不是浏览器直连 Open-Meteo。"

---

## 6. 跑全集（视频 10:30 那段）

1. 点集合名 **Giving Coast A3** 右边的 **⋯**（三个点）
2. 选 **Run collection**
3. 右上角点橙色 **Run Giving Coast A3**
4. 等它跑完（约 10–20 秒）

结果页左边列出 23 个请求，**全部绿色对勾**就对了。

其中这几个**故意是红的反而是对的** —— 它们是断言「必须失败」的用例，
断言通过所以显示绿：

- `Events - invalid filter (400)`
- `Events - unknown id (404)`
- `Admin - delete blocked because people booked (409)`
- 四个 `Registrations - ... (409) / (400)`

**讲法**：

> "二十三个请求，我关心的是失败那些 —— 400、404、409 都有断言。
> 只测正常流程的集合什么都证明不了。"

### ⚠️ 一个坑：别打乱顺序跑

`Admin - create` → `update` → `delete` 是**一条链**：create 会写入 `new_event_id`，
后面两个读它。**单独点 Send 的话要按这个顺序**，乱了会 404。
用 **Run collection** 就没这问题，它按列表顺序跑。

---

## 7. 想测你自己的线上站点（可选，加分）

把 `base_url` 从 `http://localhost:3000` 改成 `https://24832054.it.scu.edu.au`，
再跑一次全集 —— **同一个文件，只改一个变量**。

改法：右上角 ** Environments**（眼睛图标）→ 点 **Giving Coast A3** →
把 `base_url` 的 CURRENT VALUE 改掉 → `Ctrl + S` 保存。

视频里可以说：

> "同一个集合也能打线上，只改一个变量。"

测完记得改回 `http://localhost:3000`。

---

## 8. 出问题怎么办

| 现象 | 原因 | 怎么办 |
|---|---|---|
| 全部 `Could not send request` | API 没跑 | 浏览器开 http://localhost:3000/api/health 试试；不行就双击 `start-all.bat` |
| `{{base_url}}` 显示橙色 | 没选环境 | 右上角选 **Giving Coast A3** |
| 全是 404 | `base_url` 写错 | 应该是 `http://localhost:3000`（**没有结尾斜杠**） |
| `Events - detail` 返回的报名是空的 | `event_id` 不对 | 确认它是 `5`（活动 5 有 3 条报名） |
| create/update/delete 链失败 | 顺序乱了 | 按 create → update → delete 顺序点，或者用 Run collection |
| delete 在活动 5 上报 409 | **这是对的** | 活动 5 有 3 条报名，本来就该删不掉 —— 这正是要演示的 |

---

## 9. 录视频时的操作顺序（照着做）

1. **开录前**：导入完、环境选好、先 Send 一次 Health 确认通
2. **0:45–2:45**：逐个点 ①②③，讲 409
3. **2:45–3:00**：点 ⑤ 讲天气（或者用浏览器打开 `/api/weather/5`）
4. **10:30**：点 **⋯ → Run collection → Run**，讲「失败用例也有断言」
5. 跑完展示全绿

---

## 10. 一页速查

```
Import 两个 json → 右上角选环境 Giving Coast A3
→ 点 Health  Send 确认 200
→ 演示：duplicate(409) / finished(409) / suspended(409) / future(400) / weather(200)
→ ⋯ → Run collection → Run
→ 全绿
```

---

## 附：这 23 个请求都在测什么

| 组 | 请求 | 测什么 |
|---|---|---|
| 健康 | `Health` | API 和数据库都活着 |
| 活动 | list / 按日期筛 / 按地点分类筛 / 无效筛选(400) / 已结束 / 详情 / 未知 id(404) | 公开站的读取 + 两种错误 |
| 管理端 | 全量列表 / 新建(201) / 修改(200) / 删除(200) / **删除被报名挡住(409)** | 员工站的增删改 + 删除规则 |
| 报名 | 列表 / 新建(201) / **重复(409)** / **已结束(409)** / **未来日期(400)** / **已暂停(409)** / 无效字段(400) | 你的核心部分，五种拒绝 |
| 天气 | `Weather` | 第三方代理 |
| 字典 | 分类 / 组织 | 筛选下拉框的数据来源 |
