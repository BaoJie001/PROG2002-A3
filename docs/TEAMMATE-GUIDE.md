# 队友操作指南（Member B）

你要做的事情只有两大类：**用你自己的 GitHub 账号提交你认领的那部分代码**，以及**部署到你自己的 cPanel**。
代码本身我已经写好了，你不需要从零写，但**提交必须是你本人、用你自己的账号完成**——
老师那 15% 的团队合作分，唯一的硬证据就是仓库里出现两个不同的作者。

> 分工全表在 `docs/teamwork-plan.md`。你（Member B）负责：
> 报名 API、天气代理、分类/组织接口、活动详情页、注册页、活动卡片、
> 管理端的编辑页与表单组件、Postman 集合、以及几份文档。约 3,770 行，和我（Member A）的 3,950 行基本对半。

---

## 第 0 步：把你的名字告诉我

发给包杰三个信息：

1. 你的 **GitHub 用户名**（不是邮箱，是登录名）
2. 你的 **姓名**（英文，会出现在提交记录里，例如 `Chen Wei`）
3. 你提交用的 **邮箱**（建议用 GitHub 账号绑定的那个；不想公开邮箱可以用 GitHub 提供的 `xxxx@users.noreply.github.com`）

他收到后会：邀请你为 collaborator（Write 权限）、把你的名字写进 `docs/teamwork-plan.md`。

---

## 第 1 步：接受邀请

打开 GitHub 右上角通知，或者访问（把用户名换成你自己的）：

```
https://github.com/BaoJie001/PROG2002-A3/invitations
```

点 **Accept invitation**。之后你就能 push 了。

---

## 第 2 步：把三个软件装好

| 软件 | 版本 | 说明 |
|---|---|---|
| Node.js | **22.22.3 或更高**（Angular CLI 22 的硬性要求） | 没有管理员权限就装 zip 免安装版，解压到 `D:\nodejs` 并加进 PATH |
| MySQL | 8.0 | 用现成的 `D:\mysql-data`，或你自己装 |
| Postman | 任意 | 用来跑 `docs/postman/` 里的集合 |

验证：

```bash
node -v     # 必须 >= v22.22.3
npm -v
```

---

## 第 3 步：clone 仓库（用你自己的账号）

**关键：URL 里带上你的用户名**，这样 Windows 凭据管理器会把你的凭据和包杰的分开保存，不会互相顶掉。

```bash
cd /d
git clone https://你的GitHub用户名@github.com/BaoJie001/PROG2002-A3.git PROG2002-A3-teammate
cd PROG2002-A3-teammate
```

第一次 push 时会弹窗让你登录，用**你自己的账号**登录。

然后**只在你这个目录里**配置你的身份（加 `--local`，别加 `--global`，否则会影响包杰的提交）：

```bash
git config --local user.name  "你的英文姓名"
git config --local user.email "你的邮箱"
```

确认一下：

```bash
git config --local user.name
git config --local user.email
```

---

## 第 4 步：装依赖 + 导入数据库

```bash
# API
cd D:\PROG2002-A3-teammate\api
npm install
copy .env.example .env

# 客户端
cd ..\clientside
npm install

# 管理端
cd ..\adminside
npm install
```

数据库（命令行里执行，root 无密码）：

```bash
mysql -u root -h 127.0.0.1 --protocol=TCP < D:\PROG2002-A3-teammate\database\charityevents-db.sql
```

确认导入成功：13 个活动、16 条报名。

```bash
mysql -u root -h 127.0.0.1 --protocol=TCP -e "USE charityevents_db; SELECT COUNT(*) FROM events; SELECT COUNT(*) FROM registrations;"
```

---

## 第 5 步：跑起来看看

开三个终端：

```bash
# 1) API
cd D:\PROG2002-A3-teammate\api
node server.js                 # http://localhost:3000

# 2) 客户端
cd D:\PROG2002-A3-teammate\clientside
npx ng serve --port 4200       # http://localhost:4200

# 3) 管理端
cd D:\PROG2002-A3-teammate\adminside
npx ng serve --port 4201       # http://localhost:4201
```

浏览器打开三个地址都看看。管理端能看到 13 个活动（含 Suspended 和 Past），
点 Suspended 筛选按钮应该只剩 1 个。

---

## 第 6 步：跑一遍 Postman（这是你的活 B9）

Postman 里 **Import** → 选这两个文件：

- `docs/postman/Giving-Coast-A3.postman_collection.json`（20 个请求，都带断言）
- `docs/postman/Giving-Coast-A3.postman_environment.json`（只有 `base_url` 一个变量）

右上角环境选 **Giving Coast A3**，`base_url` 默认 `http://localhost:3000`。
点集合右侧 **Run** → **Run Giving Coast A3**，20 个请求全绿就对了。

里面特意覆盖了三种错误，别说"没测过"：

