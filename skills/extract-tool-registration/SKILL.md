---
name: extract-tool-registration
description: >
  【网页 Web UI 自动化测试技能 · 仅用于学习与测试】
  在 bibigpt.co 上验证「提取工具」（BibiGPT 字幕提取 API）的账号注册流程与
  开放平台 API Key 获取流程的自动化测试技能。
  覆盖：注册页入口与表单结构、注册交互、开放平台 API Token 提取（掩码显示）、
  Token 有效性验证（HTTP 400/401 判据）、账号登出（CDP 删 cookie）、
  批量注册循环与风控注意点。
  适用：学习 Web UI 自动化、接口鉴权验证、测试环境自建测试账号。
  不适用：任何非学习/测试用途。
  Triggers: "bibigpt 网页注册流程测试", "bibigpt 注册接口验证",
  "bibigpt 测试账号", "提取 bibigpt apikey", "开放平台 apikey",
  "bibigpt token 验证", "Web UI 注册流程自动化测试".
agent_created: true
---

# 提取工具账号注册与 API Key 获取 · Web UI 测试技能

> ⚠️ **用途声明：本技能仅用于学习与测试目的。**
> 本技能是 `media-content-distiller` 的配套技能：先用它注册「提取工具」（BibiGPT）
> 测试账号并取出开放平台 API Token，再由 distiller 用该 Token 获取公开媒体字幕。
> 这是一个网页 **Web UI 自动化测试** 技能：用于验证 bibigpt.co 网页端的
> 注册表单交互、开放平台页面信息获取（API Key）流程是否可用，以及学习
> 浏览器自动化 + 接口鉴权验证的常见模式。
>
> **边界与约定：**
> - 仅创建和操控**自己用于测试/学习**的账号（如 `vidnote.testNN@gmail.com` 这类
>   明确标识的测试账号），不用于任何生产、商业、滥发或干扰他人服务的行为
> - 遵守 bibigpt.co 的服务条款与隐私政策；注册即视为同意其 ToS
> - 测试账号为虚构邮箱（无真实归属），不冒充任何真实用户身份
> - 提取到的 Token 等同账户钥匙，仅保存在本地测试环境，不公开分享
> - 若站点开启验证码/风控/邮箱验证，应停止并尊重其策略，**不要绕过**
>
> 本技能作为 Web UI 测试 + 接口验证的学习样例，任何超出「学习与测试」
> 范围的用途均与本技能编写目的无关。

# 正文：Web UI 注册流程测试与 API Key 获取

本技能在 bibigpt.co 上演练两条被测链路（均属学习型 Web UI 测试）：

1. **注册表单链路**：验证网页端注册表单（邮箱 + 密码×2 + Sign up）从填写到
   落库跳转是否正常，期间覆盖无验证码说明、表单结构、跳转行为等观察点
2. **开放 API Key 链路**：验证开放平台页面能否正确显示/掩码/明文切换
   API Token，并验证 Token 经 Bearer 鉴权后是否可通过接口校验
   （HTTP 400/401 判据）

> 说明：注册时「邮箱 = 密码」只是测试账号的简化策略，便于测试人员自己
> 管理测试凭据；当前站点未启用验证码/邮箱验证，若日后启用则停止测试。

## 适用场景

- 学习/测试 **Web UI 注册流程自动化**（表单填写、提交、状态跳转验证）
- 学习/测试 **登录后页面信息获取**（掩码字段、点击显示明文等交互）
- 学习/测试 **接口鉴权验证**（Bearer Token 有效性判据：400 vs 401）
- 为测试环境批量准备**自有的测试账号**（每个账号独立 120 分钟 API 余额）
- 已注册测试账号失效/忘记，重走一遍该流程

## 前置条件

- `ego-browser` 可用（浏览器自动化，继承用户登录态但相互隔离）
- `curl` 可用（Token 有效性验证）
- 注册策略：邮箱 = 密码（整串当作密码），如 `vidnote.test09@gmail.com`
  - 密码字段无强度校验，邮箱+@ 符号可直接作为密码
  - 邮箱格式任意合法邮箱即可，无需真实存在（无验证邮件）

## 关键事实（实测 2026-09，勿改，除非页面变更）

| 项目 | 值 |
|---|---|
| 注册页入口 | `https://bibigpt.co/en/signup`（会被重定向） |
| 实际注册页 | `https://bibigpt.co/en/user/login`（登录注册同页，含 Sign up 表单） |
| 表单结构 | 3 个 input：email + password ×2（确认密码），无验证码 |
| 注册按钮 | 文本 `Sign up` |
| 开放平台页 | `https://bibigpt.co/user/integration`（账户菜单「开放平台」） |
| Token 输入框 | `input[readonly]`，默认显示 `************` 掩码 |
| 显示明文 | 点眼睛按钮（`button` 内含 `svg.lucide-eye`） |
| 认证 cookie | `sb-hxtizkasyxsfnzgphrtk-auth-token`（httponly，JS 删不掉） |
| API Base | `https://api.bibigpt.co`，认证 `Authorization: Bearer <token>` |
| 新账号额度 | 120 分钟 API 余额（网页端同额度） |

## 流程 A：注册单个账号 + 提取 Token（推荐路径）

使用 ego-browser heredoc，每轮执行一个账号。以下为单账号完整脚本骨架：

