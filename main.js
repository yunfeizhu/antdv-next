import { Button, Tree } from 'antdv-next'
import { createApp, h, ref } from 'vue'

const treeData = [
  { key: 'a', title: '项目文档', children: [{ key: 'a-1', title: '需求说明.md', isLeaf: true }] },
  { key: 'b', title: '设计资源', children: [{ key: 'b-1', title: '界面规范.pdf', isLeaf: true }] },
]
const params = new URLSearchParams(location.search)
const initialKeys = params.get('open') ? params.get('open').split(',') : []
const defaultExpandAll = params.get('defaults') !== 'none'

createApp({
  setup() {
    const expandedKeys = ref([...initialKeys])
    const revision = ref(0)
    const treeProps = () => ({
      treeData,
      virtual: false,
      defaultExpandAll,
      expandedKeys: expandedKeys.value,
      'onUpdate:expandedKeys': keys => { expandedKeys.value = keys },
    })

    return () => h('main', [
      h('h1', 'Tree 与 DirectoryTree 受控展开状态'),
      h('p', [
        '两个组件都传入 ',
        h('code', 'expandedKeys'),
        ' 控制展开状态，并设置 ',
        h('code', `defaultExpandAll=${defaultExpandAll}`),
        '。初始值为空数组时，两棵树都应收起。',
      ]),
      h('div', { class: 'actions' }, [
        h(Button, { type: 'primary', onClick: () => { expandedKeys.value = [] } }, () => '全部收起'),
        h(Button, { onClick: () => { revision.value++ } }, () => '重新挂载'),
      ]),
      h('div', { class: 'trees' }, [
        h('section', { id: 'directory' }, [
          h('h2', 'DirectoryTree'),
          h(Tree.DirectoryTree, { ...treeProps(), key: `directory-${revision.value}` }),
        ]),
        h('section', { id: 'tree' }, [
          h('h2', 'Tree'),
          h(Tree, { ...treeProps(), key: `tree-${revision.value}` }),
        ]),
      ]),
      h('div', { class: 'state', 'aria-live': 'polite' }, [
        '父组件 expandedKeys ',
        h('code', { id: 'expanded-keys' }, JSON.stringify(expandedKeys.value)),
      ]),
    ])
  },
}).mount('#app')
