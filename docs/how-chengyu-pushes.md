# Chengyu：在这台电脑上把代码推送到 GitHub

> 情境：包杰和 Chengyu 共用这一台电脑，仓库在 `D:\PROG2002-A3`，
> 本地有 23 个提交还没上传到 GitHub。Chengyu 的 GitHub 账号
> `Carlos-001-max` 已经是这个仓库的协作者（有 push 权限），
> 所以**直接在这台电脑上就能推送**，不用换机器、不用重新 clone。

---

## 先说清楚：这台电脑现在是谁的身份

| 项目 | 现在的值 | 要改成 |
|---|---|---|
| `git config user.name`（仓库级） | `BaoJie001` | `Chengyu Gao` |
| `git config user.email`（仓库级） | `1822675871@qq.com` | 你自己的 GitHub 邮箱 |
| `gh auth status` | `BaoJie001` | `Carlos-001-max` |

所以直接 `git push` 是能成功的（协作者有权限），但推送凭据用的是包杰的账号。
下面把它换成你自己的。

---

## 一共 5 步

### 第 1 步：换成本人的 Git 身份

打开 **Git Bash**（开始菜单搜 "Git Bash"），执行：

```bash
cd /d/PROG2002-A3

# 只改这个仓库，不动全局设置（全局是包杰的，改了会影响他）
git config user.name "Chengyu Gao"
git config user.email "你的GitHub邮箱"
```

查一下：

```bash
git config user.name
git config user.email
```

> 邮箱用你 `Carlos-001-max` 账号绑定的那个。不想公开真实邮箱，
> 可以用 GitHub 给你的 `24832054+Carlos-001-max@users.noreply.github.com` 形式。

---

### 第 2 步：把 GitHub 凭据换成你的

```bash
gh auth logout
gh auth login
```

按提示选：

| 提示 | 选什么 |
|---|---|
| What account do you want to log into? | **GitHub.com** |
| What is your preferred protocol? | **HTTPS** |
| Authenticate Git with your GitHub credentials? | **Yes** |
| How would you like to authenticate? | **Login with a web browser** |

它会显示一个 **8 位一次性代码**（例如 `A1B2-C3D4`），按回车打开浏览器 →
粘贴代码 → 点 **Authorize**。

确认：

```bash
gh auth status
```

要看到 `Logged in to github.com account Carlos-001-max`。

> ⚠️ 这一步做完之后，包杰在这台电脑上就不能直接推送了。
> 他要用的时候执行一次 `gh auth logout` + `gh auth login` 换回来。

---

### 第 3 步：做一次属于你自己的提交（建议，但不是必须）

这一步是为了让仓库历史里留下你今天的真实工作痕迹。挑一个**只有你能做**的小改动：

- 打开 `docs/teamwork-plan.md`，Member B 那一行的 Student ID / Cohort / Team ID
  如果还是 `_(fill in)_`，填上你的真实信息（学号 24832054）；
- 或者打开 `README.md`，把 "Team members" 那段补全成两个人的名字和学号。

```bash
git status                       # 确认只改了你预期的那一个文件
git add docs/teamwork-plan.md    # 换成你实际改的文件
git commit -m "B12: fill in my student id, cohort and team id

The work plan still had placeholders in the Member B column. Only I know
these three values, so this commit has to come from me."
git log -1 --pretty=format:"%an <%ae>%n%s"
```

作者必须显示 `Chengyu Gao`，不是 `BaoJie001`。

---

### 第 4 步：推送

```bash
git push origin master
```

正常输出大概是这样：

```
Enumerating objects: 120, done.
Writing objects: 100% (120/120), done.
To https://github.com/BaoJie001/PROG2002-A3.git
   ce4b0d8..66a1d38  master -> master
```

23 个提交 + 你这个新提交会一起上去。

---

### 第 5 步：验证

```bash
git status
```

应该显示 `Your branch is up to date with 'origin/master'.`

然后浏览器打开：

```
https://github.com/BaoJie001/PROG2002-A3/commits/master
```

应该能看到今天日期下面有 `Chengyu Gao` 的提交。

---

## 如果报错

| 报错 | 原因 | 怎么办 |
|---|---|---|
| `Permission denied (403)` | 登录的不是你的账号 | 回第 2 步重新 `gh auth login` |
| `failed to push some refs` / `rejected` | 远程有别人新推的提交 | `git pull --rebase origin master` 后再 `git push` |
| `Author identity unknown` | 第 1 步没做 | 回第 1 步设 `user.name` / `user.email` |
| 推送卡住不动 | 网络慢或凭据弹窗被挡住 | 等一会儿；必要时 `git config --global http.postBuffer 524288000` 重试 |
| `refusing to allow an OAuth App to ...` | 包杰当初登录时没给 workflow 权限 | 不影响，仓库里没有 workflow 文件 |
| 推送被拒且提示 email privacy | GitHub 开了 "Block command line pushes that expose my email" | GitHub → Settings → Emails，用 `@users.noreply.github.com` 地址作 `user.email` |

---

## 推完之后

1. 告诉包杰「推上去了」，让他看眼 commits 页面；
2. 包杰那边如果要继续用这台电脑推东西，记得让他把 `gh` 切回自己；
3. 回到 Blackboard 提交清单（三个 zip + 报告 + storyboard + 视频链接 + peer evaluation）。
