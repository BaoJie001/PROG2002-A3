# Chengyu 完整操作指南 —— PROG2002 A3

> 你（Chengyu Gao，学号 24832054，GitHub `Carlos-001-max`）从「接手这台电脑」
> 到「Blackboard 交完」要做的全部事情，按顺序列在这里。
>
> 前提：你和包杰共用这台电脑，仓库已经在 `D:\PROG2002-A3`，代码全部写完，
> 交付物全部在 `D:\PROG2002-A3\submission\`，本地有 25 个提交还没推上 GitHub。
>
> **总用时大约 3～4 小时**（推代码 10 分钟 + 跑起来 20 分钟 + 录视频 1 小时 +
> peer evaluation 20 分钟 + Blackboard 提交 15 分钟 + 答辩预习 1 小时）。

---

# 阶段 0：先花 2 分钟搞清楚现在的状态

打开 **Git Bash**（开始菜单搜 "Git Bash"），执行：

```bash
cd /d/PROG2002-A3
git log --oneline -1
git status
```

应该看到 `nothing to commit, working tree clean`。

再看待推数量：

```bash
git log --oneline origin/master..HEAD | wc -l
```

会输出 `25`，意思是本地有 25 个提交还没上 GitHub。**这是正常的**，
阶段 1 会一次性推上去。

---

# 阶段 1：换身份 + 推送 GitHub（约 10 分钟）

## 1.1 把 Git 身份换成你自己的

```bash
cd /d/PROG2002-A3
git config user.name "Chengyu Gao"
git config user.email "190163452+Carlos-001-max@users.noreply.github.com"
```

> 为什么用这个邮箱：它是 GitHub 自动给你的 noreply 地址（从仓库已有提交里看到的），
> 用它不会被 GitHub 的「邮箱隐私保护」拦下。想用真实邮箱也可以，但要先在
> GitHub → Settings → Emails 里确认那个邮箱已验证。

**不要加 `--global`**，否则会把包杰所有项目的身份都改掉。

验证：

```bash
git config user.name
git config user.email
```

要显示 `Chengyu Gao` 和你的邮箱。

## 1.2 把 GitHub 登录换成你自己的

```bash
gh auth logout
gh auth login
```

按提示选：

| 提示 | 选什么 |
|---|---|
| What account do you want to log into? | **GitHub.com** |
| What is your preferred protocol for Git operations? | **HTTPS** |
| Authenticate Git with your GitHub credentials? | **Yes** |
| How would you like to authenticate GitHub CLI? | **Login with a web browser** |

终端显示一个 **8 位一次性代码**（形如 `A1B2-C3D4`），按回车 → 浏览器打开 →
粘贴代码 → 用**你自己的账号 `Carlos-001-max`** 登录 → 点 **Authorize**。

验证：

```bash
gh auth status
```

必须看到：

```
Logged in to github.com account Carlos-001-max (keyring)
```

如果还是 `BaoJie001`，说明没登录成功，回到 `gh auth logout` 重做。

> ⚠️ **这一步做完，包杰在这台电脑上就推不了了。** 操作前跟他说一声，
> 他要推的时候得自己再 `gh auth login` 换回来。

## 1.3 做一个你自己的真实提交

`docs/teamwork-plan.md` 里 Cohort 那一格还是 `_(fill in)_`，这只有你知道。

```bash
notepad docs/teamwork-plan.md
```

找到第 10 行附近：

```
| Cohort | _(fill in)_ | _(fill in)_ |
```

把 **Member B（右边那格）** 换成你真实的 cohort 值（比如 `29`、`GC1`，按学校系统里
你所属的 cohort 填；不确定就问包杰）。保存关闭。

顺手看一眼 Team ID 那行，如果是 `_(e.g. GC1 / Team20 — check Blackboard)_`，
也换成你们实际的 Team ID（Blackboard 上能找到）。

然后提交：

```bash
git status
git add docs/teamwork-plan.md
git commit -m "B12: fill in my cohort and the team id in the work plan"
```

**关键检查**——确认作者是你：

```bash
git log -1 --pretty="%an <%ae>"
```

必须显示 `Chengyu Gao <190163452+Carlos-001-max@users.noreply.github.com>`。

> 如果显示 `BaoJie001` 或 `Jie Bao`，说明 1.1 没生效。
> 修正：`git config user.name "Chengyu Gao"` 之后
> `git commit --amend --reset-author --no-edit`。

## 1.4 推送

```bash
git push origin master
```

正常输出类似：

```
Enumerating objects: ..., done.
Writing objects: 100% (…/…), done.
To https://github.com/BaoJie001/PROG2002-A3.git
   c98e65d..a1b2c3d  master -> master
