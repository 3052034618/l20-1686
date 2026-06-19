import { useState } from 'react';
import { X, Users, Plus, LogIn } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface TeamModalProps {
  show: boolean;
  onClose: () => void;
}

const TeamModal = ({ show, onClose }: TeamModalProps) => {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const { createTeam, joinTeam } = useStore();

  if (!show) return null;

  const handleSubmit = () => {
    if (mode === 'create' && teamName.trim()) {
      createTeam(teamName.trim());
      onClose();
    } else if (mode === 'join' && teamCode.trim()) {
      joinTeam(teamCode.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-bounce-in overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-manga" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-manga-pink to-rose-500 flex items-center justify-center">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-dark-800">
                  {mode === 'create' ? '创建队伍' : '加入队伍'}
                </h2>
                <p className="text-sm text-dark-500">
                  3-5人组队，解锁全队奖励
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-100 rounded-full transition-colors"
            >
              <X size={20} className="text-dark-400" />
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                mode === 'create'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Plus size={18} />
                创建队伍
              </span>
            </button>
            <button
              onClick={() => setMode('join')}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                mode === 'join'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <LogIn size={18} />
                加入队伍
              </span>
            </button>
          </div>

          {mode === 'create' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  队伍名称
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="给你的队伍起个响亮的名字吧"
                  className="w-full px-4 py-3 rounded-xl border-2 border-dark-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                  maxLength={20}
                />
              </div>
              <p className="text-xs text-dark-400">
                💡 创建队伍后，将自动生成队伍码，你可以分享给队友邀请加入
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  队伍码
                </label>
                <input
                  type="text"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  placeholder="输入队友分享的队伍码"
                  className="w-full px-4 py-3 rounded-xl border-2 border-dark-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 outline-none transition-all font-mono text-center text-xl tracking-widest"
                  maxLength={10}
                />
              </div>
              <p className="text-xs text-dark-400">
                💡 队伍码由队长创建队伍时生成，向队长索取即可加入
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-4 border-t border-dark-200">
            <button onClick={onClose} className="btn-ghost flex-1">
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                (mode === 'create' && !teamName.trim()) ||
                (mode === 'join' && !teamCode.trim())
              }
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'create' ? '创建' : '加入'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamModal;
