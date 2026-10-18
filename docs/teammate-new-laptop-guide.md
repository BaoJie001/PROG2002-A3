# 新电脑操作手册（Member B — Chengyu Gao）

从一台全新的电脑开始，到作业交完为止。按顺序做，不要跳。

---

## 0. 出发前带走的东西

### 五个文件（用微信文件传输助手或 U 盘，它们在仓库里没有）

| 文件 | 用途 |
|---|---|
| `postman-README.md` | 第一次提交用 |
| `teamwork-plan.md`（已填好学号 24832054） | 第一次提交用 |
| `cpanel-upload-public_html.zip` | 部署：客户端 |
| `cpanel-upload-admin.zip` | 部署：管理端 |
| `cpanel-upload-api.zip` | 部署：API + 数据库 |

### 要装的三个软件（都是免费的）

| 软件 | 用途 | 地址 |
|---|---|---|
| **Git** | 提交代码（必装） | https://git-scm.com/download/win 一路 Next |
| **VS Code** | 视频里要看代码 | https://code.visualstudio.com |
| **Postman** | 视频里演示接口 | https://www.postman.com/downloads |

录屏不用装：Windows 自带 **Xbox Game Bar**（`Win + G`）。

### 三个信息要先拿到

- 你的 **cPanel 登录用户名 / 密码**（SCU 邮箱里搜 "cPanel"，Brief 说登录信息会发到那里）
- 你们的 **Team ID**（Blackboard 上，互评邮件标题要用）
- 你的 **Cohort**（问包杰，跟他填一样的）

---

## 1. 第一次提交（今天）

打开 **Git Bash**（装完 Git 开始菜单里搜）：

```bash
git --version          # 有版本号说明装好了
cd /d
git clone https://Carlos-001-max@github.com/BaoJie001/PROG2002-A3.git PROG2002-A3-teammate
cd PROG2002-A3-teammate

git config --local user.name  "Chengyu Gao"
git config --local user.email "190163452+Carlos-001-max@users.noreply.github.com"

cp ~/Downloads/postman-README.md docs/postman/README.md
cp ~/Downloads/teamwork-plan.md  docs/teamwork-plan.md
```

（`~/Downloads` 换成你实际放文件的地方）

顺手用记事本把 `docs/teamwork-plan.md` 里 Member B 那列剩下的 **Cohort** 和
**Team ID** 两格填上：

```bash
notepad docs/teamwork-plan.md
```

然后提交：

```bash
git add docs/postman/README.md docs/teamwork-plan.md
git commit -m "B12: Postman guide and my own details in the work plan

How to import and run the collection, which variable to change when moving
from localhost to cPanel, and which three requests are meant to return 409.
Also fills in my student id, cohort and team id in the Member B column."
git push
```

弹窗登录用**你自己的 GitHub 账号**。验证：

```bash
git log --pretty=format:"%an | %ad | %s" --date=short | head -3
```

第一行是 `Chengyu Gao | 今天日期 | B12: ...` 就成了。
网页再确认一次：https://github.com/BaoJie001/PROG2002-A3/commits/master

---

## 2. 部署到你自己的 cPanel（明天上午）

登录你的 cPanel，按顺序：

### 2.1 建数据库

1. **MySQL Databases** → 建一个数据库（记下名字，cPanel 会加前缀）→ 建一个用户 →
   把用户加进数据库，勾 **ALL PRIVILEGES**
2. **phpMyAdmin** → 选中刚建的库 → **Import** → 选 `charityevents-db.sql`（在
   `cpanel-upload-api.zip` 的 `database/` 里）→ 执行
3. 记下三样：**库名、数据库用户名、密码**

### 2.2 起 Node 应用

**Setup Node.js App** → Create Application：

| 项 | 值 |
|---|---|
| Node.js version | 选最新 |
| Application mode | Production |
| Application root | `api` |
| Application URL | `/api` |
| Startup file | `server.js` |

创建后：把 `cpanel-upload-api.zip` 里 `api/` 的文件传上去（**不要**传 node_modules），
点 **Run NPM Install**，然后加环境变量：

```
DB_HOST        = 127.0.0.1
DB_PORT        = 3306
DB_USER        = <你的数据库用户>
DB_PASSWORD    = <你的数据库密码>
DB_NAME        = <你的库名>
ALLOWED_ORIGIN = https://<你>.scu.edu.au
```

**不要设 `PORT`**（cPanel 自动分配）。点 **Restart**。

### 2.3 传两个网站

| 本地 | 传到 |
|---|---|
| `cpanel-upload-public_html.zip` 解压后的全部文件 | `public_html/`（含 `.htaccess`） |
| `cpanel-upload-admin.zip` 解压后的全部文件 | `public_html/admin/` |

### 2.4 自检（录视频前必须全过）

打开 `https://<你>.scu.edu.au/api/health` → 看到 `"database":"connected"`

| 检查 | 期望 |
|---|---|
| 首页 | 有即将开始和已结束的活动 |
| 搜索 | 筛选后结果变少 |
| 活动详情 | 有报名名单 + 天气面板 |
| 报名 | 提交后名单里多一行 |
| 管理端 | 13 个活动，含 Suspended（event 13） |
| 删 event 12 | 成功 |
| 删 event 5 | 被拒绝，提示有 3 条报名 |

