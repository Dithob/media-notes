# Git + GitHub 核心概念学习笔记
> 来源：[原始内容](<https://www.bilibili.com/video/BV1ySLc6QEcB/>)
> 整理日期：2026-08-31


> 来源视频： [Git+Github核心概念大串讲，从零到一全攻略，详细实战教程](https://www.bilibili.com/video/BV1ySLc6QEcB/)
>
> UP 主：技术爬爬虾　｜　时长：约 42 分 50 秒　｜　字幕：已获取
>
> 本笔记不是逐字稿，而是根据视频字幕整理出的概念地图、操作流程和避坑清单。章节标题为整理者划分，不代表视频官方章节。

## 1. 先建立整体认识：Git 管版本，GitHub 管协作

### 1.1 Git 解决什么问题

Git 是运行在本地电脑上的分布式版本控制系统。它把项目的每次提交保存成一个可回溯的快照，并由提交历史串成一条记录链。这样可以：

- 找回历史版本；
- 查看某次提交改了哪些文件；
- 在不同开发分支上并行工作；
- 在多人协作时合并、审核和追踪代码变更；
- 让 AI Agent 在明确的版本边界内修改、回退或比较代码。

一个文件夹执行 `git init` 后，会出现 `.git/` 目录。`.git/` 保存仓库的版本控制信息；删除它，Git 就不再管理这个文件夹。

### 1.2 GitHub 解决什么问题

GitHub 是远端仓库托管和协作平台。它可以保存本地 Git 仓库的备份，让其他人查看代码、提交问题、复刻项目、发起 Pull Request，并通过 Code Review 协作。

- **Local repository**：本地仓库，位于自己的电脑上。
- **Remote repository**：远端仓库，视频中主要以 GitHub 为例。
- **Public repository**：公开仓库，代码可被搜索和查看。
- **Private repository**：私有仓库，只有自己或被授权的协作者可见。

Git 负责记录和管理版本，GitHub 负责把仓库放到远端并提供协作界面；两者不是同一个东西。

## 2. 本地仓库的核心对象

### 2.1 Commit：一次可回溯的快照

一次 `commit` 可以理解为“当前项目状态的一张快照”。每次提交都应该有清晰的提交说明，例如：

```text
新增用户登录校验
修复导航页空状态
补充 GitHub Actions 配置
```

每个 commit 都有唯一的 commit ID，也叫 commit hash。Git 界面中常显示短 hash，完整 hash 更长；在同一个仓库中，使用 commit ID 能精确指向某次改动。

视频建议在 AI 编程时采用“小步提交”：每完成一个相对独立的功能点，就提交一次。这样 AI 的改动如果不符合预期，可以快速定位和回退，而不是让大量修改混在一起。

### 2.2 `.gitignore`：不要把不该提交的内容纳入仓库

`.gitignore` 用来声明 Git 不应跟踪的文件或目录。项目初始化时就创建它，能从源头减少密钥、依赖包和临时产物被误提交的概率。

常见示例：

```gitignore
.env
node_modules/
.DS_Store
*.log
```

注意：`.gitignore` 只影响“尚未被 Git 跟踪”的文件。某个密钥已经提交过时，单纯把它写入 `.gitignore` 并不能从历史中删除；应立即撤销或更换密钥，并另外处理历史记录。

### 2.3 Git 的四个常用区域

视频重点解释了文件在不同区域之间的流动：

```text
Working Directory  --git add-->  Staging Area  --git commit-->  Local Repository
       ^                                                              |
       |                         git pull / fetch + merge             |
       +--------------------------- Remote Repository <---git push---+
```

- **Working Directory（工作区）**：电脑磁盘中正在编辑的项目文件。
- **Staging Area / Index（暂存区）**：提交前的检查点，可以挑选本次要提交的文件。
- **Local Repository（本地仓库）**：已经 commit 的历史记录。
- **Remote Repository（远端仓库）**：GitHub 等服务器上的仓库。

典型命令链：

```bash
git status
git add <file>       # 将文件放入暂存区
git commit -m "描述本次改动"  # 写入本地仓库
git push              # 推送到远端
```

VS Code 的 Source Control 面板会把部分步骤合并成按钮，但理解暂存区仍然重要：如果只 stage 两个文件，commit 时就只提交这两个文件；不单独 stage 时，工具可能默认提交全部变更。

## 3. 回退、比较和恢复：三种“后悔药”

| 操作 | 作用 | 适用场景 | 协作风险 |
|---|---|---|---|
| `discard changes` | 丢弃尚未 commit 的工作区修改 | 本地改了一半，确定不要了 | 会丢失未提交内容 |
| `git reset` | 把当前分支指针强制移回某个历史提交 | 个人分支、改动尚未共享 | 可能改写历史；已推送后通常需要强推 |
| `git revert` | 新建一个反向提交，抵消某次 commit | 多人共享分支撤销已发布改动 | 相对安全，保留历史链 |

### 3.1 查看历史与差异

```bash
git log
git log --oneline --graph --decorate
git diff
```

视频中使用 AI 根据两个 commit ID 比较差异，底层对应 `git diff`。实际向 AI 描述任务时，最好同时提供准确的 commit hash、目标分支和是否允许改写历史。

### 3.2 `reset` 与 `revert` 的关键区别

- `reset` 会移动分支指针，后面的提交可能从当前分支历史中消失；如果这些提交已经推送到远端，强制覆盖会影响其他人。
- `revert` 会生成一个新的反向提交，用新提交抵消旧提交，历史仍然完整，所以共享分支应优先考虑它。

安全的 AI 请求示例：

```text
请先检查当前分支和工作区状态。将 commit <hash> 的改动撤销，但保留其他提交，不要改写共享分支历史；执行前先告诉我将要运行的命令。
```

### 3.3 Detached HEAD：适合查看，不适合直接开发

当 HEAD 直接指向某个历史 commit，而不是某个分支时，处于 detached HEAD（分离头指针）状态。这个状态适合查看旧版本或复现问题；如果直接在上面提交，提交可能没有被任何分支引用，后续容易找不到。

如果需要基于历史版本继续开发，更稳妥的方式是从该 commit 创建新分支：

```bash
git switch -c feature-from-old <commit-hash>
```

## 4. Branch：让不同开发线互不干扰

分支本质上是指向 commit 的指针，不是复制一份完整代码。新分支刚创建时通常和当前分支指向同一个 commit；之后在新分支提交，只会推进新分支，不会改变主干。

```bash
git switch main
git switch -c feature/login
# 修改代码并提交
git add .
git commit -m "实现登录功能"
# 回到主干
git switch main
# 合并功能分支
git merge feature/login
```

推荐的基本习惯：

1. `main` / `master` 只保留相对稳定的代码；
2. 每个功能、修复或实验使用独立分支；
3. 分支合并完成后删除已无用途的分支；
4. 删除前先确认分支已经合并并且没有未保存工作；
5. 不要直接在共享主干上让 AI 进行大范围修改。

### 4.1 HEAD、分支与工作树

- **HEAD**：当前仓库正在查看或工作的 commit，通常跟随当前分支移动。
- **Branch**：一条开发线的指针。
- **Worktree**：为另一个分支创建独立工作目录，可以让多个分支在多个文件夹中并行开发。

Worktree 对并行使用多个 AI Agent 很有价值：每个 Agent 在自己的分支和目录中修改，互不覆盖，完成后再逐个合并。

```bash
git worktree add ../project-feature feature/login
git worktree list
git worktree remove ../project-feature
```

### 4.2 Merge Conflict：合并冲突

当两个分支修改了同一个文件的同一位置，Git 无法自动判断保留哪一份，就会产生 merge conflict。解决冲突不是“让 Git 猜”，而是人工或让 AI 根据明确规则选择：

- 保留当前分支版本；
- 保留被合并分支版本；
- 两者都保留并重新排列；
- 结合业务逻辑重写。

解决后要检查 diff 和测试结果，再完成合并提交。向 AI 提需求时，不要只说“解决冲突”，要写清楚每一块冲突的业务取舍。

## 5. 本地与 GitHub 之间同步

### 5.1 两种建立远端关联的方式

**方式一：先有远端，再 clone 到本地**

```bash
git clone <repository-url>
cd <repository-directory>
```

`clone` 会把远端仓库复制到本地，同时建立本地仓库、工作区以及默认的远端名称（通常是 `origin`）。

**方式二：先有本地项目，再推送到 GitHub**

```bash
git init
git add .
git commit -m "初始化项目"
git remote add origin <repository-url>
git branch -M main
git push -u origin main
```

推送权限取决于你是否是仓库所有者，或是否被添加为协作者。不能因为知道仓库地址，就直接向别人的仓库 push。

### 5.2 push、fetch、pull

```text
本地 commit --git push--> 远端仓库
远端新提交 --git fetch--> 本地远端跟踪分支
本地合并远端改动       --> 当前本地分支
```

- `git push`：把本地提交上传到远端。
- `git fetch`：只获取远端最新信息，不自动改当前工作区。
- `git pull`：通常可理解为 `fetch` + `merge`，获取并合并远端改动。

同步前先检查工作区是否干净；如果本地有未提交修改，先 commit、stash 或确认可以丢弃，再进行 pull，减少冲突和误覆盖。

`origin/main` 表示远端 `origin` 的 `main` 分支；本地 `main` 与 `origin/main` 的提交数量不同，说明双方尚未同步。

## 6. GitHub 仓库页面值得掌握的功能

- **Code**：浏览源代码、复制 clone 地址、下载 ZIP。
- **README**：项目说明、用途、运行方式和基础文档。
- **Releases**：项目发布版本、版本号、更新说明和可下载的构建产物。
- **Star**：表示关注或收藏，也能粗略反映项目热度。
- **Fork**：把别人的仓库复制到自己的账号下，用于学习、修改或发起贡献。
- **Issues**：提交 Bug、功能建议和问题讨论；Open 表示未解决，Closed 表示已处理或结束。
- **Code Spaces**：基于远端仓库申请云端开发环境，适合直接在浏览器中查看、修改和运行代码。
- **Git Blame**：查看每一行代码最后由谁、在哪次提交中修改，便于追溯上下文。

常用 GitHub 页面快捷键（视频演示）：

| 快捷键 | 用途 |
|---|---|
| `/` | 打开搜索 |
| `t` | 按文件名搜索文件 |
| `l` | 跳转到指定行号 |
| `?` | 查看快捷键速查表 |
| `.` | 在浏览器中打开网页版 VS Code |
| `g` 后 `i` | 进入 Issues |
| `g` 后 `c` | 进入代码区域 |

具体快捷键可能随 GitHub 页面版本变化，忘记时优先按 `?` 查看当前页面的速查表。

## 7. 开源项目贡献：Fork → Branch → Commit → PR → Review → Merge

没有上游仓库直接写权限时，视频给出的完整流程是：

1. 在 GitHub 上 Fork 上游项目；
2. Clone 自己账号下的 Fork；
3. 创建功能分支，不要直接改 `main`；
4. 修改代码、运行检查并 commit；
5. Push 功能分支到自己的远端仓库；
6. 创建 Pull Request（PR），选择正确的源分支和目标分支；
7. 上游维护者查看代码差异并进行 Code Review；
8. 根据意见继续修改；
9. 审核通过后合并到上游主干。

创建 PR 前，要先把上游最新主干同步到自己的功能分支，在本地解决冲突，再发起 PR。否则上游已经变化时，PR 可能带着冲突进入审核流程。

如果项目管理员已经把你添加为 Collaborator，就可以省略 Fork：直接 Clone 原仓库、创建分支、Push 分支并发起 PR。无论哪种方式，都建议通过分支和 PR 保持主干可审查、可回滚。

## 8. 进阶但高频的三个概念

### 8.1 `cherry-pick`：只挑选指定提交

如果一个功能分支上有多个 commit，但只想把其中几个提交带到当前分支，可以使用 cherry-pick：

```bash
git switch main
git cherry-pick <commit-a> <commit-b>
```

它适合把独立修复、紧急补丁或某个小功能迁移到另一条分支。使用前要确认提交之间的依赖关系；只挑后续提交可能无法独立工作。

### 8.2 `stash`：临时收起未完成修改

`stash` 不是暂存区。它用于把尚未完成、暂时不想 commit 的工作区修改临时保存起来，以便切换分支处理紧急任务：

```bash
git stash push -m "未完成的登录页面"
git switch main
# 处理紧急任务
# 回到原分支
git switch feature/login
git stash pop
```

如果修改已经足够完整且有明确意义，优先使用一个临时 commit；如果只是半成品、实验代码或需要短暂切换上下文，才考虑 stash。恢复前检查当前工作区，避免覆盖新的修改。

### 8.3 `rebase`：变基，整理历史线

视频用一个简单提交图说明：feature 分支基于旧的主干提交开发，而 main 已经前进；`git rebase main` 会把 feature 的提交重新“接到”最新 main 上，形成更线性的历史，减少额外的 merge commit。

```bash
git switch feature/login
git rebase main
```

rebase 会重写 feature 分支上的提交，因此提交 hash 会发生变化。若该分支已经推送过，后续通常需要：

```bash
git push --force-with-lease
```

视频演示中使用了强制推送；实际操作优先选择 `--force-with-lease`，并且只对自己独占的分支使用。共享分支禁止随意 rebase 和强推，否则可能覆盖其他人的提交。

## 9. AI 时代的 Git 使用方法

视频的核心观点不是“完全不学命令”，而是把学习重点从死记命令转为掌握状态、对象和风险：

1. 能判断当前处于哪个分支、哪个 commit；
2. 能区分工作区、暂存区、本地仓库和远端仓库；
3. 能说清楚是要撤销未提交修改、撤销某个提交，还是回到历史状态；
4. 能判断操作是否会改写共享历史；
5. 能要求 AI 先检查状态、解释计划、执行后汇报 diff 和测试结果。

推荐的 AI 协作提示词模板：

```text
请先检查当前分支、工作区状态和最近 5 条提交，不要修改文件。
目标：把 <具体改动/commit> 合并到 <目标分支>。
约束：不要改写共享分支历史；如果有冲突先暂停并列出冲突文件和可选方案。
执行后请汇报：实际执行的操作、变更文件、git diff 摘要和测试结果。
```

AI 可以替你调用命令，但不能替你承担错误分支、错误目标仓库、密钥泄漏或强制推送的后果。涉及 `reset --hard`、`push --force`、删除分支、批量删除文件时，必须先确认目标和备份策略。

## 10. 一套可跟做的练习路线

在一个空目录中完成以下练习，足以覆盖视频大部分核心概念：

```bash
mkdir git-practice && cd git-practice
git init
printf "apple\n" > fruits.txt
git add fruits.txt
git commit -m "初始化水果清单"
git switch -c feature/add-fruit
printf "banana\n" >> fruits.txt
git add fruits.txt
git commit -m "增加香蕉"
git switch main
git merge feature/add-fruit
git log --oneline --graph --decorate
```

然后继续练习：

- 在两个分支修改同一行并解决冲突；
- 使用 `git stash` 暂存半成品；
- 使用 `git revert` 撤销已提交改动；
- 使用 `git cherry-pick` 只迁移一个 commit；
- 创建 GitHub 远端仓库并完成 `push` / `pull`；
- 用 Fork 和 PR 模拟一次开源贡献流程；
- 用 `git worktree` 为两个分支创建两个并行目录。

## 11. 最终速查表

| 目标 | 优先理解/使用 |
|---|---|
| 开始管理项目 | `git init`、`.gitignore` |
| 查看当前状态 | `git status` |
| 保存一次版本 | `git add`、`git commit` |
| 查看历史 | `git log` |
| 比较差异 | `git diff` |
| 创建或切换开发线 | `git switch -c`、`git switch` |
| 合并分支 | `git merge` |
| 绑定/获取远端 | `git remote`、`git clone` |
| 上传/同步 | `git push`、`git fetch`、`git pull` |
| 撤销未提交修改 | discard / `git restore` |
| 安全撤销已提交改动 | `git revert` |
| 回退个人未共享历史 | `git reset` |
| 临时收起半成品 | `git stash` |
| 迁移指定提交 | `git cherry-pick` |
| 整理个人分支历史 | `git rebase` |
| 并行目录开发 | `git worktree` |

---

## 来源与回查

- 视频原始字幕、元数据、完整时间轴和边界说明：[`原始字幕副产物（不随公开仓库提交）`](https://www.bilibili.com/video/BV1ySLc6QEcB/)
- 其中 `timeline.md` 用于按时间范围回查字幕；`boundaries.md` 记录了本笔记的事实来源和整理边界。

## 副产物导航

副产物（原始字幕、时间轴转录、元数据）仅存本地，不进公开仓库。来源：[https://www.bilibili.com/video/BV1ySLc6QEcB/](https://www.bilibili.com/video/BV1ySLc6QEcB/)
