import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  LogIn,
  Copy,
  Check,
  Crown,
  Shield,
  Calendar,
  Gift,
  AlertTriangle,
  UserPlus,
  Sparkles,
  History,
  BarChart3,
  Zap,
  ChevronDown,
  ChevronUp,
  BookOpen,
  PartyPopper,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import TeamModal from '@/components/Modals/TeamModal';
import ProgressBar from '@/components/ProgressBar';
import { formatDateCN, formatDateWithWeek, getToday } from '@/utils/date';
import type { CartItem } from '@/types';

const Team = () => {
  const {
    currentTeam,
    user,
    teams: allTeams,
    teamCheckIn,
    claimTeamReward,
    leaveTeam,
    joinTeam,
    refreshDailyState,
    inviteRandomMember,
    simulateTeamMemberCheckIn,
    simulateTeamMemberReading,
    useCaptainDailySupply,
  } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [showSupplyPanel, setShowSupplyPanel] = useState(false);
  const [expandedHistoryDate, setExpandedHistoryDate] = useState<string | null>(null);

  useEffect(() => {
    refreshDailyState();
  }, []);

  const handleCopyCode = () => {
    if (currentTeam) {
      navigator.clipboard.writeText(currentTeam.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSupply = (memberId: string, supplyType: 'checkIn' | 'reading') => {
    useCaptainDailySupply(memberId, supplyType);
    setShowSupplyPanel(false);
  };

  const toggleHistoryDate = (date: string) => {
    setExpandedHistoryDate(expandedHistoryDate === date ? null : date);
  };

  const myMember = currentTeam?.members.find((m) => m.id === user.id);
  const isLeader = currentTeam?.members[0]?.id === user.id;
  const memberCount = currentTeam?.members.length || 0;
  const minMembers = 3;
  const needsMore = Math.max(0, minMembers - memberCount);
  const canUnlockProgress = memberCount >= minMembers;

  const availableTeams = allTeams.filter(
    (t) => !t.members.some((m) => m.id === user.id) && t.members.length < 5
  );

  const todayRecord = currentTeam
    ? {
        date: getToday(),
        members: currentTeam.members.map((m) => ({
          memberId: m.id,
          memberName: m.name,
          memberAvatar: m.avatar,
          checkedIn: m.todayChecked,
          checkInSource: m.checkInSource,
          readingChapters: m.todayReadingChapters || 0,
          readingSource: m.readingSource,
        })),
        allChecked: currentTeam.members.every((m) => m.todayChecked),
        isToday: true,
        captainSupplyUsed: currentTeam.captainDailySupplyUsed,
      }
    : null;

  const displayHistory = todayRecord
    ? [todayRecord, ...(currentTeam?.dailyHistory || [])].slice(0, 7)
    : currentTeam?.dailyHistory?.slice(0, 7) || [];

  const nonLeaderMembers = currentTeam?.members.filter((_, index) => index !== 0) || [];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-manga-pink via-primary-500 to-manga-purple p-8 text-white animate-fade-in-up">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <h1 className="font-display text-4xl font-bold mb-2 drop-shadow-lg">
            组队任务
          </h1>
          <p className="text-white/80 text-lg">
            和小伙伴一起打卡，解锁全队专属补给券！
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 animate-fade-in-up stagger-1">
        <div className="flex items-start gap-3">
          <Shield className="text-blue-500 flex-shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-bold text-blue-700 mb-1">
              📢 正版阅读声明
            </h3>
            <p className="text-sm text-blue-600">
              本活动所有券包仅限用于平台内正版漫画章节。支持正版阅读，尊重创作者劳动，从我做起！让我们一起抵制盗版，营造良好的阅读环境。
            </p>
          </div>
        </div>
      </div>

      {currentTeam ? (
        <div className="space-y-6 animate-fade-in-up stagger-2">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-display text-2xl font-bold text-dark-800">
                    {currentTeam.name}
                  </h2>
                  {isLeader && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                      <Crown size={12} />
                      队长
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-dark-500">
                  <span>队伍码：</span>
                  <code className="px-2 py-1 bg-dark-100 rounded font-mono font-bold text-primary-600">
                    {currentTeam.code}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 hover:bg-dark-100 rounded-full transition-colors"
                  >
                    {copied ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} className="text-dark-400" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm font-medium">
                  {currentTeam.members.length}/5 人
                </span>
                <button
                  onClick={leaveTeam}
                  className="px-4 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  退出队伍
                </button>
              </div>
            </div>

            <div className="mb-6">
              <ProgressBar
                progress={currentTeam.currentDays}
                total={currentTeam.targetDays}
                label="全队共同阅读天数"
                color="pink"
                size="lg"
              />
              <div className="mt-2 space-y-1">
                {!canUnlockProgress && (
                  <p className="text-sm text-orange-600 font-medium flex items-center gap-1">
                    <AlertTriangle size={14} />
                    队伍还差 {needsMore} 人才能解锁全队奖励进度，快邀请小伙伴加入吧！
                  </p>
                )}
                <p className="text-sm text-dark-500">
                  开始于 {formatDateCN(currentTeam.startDate)}
                  {canUnlockProgress
                    ? `，还需 ${currentTeam.targetDays - currentTeam.currentDays} 天解锁奖励`
                    : '（当前进度仅作展示，凑齐3人后开始累计有效天数）'}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-dark-700 mb-3 flex items-center gap-2">
                <Users size={18} />
                队伍成员
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {currentTeam.members.map((member, index) => (
                  <div
                    key={member.id}
                    className={`relative p-4 rounded-2xl text-center transition-all ${
                      member.todayChecked
                        ? 'bg-green-50 border-2 border-green-200'
                        : 'bg-dark-50 border-2 border-transparent'
                    }`}
                  >
                    {index === 0 && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <Crown size={20} className="text-yellow-500" />
                      </div>
                    )}
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-14 h-14 rounded-full mx-auto mb-2 border-2 border-white shadow-md"
                    />
                    <p className="font-medium text-dark-800 text-sm truncate">
                      {member.name}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1 ${
                        member.todayChecked
                          ? member.checkInSource === 'captain'
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-green-100 text-green-600'
                          : 'bg-dark-100 text-dark-500'
                      }`}
                    >
                      {member.todayChecked ? (
                        member.checkInSource === 'captain' ? (
                          <>🎁 队长补给</>
                        ) : (
                          <><Check size={12} /> 已打卡</>
                        )
                      ) : (
                        '未打卡'
                      )}
                    </span>
                    {member.todayReadingChapters > 0 && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1 ${
                          member.readingSource === 'captain'
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-primary-50 text-primary-600'
                        }`}
                      >
                        {member.readingSource === 'captain' ? (
                          <>📖 队长补给阅读</>
                        ) : (
                          <>📖 今日阅读{member.todayReadingChapters}章</>
                        )}
                      </span>
                    )}
                  </div>
                ))}
                {currentTeam.members.length < 5 && (
                  <div className="p-4 rounded-2xl border-2 border-dashed border-primary-300 text-center bg-primary-50/30">
                    <UserPlus size={28} className="mx-auto mb-2 text-primary-400" />
                    <p className="text-sm font-medium text-primary-600 mb-2">邀请室友/社团同学</p>
                    {isLeader && (
                      <button
                        onClick={inviteRandomMember}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow hover:shadow-md hover:scale-105 active:scale-95 transition-all"
                      >
                        <Sparkles size={12} />
                        一键邀请
                      </button>
                    )}
                    <p
                      onClick={() => setShowModal(true)}
                      className="text-xs text-primary-400 mt-2 cursor-pointer hover:text-primary-600 transition-colors"
                    >
                      或分享队伍码邀请
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center relative">
              <button
                onClick={teamCheckIn}
                disabled={myMember?.todayChecked}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg transition-all ${
                  myMember?.todayChecked
                    ? 'bg-dark-100 text-dark-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                }`}
              >
                <Calendar size={20} />
                {myMember?.todayChecked ? '今日已打卡' : '今日打卡'}
              </button>

              {isLeader && (
                <>
                  <button
                    onClick={() => !currentTeam.captainDailySupplyUsed && setShowSupplyPanel(!showSupplyPanel)}
                    disabled={currentTeam.captainDailySupplyUsed}
                    className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg transition-all relative ${
                      currentTeam.captainDailySupplyUsed
                        ? 'bg-dark-100 text-dark-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-manga-purple to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                    }`}
                  >
                    <PartyPopper size={20} />
                    {currentTeam.captainDailySupplyUsed ? '今日补给已用完' : '队长补给'}
                  </button>

                  {showSupplyPanel && !currentTeam.captainDailySupplyUsed && (
                    <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-20 w-80 bg-white rounded-2xl shadow-xl border border-dark-100 p-4 animate-fade-in-up">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-dark-800 flex items-center gap-2">
                          <PartyPopper size={18} className="text-purple-500" />
                          队长每日补给
                        </h4>
                        <button
                          onClick={() => setShowSupplyPanel(false)}
                          className="text-dark-400 hover:text-dark-600"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-xs text-dark-500 mb-3 flex items-center gap-1">
                        <HelpCircle size={12} />
                        今日可使用一次，为任意成员补打卡或补阅读
                      </p>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {nonLeaderMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-dark-50"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <p className="text-sm font-medium text-dark-800">
                                  {member.name}
                                </p>
                                <p className="text-xs text-dark-500">
                                  {member.todayChecked ? '已打卡' : '未打卡'}
                                  {member.todayReadingChapters > 0 && ` · 阅读${member.todayReadingChapters}章`}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleSupply(member.id, 'checkIn')}
                                disabled={member.todayChecked}
                                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                                  member.todayChecked
                                    ? 'bg-dark-100 text-dark-400 cursor-not-allowed'
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                              >
                                补打卡
                              </button>
                              <button
                                onClick={() => handleSupply(member.id, 'reading')}
                                className="px-2 py-1 rounded-lg text-xs font-medium bg-primary-500 text-white hover:bg-primary-600 transition-all"
                              >
                                补阅读
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {isLeader && currentTeam.members.length < 5 && (
                <button
                  onClick={inviteRandomMember}
                  className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-manga-purple to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Sparkles size={20} />
                  一键邀请随机成员
                </button>
              )}

              {currentTeam.rewardUnlocked && !currentTeam.rewardClaimed && (
                <button
                  onClick={claimTeamReward}
                  className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-manga-yellow to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all animate-pulse-glow"
                >
                  <Gift size={20} />
                  领取全队奖励 ¥{currentTeam.rewardAmount}
                </button>
              )}

              {currentTeam.rewardClaimed && (
                <div className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg bg-green-100 text-green-600">
                  <Check size={20} />
                  已领取全队奖励 ¥{currentTeam.rewardAmount}
                </div>
              )}
            </div>

            {currentTeam.rewardUnlocked && (
              <div className={`mt-6 p-4 rounded-2xl border ${
                currentTeam.rewardClaimed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start gap-3">
                  <Gift size={24} className={`flex-shrink-0 ${
                    currentTeam.rewardClaimed ? 'text-green-500' : 'text-yellow-500'
                  }`} />
                  <div>
                    <p className={`font-bold ${
                      currentTeam.rewardClaimed ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {currentTeam.rewardClaimed
                        ? '✓ 已领取全队奖励'
                        : '🎉 恭喜！组队任务已完成'}
                    </p>
                    <p className={`text-sm ${
                      currentTeam.rewardClaimed ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {currentTeam.rewardClaimed
                        ? `你已领取 ${currentTeam.rewardAmount} 元阅读券，可在兑换记录中查看。`
                        : `全队每人可获得 ${currentTeam.rewardAmount} 元阅读券，可用于平台内任意正版漫画章节。`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-manga-pink via-primary-500 to-manga-purple rounded-3xl blur-sm opacity-50" />
            <div className="relative card p-6 rounded-3xl">
              <button
                onClick={() => setHistoryExpanded(!historyExpanded)}
                className="w-full flex items-center justify-between mb-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-manga-pink to-primary-500 flex items-center justify-center text-white">
                    <BarChart3 size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display text-xl font-bold text-dark-800">
                      团队战报
                    </h3>
                    <p className="text-sm text-dark-500">
                      最近7天打卡记录
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-dark-400">
                  <History size={18} />
                  {historyExpanded ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </button>

              {historyExpanded && (
                <div className="space-y-3">
                  {displayHistory.map((record, idx) => {
                    const isExpanded = expandedHistoryDate === record.date;
                    const hasCaptainSupply = record.captainSupplyUsed;
                    const isAllCheckedValid = record.allChecked && record.members.length >= 3;
                    return (
                      <div
                        key={record.date}
                        className={`rounded-2xl border-2 transition-all overflow-hidden ${
                          record.allChecked
                            ? 'bg-green-50/50 border-green-200'
                            : 'bg-dark-50/50 border-dark-100'
                        } ${idx === 0 ? 'ring-2 ring-primary-200 ring-offset-2' : ''}`}
                      >
                        <button
                          onClick={() => toggleHistoryDate(record.date)}
                          className="w-full p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                              record.allChecked
                                ? 'bg-green-500 text-white'
                                : 'bg-dark-200 text-dark-500'
                            }`}>
                              {new Date(record.date).getDate()}
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-dark-800">
                                {formatDateWithWeek(record.date)}
                                {idx === 0 && (
                                  <span className="ml-2 text-xs px-2 py-0.5 bg-primary-100 text-primary-600 rounded-full">
                                    今天
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-dark-500">
                                {record.members.filter((m) => m.checkedIn).length}/{record.members.length} 人已打卡
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {record.allChecked && (
                              <span className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-bold shadow-sm">
                                <Zap size={12} />
                                全队达成
                              </span>
                            )}
                            {isExpanded ? (
                              <ChevronUp size={20} className="text-dark-400" />
                            ) : (
                              <ChevronDown size={20} className="text-dark-400" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-3">
                            {hasCaptainSupply && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-xl">
                                <span className="text-lg">🎁</span>
                                <span className="text-sm font-medium text-purple-700">
                                  今日队长使用了补给
                                </span>
                              </div>
                            )}
                            {isAllCheckedValid && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-xl">
                                <Sparkles size={16} className="text-yellow-500" />
                                <span className="text-sm font-medium text-yellow-700">
                                  ✨ 全队达成，有效天数+1
                                </span>
                              </div>
                            )}
                            <div className="space-y-2">
                              {record.members.map((member) => (
                                <div
                                  key={member.memberId}
                                  className="flex items-center justify-between p-3 bg-white rounded-xl"
                                >
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={member.memberAvatar}
                                      alt={member.memberName}
                                      className="w-10 h-10 rounded-full border-2 border-white shadow"
                                    />
                                    <div>
                                      <p className="font-medium text-dark-800">
                                        {member.memberName}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <span
                                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                        member.checkedIn
                                          ? member.checkInSource === 'captain'
                                            ? 'bg-purple-100 text-purple-600'
                                            : 'bg-green-100 text-green-600'
                                          : 'bg-dark-100 text-dark-500'
                                      }`}
                                    >
                                      {member.checkedIn ? (
                                        member.checkInSource === 'captain' ? (
                                          '🎁 队长补给'
                                        ) : (
                                          '✓ 自己打卡'
                                        )
                                      ) : (
                                        '未打卡'
                                      )}
                                    </span>
                                    {member.readingChapters > 0 && (
                                      <span
                                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                          member.readingSource === 'captain'
                                            ? 'bg-purple-100 text-purple-600'
                                            : 'bg-primary-50 text-primary-600'
                                        }`}
                                      >
                                        {member.readingSource === 'captain' ? (
                                          `📖 队长补给阅读${member.readingChapters}章`
                                        ) : (
                                          `📖 自己阅读${member.readingChapters}章`
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in-up stagger-2">
          <div className="card p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-manga-pink to-rose-500 flex items-center justify-center shadow-lg animate-float">
              <Users size={48} className="text-white" />
            </div>
            <h2 className="font-display text-2xl font-bold text-dark-800 mb-2">
              还没有加入队伍
            </h2>
            <p className="text-dark-500 mb-6 max-w-md mx-auto">
              邀请同宿舍或同社团的小伙伴组成3-5人小队，全队一起打卡阅读，达到目标天数后每人都能获得丰厚的全队专属补给券！
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                创建队伍
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <LogIn size={20} />
                加入队伍
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-primary-50 rounded-2xl">
                <span className="text-3xl mb-2 block">👥</span>
                <h4 className="font-bold text-dark-800 mb-1">3-5人组队</h4>
                <p className="text-sm text-dark-500">
                  邀请好友一起参与，人多力量大
                </p>
              </div>
              <div className="p-4 bg-manga-blue/10 rounded-2xl">
                <span className="text-3xl mb-2 block">📅</span>
                <h4 className="font-bold text-dark-800 mb-1">连续7天</h4>
                <p className="text-sm text-dark-500">
                  全队每人每天打卡，坚持就是胜利
                </p>
              </div>
              <div className="p-4 bg-manga-purple/10 rounded-2xl">
                <span className="text-3xl mb-2 block">🎁</span>
                <h4 className="font-bold text-dark-800 mb-1">全队奖励</h4>
                <p className="text-sm text-dark-500">
                  每人获得20元专属阅读券
                </p>
              </div>
            </div>
          </div>

          {availableTeams.length > 0 && (
            <div>
              <h3 className="font-display text-xl font-bold text-dark-800 mb-4">
                可加入的队伍
              </h3>
              <div className="grid gap-4">
                {availableTeams.slice(0, 3).map((team) => (
                  <div
                    key={team.id}
                    className="card p-5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {team.members.slice(0, 3).map((member) => (
                          <img
                            key={member.id}
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full border-2 border-white"
                          />
                        ))}
                        {team.members.length > 3 && (
                          <div className="w-10 h-10 rounded-full border-2 border-white bg-dark-200 flex items-center justify-center text-xs font-bold text-dark-600">
                            +{team.members.length - 3}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-dark-800">
                          {team.name}
                        </h4>
                        <p className="text-sm text-dark-500">
                          {team.members.length}/5 人 · 进度 {team.currentDays}/{team.targetDays}天
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="输入队伍码"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        className="w-32 px-3 py-2 rounded-lg border border-dark-200 text-sm font-mono text-center focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                        maxLength={10}
                      />
                      <button
                        onClick={() => {
                          if (joinCode.trim()) {
                            joinTeam(joinCode.trim());
                            setJoinCode('');
                          }
                        }}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        加入
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <TeamModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default Team;
