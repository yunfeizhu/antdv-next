# Table：恢复勾选后翻页，selectedRows 中的旧记录丢失

独立复现项目，使用 `antdv-next@1.5.4` 和 `vue@3.5.42`。页面只有订单表格及回调结果，没有其他组件问题的演示。

## 运行

需要 Node.js 22.18.0 或更高版本。

```sh
npm install
npm run dev
```

打开终端打印的本地地址。

## 复现步骤

1. 页面初始展示订单 A（100 元），通过 `selectedRowKeys: ['ORDER-A']` 恢复勾选，并启用 `preserveSelectedRowKeys: true`。
2. 点击分页的 **2**，加载第二页订单 B（200 元）。
3. 勾选订单 B。
4. 点击 **计算所选订单金额**。

预期：回调包含 A、B 的完整记录，金额为 300 元。

实际：`selectedRowKeys` 为 `['ORDER-A', 'ORDER-B']`，`selectedRows` 为 `[undefined, B对象]`，按 `row.amount` 计算时报错。

`public/page-1.json` 和 `public/page-2.json` 是虚构订单数据。翻页通过 `fetch` 加载对应 JSON 文件，模拟服务端分页；每次只把当前页数据传给 Table。没有连接真实订单系统。

页面的回调面板保留原始 `undefined`，没有过滤或补全记录。金额计算按钮直接读取回调记录的 `amount` 字段，并把捕获到的错误显示出来。

## 截图

- [修复前：1.5.4 发布包](./before.png)
- [修复后：同样的操作](./after.png)

修复后截图使用同一个页面，将 Table 的依赖切换为 PR 中的源码；页面中的业务逻辑保持一致。

修复代码：[commit eff724e](https://github.com/yunfeizhu/antdv-next/commit/eff724e529230a21a4dbef756f72fc9c1be0a64c)。
