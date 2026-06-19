import { useState } from 'react';
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
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import TeamModal from '@/components/Modals/TeamModal';
import ProgressBar from '@/components/ProgressBar';
import { formatDateCN } from '@/utils/date';

const Team = () => {
  const { currentTeam, user, teams: allTeams, teamCheckIn, claimTeamReward, leaveTeam, joinTeam } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const handleCopyCode = () => {
    if (currentTeam) {
      navigator.clipboard.writeText(currentTeam.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const myMember = currentTeam?.members.find((m) => m.id === user.id);
  const isLeader = currentTeam?.members[0]?.id === user.id;

  const availableTeams = allTeams.filter(
    (t) => !t.members.some((m) => m.id === user.id) && t.members.length < 5
  );

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
              <p className="text-sm text-dark-500 mt-2">
                开始于 {formatDateCN(currentTeam.startDate)}，还需{' '}
                {currentTeam.targetDays - currentTeam.currentDays} 天解锁奖励
              </p>
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
                          ? 'bg-green-100 text-green-600'
                          : 'bg-dark-100 text-dark-500'
                      }`}
                    >
                      {member.todayChecked ? (
                        <>
                          <Check size={12} /> 已打卡
                        </>
                      ) : (
                        '未打卡'
                      )}
                    </span>
                  </div>
                ))}
                {currentTeam.members.length < 5 && (
                  <div
                    onClick={() => setShowModal(true)}
                    className="p-4 rounded-2xl border-2 border-dashed border-dark-200 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all"
                  >
                    <Plus size={28} className="mx-auto mb-2 text-dark-400" />
                    <p className="text-sm text-dark-500">邀请队友</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
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

              {currentTeam.rewardUnlocked && (
                <button
                  onClick={claimTeamReward}
                  className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-manga-yellow to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all animate-pulse-glow"
                >
                  <Gift size={20} />
                  领取全队奖励 ¥{currentTeam.rewardAmount}
                </button>
              )}
            </div>

            {currentTeam.rewardUnlocked && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
                <div className="flex items-start gap-3">
                  <Gift size={24} className="text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-yellow-700">
                      🎉 恭喜！组队任务已完成
                    </p>
                    <p className="text-sm text-yellow-600">
                      全队每人可获得 {currentTeam.rewardAmount} 元阅读券，可用于平台内任意正版漫画章节。
                    </p>
                  </div>
                </div>
              </div>
            )}
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
