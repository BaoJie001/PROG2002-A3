# Chengyu 的完整部署步骤（SCU cPanel）

包杰已经用**完全相同的流程**把他那份部署成功了（13 个活动 / 16 条报名，公网可访问）。
你照着做一遍就行，下面是从登录到验收的每一步。

**你的服务器已经确认在线**：`https://24832054.it.scu.edu.au`（现在是空目录）。

> 记号说明：下文里 `<你>` 一律替换成**你的 cPanel 用户名**（在你 SCU 邮箱那封
> cPanel 邮件里，形如 `jgao12`）。包杰的是 `jbao14`。

---

## 第 0 步：登录

1. 打开 `https://24832054.it.scu.edu.au:2083`
2. 用户名填邮件里那个，密码用你设过的；忘了就去 https://reset.it.scu.edu.au/ 用 SCU 学生邮箱重置
3. 登录后在首页确认能看到这两个图标：
   - **MySQL® Databases**（在 Databases 区）
   - **Setup Node.js App**（在 Software 区）

**把你的用户名发给我** —— 我好把你的三个 zip 从 `ChengyuGaoA3-*` 改成正确的前缀。

---

## 第 1 步：建数据库（3 分钟）

点 **MySQL® Databases**，页面从上往下有三个区块：

### ① Create New Database

填 `charityevents` → 点 **Create Database**

cPanel 会自动加前缀，实际名字是 **`<你>_charityevents`**（后面要用，记下来）

### ② Add New User

- Username 填 `charityuser`
- 点 **Generate** 生成密码 → **立刻把密码复制到别处存好**（这一步最容易忘）

实际用户名是 **`<你>_charityuser`**，点 **Create User**

### ③ Add User To Database

- User 选 `<你>_charityuser`
- Database 选 `<你>_charityevents`
- 点 **Add** → 勾选 **ALL PRIVILEGES** → **Make Changes**

---

## 第 2 步：导入数据（2 分钟）

1. cPanel 首页 → **phpMyAdmin**
2. 左侧栏点 **`<你>_charityevents`**（先选中它再导，不然表会跑到别处）
3. 顶部 **Import** 标签 → **Choose File**
4. 选这个文件：

   ```
   D:\PROG2002-A3\database\charityevents-db-cpanel.sql
   ```

   ⚠️ **必须是 `-cpanel` 结尾这个**。原版 `charityevents-db.sql` 里有
   `CREATE DATABASE` 语句，共享主机没权限执行，导入会直接报错。

5. 选项保持默认，拉到底点 **Go**

成功会显示绿色 "Import has been successfully finished"。

左侧应该出现 5 个对象，行数核对：

| 表 | 行数 |
|---|---|
| `categories` | 6 |
| `organisations` | 5 |
| `events` | **13** |
| `registrations` | **16** |
| `v_event_summary` | 视图 |

---

## 第 3 步：上传 API 文件（2 分钟）

1. cPanel → **File Manager** → 进家目录（`/home/<你>`）
2. 点 **Upload** → 选 `D:\PROG2002-A3\submission\cpanel-upload-api.zip`
3. 上传完，右键这个 zip → **Extract** → 路径保持家目录 → **Extract File(s)**
4. 确认家目录里出现 `api/`（含 `server.js`、`event_db.js`、`package.json`、`routes/`）和 `database/`

> 如果 `api/` 里只有 `routes/` 没有 `server.js`，是旧版包的问题——直接用 File Manager
> 进 `api/`，手动 Upload 这 4 个文件：`server.js`、`event_db.js`、
> `package.json`、`package-lock.json`（都在 `D:\PROG2002-A3\api\`）。

---

## 第 4 步：创建 Node 应用（1 分钟）

cPanel 首页 → **Setup Node.js App** → **Create Application**

| 字段 | 值 |
|---|---|
| Node.js version | 选列表里最新的（18 或 20 都行） |
| Application mode | **Production** |
| Application root | `api` |
| Application URL | `/api` |
| Application startup file | `server.js` |

点 **Create**。（创建后显示 Stopped 或报错都正常，依赖还没装。）

---

## 第 5 步：装依赖（1–3 分钟）

在应用那一行点 **Run NPM Install**，等终端跑完。

⚠️ **这一步失败很常见**（包杰第一次也失败了）。处理方式：

1. 关掉红色错误条 → **再点一次 Run NPM Install**（多半第二次就过）
2. 还是不行 → **兜底**：上传 `cpanel-upload-node_modules.zip` 到 `api/`，
   右键 **Extract** 解压（依赖全是纯 JavaScript，跨平台通用，不需要 npm）

---

## 第 6 步：填环境变量（2 分钟）

在同一应用界面找 **Environment variables → Add Variable**，逐个添加：

| Name | Value |
|---|---|
| `DB_HOST` | `127.0.0.1` |
| `DB_PORT` | `3306` |
| `DB_USER` | `<你>_charityuser`（带前缀的完整名） |
| `DB_PASSWORD` | 第 1 步生成的密码 |
| `DB_NAME` | `<你>_charityevents`（带前缀的完整名） |
| `ALLOWED_ORIGIN` | `https://24832054.it.scu.edu.au` |

