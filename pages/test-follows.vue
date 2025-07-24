<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">关注功能测试</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 测试操作区 -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">测试操作</h2>
        
        <div class="space-y-2">
          <button
            @click="addTestFollow"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
          >
            添加测试关注
          </button>
          
          <button
            @click="downloadFollows"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
          >
            导出关注列表
          </button>
          
          <div>
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              @change="handleFileImport"
              class="w-full px-3 py-2 border border-gray-300 rounded"
            />
            <p class="text-sm text-gray-500 mt-1">选择JSON文件导入</p>
          </div>
          
          <button
            @click="clearAll"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full"
          >
            清空所有关注
          </button>
        </div>
        
        <div class="mt-4 p-4 bg-gray-100 rounded">
          <h3 class="font-semibold mb-2">统计信息</h3>
          <p>关注总数: {{ getFollowsCount() }}</p>
          <p>存储方式: localStorage</p>
        </div>
      </div>
      
      <!-- 关注列表显示区 -->
      <div>
        <h2 class="text-lg font-semibold mb-4">关注列表 ({{ follows.length }})</h2>
        
        <div class="mb-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索关注..."
            class="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="follow in filteredFollows"
            :key="follow.fakeid"
            class="p-3 border rounded flex items-center justify-between"
          >
            <div>
              <h4 class="font-medium">{{ follow.nickname }}</h4>
              <p class="text-sm text-gray-500">{{ follow.fakeid }}</p>
              <p class="text-xs text-gray-400">
                {{ follow.type }} | {{ new Date(follow.createdAt).toLocaleString() }}
              </p>
            </div>
            <button
              @click="removeFollow(follow.fakeid)"
              class="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              删除
            </button>
          </div>
          
          <div v-if="filteredFollows.length === 0" class="text-center text-gray-500 py-8">
            {{ searchQuery ? '没有找到匹配的关注' : '还没有任何关注' }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 原始数据展示 -->
    <div class="mt-8">
      <h2 class="text-lg font-semibold mb-4">原始数据 (JSON)</h2>
      <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">{{ exportFollows() }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import useFollows from "~/composables/useFollows";

definePageMeta({
  layout: false
})

useHead({
  title: '关注功能测试'
})

const {
  follows,
  addFollow,
  removeFollow,
  searchFollows,
  downloadFollows,
  exportFollows,
  importFollows,
  getFollowsCount
} = useFollows()

const searchQuery = ref('')
const fileInput = ref<HTMLInputElement>()

// 计算过滤后的关注列表
const filteredFollows = computed(() => {
  return searchFollows(searchQuery.value)
})

// 添加测试关注
const addTestFollow = async () => {
  const testAccount = {
    type: 'account' as const,
    fakeid: `test_${Date.now()}`,
    nickname: `测试公众号_${Date.now()}`,
    alias: 'test_alias',
    round_head_img: 'https://via.placeholder.com/40',
    service_type: 1,
    signature: '这是一个测试公众号',
    _loaded: true
  }
  
  try {
    await addFollow(testAccount)
    alert(`成功添加关注: ${testAccount.nickname}`)
  } catch (error) {
    alert('添加失败: ' + (error as Error).message)
  }
}

// 文件导入处理
const handleFileImport = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      importFollows(content)
      alert(`成功导入 ${follows.value.length} 个关注`)
      
      // 清空文件输入
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    } catch (error) {
      alert('导入失败：' + (error as Error).message)
    }
  }
  reader.readAsText(file)
}

// 清空所有关注
const clearAll = () => {
  if (confirm('确定要清空所有关注吗？')) {
    // 通过删除所有关注来清空
    const allFakeids = follows.value.map((f: any) => f.fakeid)
    allFakeids.forEach((fakeid: string) => removeFollow(fakeid))
    alert('已清空所有关注')
  }
}
</script> 