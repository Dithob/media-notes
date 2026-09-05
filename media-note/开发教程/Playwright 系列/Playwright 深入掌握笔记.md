# 深入掌握 Playwright：页面控制、内容获取、页面动作与断言
> 来源：[原始内容](<https://www.bilibili.com/video/BV17wRQBLEZn?p=3>)
> 整理日期：2026-08-31


> 根据视频《3.深入掌握 Playwright》字幕整理。视频属于“AI 驱动 Playwright，不会写代码也能搞定 Web 自动化测试”系列的第 3 个分 P，重点讲解 Playwright 页面级 API、网页内容读取、页面动作、`evaluate` 执行 JavaScript，以及自动化与自动化测试的区别。
>
> - 视频： [Bilibili：目前B站最全最新用AI驱动Playwright](https://www.bilibili.com/video/BV17wRQBLEZn?p=3)
> - UP 主：web自动化测试
> - 时长：约 58 分钟
> - 主要技术对象：Playwright Web 自动化
> - 字幕来源：BibiGPT 字幕接口

## 一、先建立整体模型：Playwright 在控制什么

视频把 Playwright 的使用内容拆成几个层次。可以把它理解成一条从“大范围页面”到“小范围元素”的测试链路：

1. **页面导航**：决定浏览器当前要访问、刷新、前进或后退到哪里。
2. **页面内容**：读取当前页面的标题、URL 和完整 HTML 内容。
3. **页面动作**：对整个页面或浏览器视口做操作，例如调整视口大小、截图、执行 JavaScript。
4. **元素内容**：读取输入框、按钮、文本等具体元素的信息。
5. **元素动作**：对具体元素执行点击、输入、选择等操作。
6. **断言**：动作完成后判断结果是否符合预期，这是“自动化测试”区别于单纯“自动化操作”的关键。

视频开头强调了一个很实用的学习方法：先用 Playwright Inspector 录制用户操作，再对照录制出来的代码，理解“自己做的动作”对应什么 API。这样可以先建立 API 与页面行为之间的映射，再逐步掌握代码，而不是一开始死记语法。

## 二、页面导航：先决定被测页面

### 2.1 常用导航 API

| 目的 | Playwright API | 说明 |
| --- | --- | --- |
| 直接跳转 | `page.goto(url)` | 访问指定 URL，是最常用的导航操作 |
| 刷新页面 | `page.reload()` | 重新加载当前页面 |
| 后退 | `page.goBack()` | 返回浏览器历史记录中的上一页 |
| 前进 | `page.goForward()` | 前进到浏览器历史记录中的下一页 |

视频认为日常自动化里最常用的是“跳转”和“刷新”，前进与后退了解即可，不必把它们当作主要测试手段。

### 2.2 多次 `goto` 并不会让前面的操作失效

如果脚本依次访问百度、腾讯和网易，三个跳转都会真实执行。最后停留在网易，只表示最后一次导航改变了当前被测页面，并不表示前两个跳转没有生效。

```ts
await page.goto('https://www.baidu.com');
// 如果这里有操作，它会在百度页面上执行
await page.goto('https://www.qq.com');
// 这里的操作会在腾讯页面上执行
await page.goto('https://www.163.com');
```

**测试设计含义：**

- 每次 `goto` 后，都应明确后续动作属于哪个页面。
- 如果要验证多个页面，不要把多个页面的检查都写成“导航后只看最终页面”；应在每次导航后完成对应的操作和断言。
- 登录后跳转地址不固定时，可以先完成登录，再读取当前页面状态，或通过明确的导航进入目标页面。

### 2.3 刷新的典型用途

视频用“填写表单后刷新”演示了刷新行为：刷新可以清空页面上的临时输入或恢复页面状态，因此适合用于验证刷新后的数据保留、清空、重新加载和状态恢复。

不要把固定的长时间 `sleep` 当成主要等待策略。视频中的等待主要是为了让演示过程可观察；真正执行自动化时，应优先等待页面状态、元素状态或网络结果。

## 三、页面内容：标题、URL 与完整 HTML

页面内容不只是用户肉眼看到的正文。视频将页面内容至少分为三类：

1. **页面标题**：浏览器标签页显示的标题，对应 HTML 的 `<title>`。
2. **当前 URL**：当前页面地址，可用来判断导航是否到达预期位置。
3. **完整页面内容**：当前文档的 HTML，可用于判断关键文本、结构或页面内容是否存在。

按 Playwright 的标准 API，可对应为：

```ts
const title = await page.title();
const url = page.url();
const html = await page.content();
```

### 3.1 为什么 `title()` 和 `content()` 有括号

`page.url()` 是一个属性式读取，直接访问即可；`page.title()` 和 `page.content()` 是需要执行读取动作的方法，因此需要括号。

从测试角度看，重要的不是记住“有没有括号”，而是区分：

- 当前对象上已经存在的数据：直接读取属性；
- 需要浏览器执行读取、解析或计算才能得到的结果：调用方法并等待异步返回。

### 3.2 页面内容变化要多点验证

视频用搜索关键词变化举例：一次搜索可能同时改变：

- 输入框中的关键词；
- 页面标题；
- 页面 URL；
- 搜索结果区域；
- 页面其他位置的文本或 HTML。

因此，不能只检查最显眼的结果区域。一个更可靠的测试思路是：

```ts
await page.getByRole('textbox').fill('天气');
await page.getByRole('button', { name: '搜索' }).click();

await expect(page).toHaveURL(/wd=天气/);
await expect(page).toHaveTitle(/天气/);
await expect(page.locator('body')).toContainText('天气');
```

上面的断言写法属于基于视频概念的 Playwright 标准写法补充；视频本身主要讲“获取页面内容后再判断”，没有完整展开断言 API 的写法。

### 3.3 `content()` 的使用边界

`page.content()` 获取的是完整 HTML，不是图片或视频本身。如果 URL 指向图片、MP4 等非 HTML 资源，得到的内容就不再是普通网页结构。

因此：

- 验证网页结构或文本时，可以考虑 `page.content()`；
- 验证用户真正看到的布局时，HTML 不一定足够，应结合截图；
- 验证图片、视频等资源是否加载成功，应使用对应的资源状态、元素属性或网络请求检查，而不是把它们当作 HTML 读取。

## 四、页面动作：视口大小、截图与执行 JavaScript

### 4.1 设置视口大小：模拟不同设备尺寸

视频重点演示了调整页面可视区域大小。按 Playwright 标准 API，可以在上下文或页面初始化时设置，也可以在运行过程中使用：

```ts
await page.setViewportSize({ width: 1080, height: 300 });
```

不同尺寸可以用于模拟：

- 手机：较窄的视口；
- 平板：中等尺寸的视口；
- 桌面浏览器：较宽的视口。

**QA 价值：**

- 验证响应式布局是否断裂；
- 检查按钮、输入框和弹窗是否被遮挡；
- 检查窄屏下文本是否溢出；
- 验证不同尺寸下导航栏、列表和地图区域的适配情况。

### 4.2 截图：记录用户真正看到的结果

调整视口后，页面 HTML 可能没有明显变化，但用户看到的布局会变化。截图能够把视觉结果固定下来，便于人工回溯、缺陷举证和视觉回归。

```ts
await page.screenshot({
  path: 'artifacts/viewport-1080x300.png',
  fullPage: true,
});
```

截图可以记录：

- 页面整体布局；
- 视口改变后的响应式效果；
- 滚动位置和可见区域；
- 页面弹窗、遮罩、提示信息；
- 用户视角下真正呈现的内容。

视频中用固定等待时间帮助观众观察窗口变化；实际自动化应直接截图并在测试报告中保留证据，避免让脚本无意义地变慢。

### 4.3 `page.evaluate()`：从浏览器内部执行 JavaScript

当外部 API 不容易完成某个操作时，可以使用 `page.evaluate()` 在网页上下文中执行 JavaScript：

```ts
await page.evaluate(() => {
  document.body.style.backgroundColor = 'black';
});
```

视频用修改当前地址、修改页面内容和弹出提示来说明它的用途。核心理解是：

- 普通 Playwright API 是从自动化脚本侧控制浏览器；
- `evaluate` 可以进入当前网页上下文，从页面内部读取或修改 DOM；
- 它适用于 Web 页面，不等同于 App 自动化中的通用能力。

### 4.4 `evaluate()` 的典型用途

可以考虑以下场景：

- 读取页面内普通定位器不方便获取的计算结果；
- 修改页面样式以验证某些状态；
- 调用页面已有的 JavaScript 函数；
- 构造测试数据或临时改变 DOM；
- 在特定 Web 测试场景下处理 cookie、session、缓存或请求相关逻辑。

但不要把 `evaluate()` 当作所有操作的首选。优先使用用户真实可执行的 Playwright API，只有在确有必要时才进入页面内部执行代码，否则容易让测试绕过真实用户路径。

### 4.5 字符串嵌套与弹窗陷阱

视频提醒了执行 JavaScript 时的引号问题：如果内部 JavaScript 使用双引号，外层字符串可以使用单引号；反过来也一样，避免字符串提前结束。

另外，阻塞式 `alert()` 会暂停页面执行，可能影响后续截图和脚本继续运行。测试弹窗时，应先区分：

- 浏览器原生对话框：使用 Playwright 的 dialog 事件处理；
- 页面 DOM 弹窗：使用定位器查找并断言；
- 仅为调试而临时注入的 `alert()`：不应直接当作稳定测试方案。

## 五、元素内容与元素动作：从页面级进入控件级

视频在约 35 分钟处开始转向元素内容、元素动作和断言，但这一部分没有像前面的页面 API 一样完整展开。

需要建立的层级关系是：

```text
页面导航
  -> 进入目标页面
页面内容
  -> 确认页面身份、标题、URL、整体内容
页面动作
  -> 调整视口、截图、执行页面级操作
元素定位
  -> 找到按钮、输入框、文本、列表等控件
元素动作
  -> 点击、输入、选择、悬停、拖拽
断言
  -> 验证页面或元素达到了预期状态
```

示例：

```ts
await page.goto('https://example.com/login');

await expect(page).toHaveTitle(/登录/);
await page.getByLabel('用户名').fill('tester');
await page.getByLabel('密码').fill('secret');
await page.getByRole('button', { name: '登录' }).click();

await expect(page).toHaveURL(/dashboard/);
await expect(page.getByRole('heading', { name: '控制台' })).toBeVisible();
```

这条链路体现了测试脚本的基本逻辑：先到达正确页面，再完成用户动作，最后用断言验证结果。只执行点击和输入而没有断言，只能说明“脚本跑过了”，不能说明“功能正确”。

## 六、视频内容提炼成一套可复用的测试模板

### 6.1 页面级测试模板

```ts
import { test, expect } from '@playwright/test';

test('页面导航与内容校验', async ({ page }) => {
  await page.goto('https://example.com');

  await expect(page).toHaveTitle(/Example/);
  await expect(page).toHaveURL('https://example.com/');
  await expect(page.locator('body')).toContainText('预期文本');

  await page.screenshot({
    path: 'artifacts/example-page.png',
    fullPage: true,
  });
});
```

### 6.2 响应式页面测试模板

```ts
import { test, expect } from '@playwright/test';

test('不同视口下页面适配', async ({ page }) => {
  await page.goto('https://example.com');

  for (const viewport of [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await expect(page.locator('body')).toBeVisible();
    await page.screenshot({
      path: `artifacts/${viewport.name}.png`,
      fullPage: true,
    });
  }
});
```

### 6.3 适合实际 QA 工作的检查清单

- [ ] 是否通过 `goto` 明确进入了目标页面？
- [ ] 导航后是否检查了 URL 或页面标题？
- [ ] 页面刷新后，数据应该保留还是清空？是否有对应断言？
- [ ] 是否只检查了页面最显眼的区域，遗漏了标题、URL 或其他区域？
- [ ] 是否需要在多个视口尺寸下验证布局？
- [ ] 是否保留了截图、日志或测试报告作为失败证据？
- [ ] 页面操作是否尽量模拟真实用户，而不是过度依赖 `evaluate()` 修改 DOM？
- [ ] 每个关键操作后是否有可验证的预期结果？

## 七、学习与实践建议

1. **先录制，再理解代码**：用 Inspector 录制一个简单流程，把点击、输入、跳转与生成代码逐一对照。
2. **先掌握能力边界，再深入写法**：先知道 `evaluate()` 能解决哪类问题，遇到具体场景时再查具体 JavaScript。
3. **把页面级和元素级分开**：先练 `goto`、`reload`、`title`、`url`、`content`、截图，再练 locator、点击、输入和断言。
4. **少用固定等待**：演示可以 `sleep`，正式测试应使用状态等待和断言等待。
5. **将自动化升级为测试**：每条脚本至少要有一个明确的成功条件，否则只是操作回放。
6. **保留失败证据**：截图、HTML、URL、日志和测试报告分别回答“用户看到了什么”“页面结构是什么”“实际到了哪里”“脚本做了什么”。

## 八、视频结构与内容边界

- **00:00–03:53**：Playwright 学习框架：页面导航、页面内容、页面动作、元素内容、元素动作、断言。
- **03:53–11:58**：页面导航：`goto`、`reload`、前进、后退，以及多次导航的执行逻辑。
- **12:02–21:26**：页面内容：标题、URL、完整 HTML，以及读取内容后进行判断。
- **21:30–35:31**：页面动作：视口大小、截图、执行 JavaScript。
- **35:31–约 58:08**：元素内容与元素动作只作引入，主体转为软件测试课程、项目、就业服务和优惠宣传。

后半段关于课程价格、优惠、就业结果和服务承诺属于视频中的宣传内容，不应当当作 Playwright 技术结论，也不代表本笔记对相关信息进行过独立核验。

## 相关副产物

- [字幕时间轴](https://www.bilibili.com/video/BV17wRQBLEZn?p=3)
- [视频元数据](https://www.bilibili.com/video/BV17wRQBLEZn?p=3)
- [原始字幕 JSON](https://www.bilibili.com/video/BV17wRQBLEZn?p=3)

## 副产物导航

副产物（原始字幕、时间轴转录、元数据）仅存本地，不进公开仓库。来源：[https://www.bilibili.com/video/BV17wRQBLEZn?p=3](https://www.bilibili.com/video/BV17wRQBLEZn?p=3)