```bash
ego-browser nodejs <<'EOF'
const task = await useOrCreateTaskSpace('bibigpt account <n>')
const email = 'vidnote.testNN@gmail.com'

// 1. 注册（已登录态必须先登出，见流程 C）
await gotoAndWait('https://bibigpt.co/en/user/login', { timeout: 25 })
await wait(2)
const r = await js(String.raw`(() => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  const inputs = [...document.querySelectorAll('input')]
  const emailInput = inputs[0], pwd = inputs.filter(i => i.type === 'password')
  if (!emailInput || pwd.length < 2) return 'form missing'
  setter.call(emailInput, ${JSON.stringify(email)})
  emailInput.dispatchEvent(new Event('input', { bubbles: true }))
  pwd.forEach(p => {
    setter.call(p, ${JSON.stringify(email)})
    p.dispatchEvent(new Event('input', { bubbles: true }))
  })
  const btn = [...document.querySelectorAll('button')].find(b => (b.innerText || '').trim() === 'Sign up')
  if (btn) { btn.click(); return 'ok' }
  return 'no signup btn'
})()`)
// 2. 等跳转到 /desktop 即注册成功（最多 ~30s 轮询）
// 3. 进开放平台
await gotoAndWait('https://bibigpt.co/user/integration', { timeout: 25 })
await waitForElement('input[readonly]', { timeout: 30 })
await wait(2)
let token = await js(String.raw`(() => document.querySelector('input[readonly]')?.value || null)()`)
if (token === '************') {
  await js(String.raw`(() => { const eye = [...document.querySelectorAll('button')].find(b => b.querySelector('svg.lucide-eye')); if (eye) eye.click() })()`)
  await wait(1.5)
  token = await js(String.raw`(() => document.querySelector('input[readonly]')?.value || null)()`)
}
cliLog('TOKEN: ' + token)
EOF
```

### 表单填写要点

- 用 DOM `value` setter + dispatch `input` 事件填表（fillInput 对第二个密码框容易失手）
- 确认密码框必须填，否则 Sign up 无反应（页面 URL 不跳转）
- 提交后轮询 `pageInfo().url` 是否包含 `/desktop`，最多等 15×2s

## 流程 B：验证 Token 有效性（不消耗余额）

**判据（不消耗任何 API 余额）：**

```
curl -s -o /dev/null -w "%{http_code}" "https://api.bibigpt.co/api/v1/express" \
  -H "Authorization: Bearer <token>"
```

| HTTP | 含义 |
|---|---|
| 400 `Input validation failed` | **token 有效**（鉴权通过，仅缺 url 参数） |
| 401 `UNAUTHORIZED` | token 无效 / 未配置 |

也可以带 url 真实调用（会消耗余额，代价 = 视频时长）：
`GET https://api.bibigpt.co/api/v1/express?url=...` 返回 200 + `success: true`。

批量验证脚本（见 `scripts/verify-tokens.sh`，从 `<email> <token>` 两列文件读取）。

## 流程 C：登出（难点，UI 菜单不可靠）

**现象：** 桌面页用户按钮点击后下拉菜单偶尔不渲染（Radix portal 未挂载），
`div[role="menuitem"]` 找不到，UI 登出走不通。

**可靠做法：CDP 删除认证 cookie（httponly，JS document.cookie 删不掉）：**

```js
await cdp('Network.deleteCookies', { name: 'sb-hxtizkasyxsfnzgphrtk-auth-token', url: 'https://bibigpt.co' })
await js(String.raw`(() => { localStorage.removeItem('zustand-storage'); localStorage.removeItem('bibigpt:last-login-method'); return true })()`)
await gotoAndWait('https://bibigpt.co/desktop', { timeout: 25 })
await wait(2)
// 验证：body 内无 gmail 邮箱文本即为登出成功
```

### 登出后确认

```js
const st = await js(String.raw`(() => {
  const t = document.body.innerText
  return { email: (t.match(/[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}/i) || [null])[0] }
})()`)
// st.email === null 则已登出，可注册下一个
```

**登出必须做**：未登出时访问 `/en/user/login` 会直接留在已登录态/被重定向，
且新注册的表单不出现（表现为 `form missing`）。

## 流程 D：批量注册（每账号 3 步循环）

```
循环 N 次：
  1. registerAndToken(email)  — 注册 + 进开放平台 + 点眼睛取 token
  2. verifyToken(token)       — curl 400 判据（在 bash 侧做）
  3. logoutViaCookie()        — CDP 删 cookie + 清 localStorage
```

- 一次 heredoc 循环 3 个账号较稳（每个约 20~40s），避免单轮超时
- 账号命名建议 `前缀+testNN`：`vidnote.test01@gmail.com` ~ `vidnote.test10@gmail.com`
- 全部用同一任务空间，`useOrCreateTaskSpace('batch bibigpt test accounts')`
- 实测 10 连注册 0 风控、0 失败；重复注册已存在邮箱是唯一失败模式（页面无提示，仍停留登录页）

## 页面 / 接口变更探测

- 注册页入口若 404/重定向变化：curl 探测 `/en/signup`、`/signup`、`/en/user/login`
- 开放平台菜单入口：账户头像下拉里「开放平台」→ `/user/integration`
- 页面若大改，先 `snapshotText()` + DOM dump 重新定位 input/按钮
- API 文档：`https://docs.bibigpt.co/api-reference/introduction`（Mintlify 构建，正文在 HTML 源码里）

## 输出物

每次实验建议保存一份账号清单（`邮箱 密码=邮箱 token` 三列），供后续复用与验证：
文件可放在项目目录如 `bibigpt-accounts.md`，并对 token 标注「等同账户钥匙，勿公开分享」。