排错表在 `docs/deployment.md` 第 5 节。

---

## 3. 第二次提交（明天下午，部署完之后）

```bash
cd /d/PROG2002-A3-teammate
git pull
notepad docs/deployment.md
```

拉到文件**最末尾**，追加（把网址换成你自己的）：

```markdown
## 6. My deployment — Chengyu Gao

| Part | URL |
|---|---|
| Public site | https://<你>.scu.edu.au/ |
| Admin site | https://<你>.scu.edu.au/admin/ |
| API health | https://<你>.scu.edu.au/api/health |
```

```bash
git add docs/deployment.md
git commit -m "B12: record my own cPanel URLs after deploying

Each of us deploys to our own cPanel, so the URLs in this file are different
for each of us."
git push
```

> 和第一次提交**隔一天**。commits 页面出现两个不同日期，就是老师要看的进度。

---

## 4. 录你的视频（明天下午）

### 怎么录

`Win + G` 打开 Xbox Game Bar → 点录制按钮（或 `Win + Alt + R`）。
录完在 **Captures → Videos** 里找到 mp4。

建议：浏览器**全屏**、关掉微信等弹窗、网速正常再开始。讲错了不用停，
后期剪掉即可（Photos 应用能简单剪）。**≤ 15 分钟**，超了会扣分。

### 讲什么（Member B，只讲你那一半）

| 时间 | 内容 | 画面 |
|---|---|---|
| 0:00–1:00 | 站点总览（两人开场一样） | 公网首页 |
| 1:00–4:00 | **报名接口的三条拒绝规则**：重复邮箱 / 活动已结束 / 活动已暂停，逐个演示 409 | Postman + `api/routes/registrations.js` |
| 4:00–6:00 | **天气代理**为什么走服务端（而不是浏览器直接调 Open-Meteo）：缓存 10 分钟、WMO 码翻译、失败也不拖垮页面 | `api/routes/weather.js` + 详情页天气面板 |
| 6:00–8:00 | **详情页报名名单**按购票日期倒序（SQL 的 ORDER BY + 前端渲染） | 活动详情页 + `event-detail.ts` |
| 8:00–10:30 | **注册页校验**：必填、邮箱、电话、`bookingDateMax = min(今天, 活动日期)` | 注册页 + `register.ts` |
| 10:30–12:30 | **管理端编辑页**（显示该活动报名）+ 你新加的**状态筛选** | 管理端 + `event-edit.ts`、`event-list.ts` |
| 12:30–14:30 | 跑一遍 Postman 全集，21 个全绿 | Postman |
| 14:30–15:00 | 小结：我负责哪一半、遇到什么问题、怎么解决的 | 随便 |

详细脚本在 `docs/video-script.md` 的 Member B 段。

### 传上去

SCU **OneDrive** → 上传 mp4 → 右键 **Share** → 权限选 **Anyone with the link** →
复制链接。这是要交到 Blackboard 的视频链接。

---

## 5. 交作业（截止前）

Blackboard 上提交这四项：

| # | 交什么 | 说明 |
|---|---|---|
| 1 | `ChengyuGaoA3-clientside.zip` | 我给你打好了（前缀待你确认 cPanel 用户名后重打） |
| 2 | `ChengyuGaoA3-adminside.zip` | 同上 |
| 3 | `ChengyuGaoA3-api.zip` | 同上，含 `database/` |
| 4 | GitHub 链接 | https://github.com/BaoJie001/PROG2002-A3 （两人交同一个） |
| 5 | 视频链接 | SCU OneDrive 分享链接 |
| 6 | Peer evaluation form | **单独、保密，邮件发给 tutor**（不是 UA） |

互评邮件：

- 收件人：**你的 tutor**（不是 UA）
- 标题：`PROG2002_A3_[Team_ID]_ChengyuGao`（Team ID 换成真的）
- 附件：`Peer Evaluation form.docx`（在 Assessment 3 文件夹里）
- 写作参考：`docs/peer-evaluation-draft.md`

⚠️ 打分要和 GitHub 记录对得上——你们是 12:12，两人都写"贡献相当"最稳。

---

## 排错

| 现象 | 解决 |
|---|---|
| `git --version` 报不是内部命令 | Git 没装好或没勾"添加到 PATH"，重装有 PATH 那一项 |
| `nothing to commit` | 那两个文件没放进正确位置，检查 `docs/postman/README.md` 是否存在 |
| push 认证失败 | clone 的 URL 里没带 `Carlos-001-max@`，重新 clone |
| 提交作者显示 BaoJie001 | 漏了 `git config --local`；补救：`git commit --amend --author="Chengyu Gao <190163452+Carlos-001-max@users.noreply.github.com>"` 后 `git push --force` |
| push 被拒绝 | 先 `git pull --rebase` 再 `git push` |
| `/api/health` 显示 database error | `DB_*` 环境变量填错，或 SQL 没导进去 |
| 网站刷新 404 | `.htaccess` 没传上去 |
| 管理端页面空白 | 上传到了 `public_html/` 而不是 `public_html/admin/` |
