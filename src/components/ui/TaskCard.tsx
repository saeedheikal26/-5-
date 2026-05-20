import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface TaskCardProps {
  id: string;
  title: string;
  current: number;
  target: number;
  points: number;
  icon: React.ReactNode;
  color: 'emerald' | 'blue' | 'orange' | 'purple';
  unit?: string;
  onClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  title, current, target, points, icon, color, unit, onClick
}) => {
  const isCompleted = current >= target;
  const progress = Math.min((current / target) * 100, 100);

  const colors = {
    emerald: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-500 bg-blue-50 border-blue-100',
    orange: 'text-orange-500 bg-orange-50 border-orange-100',
    purple: 'text-purple-500 bg-purple-50 border-purple-100'
  };

  const progressColors = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500'
  };

  return (
    <motion.div 
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={`p-6 rounded-[2.5rem] border bg-white shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden select-none touch-pan-y`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]} transition-transform group-hover:scale-110 shadow-sm`}>
          {icon}
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Points</p>
          <div className="inline-flex items-center gap-1 bg-brand/5 px-2 py-1 rounded-lg">
            <p className="text-lg font-black text-brand leading-none">+{points}</p>
            <span className="text-[10px] font-black text-brand opacity-50">PTS</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-black text-[#1a1a1a] mb-1">{title}</h3>
          <p className="text-xs font-bold text-gray-400">
            {isCompleted ? 'تم الإنجاز بنجاح! 🎉' : `المتبقي: ${Math.max(target - current, 0)} ${unit || ''}`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-100 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full rounded-full ${progressColors[color]} shadow-sm`}
            />
          </div>
          <span className="text-sm font-black text-[#1a1a1a] font-sans">{current}/{target}</span>
        </div>
      </div>

      {isCompleted && (
        <div className="absolute top-4 right-4 text-emerald-500 animate-bounce">
          <CheckCircle2 size={24} />
        </div>
      )}
      
      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-gray-300">
        <ChevronRight size={20} />
      </div>
    </motion.div>
  );
};