⚠️ 三个注意：
- **不要**加 `PORT`（cPanel 自动分配）
- `ALLOWED_ORIGIN` 填**域名本身**，不要带 `/api`、不要带结尾斜杠
- 库名和用户名必须是**带前缀的完整名字**，否则连不上库

---

## 第 7 步：启动并验证（1 分钟）

点 **RESTART**，然后浏览器打开：

```
https://24832054.it.scu.edu.au/api/health
```

成功显示：

```json
{"api":"running","database":"connected","counts":{"events":13,"registrations":16,"categories":6}}
```

看到 `"database":"connected"` 就成了 ✅

---

## 第 8 步：上传两个网站（3 分钟）

### 客户端 → `public_html/`

1. File Manager → 进 **`public_html`**
2. 右上角 **Settings** → 勾 **Show Hidden Files**（`.htaccess` 是隐藏文件）
3. **Upload** → `cpanel-upload-public_html.zip` → 右键 **Extract** → 路径 `/public_html`

### 管理端 → `public_html/admin/`

1. 在 `public_html` 里 **+ Folder** → 名字 `admin` → Create
2. 进 `admin` → **Upload** → `cpanel-upload-admin.zip` → 右键 **Extract** → 路径 `/public_html/admin`

---

## 第 9 步：最终自检（自己点一遍）

| 检查 | 期望 |
|---|---|
| `https://24832054.it.scu.edu.au/` | 首页出现活动卡片 |
| 搜索页 | 筛选后结果变少 |
| 某个活动详情页 | 有 "Who is going" 报名名单 + 天气面板 |
| 报名流程 | 提交成功，名单多一行 |
| `https://24832054.it.scu.edu.au/admin/` | **13 个活动**，含 Suspended（event 13）和 Past |
| 管理端删 event 12 | 成功（无报名） |
| 管理端删 event 5 | **被拒绝**，提示有 3 条报名 |

---

## 第 10 步：告诉我，我远程帮你验

做完说一声，我会直接测你的地址并返回结果（就像刚才验包杰那样）：

```
/            → 是否 200
/admin/      → 是否 200
/event/5     → 是否 200（证明 .htaccess 生效）
/api/events  → 是否返回数据 + CORS 头是否是你的域名
```

---

## 排错表

| 现象 | 原因 / 解决 |
|---|---|
| `/api/health` 404 | 应用没启动，或 Application URL 填的不是 `/api` |
| `"database":"error"` | `DB_NAME` / `DB_USER` 忘了加前缀；或密码填错 |
| 网站打开但没数据、控制台报 CORS | `ALLOWED_ORIGIN` 填错（必须和地址栏域名完全一致） |
| 管理端**白屏** | 文件传到了 `public_html/` 而不是 `public_html/admin/` |
| 刷新 `/event/5` 变 404 | `.htaccess` 没传上去（它是隐藏文件，要勾 Show Hidden Files） |
| NPM Install 失败 | 重试；再不行用 `cpanel-upload-node_modules.zip` |
| 导入 SQL 报 Access denied | 用了原版 SQL，换 `-cpanel` 版 |

---

## 部署完之后还要做

| # | 事项 | 命令 / 说明 |
|---|---|---|
| 1 | 第二次提交（填你的网址） | 见下 |
| 2 | 录视频 ≤15 分钟 | `docs/video-script.md` 的 Member B 段 |
| 3 | 交 3 个 zip + GitHub 链接 + 视频链接 | Blackboard |
| 4 | Peer evaluation 邮件发给 tutor | 标题 `PROG2002_A3_[Team_ID]_ChengyuGao` |

### 第二次提交

```bash
cd /d/PROG2002-A3-teammate
git pull
notepad docs/deployment.md
```

拉到文件末尾（`Ctrl+End`），空一行，粘贴下面这段（网址改成你自己的）：

```markdown
## 6. My deployment — Chengyu Gao

| Part | URL |
|---|---|
| Public site | https://24832054.it.scu.edu.au/ |
| Admin site | https://24832054.it.scu.edu.au/admin/ |
| API health | https://24832054.it.scu.edu.au/api/health |
```

保存后：

```bash
git add docs/deployment.md
git commit -m "B12: record my own cPanel URLs after deploying - public site, admin site and API health"
git push
```

验证（cmd 里别用 `head`）：

```bash
git log -3 --pretty=format:"%an | %ad | %s" --date=short
```
