# Playwright web自动化 教程书（Python 版）

> 来源：[原始内容](https://www.bilibili.com/video/BV1Gw411N73T)
> 整理日期：2026-09-02

> 根据 B 站合集《Playwright web自动化 - Python版》（UP 主「白月黑羽编程」）整理。合集共 36 个分 P、约 312 分钟，系统讲解用 Python 做 Web 自动化：从 Playwright 的原理架构、环境安装，到元素定位（CSS selector / xpath / 文本 / role / 视觉定位），再到元素操作（输入、单选、复选、下拉、拖拽）与页面级操作（frame、窗口切换、截屏、弹出框）。
>
> - 视频：[Bilibili：Playwright web自动化 - Python版](https://www.bilibili.com/video/BV1Gw411N73T)
> - UP 主：白月黑羽编程
> - 时长：36 个分 P，约 312 分钟
> - 主要技术对象：Playwright Web 自动化（Python 版）
> - 字幕来源：BibiGPT 字幕接口

## 内容覆盖说明

本合集 36 个分 P，其中 **22 个分 P 已获取字幕**（正文据此整理），**14 个分 P 因 BibiGPT 免费额度耗尽未能获取字幕**（正文按分 P 标题 + Playwright 官方文档补写，并逐节标注）。覆盖情况如下：

| 章节 | 分 P | 字幕状态 |
| --- | --- | --- |
| 快速上手 | p1–p6（原理、安装、示例、界面等待、代码助手、跟踪） | ✅ 有字幕 |
| 元素定位 | p7–p15（CSS selector 系列） | ✅ 有字幕 |
| 元素定位 | p16（xpath）、p17（文本）、p18–p19（role）、p21（视觉） | ✅ 有字幕 |
| 元素定位 | p20（role-3）、p22（缺省等待时间） | ⚠️ 无字幕，按标题补写 |
| 元素操作 | p25（输入框）、p33（拖拽） | ✅ 有字幕 |
| 元素操作 | p23–p24（通用操作）、p26（单选/复选）、p27（select）、p28（Page 操作）、p29（frame）、p30（窗口）、p31（冻结界面）、p32（截屏） | ⚠️ 无字幕，按标题补写 |
| 弹出框 | p34–p36 | ⚠️ 无字幕，按标题补写 |

> 有字幕的 22 个分 P 中，口语 ASR 转写存在个别识别误差（如 `aria` 常被识别成 `error/area`、`chromium` 识别成 `chromium/chrome`、`nth` 识别成 `N` 等），本笔记已在理解层面纠正，不影响技术结论。

---

## 第一部分　快速上手

### 1.1 原理与架构（p1）

Playwright 是微软开发的 Web 应用自动化框架。和 Selenium 最直观的区别在于：**Selenium 官方只提供"操作浏览器"的自动化能力**，至于你拿它做自动化测试、爬数据还是办公，它都不限定；而 **Playwright 是面向测试设计的**，在自动化操作浏览器的能力之上，还额外内置了一部分面向测试的支持。

本教程的重点是讲 Playwright **自动化操作 Web** 的能力，测试框架部分（如 Python 生态里的 pytest）不在本系列展开。

#### Selenium 的三层架构

Selenium 的自动化由**三个实体**参与，各自跑在独立进程里：

1. **自动化程序**：你自己写的代码；
2. **浏览器驱动（driver）**：由各浏览器厂商提供（ChromeDriver、EdgeDriver、Firefox 的 geckodriver 等），负责把命令翻译给浏览器；
3. **浏览器**：真正执行操作。

自动化程序不能直接控制浏览器，它先通过 **WebDriver 协议（HTTP 接口，W3C 定义）** 把命令发给浏览器驱动，驱动再通过浏览器私有协议（典型如 Chrome DevTools Protocol，简称 CDP）转给浏览器。驱动就像一个"翻译"。

#### Playwright 的架构：少一层，且驱动由官方自研

- 用 **JavaScript** 写自动化时，Playwright 把"自动化程序"和"浏览器驱动"合并成一个进程（跑在 Node.js 里），只保留两个实体，少了一个中间层。
- 用 **Python** 等其他语言时，Playwright 官方提供一份"客户端库"（如 Python 的 `playwright` 包），再搭配一个**官方自己用 JS 写的驱动进程**。整体架构跟 Selenium 很像，区别在于：**中间那个"驱动"不再由浏览器厂商提供，而是 Playwright（微软）自研的**，通过客户端库去控制它。

一句话总结：Python 版 Playwright 也是"你的程序 → 客户端库 →（网络协议）→ 驱动进程 → 浏览器"这样一条链，只是驱动换成了官方自研。

### 1.2 环境安装（p2）

Python 版 Playwright 的安装分两步，且**浏览器驱动和 Node.js 运行时会随包一起装好，无需单独下载驱动**（这是和 Selenium 最大的环境差异之一）。

```bash
# 第一步：安装客户端库（含自研驱动、所需的 node 运行时）
pip install playwright

# 第二步：安装 Playwright 自己编译的浏览器
playwright install          # 默认下载 chromium / firefox / webkit 三个
playwright install chromium # 只下最常用的一个即可
```

要点：

- 国内网络下 `pip install` 慢的话，可换国内镜像（如清华源）加速。
- 装完 `playwright` 后，`playwright` 命令会放进当前 Python 解释器环境的 `Scripts/` 目录。如果你用的是虚拟环境、且该目录没加进 `PATH`，需要用**全路径**执行 `playwright install`。
- `playwright install` 默认一口气下载三个浏览器（chromium / firefox / webkit，webkit 是苹果 Safari 那一类内核）。不做多浏览器兼容性测试的话，`playwright install chromium` 下一个就够。

**为什么 Playwright 用自己的浏览器、不用你电脑上装的 Chrome？** 因为厂商浏览器会**自动升级**，升级后驱动版本与浏览器不匹配，就会出现"上周还能跑、这周突然跑不了"的问题（Selenium 的经典痛点）。Playwright 自己编译的浏览器**不会自动升级**，版本始终和驱动匹配，避免了这类问题。

如果确实要用厂商发布的浏览器（比如为了测兼容性），也可以指定使用本机浏览器，教程后续有讲（本笔记因字幕缺失未展开）。

### 1.3 第一个自动化示例（p3）

教程用一个"股票查询"网页演示：输入"通讯"、点查询、打印所有结果。完整代码骨架如下：

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=False)  # headless=False 才有界面
    page = browser.new_page()                              # 打开一个标签页
    page.goto("https://...股票查询页面...")                 # 访问网址
    print(page.title())                                    # 打印页面标题

    page.locator("#kw").fill("通讯")                        # 定位输入框并输入
    page.locator("#go").click()                            # 定位按钮并点击

    # 打印所有查询结果（后面会细讲）
    for t in page.locator(".result-item").all_inner_texts():
        print(t)

    browser.close()                                        # 关闭浏览器
```

对象层级（视频反复强调，这是理解 Playwright 的关键）：

| 对象 | 含义 |
| --- | --- |
| `playwright` | `sync_playwright()` 返回的入口对象，封装了全部自动化能力 |
| `browser` | 控制整个浏览器的"遥控器"，由 `playwright.chromium.launch()` 返回 |
| `page` | 控制当前标签页（网页）的"遥控器"，由 `browser.new_page()` 返回 |
| `locator` | 定位到的元素的句柄，由 `page.locator(...)` 返回 |

- `launch(headless=False)`：`headless` 默认 `True`（无头、无界面）。学习阶段设成 `False` 方便观察；代码成熟后批量跑可去掉。
- **同步 vs 异步**：Playwright 原生基于 JS，天然异步，但异步写法对初学者不友好，所以本教程统一用**同步 API**（`from playwright.sync_api import sync_playwright`）。异步 API（`async_playwright`）感兴趣可自行切换。
- 关闭浏览器是 `browser.close()`（只关浏览器）；驱动进程在程序结束时随之结束。

### 1.4 界面等待（p4）

股票查询里"点查询 → 结果出现"之间有约 1 秒的间隔，程序执行却很快，会立刻去读结果，此时结果还是空列表。所以必须"等一会"。

**关键结论：不要用 `time.sleep`，要用 `page.wait_for_timeout`。**

- Playwright 底层用的是异步库（greenlet 等），用 `time.sleep` 会破坏异步处理逻辑，带来各种难以排查的奇怪后果。官方明确不推荐。
- 替代方案是 page 对象的 `wait_for_timeout`，效果等价于 `sleep`，但**参数单位是毫秒**：

```python
page.wait_for_timeout(2000)   # 等 2 秒（2000 毫秒）
```

### 1.5 代码助手 codegen（p5）

Playwright 内置"代码助手"（Inspector），可以把你**在界面上的操作**自动录制成代码，尤其是定位代码，省去手写。

```bash
playwright codegen          # 不在 PATH 里时用全路径
```

运行后会弹出 Playwright Inspector，你在浏览器里的每一步操作都会被记录成代码（访问网址 → `goto`、点击 → `click`、输入 → `fill`……）。

**但代码助手只是"助手"，不能替代写代码。** 它只能录制**界面输入类操作**（点击、输入、拖动），录不了**信息提取类操作**（比如把查询结果全部打印出来），更处理不了后续的落库、写 Excel、发邮件等。所以"不用写一行代码就能搞定自动化"是不成立的——定位原理、信息提取、后续处理仍要自己会写。

### 1.6 跟踪功能 tracing（p6）

tracing 是 Playwright 很有特色的功能：执行自动化时，把**每一步操作的细节**（每一步执行前后界面的截图、快照、对应源码位置）记录到一个 `trace.zip` 数据文件里，事后可以逐帧回看。

```python
context = browser.new_context()          # 跟踪必须在 context 上开启
context.tracing.start(screenshots=True, snapshots=True, sources=True)

page = context.new_page()
page.goto("...")
page.locator("#kw").fill("通讯")
page.locator("#go").click()
# ... 更多操作 ...

context.tracing.stop(path="trace.zip")   # 保存跟踪文件
```

查看方式有两种：

1. **在线**：打开 <https://trace.playwright.dev/>，把 `trace.zip` 拖进去即可。
2. **本地命令行**：`playwright show-trace trace.zip`（无外网时用）。

**典型用途**：自动化测试往往要批量跑大量用例、耗时很长，当某个用例失败、而开发坚称"我这里没错"时，trace 里每一步的截图就是**有图有据**的界面状态，方便定位问题、跟开发对质。

---

## 第二部分　元素定位

定位（找到要操作的元素）是 Web 自动化**最难、也最重要**的部分。操作本身其实就常见的几类（点击、输入、获取内容），方法固定、不多；难的是"根据什么特征找到那个元素"。

### 2.1 定位与操作是一体的（p7）

Playwright 的典型写法是"**先定位、再操作**"：

```python
page.locator("#kw").fill("通讯")   # 定位到输入框，再输入
page.locator("#go").click()        # 定位到按钮，再点击
```

- `page.locator(表达式)` 返回一个 **Locator 对象**；
- 再对 Locator 调用 `fill()` / `click()` / `inner_text()` 等**操作**。

元素特征可以从**开发者工具栏**看：按 `F12` 打开，点左上角箭头（或直接右键 → 检查）选中元素，即可看到它的 HTML。HTML 里有：

- **标签名（tag）**：如 `input`、`button`、`div`；
- **属性（attribute）**：`属性名="属性值"`，如 `type="text"`、`id="kw"`、`placeholder="股票名称"`。

**两个最重要的属性**：

- `id`：像身份证号，通常唯一，有 id 就优先按 id 定位；
- `class`：像"种类"，同类元素共用。注意一个元素可以有**多个 class**，HTML 里用**空格隔开**——这是"两个 class"（如 `class="result-item stock"`），不是"一个大 class 叫 result-item stock"。

**CSS selector 定位原理**：CSS 本来是给元素指定显示样式的，前半段"选择哪些元素"就是选择器（selector）。因为 CSS 选择器是**浏览器天生支持**的能力，各浏览器对它的支持最稳定、最高效，所以视频**优先推荐 CSS selector 定位**。

三种最基础的 CSS 定位写法：

| 定位依据 | 写法 | 示例 |
| --- | --- | --- |
| id | `#id值` | `page.locator("#kw")` |
| class | `.class值` | `page.locator(".result-item")` |
| 标签名 | 直接写 tag | `page.locator("div")` |

**同时匹配多个 class**（元素同时具有多个 class）要**连着写、不加空格**：

```python
page.locator(".chinese.student")   # 同时有 chinese 和 student 两个 class
# 千万别写成 ".chinese .student" —— 那是"chinese 内部的 student"（后代选择）
```

### 2.2 验证 CSS Selector（p8）

写完表达式，不用每次都跑 Python 来验证。可以在开发者工具栏里**按 `Ctrl+F`**（macOS 是 `Cmd+F`），在弹出的搜索框里输入 CSS 表达式，右侧会显示"共 N 个"，并高亮当前选中的是第几个。多选时可以上下切换。

> 注意：`Ctrl+F` 的结果里偶尔会混入 `style`/脚本里的纯文本匹配（比如 `.animal` 会匹配到 CSS 里 `.animal{...}` 那段，但那段不是 HTML 元素），看高亮的是不是真实元素即可。

### 2.3 匹配多个元素 + Locator 内部定位（p9）

一个表达式可能匹配**多个**元素。此时**不能**直接对 Locator 调用 `click` / `fill` / `inner_text`（这些是单元素操作，匹配到多个会**报错**——这点和 Selenium 不同，Selenium 的 `find_element` 遇到多个会默认取第一个）。

处理多个匹配的几种方式：

| 需求 | 方法 | 说明 |
| --- | --- | --- |
| 逐个操作每个元素 | `.all()` | 返回"每个元素对应的 Locator"组成的列表，用 for 遍历 |
| 只要元素数量 | `.count()` | 返回整数；`count()==0` 可判断元素不存在 |
| 只取第一个 | `.first` | 属性，返回 Locator |
| 只取最后一个 | `.last` | 属性，返回 Locator |
| 取第 N 个 | `.nth(n)` | **从 0 开始**：`nth(0)` 是第一个 |
| 取所有元素的文本 | `.all_inner_texts()` | 一步到位返回文本列表，免去 `all()` + 循环 |

```python
# 逐个操作
for loc in page.locator(".plant").all():
    print(loc.inner_text())

# 一步拿到所有文本
print(page.locator(".plant").all_inner_texts())

# 第一个 / 最后一个 / 第 2 个
page.locator(".plant").first.inner_text()
page.locator(".plant").last.inner_text()
page.locator(".plant").nth(1).inner_text()   # nth 从 0 开始，1 是第二个
```

**Locator 内部定位**：`Locator` 对象本身也有 `.locator()` 方法，可以在"某个已定位元素"的内部再定位，而不是从整个网页范围定位：

```python
# 先定位到 id=bottom 的 div，再在其内部找所有 span
bottom = page.locator("#bottom")
print(bottom.locator("span").all_inner_texts())
```

### 2.4 选择子元素与后代元素（p10）

- **直接子元素**：`>` 表示——`A > B` 选 A 的**直接**子元素 B（中间不隔层级）。
- **后代元素**：空格表示——`A B` 选 A 的**任意层级内部**元素 B（含直接子元素、孙元素等）。**后代写法比直接子元素更常用**（因为你往往不确定隔了几层）。

```python
page.locator("#inner12 > span")     # inner12 的直接子元素 span
page.locator("#layer1 span")        # layer1 内部任意层级的 span（后代）
```

**实用技巧**：一个元素本身没什么特征时，**往上层找**——看它的父元素/祖先元素有没有 id、class 等特征，用"祖先 + 关系"去定位它。如果一层不够唯一，就再往上一层加限定。

### 2.5 根据属性选择（p11）

id、class 之外的其他属性，用**方括号通用语法**：

| 写法 | 含义 |
| --- | --- |
| `[属性名="值"]` | 属性值**完全等于** |
| `[属性名]` | 只要有这个属性（值都不用指定） |
| `[属性名*="值"]` | 属性值**包含** |
| `[属性名^="值"]` | 属性值**以……开头** |
| `[属性名$="值"]` | 属性值**以……结尾** |

```python
page.locator('a[href="https://xxx"]')     # href 完全等于
page.locator("a[href]")                   # 只要有 href
page.locator('a[href*="byhy"]')           # href 包含 byhy
page.locator('a[href^="https"]')          # href 以 https 开头
page.locator('a[href$=".html"]')          # href 以 .html 结尾
```

- 属性值里没有特殊字符（冒号、点、斜杠等）时，引号可省；稳妥起见通常还是加引号。
- 可结合标签名加限制：`a[href="..."]` 就比 `[href="..."]` 多一层"必须是个链接"的限制。
- 同时匹配**多个属性**要**连着写、不加空格**：`div[class="misk"][type="text"]`（加了空格就变成"后代"了）。

### 2.6 表达式组合 与 组选择（p12–p13）

- **组合（且）**：各种定位表达式可以连续写在一起，表示**同时满足**所有特征。`span.copyright[name="cp1"]` 表示：是 span、class 含 copyright、且 name 为 cp1 的元素。前面学过的 id/class/tag/属性/层级关系都能任意组合。

```python
page.locator(".foot1 .copyright[name='cp1']")   # 综合多个特征定位
```

- **组选择（或）**：用**逗号**隔开，表示**满足任一条件**即可。`.plant, .animal` 选"所有植物或动物"。

```python
page.locator(".plant, .animal")   # class 是 plant 或 animal 的都选
```

**两个易错点**：

1. **组选择的顺序**：选中元素的**排列次序是它们在 HTML 文档中出现的次序**，不是你写表达式的次序。`.animal, .plant` 和 `.plant, .animal` 选中的集合一样，顺序也不变。
2. **优先级陷阱**：`#t1 span, p` 会被解析成"（#t1 里的 span）或（所有 p）"，而不是"#t1 里的（span 或 p）"。因为逗号的优先级最低，`#t1 span` 先紧密结合了。CSS 不支持括号，要表达"#t1 里的 span 和 p"只能分开写：`#t1 span, #t1 p`。

### 2.7 按次序选择子节点（p14）

用伪类（冒号开头）按"第几个子节点"选择：

| 写法 | 含义 |
| --- | --- |
| `:nth-child(n)` | 父节点的**第 n 个子节点**（**从 1 开始**） |
| `:nth-last-child(n)` | 父节点的**倒数第 n 个子节点** |
| `:last-child` | 最后一个子节点 |
| `:nth-of-type(n)` | 同类型子节点中的第 n 个 |
| `:nth-last-of-type(n)` | 同类型子节点中的倒数第 n 个 |
| `:nth-child(even)` / `:nth-child(odd)` | 偶数 / 奇数位置的子节点 |

```python
page.locator("span:nth-child(2)")        # 父节点的第 2 个子节点，且是 span
page.locator("p:last-child")             # 父节点最后一个子节点，且是 p
page.locator("p:nth-of-type(2)")         # p 类型子节点中的第 2 个
```

**易混淆点**：

- `:nth-child` 从 **1** 开始（和 CSS 传统一致），而上一节的 `.nth()` 方法从 **0** 开始（和 Python 索引一致）——两者别搞混。
- `:nth-child(n)` 和 `:nth-of-type(n)` 的区别：前者先看"是所有子节点里的第 n 个"（不限类型），再要求它是指定类型；后者只看"指定类型子节点里的第 n 个"。视频用"倒数第二个 P"的例子说明了这种差异——`p:nth-last-child(2)` 要求它既是 P、又是所有子节点里的倒数第二个；`p:nth-last-of-type(2)` 则是"所有 P 里的倒数第二个"。

### 2.8 定位兄弟节点（p15）

- **相邻兄弟**：`+` 表示——`A + B` 选**紧跟**在 A 后面的兄弟 B。
- **后面的所有兄弟**：`~` 表示——`A ~ B` 选 A 后面**所有**兄弟 B。

```python
page.locator("h3 + span")     # h3 后面紧跟的那个 span
page.locator("#t1 h3 ~ span") # t1 里 h3 后面的所有 span
```

到这一节，属性、父子关系、兄弟关系已能覆盖 **90% 左右**的定位场景。

### 2.9 xpath 定位（p16）

xpath 是 W3C 定义的、在 XML/HTML 中选节点的语言，Playwright 的 `locator` 同样支持。

视频不重讲 xpath 语法（可去 UP 主的 Selenium 教程里看），只强调两点：

1. **CSS 能解决的优先用 CSS**，xpath 主要用于 CSS 解决不了的场景，典型是**从子节点选父节点**（CSS 目前没有这个能力），以及一些**兄弟节点**选择。
2. xpath 与 CSS 很多写法可互换：如 `//a[@href="xxx"]`（`//` 从任意位置开始，属性前加 `@`）对应 CSS 的 `a[href="xxx"]`。

### 2.10 根据文本内容定位（p17）

CSS / xpath 都是"根据 HTML 内部特征定位"，有些特征（如 class）界面根本看不到。**Playwright 更推荐从用户视觉角度能看到的特征定位**——界面呈现的内容相对稳定，不容易随开发改动而变。

最直观的是**根据文本定位**：`get_by_text`，默认**包含匹配**（不要求完全相等）：

```python
page.get_by_text("111").all_inner_texts()          # 文本包含 111 的元素
page.get_by_text("111").all()                      # 逐个取
```

需要更灵活的匹配（如"以 111 结尾"）时，用**正则表达式**：

```python
import re
page.get_by_text(re.compile(r"111$")).all_inner_texts()   # 文本以 111 结尾
```

### 2.11 role 定位（p18–p19）

代码助手（codegen）经常产生 `get_by_role`，它是**根据元素的"角色"（role）定位**。role 来自 W3C 的 **ARIA**（Accessible Rich Internet Applications）标准——为界面元素按"用途"定义一套角色，方便读屏等辅助技术识别。

例如一个注册成功提示框，可以加 `role="alert"` 告诉辅助技术"这是个告警提示"；Playwright 也能据此定位：

```python
page.get_by_role("alert").inner_text()
```

**语义元素（semantic elements）**：HTML5 有些元素天生自带隐含 role，无需显式写 `role`。例如：

| 元素 | 隐含 role |
| --- | --- |
| `<progress>` | `progressbar` |
| `<input type="search">` | `searchbox` |
| `<h1>`~`<h6>` | `heading` |

所以 `page.get_by_role("progressbar")` 能定位到 `<progress>` 元素，尽管它身上并没有写 `role="progressbar"`——这是 ARIA 规范约定的隐含语义。

**get_by_role 的额外参数**：光靠 role 常常不能唯一定位（同 role 的元素可能有很多）。这时可用附加参数，对应 ARIA 的辅助属性：

| 参数 | 对应 ARIA 属性 | 用途 |
| --- | --- | --- |
| `name=` | accessible name | 按可访问名称（常用） |
| `level=` | `aria-level` | 标题层级（如 `heading` 的 level=2 表示二级标题） |
| `expanded=` | `aria-expanded` | 是否展开（树形菜单等） |
| `pressed=` | `aria-pressed` | 是否被按下 |
| `selected=` | `aria-selected` | 是否被选中 |
| `checked=` | `aria-checked` | 勾选状态 |

```python
page.get_by_role("heading", level=2).inner_text()   # 二级标题
page.get_by_role("button", name="登录").click()      # 按可访问名找按钮
```

视频的实用建议：**这些 role 和参数不用死记**——`get_by_role` 大多是 codegen 自动产生的，你**理解它是什么意思**就够了；真要手写定位，用 CSS 基本够用。

（本节 p20「role 定位-3」字幕缺失，更多 role 与选项用法参见 Playwright 官方文档 [get_by_role](https://playwright.dev/python/docs/api/class-pagelocator#page-get-by-role)。）

### 2.12 其它视觉定位（p21）

除文本、role 外，还有几种"根据界面上能看到的特征"定位，都是 codegen 常见输出：

| 方法 | 定位依据 |
| --- | --- |
| `get_by_placeholder("...")` | 输入框的 placeholder（默认包含匹配，加 `exact=True` 则完全匹配） |
| `get_by_label("...")` | 元素的 label（含 `aria-label`，或 `<label for="id">` 关联的 input） |
| `get_by_alt_text("...")` | 图片的 alt 文本 |
| `get_by_title("...")` | 元素的 title 属性（鼠标悬停时的提示） |

```python
page.get_by_placeholder("验证码").fill("1234")
page.get_by_label("用户名").fill("john")
page.get_by_alt_text("logo").click()
page.get_by_title("白月黑羽首页").click()
```

视频建议：`get_by_placeholder` / `get_by_alt_text` / `get_by_title` 这类规则简单、可自己直接手写；`get_by_label` 的规则稍复杂（涉及 aria-label、label-for 关联等），但也不难。这些方法的共同点：**大多是 codegen 产生的，看懂就行**，真自己手写定位，CSS 依然是主力。

### 2.13 缺省等待时间（p22）

> ⚠️ 本节字幕未获取，以下基于分 P 标题 + Playwright 官方文档补写，非字幕转写。

承接 p4 的"界面等待"，Playwright 默认就有一整套**自动等待**机制：`fill` / `click` / `inner_text` 等操作在找不到目标时，会在一个**默认超时时间（default timeout，默认 30 秒）**内自动重试等待，而不是立即失败。

可配置项：

```python
page.set_default_timeout(10_000)        # 页面默认超时改为 10 秒（毫秒）
page.locator("#kw").fill("通讯", timeout=5000)   # 单次操作单独指定 5 秒超时
```

核心结论：日常自动化应**优先依赖自动等待**（元素出现、可点击、网络结果等），而不是到处写固定的 `wait_for_timeout`——固定等待只会让脚本变慢、变脆。

---

## 第三部分　元素操作

### 3.1 输入框：文本输入、清空、读取、文件输入（p25）

**文本输入**：定位到输入框后 `fill()` 输入，前面已用。

**清空**：`clear()` 清空输入框已有内容。视频特别强调一个场景——**批量创建数据**时，很多系统点"创建"后输入框内容**不会自动清空**，如果不先 `clear()` 再输入，新内容会接在上次内容后面（变成两个名字拼一起），导致数据错误。所以批量输入前**务必先 clear()**。

**读取输入框内容**：输入框里的文字**不能用 `inner_text()`**（`inner_text` 是元素"内部文本"，而 `<input>` 的内容存在 value 属性里，不在内部）。要用 **`input_value()`**：

```python
kw = page.locator("#kw")
kw.fill("白月黑羽")
print(kw.input_value())      # 白月黑羽
# 错误示范：kw.inner_text() 拿不到输入框内容
```

**文件输入**：`<input type="file">` 上传文件，用 **`set_input_files()`**：

```python
page.locator("input[type=file]").set_input_files("1.jpg")       # 单选一个文件
page.locator("input[type=file]").set_input_files(["1.jpg", "2.jpg"])  # 多选
```

### 3.2 单选 radio 与复选 checkbox（p26）

> ⚠️ 本节字幕未获取，以下基于分 P 标题 + Playwright 官方文档补写，非字幕转写。

- 勾选：`check()`（适用于 radio 和 checkbox）；
- 取消勾选：`uncheck()`（主要用于 checkbox）；
- 判断是否选中：`is_checked()`。

```python
cb = page.locator("#agree")
cb.check()                        # 勾选
cb.is_checked()                   # 是否已勾选（True/False）
cb.uncheck()                      # 取消勾选（checkbox 用）
```

### 3.3 select 下拉选项（p27）

> ⚠️ 本节字幕未获取，以下基于分 P 标题 + Playwright 官方文档补写，非字幕转写。

对 `<select>` 下拉框用 **`select_option()`**，可按 value / label / index 三种方式选：

```python
sel = page.locator("#province")
sel.select_option(value="440000")      # 按 value 选
sel.select_option(label="广东省")       # 按显示文本选
sel.select_option(index=1)             # 按下标选
sel.select_option(["a", "b"])          # 多选下拉传列表
```

### 3.4 元素通用操作（p23–p24）

> ⚠️ 本节字幕未获取，以下基于分 P 标题 + Playwright 官方文档补写，非字幕转写。

除 `click` / `fill` / `inner_text` 外，元素常用的通用操作分两类：

**动作类**：

| 方法 | 含义 |
| --- | --- |
| `click()` | 点击（可加 `position=` 点坐标、`force=True` 强制点击） |
| `dblclick()` | 双击 |
| `hover()` | 鼠标悬停 |
| `right_click()` | 右键 |
| `press("Enter")` | 按键 |
| `check()` / `uncheck()` | 勾选 / 取消勾选 |

**读取内容与状态类**：

| 方法 | 含义 |
| --- | --- |
| `inner_text()` | 元素内部可见文本 |
| `text_content()` | 元素完整文本（含隐藏部分） |
| `get_attribute("href")` | 取某属性值（p18 已顺带提过） |
| `input_value()` | 输入框当前值 |
| `is_visible()` | 是否可见 |
| `is_enabled()` | 是否可用 |
| `is_checked()` | 是否勾选 |

### 3.5 网页 Page 对象操作（p28）

> ⚠️ 本节字幕未获取，以下基于分 P 标题 + Playwright 官方文档补写，非字幕转写。

`page` 对象是控制标签页的"遥控器"，常见页面级操作：

```python
page.goto(url)          # 跳转
page.reload()           # 刷新
page.go_back()          # 后退
page.go_forward()       # 前进
page.title()            # 当前页面标题
page.url                # 当前 URL（属性，无括号）
page.content()          # 页面完整 HTML
```

### 3.6 frame 切换（p29）

> ⚠️ 本节字幕未获取，以下基于分 P 标题 + Playwright 官方文档补写，非字幕转写。

网页里的 `<iframe>` 是独立的文档，其内部元素**不能用页面级的 locator 直接定位**，需先进入 frame：

```python
# 方式一：frame_locator（推荐，支持 CSS 定位 frame 本身）
page.frame_locator("#frame_id").locator("#btn").click()

# 方式二：直接拿 frame 对象
frame = page.frame(name="frame_name")      # 按 name / url 取
frame = page.frames[1]                     # 按下标取
frame.locator("#btn").click()
```

### 3.7 窗口切换（p30）

> ⚠️ 本节字幕未获取，以下基于分 P 标题 + Playwright 官方文档补写，非字幕转写。

点击链接新开标签页/窗口时，用 **`page.wait_for_event("popup")`** 拿到新页面，或在 context 里遍历所有页面：

```python
with page.expect_popup() as popup_info:
    page.locator("#new_window_link").click()
new_page = popup_info.value          # 新窗口的 page 对象
new_page.locator("#btn").click()

# 或列出 context 下所有 page
for p in context.pages:
    print(p.url)
```

### 3.8 冻结界面（p31）

> ⚠️ 本节字幕未获取，以下基于分 P 标题 + Playwright 官方文档补写，非字幕转写。

调试时想"把界面冻住、逐步观察"，用 **`page.pause()`**：程序执行到该行会暂停并打开 Playwright Inspector，可以单步执行后续代码、实时查看每一步界面变化，适合调试定位和操作逻辑。

```python
page.pause()   # 执行到这会暂停，打开 Inspector 供你逐步调试
```

### 3.9 截屏（p32）

> ⚠️ 本节字幕未获取，以下基于分 P 标题 + Playwright 官方文档补写，非字幕转写。

```python
page.screenshot(path="page.png")             # 当前视口截图
page.screenshot(path="full.png", full_page=True)  # 整页截图
page.locator("#result").screenshot(path="el.png") # 元素截图
```

截图在自动化测试里用途广泛：记录用户真正看到的结果、保留失败证据、做视觉回归。

### 3.10 拖拽（p33）

网页里"把 A 拖到 B"的操作，用 page 的 **`drag_and_drop(source, target)`**：

```python
page.drag_and_drop("#t1", "#target")   # 把 id=t1 的元素拖到 id=target
```

注意视频示例里的细节：**如果要拖的是"一段文本"**，直接拖会被当成"选中"，拖不出东西。这时要先选中文本再拖——Locator 有个 **`select_text()`** 方法用于选中元素内文本：

```python
page.locator("#t1").select_text()      # 先选中文本
# 再配合 drag_and_drop 或 drag_to
```

如果已经拿到源元素的 Locator 对象，且表达式很长不想重写，也可以直接对它调用 **`drag_to()`**：

```python
source = page.locator("#t1")           # 已定位到源
source.drag_to(page.locator("#target")) # 直接拖到目标
# 注意：drag_to 的参数必须是 locator 对象，不能光秃秃写一个 CSS 表达式
```

---

## 第四部分　弹出框（p34–p36）

> ⚠️ 本部分三个分 P（弹出框-1/2/3）字幕均未获取，以下基于分 P 标题 + Playwright 官方文档补写，非字幕转写，细节可能与视频原意有出入。

网页自动化里的"弹出框"大致两类，处理方式不同：

**1. 浏览器原生对话框（alert / confirm / prompt）**

这类不是 HTML 元素，不能用 locator 定位，要监听 `dialog` 事件处理：

```python
page.on("dialog", lambda dialog: dialog.accept())   # 自动接受所有对话框
# 或显式处理
with page.expect_dialog() as dialog_info:
    page.locator("#alert_btn").click()
dialog = dialog_info.value
dialog.accept()               # 接受（confirm/prompt）
dialog.accept("输入内容")      # prompt 接受并填入
dialog.dismiss()              # 取消
dialog.message                # 对话框文本
```

**2. DOM 弹窗 / 模态框（页面内的 div 弹层）**

这类是普通 HTML 元素，按前面学的定位方式处理即可：定位到弹窗内的元素做操作/断言，关闭按钮用 `click()`，等待弹窗出现用 `locator.wait_for()` 或自动等待。

```python
page.locator("#modal").wait_for()          # 等待弹窗出现
page.locator("#modal .close").click()      # 关闭弹窗
page.locator("#modal .message").inner_text()
```

---

## 附：视频结构与学习路径建议

1. **先建整体模型**：Playwright 是"定位 → 操作"两步走；对象层级是 playwright → browser → page → locator。
2. **定位优先学 CSS selector**：属性、父子、兄弟三种关系能覆盖绝大多数场景，且浏览器原生支持、最稳定。
3. **视觉定位（text / label / role）是 Playwright 的推荐，但多为 codegen 产出**：理解含义即可，不必死记。
4. **等待用自动等待 + wait_for_timeout，别用 time.sleep**。
5. **操作相对简单**：常用就点击、输入、获取内容；把力气花在定位上。
6. **调试用 codegen（录制）+ tracing（回看）+ pause（冻结单步）** 三板斧。

## 副产物导航

副产物（原始字幕、时间轴转录、元数据）仅存本地，不进公开仓库。22 个有字幕分 P 的副产物位于本地 `media-artifacts/BV1Gw411N73T/p{N}/` 目录。来源：[https://www.bilibili.com/video/BV1Gw411N73T](https://www.bilibili.com/video/BV1Gw411N73T)
