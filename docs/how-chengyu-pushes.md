# Chengyu：在这台电脑上把代码推送到 GitHub

> 情境：包杰和 Chengyu 共用这一台电脑，仓库在 `D:\PROG2002-A3`，
> 本地有 22 个提交还没上传到 GitHub。Chengyu 的 GitHub 账号
> `Carlos-001-max` 已经是这个仓库的协作者（有 push 权限），
> 所以**直接在这台电脑上就能推送**，不用换机器、不用打包。

---

## 你要做的事，一共 5 步

### 第 1 步：换成本人的 Git 身份

这台电脑全局的 Git 身份是包杰的，所以你要先改成自己的，
否则你之后做的提交会记在包杰名下。

打开 **Git Bash**（开始菜单搜 "Git Bash"），执行：

```bash
cd /d/PROG2002-A3

# 只改这个仓库，不动全局设置
git config user.name "Chengyu Gao"
git config user.email "你的GitHub邮箱"
```

查一下改对了没有：

```bash
git config user.name
git config user.email
```

> 邮箱建议用你 GitHub 账号 `Carlos-001-max` 绑定的那个，
> 这样提交头像和作者信息才认得出是你。

---

### 第 2 步：把 GitHub 凭据换成你的

这台电脑现在登录的是包杰的 GitHub 账号，直接推会记成包杰。
先把自己登录上去：

```bash
gh auth logout
gh auth login
```

然后按提示选：

| 提示 | 选什么 |
|---|---|
| What account do you want to log into? | **GitHub.com** |
| What is your preferred protocol? | **HTTPS** |
| Authenticate Git with your GitHub credentials? | **Yes** |
| How would you like to authenticate? | **Login with a web browser** |

它会显示一个 **8 位一次性代码**（例如 `A1B2-C3D4`），
按回车会自动打开浏览器 → 粘贴代码 → 点 Authorize。

登录成功后再确认一次：

```bash
gh auth status
```

应该看到 `Logged in to github.com account Carlos-001-max`。

---

### 第 3 步：做一次属于你自己的提交（建议，不是必须）

这一步是为了让 GitHub 的历史里留下你今天的工作痕迹，
而不是只有包杰的提交。挑一个真实的小改动，比如：

- 打开 `README.md`，把 "Team members" 那段按实际情况补全；
- 或者修一句你负责的代码里的注释。

改完之后：

```bash
git status              # 看改了什么
git add README.md       # 换成你实际改的文件
git commit -m "Docs: complete the team section in the README"
```

`git log -1` 确认作者是你自己（`Chengyu Gao`）。

---

### 第 4 步：推送

```bash
git push origin master
```

正常会看到类似输出：

```
Enumerating objects: ..., done.
Writing objects: 100% (…/…), done.
To https://github.com/BaoJie001/PROG2002-A3.git
   xxxxxxx..be56a5c  master -> master
```

---

### 第 5 步：验证

```bash
git status
```

应该显示 `Your branch is up to date with 'origin/master'.`

再到浏览器打开 https://github.com/BaoJie001/PROG2002-A3/commits/master ，
确认能看到全部提交，并且最新几条里有你的名字。

---

## 如果报错

| 报错 | 原因 | 怎么办 |
|---|---|---|
| `Permission denied (403)` | 用的不是你的账号 | 回到第 2 步重新 `gh auth login` |
| `failed to push some refs` / `rejected` | 远程有别人推过的新提交 | 先 `git pull --rebase origin master`，再 `git push` |
| `Author identity unknown` | 第 1 步没做 | 回到第 1 步设 `user.name` / `user.email` |
| 推送卡住不动 | 网络慢 | 等一会儿；实在不行 `git config --global http.postBuffer 524288000` 后重试 |
| `Updates were rejected because the remote contains work` | 远程和本地分叉了 | `git pull --rebase origin master` 后再推 |

---

## 推完之后

1. 告诉包杰「推上去了」，让他核对一下；
2. 回到 Blackboard 交作业的清单（三个 zip + 报告 + 视频链接 + peer evaluation）。

---

## 一件事要确认

`git config user.email` 如果你填的是私人邮箱而 GitHub 开了
"Block command line pushes that expose my email"，推送会被拒。
解决办法：在 GitHub → Settings → Emails 里，把
**Keep my email addresses private** 关掉，或者用它给的
`xxxxx@users.noreply.github.com` 地址作为 `user.email`。
