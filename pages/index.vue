<template>
  <div class="flex h-screen overflow-hidden">
    <!-- 左侧关注公众号侧边栏 -->
    <div class="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">关注列表</h2>
          <div class="flex space-x-2">
            <button
              @click="downloadFollows"
              class="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
              title="导出关注列表"
            >
              导出
            </button>
            <button
              @click="showAddModal = true"
              class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
            >
              添加关注
            </button>
          </div>
        </div>
        
        <!-- 搜索框 -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索公众号..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div class="absolute right-3 top-2.5 text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- 关注列表 -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="filteredFollows.length === 0" class="p-4 text-center text-gray-500">
          <div class="mb-2">
            <svg class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <p>还没有关注任何公众号</p>
          <p class="text-sm mt-1">点击"添加关注"开始关注</p>
        </div>
        
        <div v-else>
          <div
            v-for="follow in filteredFollows"
            :key="follow.fakeid"
            @click="selectFollow(follow)"
            class="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
            :class="{ 'bg-blue-50 border-blue-200': activeAccount?.fakeid === follow.fakeid }"
          >
            <div class="flex items-center space-x-3">
                             <img
                 :src="(follow.type === 'account' ? follow.round_head_img : '') || '/default-avatar.png'"
                 :alt="follow.nickname"
                 class="w-10 h-10 rounded-full"
               />
               <div class="flex-1 min-w-0">
                 <h3 class="font-medium text-gray-900 truncate">{{ follow.nickname }}</h3>
                 <p class="text-sm text-gray-500 truncate">{{ (follow.type === 'account' ? follow.signature : '') || '暂无描述' }}</p>
                 <div class="flex items-center space-x-2 mt-1">
                   <span class="text-xs text-gray-400">{{ follow.type === 'account' && follow.service_type ? ACCOUNT_TYPE[follow.service_type] : '未知类型' }}</span>
                   <span class="text-xs text-gray-400">•</span>
                   <span class="text-xs text-gray-400">{{ (follow.type === 'account' ? follow.alias : '') || '未设置微信号' }}</span>
                 </div>
               </div>
              <div class="flex items-center space-x-2">
                <button
                  @click.stop="removeFollow(follow)"
                  class="p-1 text-gray-400 hover:text-red-500"
                  title="取消关注"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右侧主内容区域 -->
    <div id="app" class="flex flex-col flex-1 h-screen overflow-hidden">
      <Header
          @select:account="selectAccount"
          @search:article="searchArticle"
          @toggle:deleted="toggleDeleted"
      />
      <ArticleList v-if="activeAccount" :hide-deleted="hideDeleted" ref="articleListRef" class="flex-1 overflow-y-scroll"/>
    </div>
    
    <!-- 添加关注弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">添加关注</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">公众号名称或biz号</label>
            <input
              v-model="newFollowInput"
              type="text"
              placeholder="请输入公众号名称或biz号"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div class="border-t pt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">或导入关注列表</label>
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              @change="handleFileImport"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">选择之前导出的JSON文件</p>
          </div>
          <div class="flex justify-end space-x-2">
            <button
              @click="showAddModal = false"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              @click="addFollow"
              :disabled="!newFollowInput.trim() || addingFollow"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              <span v-if="addingFollow">添加中...</span>
              <span v-else>添加</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type ArticleList from "~/components/ArticleList.vue";
import type {AccountInfo, AuthorInfo} from "~/types/types";
import {getAccountList} from "~/apis";
import {ACCOUNT_TYPE} from "~/config";
import useFollows, {type FollowEntry} from "~/composables/useFollows";

definePageMeta({
  layout: false
})

useHead({
  title: '微信公众号文章导出'
})

const loginAccount = useLoginAccount()
const activeAccount = useActiveAccount()
const articleListRef = ref<typeof ArticleList | null>(null)

// 关注功能的响应式数据
const searchQuery = ref('')
const showAddModal = ref(false)
const newFollowInput = ref('')
const addingFollow = ref(false)

// 使用关注列表组合式函数
const { 
  follows, 
  addFollow: addFollowToList, 
  removeFollow: removeFollowFromList, 
  isFollowed, 
  searchFollows, 
  downloadFollows,
  exportFollows,
  importFollows
} = useFollows()

// 计算属性 - 过滤后的关注列表
const filteredFollows = computed(() => {
  if (!searchQuery.value) return follows.value
  return follows.value.filter((follow: FollowEntry) => 
    follow.nickname.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (follow.type === 'account' && follow.alias?.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    follow.fakeid.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 原有的文章列表功能
const hideDeleted = ref(false)
function toggleDeleted(hide: boolean) {
  hideDeleted.value = hide
}

function selectAccount() {
  articleListRef.value?.init()
}

function searchArticle(query: string) {
  articleListRef.value?.init(query)
}

// 关注功能方法
const selectFollow = (follow: FollowEntry) => {
  // 转换为 AccountInfo 或 AuthorInfo 类型
  const accountInfo: AccountInfo | AuthorInfo = follow.type === 'account' 
    ? {
        type: 'account',
        fakeid: follow.fakeid,
        nickname: follow.nickname,
        alias: follow.alias || '',
        round_head_img: follow.round_head_img || '',
        service_type: follow.service_type || 0,
        signature: follow.signature || '',
        _loaded: follow._loaded
      }
    : {
        type: 'author',
        fakeid: follow.fakeid,
        nickname: follow.nickname
      }
  
  activeAccount.value = accountInfo
  nextTick(() => {
    selectAccount()
  })
}

const removeFollow = (follow: FollowEntry) => {
  if (confirm(`确定要取消关注"${follow.nickname}"吗？`)) {
    removeFollowFromList(follow.fakeid)
    
    // 如果取消关注的是当前选中的公众号，清空选中状态
    if (activeAccount.value?.fakeid === follow.fakeid) {
      activeAccount.value = null
    }
  }
}

// 文件导入处理
const fileInput = ref<HTMLInputElement>()

const handleFileImport = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      importFollows(content)
      alert(`成功导入 ${follows.value.length} 个关注`)
      showAddModal.value = false
      
      // 清空文件输入
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    } catch (error) {
      console.error('导入失败:', error)
      alert('导入失败：' + (error as Error).message)
    }
  }
  reader.readAsText(file)
}

const addFollow = async () => {
  if (!newFollowInput.value.trim()) return
  
  addingFollow.value = true
  
  try {
    // 使用现有的搜索API来查找公众号
    const [accounts] = await getAccountList(loginAccount.value.token, 0, newFollowInput.value.trim())
    
    if (accounts.length === 0) {
      alert('未找到该公众号，请检查名称或biz号是否正确')
      return
    }
    
    // 取第一个搜索结果
    const account = accounts[0]
    
    // 检查是否已经关注
    if (await isFollowed(account.fakeid)) {
      alert('该公众号已在关注列表中')
      return
    }
    
    // 添加到关注列表
    await addFollowToList(account)
    
    // 清空输入框并关闭弹窗
    newFollowInput.value = ''
    showAddModal.value = false
    
    alert(`成功关注"${account.nickname}"`)
  } catch (error: any) {
    console.error('添加关注失败:', error)
    alert('添加关注失败: ' + (error.message || '未知错误'))
  } finally {
    addingFollow.value = false
  }
}
</script>
