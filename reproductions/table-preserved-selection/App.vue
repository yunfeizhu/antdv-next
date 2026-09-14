<script setup lang="ts">
import { Alert, Button, Table, Tag } from 'antdv-next'
import { computed, ref } from 'vue'

interface Order {
  key: string
  name: string
  customer: string
  amount: number
}

const initialOrder: Order = { key: 'ORDER-A', name: '订单 A', customer: '示例客户甲', amount: 100 }
const dataSource = ref<Order[]>([initialOrder])
const selectedRowKeys = ref<string[]>(['ORDER-A'])
const selectedRows = ref<(Order | undefined)[]>([initialOrder])
const current = ref(1)
const loading = ref(false)
const calculation = ref<number | undefined>(100)
const calculationError = ref('')
const eventReceived = ref(false)
const buildLabel = import.meta.env.VITE_BUILD_LABEL || 'antdv-next 1.5.4（npm 发布版）'
const columns = [
  { title: '订单编号', dataIndex: 'key', width: 170 },
  { title: '订单名称', dataIndex: 'name', width: 110 },
  { title: '客户', dataIndex: 'customer' },
  { title: '金额（元）', dataIndex: 'amount', width: 120 },
]

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  preserveSelectedRowKeys: true,
  onChange(keys: (string | number)[], rows: Order[]) {
    selectedRowKeys.value = keys as string[]
    selectedRows.value = rows
    eventReceived.value = true
    calculation.value = undefined
    calculationError.value = ''
  },
}))

async function changePage(page: number) {
  loading.value = true
  try {
    const response = await fetch(`/page-${page}.json`)
    if (!response.ok)
      throw new Error(`HTTP ${response.status}`)
    dataSource.value = await response.json()
    current.value = page
  }
  finally {
    loading.value = false
  }
}

function calculateAmount() {
  calculationError.value = ''
  try {
    calculation.value = selectedRows.value.reduce((sum, row) => sum + row!.amount, 0)
  }
  catch (error) {
    calculation.value = undefined
    calculationError.value = (error as Error).message
  }
}