```

## 1.5 验证

```bash
git status
```

显示 `Your branch is up to date with 'origin/master'.` 就成功了。

浏览器打开 **https://github.com/BaoJie001/PROG2002-A3/commits/master**，
确认最上面几条里有今天日期、作者是 `Chengyu Gao` 的提交。

## 推不上去怎么办

| 报错 | 原因 | 解决 |
|---|---|---|
| `Permission denied (403)` | 登录的还是包杰 | 回 1.2 重做 `gh auth login` |
| `rejected` / `failed to push some refs` | 远程有别人新推的提交 | `git pull --rebase origin master` 后重新 `git push` |
| `Author identity unknown` | 1.1 没做，或做在了别的目录 | `cd /d/PROG2002-A3` 后重做 1.1 |
| 卡住好几分钟 | 网络慢 | 等一会儿；或 `git config --global http.postBuffer 524288000` 重试 |
| 粘贴代码没反应 | Git Bash 认的是 Shift+Insert | 用 `Shift+Insert` 粘贴，不是 `Ctrl+V` |

---

# 阶段 2：把项目跑起来（约 20 分钟）—— 录视频前必做

## 2.1 启动 MySQL

双击运行：

```
D:\PROG2002-A3\start-mysql.bat
```

等几秒，看到 `mysqld is running` 之类的提示。

## 2.2 起 API（终端 1）

```bash
cd /d/PROG2002-A3/api
node server.js
```

看到 `API listening on 3000` 和数据库连接成功的提示就对了。

## 2.3 起客户端（终端 2）

```bash
cd /d/PROG2002-A3/clientside
npx ng serve --port 4200
```

等编译完（第一次约 30 秒），看到 `Local: http://localhost:4200/`。

## 2.4 起管理端（终端 3）

```bash
cd /d/PROG2002-A3/adminside
npx ng serve --port 4201
```

## 2.5 打开三个地址自查

| 地址 | 应该看到 |
|---|---|
| http://localhost:4200/ | 首页，13 个慈善活动卡片 |
| http://localhost:3000/api/health | `{"database":"connected",...}` |
| http://localhost:4201/ | 管理端活动列表，13 行，含 Suspended 和 Past |

首页没数据，多半是 MySQL 没起来，回 2.1。

---

# 阶段 3：录你的视频（≤ 15 分钟）

## 3.1 你要讲什么（只讲你的那半）

**开场 45 秒**（站点总览，和包杰的一样）：

> "This is Giving Coast, the Assessment 3 build. Two websites — the public site
> and the staff admin — both Angular 22 with TypeScript, both talking to one
> Express API over MySQL. I built everything that happens after somebody decides
> to attend: the registration endpoint, the registration form, the event page
> that shows who is coming, the weather feature, and the staff screens for
> creating and editing an event. I also deployed the whole stack to my own cPanel."

**三段主体**（结构照 `docs/video-script.md`，约 45 秒 / 3 分钟 / 3 分钟）：

1. **数据库与 API** —— `POST /api/registrations` 的三条拒绝规则（重复邮箱、
   活动已结束、活动已暂停，全部返回 409 而不是 400，讲清为什么），
   以及天气为什么由我们自己的服务器去取而不是浏览器直连 Open-Meteo。
2. **数据流** —— 活动详情页的「谁要来」名单怎么按购票日期倒序渲染，
   报名表单的校验信息怎么传到用户眼前。
3. **两个网站演示** —— 管理端**编辑**页（带该活动的报名名单和票数总计）、
   状态筛选按钮，最后跑一遍 Postman 集合（20 个请求全绿）。

## 3.2 录之前把这几页打开

- 活动详情页：http://localhost:4200/events/1
- 报名页：从详情页点 Register 按钮进去
- 管理端编辑页：http://localhost:4201/ 里点某个活动的 Edit
- Postman：导入 `docs/postman/` 下两个 json，选环境 `Giving Coast A3`，
  点集合右侧 **Run**，20 个请求全绿

## 3.3 录完之后

- 传 **SCU OneDrive**，共享改成 **Anyone with the link**
- 复制链接，Blackboard 要交

## 3.4 三个必须能脱口而出的问题（老师会抽查）

1. **为什么报名被拒是 409 而不是 400？**
   → 请求本身没毛病，是「世界状态」不允许（暂停了 / 结束了 / 已经报过名）。
   400 表示请求格式错。
2. **`max` 属性为什么不够？**
   → 它只是浏览器给用户的提示，改 DOM 或用 curl 直接发请求都能绕过，
   所以服务端必须再校验一次。
3. **天气为什么走服务端代理？**
   → 第三方密钥不暴露在前端、响应能裁剪成页面要的几个字段、
   Open-Meteo 挂了页面还能显示「暂无预报」而不是空框。

---

# 阶段 4：填 Peer Evaluation（约 20 分钟）

打开 `docs/peer-evaluation-draft.md`（那是包杰的草稿），**你要改这几处**：

| 位置 | 改成 |
|---|---|
| `Your name` | **Chengyu Gao** |
| `Group member 2` | **Jie Bao** |
| 邮件标题 | `PROG2002_A3_[Team_ID]_ChengyuGao` |
| Workload allocation 里 `[Teammate name]` 那段 | 改成描述**你自己**做的部分；`Jie Bao` 那段保留 |

