# Peer evaluation — 填写草稿

> 用法：这份是给你自己看的草稿。**表单必须你自己单独填、不要和队友商量**，
> 填完直接邮件发给你的 tutor（不是 UA）。下面是可以直接抄进 `Peer Evaluation form.docx`
> 的文字，以及每一项打分的理由，你按实际情况改。

邮件标题：`PROG2002_A3_[Team_ID]_[你的名字]`，例：`PROG2002_A3_GC1_JieBao`

---

## 一、表头

| 栏目 | 填什么 |
|---|---|
| Your name | Jie Bao |
| Group member 2 | 队友的姓名（按实际填） |

---

## 二、6 项评分（5 = Strongly agree … 1 = Strongly disagree）

评分要如实。下面是**按目前实际分工**的建议值 —— 关键是**每一项都要能说出理由**，
因为老师会拿它和 GitHub 提交记录对照。

| 评分项 | 给自己 | 给队友 |
|---|---|---|
| Attends group meetings regularly and arrives on time | 5 | 按实际 |
| Contributes meaningfully to group discussions | 5 | 按实际 |
| Carries out tasks without overly depending on other team members | 5 | 按实际 |
| Demonstrates quality work assigned based on the role agreed | 5 | 按实际 |
| Demonstrates a cooperative and supportive attitude | 5 | 按实际 |
| Contributes significantly to the success of the assessment | 5 | 按实际 |
| **TOTALS** | 30 | — |

**重要**：如果队友实际没有参与，就如实打低分并在下面的 feedback 里写清楚。
虚高打分的风险比诚实打分大得多 —— 老师会对照 GitHub 提交记录，
一旦对不上，两个人都可能被调查。诚实打分不会让你失分，
因为评分标准看的是**你自己的贡献**，不是平均分。

---

## 三、Workload allocation between members

（表上这一栏要写每个人的具体贡献，照抄下面这段，把名字替换掉）

**Jie Bao** — Designed and built the database and the whole API layer: the
`registrations` table with its foreign key, `UNIQUE(event_id, email)` and CHECK
constraints; the event CRUD endpoints including the 409 rule that stops an
event with bookings from being deleted; the registration endpoint; and the
Open-Meteo weather proxy. Built the client-side Angular 22 application shell,
the home page and the search page with filtering and validation. Set up the
GitHub repository, wrote the deployment guide, and produced the API test
collection.

**[Teammate name]** — Built the event detail page showing the list of tickets
purchased sorted by the latest purchase date, plus the weather panel, and the
registration form with its validation. Built the admin-side Angular 22
application (list including suspended and past events, create, edit, delete).
Added the explanatory comments across the API, ran the Postman collection
against every endpoint, and deployed the project to their own SCU cPanel.

---

## 四、Feedback on team dynamics

**How effectively did your group work?**

We split the project by layer rather than by page, which worked well: I owned
the database and API, my teammate owned the admin site and the parts of the
public site that depend on registrations. Because the API contract was agreed
first (one endpoint per resource, JSON in and out), we could build our halves
at the same time without constantly blocking each other. We met to agree the
split, then worked on separate branches and reviewed each other's pull
requests, so neither of us had to wait for the other to finish.

**Were the behaviors of any of your team members particularly valuable or
detrimental to the team? Explain.**

The most valuable habit was writing the API contract down before writing code.
Once `/api/events/:id` was defined as "the event plus its registrations, sorted
by purchase date", the event page could be built against a known shape instead
of guessing. Using pull requests instead of pushing straight to master also
meant mistakes were caught by the other person rather than by the marker.

**What did you learn about working in a group from this assessment that you
will carry into your next group experience?**

That shared work needs a shared record. Committing in small, explained steps
and reviewing each other's pull requests turned "who did what" from an argument
into something we could both point at. Next time I would agree the branch and
commit-message rules at the very first meeting rather than after the first
merge, and I would set the deployment up earlier — leaving it until the end
made the last days more stressful than they needed to be.

---

## 五、发送前检查

- [ ] 表单是**你自己单独**填的（没和队友对答案）
- [ ] 收件人是 **tutor**，不是 UA
- [ ] 邮件标题格式正确：`PROG2002_A3_[Team_ID]_[你的名字]`
- [ ] 在**截止日期之前**发出
- [ ] 附件是填好的 `Peer Evaluation form.docx`