const callbackText = computed(() => {
  if (!eventReceived.value)
    return '尚未触发 onChange；订单 A 已通过 selectedRowKeys 恢复勾选。'
  const rows = selectedRows.value.map(row => row === undefined ? '  undefined' : `  ${JSON.stringify(row)}`)
  return `selectedRowKeys = ${JSON.stringify(selectedRowKeys.value)}\n\nselectedRows = [\n${rows.join(',\n')}\n]`
})
const missingCount = computed(() => selectedRows.value.filter(row => row === undefined).length)
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand-mark">
        O
      </div>
      <strong>订单管理示例</strong>
      <span class="topbar-label">Table 跨页选择复现</span>
    </header>
    <main>
      <div class="breadcrumb">
        结算管理 <span>/</span> 编辑草稿 <span>/</span> 选择订单
      </div>
      <div class="page-heading">
        <div>
          <h1>选择结算订单</h1>
          <p>恢复草稿中的订单 A，翻到第二页添加订单 B，再计算金额。</p>
        </div>
        <Tag color="blue">
          {{ buildLabel }}
        </Tag>
      </div>
      <Alert
        type="info"
        show-icon
        message="草稿已恢复：订单 A（100 元）已勾选"
        description="已开启 preserveSelectedRowKeys；翻页时 dataSource 只包含当前页订单。"
      />
      <div class="steps">
        <span><b>1</b> 点击第 2 页</span>
        <span><b>2</b> 勾选订单 B</span>
        <span><b>3</b> 点击「计算所选订单金额」</span>
      </div>
      <section class="card orders-card">
        <div class="card-heading">
          <h2>待结算订单</h2><span>共 2 条 · 每页 1 条</span>
        </div>
        <Table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :row-selection="rowSelection"
          :pagination="{ current, pageSize: 1, total: 2, showSizeChanger: false, onChange: changePage }"
        />
      </section>
      <div class="result-grid">
        <section class="card summary-card">
          <h2>结算预览</h2>
          <div class="summary-line">
            <span>已选订单</span><strong id="selected-count">{{ selectedRowKeys.length }} 笔</strong>
          </div>
          <div class="summary-line">
            <span>金额合计</span><strong id="amount" class="amount">{{ calculation === undefined ? '—' : `¥ ${calculation.toFixed(2)}` }}</strong>
          </div>
          <Button id="calculate" type="primary" block @click="calculateAmount">
            计算所选订单金额
          </Button>
          <Alert
            v-if="calculationError"
            id="calculation-error"
            type="error"
            show-icon
            message="无法计算金额：已选订单的记录缺失"
            :description="calculationError"
          />
          <Alert
            v-else-if="eventReceived && calculation !== undefined"
            id="calculation-success"
            type="success"
            show-icon
            message="记录完整，金额计算成功"
          />
          <p class="expected">
            选中 A 和 B 时，预期合计为 300.00 元。
          </p>
        </section>
        <section class="card callback-card">
          <div class="card-heading">
            <h2>onChange 实际返回</h2>
            <Tag v-if="eventReceived" :color="missingCount ? 'red' : 'green'">
              {{ missingCount ? `${missingCount} 条记录缺失` : '记录完整' }}
            </Tag>
          </div>
          <pre id="callback-output">{{ callbackText }}</pre>
          <p class="callback-note">
            此处原样展示回调中的记录；undefined 没有被过滤或补全。
          </p>
        </section>
      </div>
      <footer>本地复现示例 · 虚构订单数据 · 刷新页面可重新开始</footer>
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1f2937;
  background: #f5f7fa;
}
.topbar {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 42px;
  background: #fff;
  border-bottom: 1px solid #e6eaf0;
}
.brand-mark {
  height: 30px;
  width: 30px;
  border-radius: 8px;
  background: #1677ff;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
}
.topbar-label {
  margin-left: auto;
  color: #7c8798;
  font-size: 13px;
}
main {
  max-width: 1120px;
  margin: 0 auto;
  padding: 25px 28px 16px;
}
.breadcrumb {
  color: #8a94a5;
  font-size: 13px;
  margin-bottom: 16px;
}
.breadcrumb span {
  padding: 0 10px;
  color: #b9c1cf;
}
.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
h1 {
  font-size: 25px;
  font-weight: 650;
  margin: 0 0 8px;
}
.page-heading p {
  margin: 0;
  color: #66758a;
  font-size: 14px;
}
.steps {
  display: flex;
  align-items: center;
  gap: 35px;
  padding: 18px 4px;
  font-size: 13px;
  color: #506178;
}
.steps b {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  margin-right: 7px;
  background: #e6f0ff;
  color: #1677ff;
}
.card {
  border: 1px solid #e3e8ef;
  border-radius: 10px;
  background: #fff;
  padding: 20px 24px;
}
.card-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.card-heading > span {
  color: #8390a2;
  font-size: 12px;
}
h2 {
  font-size: 16px;
  margin: 0;
  font-weight: 650;
}
.orders-card {
  padding-bottom: 2px;
}
.result-grid {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 18px;
  margin-top: 18px;
}
.summary-card > h2 {
  margin-bottom: 15px;
}
.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 14px 0;
  font-size: 14px;
}
.summary-line > span {
  color: #748196;
}
.amount {
  font-size: 24px;
  font-variant-numeric: tabular-nums;
}
.summary-card .ant-alert {
  margin-top: 14px;
}
.summary-card .ant-alert-description {
  overflow-wrap: anywhere;
  font-size: 12px;
}
.expected,
.callback-note {
  font-size: 12px;
  color: #8a94a5;
  margin: 12px 0 0;
  line-height: 1.6;
}
pre {
  margin: 0;
  padding: 16px;
  background: #f7f9fc;
  border: 1px solid #edf0f5;
  border-radius: 7px;
  font:
    12px/1.8 ui-monospace,
    SFMono-Regular,
    Consolas,
    monospace;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  min-height: 188px;
}
footer {
  text-align: center;
  color: #a1a9b7;
  font-size: 12px;
  padding-top: 17px;
}
@media (max-width: 800px) {
  main {
    padding: 20px 16px;
  }
  .result-grid {
    grid-template-columns: 1fr;
  }
  .steps {
    gap: 12px;
    flex-wrap: wrap;
  }
  .page-heading {
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
