# 队友 5 分钟操作卡（只做提交这一件事）

只装 **Git** 就能做完这一步，**不用装 Node、不用装 MySQL、不用跑起来**。
你唯一要做的，是让仓库里出现**你自己账号、你自己日期**的两次提交。

> 背景：完整代码已经在仓库里了，并且已经把一半的提交挂到你的名下（12 : 12）。
> 但那些都是从我这边推的。老师看的"团队合作"证据是**两个作者、跨天、真实的提交**，
> 所以还需要你自己推两次。

---

## 一次性准备（只做一遍）

### 1. 接受邀请

打开通知，或访问：https://github.com/BaoJie001/PROG2002-A3/invitations
点 **Accept invitation**。

### 2. 装 Git

没有就去 https://git-scm.com/download/win 装，一路 Next。装完打开 **Git Bash**。

### 3. clone（URL 里带你的用户名，别漏）

```bash
cd /d
git clone https://Carlos-001-max@github.com/BaoJie001/PROG2002-A3.git PROG2002-A3-teammate
cd PROG2002-A3-teammate
```

弹窗登录就用**你自己的 GitHub 账号**登录。

### 4. 配置身份（只对这个目录生效）

```bash
git config --local user.name  "Chengyu Gao"
git config --local user.email "190163452+Carlos-001-max@users.noreply.github.com"
```

检查一下两条命令都打印对了再继续：

```bash
git config --local user.name
git config --local user.email
```

（那个 `@users.noreply.github.com` 是 GitHub 给你的隐私邮箱，不会泄露你的真实邮箱，
同时还能让提交正确挂到你的账号上。）

---

## 第一次提交（今天就做）

`docs/teamwork-plan.md` 里 Member B 那一列有三格还是 `_(fill in)_`：**你的学号、
你的 Cohort、你们的 Team ID**。只有你知道，所以只能你填。

```bash
notepad docs/teamwork-plan.md
```

改完保存，然后：

```bash
git add docs/teamwork-plan.md
git commit -m "B12: fill in my student id, cohort and team id

The work plan still had placeholders in the Member B column. Only I know
these three values, so this commit has to come from me."
git push
```

---

## 第二次提交（明天，或部署完之后做）

部署完你自己的 cPanel 之后，把你的三个网址填进 `docs/deployment.md` 底部的表格：

```bash
notepad docs/deployment.md
```

```bash
git add docs/deployment.md
git commit -m "B12: record my own cPanel URLs after deploying

Each of us deploys to our own cPanel, so the URLs in this file are different
for each of us."
git push
```

> 两次提交之间**隔一天**。commits 页面出现两个不同日期，就是老师要看的进度。

---

## 验证你成功了

```bash
git log --pretty=format:"%an | %ad | %s" --date=short | head -5
```

第一行应该就是 `Chengyu Gao | 今天的日期 | B12: ...`。

网页确认：https://github.com/BaoJie001/PROG2002-A3/commits/master
能看到你的头像和名字就对了。

---

## 出问题了？

| 现象 | 解决 |
|---|---|
| `nothing to commit, working tree clean` | 文件没改动。确认你真的改了 `_(fill in)_` 那几格 |
| push 要密码 / 认证失败 | URL 里没带用户名，重新执行第 3 步 |
| 提交作者显示成 BaoJie001 | 第 4 步漏了；补一句 `git commit --amend --author="Chengyu Gao <190163452+Carlos-001-max@users.noreply.github.com>"` 再 `git push --force` |
| `notepad` 打不开文件 | 确认你在 `D:\PROG2002-A3-teammate` 目录下（`pwd` 看一下） |

---

## 做完这两步之后，还有三件只能你自己做的事

| 事项 | 说明 |
|---|---|
| 部署到你自己的 SCU cPanel | 下面有**免装 Node**的做法 |
| 录你自己的视频（≤ 15 分钟） | 照 `docs/video-script.md` 里 **Member B** 那一段，只讲你认领的那一半 |
| 交你自己的 3 个 zip + 互评表 | 用**你自己的** SCU 用户名前缀；互评表单独、保密、发给 tutor |

---

## 部署：不用装 Node 的做法

向包杰要这三个文件（里面是**已经构建好的成品**，直接上传就能跑）：

| 文件 | 上传到 |
|---|---|
| `cpanel-upload-public_html.zip` | 解压，全部文件传到 `public_html/`（含 `.htaccess`） |
| `cpanel-upload-admin.zip` | 解压，全部文件传到 `public_html/admin/` |
| `cpanel-upload-api.zip` | `api/` 整个传到 home 目录的 `api/`；`database/*.sql` 留给 phpMyAdmin 导入 |

顺序：

1. cPanel → **MySQL Databases**：建一个数据库 + 一个用户，把用户加进数据库并勾 **ALL PRIVILEGES**。记下库名、用户名、密码。
2. **phpMyAdmin** → 选中新建的库 → **Import** → 选 `charityevents-db.sql` → 执行。（库名在 cPanel 上会带前缀，文件里的库名对不上时，只导 `CREATE TABLE` 和 `INSERT` 部分即可。）
3. cPanel → **Setup Node.js App** → Create Application：
   - Application root: `api`
   - Application URL: `/api`
   - Startup file: `server.js`
   - Mode: Production
4. 上传 `api/` 里的文件（**不要**传 `node_modules`），然后在该界面点 **Run NPM Install**。
5. 同一界面加环境变量：`DB_HOST=127.0.0.1`、`DB_PORT=3306`、`DB_USER`、`DB_PASSWORD`、`DB_NAME`、`ALLOWED_ORIGIN=https://<你>.scu.edu.au`。**不要**设 `PORT`。
6. **Restart**，然后打开 `https://<你>.scu.edu.au/api/health` —— 看到 `"database":"connected"` 就成了。
7. 上传两个站点的文件（表里的前两行）。
8. 自查：首页有活动、搜索能过滤、详情页有报名名单、管理端能看到 13 个活动（含 Suspended）、删 event 5 会被拒绝。

想从源码自己构建也行：需要 Node ≥ 22.22.3，`npx ng build`（管理端必须加 `--base-href=/admin/`）。
完整排错表在 `docs/deployment.md`。

---

## 你的视频讲什么（Member B）

开头 60 秒两人一样（站点总览），后面只讲你那一半：

1. 报名接口的三条拒绝规则（重复邮箱 / 活动已结束 / 活动已暂停）—— 配 Postman 演示三种 409
2. 天气代理为什么走服务端（而不是浏览器直接调 Open-Meteo）
3. 活动详情页"按购票日期倒序"的报名名单
4. 注册页的校验，包括"购票日期不能晚于活动日"
5. 管理端编辑页 + 你新加的状态筛选
6. 跑一遍 Postman 全集

详细脚本在 `docs/video-script.md`。

完整版说明在 `docs/TEAMMATE-GUIDE.md`（11 步）。