**打分**：每一项如实打。你自己的六项可以给 5，队友那六项按真实感受给。
理由要说得出来，老师会对照 GitHub 提交记录。

**三条 feedback 的写法**（照抄改主语）：

- *How effectively did your group work?* → 按层分工（包杰负责数据库 + API 骨架，
  我负责报名流程 + 管理端表单），先定 API 契约再各自开工，所以没互相等。
- *Particularly valuable or detrimental behaviours* → 最有价值的是先把 API 返回的
  数据结构写下来；最有用的纪律是每人只提交自己写的代码。
- *What did you learn?* → 共享的工作需要共享的记录；小步提交并写清为什么，
  让「谁做了什么」变成可以指认的东西。

发送前检查：

- [ ] 是**你自己单独**填的，没和包杰对答案
- [ ] 收件人是 **tutor**（不是 UA）
- [ ] 标题 `PROG2002_A3_[Team_ID]_ChengyuGao`
- [ ] 附件是填好的 `Peer Evaluation form.docx`
- [ ] **截止日期前发出**

---

# 阶段 5：Blackboard 提交（约 15 分钟）

用**你自己的** SCU 用户名前缀（`cgao15`），交这些：

| 交什么 | 具体文件 | 在哪 |
|---|---|---|
| 代码 zip | `cgao15A3-api.zip`（约 5.3 MB，含 api + database + 报告） | `D:\PROG2002-A3\submission\` |
| 代码 zip | `cgao15A3-clientside.zip`、`cgao15A3-adminside.zip` | 同上 |
| 报告 | `cgao15A3-report.docx`（30 页，第 15 节即你的 GenAI 声明） | 同上 |
| Storyboard | `cgao15A3-storyboard.docx`（14 页） | 同上 |
| GitHub 链接 | https://github.com/BaoJie001/PROG2002-A3 （两人交**同一个**） | 复制 |
| 视频链接 | 阶段 3 传到 OneDrive 的那个 | 复制 |

Blackboard 上如果要求填你的 GitHub 用户名，填 `Carlos-001-max`；仓库地址是包杰的
不是问题——你是协作者，commits 页面有你的名字。

**交之前核对报告**：打开 `cgao15A3-report.docx`，确认：

- 封面 `Student ID: 24832054`
- 封面 `First Name: Chengyu`、`Last Name: Gao`
- 第 12 节团队表表头是 `Chengyu Gao (me)`
- 第 13 节通篇讲你的那半（报名端点、报名表单、天气、管理端表单、部署）
- 第 15 节署名是你

---

# 阶段 6：答辩预习（约 1 小时，强烈建议）

老师约谈会问「哪个文件是你写的」「这个决定为什么这么做」。要能立刻答出来的：

| 文件 | 你能讲什么 |
|---|---|
| `api/routes/registrations.js` | 8 个字段的校验、三种 409、为什么还要兜住 MySQL 1062 |
| `api/routes/weather.js` | 10 分钟缓存、WMO 数字码翻成文字、故障降级 |
| `clientside/src/app/pages/register/` | Reactive Form、日期上限二次校验、实时票价总计 |
| `clientside/src/app/pages/event-detail/` | 「谁要来」按购票日期倒序、Register 按钮用 URL 传参 |
| `adminside/src/app/pages/event-edit/` + `components/event-form` | 新建与编辑共用一套表单组件（校验规则只写一次）、票数总计 |
| `docs/postman/` | 20 个请求，含 400/404/409 的失败路径 |

这些文件**自己读一遍**。不是为了背，是为了有人问「这行为什么这么写」时不卡壳。

---

# 一页速查

```bash
# 阶段 1
cd /d/PROG2002-A3
git config user.name "Chengyu Gao"
git config user.email "190163452+Carlos-001-max@users.noreply.github.com"
gh auth logout
gh auth login                              # 浏览器登录 Carlos-001-max
notepad docs/teamwork-plan.md              # 填 Cohort 和 Team ID
git add docs/teamwork-plan.md
git commit -m "B12: fill in my cohort and the team id in the work plan"
git log -1 --pretty="%an <%ae>"            # 必须是 Chengyu Gao
git push origin master
git status                                 # 应为 up to date

# 阶段 2
# 双击 D:\PROG2002-A3\start-mysql.bat
cd /d/PROG2002-A3/api       && node server.js             # 终端 1
cd /d/PROG2002-A3/clientside && npx ng serve --port 4200  # 终端 2
cd /d/PROG2002-A3/adminside  && npx ng serve --port 4201  # 终端 3
```

---

# 附：所有文档在哪

| 文档 | 路径 |
|---|---|
| 这份指南 | `docs/how-chengyu-pushes.md` |
| 视频脚本 | `docs/video-script.md` |
| Peer evaluation 草稿 | `docs/peer-evaluation-draft.md` |
| 部署指南 | `docs/deployment.md` |
| 分工全表 | `docs/teamwork-plan.md` |
| 交付物 | `submission/` |