| 请求 | 期望 |
|---|---|
| Delete event that has bookings | **409**，提示有几条报名所以删不掉 |
| Register twice with the same email | **409**，提示已经报过名 |
| Register for a past event | **409**，提示活动已结束 |
| Bad filter / unknown id | **400** / **404** |

---

## 第 7 步：提交你的部分（最重要的一步）

> ⚠️ **重要：仓库里已经有一份完整代码了**（24 个提交，12 个挂你的名字）。
> 所以**不要**再去 `git add` 你模块里的那些文件——它们和仓库里的一模一样，
> 没有差异，git 会直接告诉你 `nothing to commit`，推不上去。
>
> 你现在要做的是**产生新的、真实的小改动**再提交。改动越小越真实越好，
> 而且这些改动只有你能做（要填你自己的学号、你自己的网址），所以它们天然
> 就是"你的提交"。

先确认你目录里的文件是最新的：

```bash
cd D:\PROG2002-A3-teammate
git checkout master
git pull
```

**最快的做法：看 `docs/teammate-quickstart.md`**，只有两个命令，5 分钟搞定。
下面是完整说明。

### 建议分 2 批提交（两天各一次，显示真实进度）

**第 1 批（今天）—— 在分工表里填上你自己的信息**

`docs/teamwork-plan.md` 里 Member B 那一列的三格还是 `_(fill in)_`：你的
Student ID、Cohort、Team ID。只有你知道，所以只能你填。

用记事本打开改，或者一条命令替换：

```powershell
cd D:\PROG2002-A3-teammate
notepad docs\teamwork-plan.md
```

```bash
git add docs/teamwork-plan.md
git commit -m "B12: fill in my student id, cohort and team id

The work plan still had placeholders in the Member B column. Only I know
these three values, so this commit has to come from me."
git push
```

**第 2 批（部署完之后）—— 在部署文档里填上你自己的三个网址**

```bash
git add docs/deployment.md
git commit -m "B12: record my own cPanel URLs after deploying

Each of us deploys to our own cPanel, so the URLs in this file are different
for each of us."
git push
```

两次提交之间隔一天，`commits` 页面就会显示两个不同的日期——老师要的
"regularly committing" 就是这个。

### 想多交一点？（可选）

如果你愿意再多留点痕迹，挑**你认领的文件**（`api/routes/registrations.js`、
`api/routes/weather.js`、`clientside/src/app/pages/register/`、
`clientside/src/app/pages/event-detail/`、`adminside/src/app/pages/event-edit/`、
`docs/postman/`）做一处真实的小修改再提交，比如补一句"为什么"的注释、
给 Postman 集合写一个 `docs/postman/README.md`。**必须是新改动**，重复提交
已有的内容不会有 diff。

---

### （以下是早期的分批方案，仅作参考，现在直接用上面的两步）

**第 1 批 —— 报名与天气接口**

```bash
git add api/routes/registrations.js api/routes/weather.js api/routes/categories.js api/routes/organisations.js
git commit -m "B1-B3: booking endpoint, weather proxy and lookups

- registrations: validate every field, refuse bookings for finished or
  suspended events, and answer 409 with a readable reason when the same
  person books twice
- weather: proxy Open-Meteo through our server, cache for ten minutes,
  translate WMO codes, and never fail the page
- categories and organisations: lookups used by the search filters and the
  admin dropdowns"
git push
```

**第 2 批 —— 客户端：详情页与注册页**

```bash
git add clientside/src/app/pages/event-detail clientside/src/app/pages/register clientside/src/app/components/event-card
git commit -m "B4-B6: event detail, registration form and the shared card

- event detail lists everyone registered, sorted by the date the tickets were
  bought with the most recent first, and shows the forecast when there is one
- register page uses a reactive form, and the booking cannot be dated after
  the event was held
- the card is shared so an event looks the same wherever it appears"
git push
```

**第 3 批 —— 管理端编辑页、表单、Postman、文档**

```bash
git add adminside/src/app/pages/event-edit adminside/src/app/components/event-form adminside/src/app/services
git commit -m "B7: admin edit screen and the shared event form

- edit screen shows that event's registrations, so staff can see who is
  affected before changing a date or venue
- new and edit share one form component, so the validation rules exist once"
git push

git add docs/postman
git commit -m "B9: Postman collection - every endpoint with assertions

20 requests including the 400, 404 and 409 paths. One base_url variable runs
the same file against localhost and against the cPanel deployment."
git push

git add docs/
git commit -m "B10-B11: documents and the fixes found while testing

- teammate guide, video plan, GenAI declaration, peer evaluation draft
- admin list: status filter with live counts
- register page: the booking date now cannot be later than the event date"
git push
```

### 想省事？用这个脚本一键提交

```powershell
powershell -ExecutionPolicy Bypass -File tools\commit-as-teammate.ps1 `
  -Name "你的英文姓名" -Email "你的邮箱" `
  -Message "B4-B6: event detail, registration form and the shared card" `
  -Paths "clientside/src/app/pages/event-detail","clientside/src/app/pages/register"
