import { Badge } from '@/types';

export const badgeTemplates: Omit<Badge, 'userId' | 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'badge-001',
    name: '初来乍到',
    icon: '🌟',
    description: '完成首次签到',
    condition: '签到1天',
    rarity: 'common',
  },
  {
    id: 'badge-002',
    name: '坚持不懈',
    icon: '🔥',
    description: '连续签到7天',
    condition: '连续签到7天',
    rarity: 'rare',
  },
  {
    id: 'badge-003',
    name: '签到达人',
    icon: '👑',
    description: '连续签到30天',
    condition: '连续签到30天',
    rarity: 'epic',
  },
  {
    id: 'badge-004',
    name: '分享使者',
    icon: '📤',
    description: '分享10次正版章节',
    condition: '分享10次',
    rarity: 'common',
  },
  {
    id: 'badge-005',
    name: '阅读新星',
    icon: '📚',
    description: '累计阅读10章',
    condition: '阅读10章',
    rarity: 'common',
  },
  {
    id: 'badge-006',
    name: '阅读狂人',
    icon: '📖',
    description: '累计阅读100章',
    condition: '阅读100章',
    rarity: 'rare',
  },
  {
    id: 'badge-007',
    name: '漫协成员',
    icon: '🤝',
    description: '加入一个队伍',
    condition: '加入队伍',
    rarity: 'common',
  },
  {
    id: 'badge-008',
    name: '团队领袖',
    icon: '🏆',
    description: '创建并完成一个组队任务',
    condition: '创建并完成组队任务',
    rarity: 'epic',
  },
  {
    id: 'badge-009',
    name: '正版卫士',
    icon: '🛡️',
    description: '用券阅读5部正版作品',
    condition: '用券阅读5部作品',
    rarity: 'rare',
  },
  {
    id: 'badge-010',
    name: '省钱小能手',
    icon: '💰',
    description: '累计节省100元',
    condition: '累计节省100元',
    rarity: 'epic',
  },
  {
    id: 'badge-011',
    name: '漫迷收藏家',
    icon: '🎖️',
    description: '解锁全部漫画分类',
    condition: '选择全部6个分类',
    rarity: 'rare',
  },
  {
    id: 'badge-012',
    name: '传说级漫迷',
    icon: '⭐',
    description: '解锁所有徽章',
    condition: '解锁所有徽章',
    rarity: 'legendary',
  },
];

export const rarityColors: Record<Badge['rarity'], string> = {
  common: 'from-gray-300 to-gray-400',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

export const rarityLabels: Record<Badge['rarity'], string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};
