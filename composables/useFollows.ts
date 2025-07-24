import type {AccountInfo, AuthorInfo} from "~/types/types";
import {StorageSerializers} from "@vueuse/core";

export interface FollowEntry {
    type: 'account' | 'author'
    fakeid: string
    nickname: string
    createdAt: number
    // AccountInfo 特有字段
    alias?: string
    round_head_img?: string
    service_type?: number
    signature?: string
    _loaded?: boolean
}

export default function useFollows() {
    // 使用 localStorage 存储关注列表
    const follows = useLocalStorage<FollowEntry[]>('follows', [], {
        serializer: StorageSerializers.object
    })

    // 添加关注
    const addFollow = async (account: AccountInfo | AuthorInfo): Promise<void> => {
        const followEntry: FollowEntry = {
            type: account.type,
            fakeid: account.fakeid,
            nickname: account.nickname,
            createdAt: Date.now(),
            ...(account.type === 'account' ? {
                alias: account.alias,
                round_head_img: account.round_head_img,
                service_type: account.service_type,
                signature: account.signature,
                _loaded: account._loaded
            } : {})
        }

        // 检查是否已存在
        if (!follows.value.some(f => f.fakeid === account.fakeid)) {
            follows.value.unshift(followEntry)
        }
    }

    // 删除关注
    const removeFollow = (fakeid: string): void => {
        follows.value = follows.value.filter(f => f.fakeid !== fakeid)
    }

    // 检查是否已关注
    const isFollowed = (fakeid: string): boolean => {
        return follows.value.some(f => f.fakeid === fakeid)
    }

    // 获取所有关注
    const getAllFollows = (): FollowEntry[] => {
        return follows.value
    }

    // 搜索关注
    const searchFollows = (query: string): FollowEntry[] => {
        if (!query.trim()) return follows.value

        const keyword = query.toLowerCase()
        return follows.value.filter(follow => 
            follow.nickname.toLowerCase().includes(keyword) ||
            follow.fakeid.toLowerCase().includes(keyword) ||
            (follow.type === 'account' && follow.alias?.toLowerCase().includes(keyword))
        )
    }

    // 获取关注数量
    const getFollowsCount = (): number => {
        return follows.value.length
    }

    // 导出关注列表为JSON
    const exportFollows = (): string => {
        return JSON.stringify(follows.value, null, 2)
    }

    // 从JSON导入关注列表
    const importFollows = (jsonString: string): void => {
        try {
            const imported = JSON.parse(jsonString) as FollowEntry[]
            if (Array.isArray(imported)) {
                follows.value = imported
            }
        } catch (error) {
            console.error('导入关注列表失败:', error)
            throw new Error('JSON格式错误')
        }
    }

    // 下载关注列表为JSON文件
    const downloadFollows = (): void => {
        const dataStr = exportFollows()
        const dataBlob = new Blob([dataStr], {type: 'application/json'})
        const url = URL.createObjectURL(dataBlob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `follows-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        URL.revokeObjectURL(url)
    }

    return {
        follows: readonly(follows),
        addFollow,
        removeFollow,
        isFollowed,
        getAllFollows,
        searchFollows,
        getFollowsCount,
        exportFollows,
        importFollows,
        downloadFollows
    }
} 