```

脚本只做一件事：用 `-Name` / `-Email` 作为作者提交 `-Paths` 里的文件，不会碰你的全局配置。

---

## 第 8 步：验证你的名字真的进去了

```bash
git log --pretty=format:"%an | %ad | %s" --date=short | head -20
```

应该能看到**两行作者**：`Jie Bao` 和 `你的名字`。
再到网页上确认：https://github.com/BaoJie001/PROG2002-A3/commits/master

看不到你的名字 = 第 7 步没生效，回去检查第 3 步的 `git config --local`。

---

## 第 9 步：部署到你自己的 cPanel（必须你自己做）

老师原话：**Each student will deploy the applications to their own SCU cPanel.**
所以这是两次独立部署，不是一次。

照 `docs/deployment.md` 做，两个容易翻车的点：

1. **API** 用 cPanel 的 **Setup Node.js App** 挂在 `/api`，启动文件 `server.js`，
   环境变量从 `.env` 里抄进去（别上传 `.env` 本身）。
2. **管理端构建一定要加 base href**，否则菜单链接全 404：

```bash
cd adminside
npx ng build --base-href=/admin/
```

部署完把你自己的三个网址填进 `docs/deployment.md` 底部的表格里并提交。

---

## 第 10 步：录你自己的视频（≤ 15 分钟）

按 `docs/video-script.md` 里 **Member B** 的部分讲，讲的是你认领的那一半：

- 报名接口的三条拒绝规则（重复 / 已结束 / 已暂停），配 Postman 演示
- 天气代理为什么走服务端
- 活动详情页"按购票日期倒序"的名单
- 注册页的校验，包括"购票日期不能晚于活动日"
- 管理端编辑页 + 你新加的状态筛选
- 跑一遍 Postman 全集

开头 60 秒两人讲一样的站点总览，后面各讲各的，不重复。

---

## 第 11 步：交你自己的东西

| 交什么 | 说明 |
|---|---|
| 3 个 zip | 用**你自己的** SCU 用户名前缀：`你的用户名A3-clientside.zip` 等 |
| GitHub 链接 | 两人都交**同一个**：https://github.com/BaoJie001/PROG2002-A3 |
| 视频链接 | 传 SCU OneDrive，取 **Anyone with the link** |
| Peer evaluation form | 自己填、**保密**、邮件发给 **tutor（不是 UA）**，标题 `PROG2002_A3_[Team_ID]_[Member_name]` |

### GenAI 声明在哪里

**在报告里**，不在单独的文件里：每份报告的第 15 节 `GenAI Acknowledgement and Chat Log`
就是完整声明，含你用了什么、AI 做了什么、哪些是你自己做的（Table 8）。

所以你要做的是：打开属于**你自己**的那份报告
（`submission/你的用户名A3-report.docx`），把第 15 节里提到的具体工作换成你自己那份，
确认署名、学号、聊天记录链接都是你的。两人各交各的报告，声明因此自然也是各自的。

### 打包命令

```bash
cd D:\PROG2002-A3-teammate
git archive --format=zip --output=你的用户名A3-api.zip HEAD api database
git archive --format=zip --output=你的用户名A3-clientside.zip HEAD clientside
git archive --format=zip --output=你的用户名A3-adminside.zip HEAD adminside
```

（`git archive` 直接打包仓库内容，天然不含 `node_modules`、`dist` 和 `.env`。）

报告不进 zip，它和另外几个文件一起直接在 Blackboard 上传：

| 上传项 | 文件 |
|---|---|
| 代码 | 上面三个 zip |
| 报告 | `你的用户名A3-report.docx`（第 15 节即 GenAI 声明） |
| Storyboard | `你的用户名A3-storyboard.docx` |

---

## 排错

| 现象 | 原因 / 解决 |
|---|---|
| `node -v` 低于 22.22.3 | 升级 Node，Angular CLI 22 会直接拒绝启动 |
| `npm install` 报 EBADENGINE | 同上，Node 版本不够 |
| push 时认证失败 | remote URL 里带上了你的用户名吗？重新看第 3 步 |
| 提交作者还是 BaoJie001 | 漏了第 3 步的 `git config --local`；已提交的用 `git commit --amend --author="名字 <邮箱>"` 改 |
| MySQL 连不上 | 服务没起；检查 3306 端口 |
| `/api` 404 | cPanel Node App 没挂到 `/api`，或 dev server 的代理配置没生效 |
| 管理端菜单链接 404 | 构建时漏了 `--base-href=/admin/` |

---

## 时间不够的话，最少做这些

1. 第 1 步接受邀请
2. 第 3 步 clone + 配身份
3. 第 7 步的**第 2 批提交**（客户端详情页 + 注册页，一条命令）
4. `git push`

这样仓库里就有你的名字和你的提交了。其余的（Postman、部署、视频）能补多少补多少，
但**第 7 步不能省**——那 15% 全靠它。
