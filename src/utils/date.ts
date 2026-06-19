export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateCN = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}年${month}月${day}日`;
};

export const getToday = (): string => {
  return formatDate(new Date());
};

export const isToday = (date: string): boolean => {
  return date === getToday();
};

export const isYesterday = (date: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date === formatDate(yesterday);
};

export const addDays = (date: string | Date, days: number): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

export const daysUntil = (date: string): number => {
  const target = new Date(date);
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isExpiringSoon = (date: string, days = 3): boolean => {
  return daysUntil(date) <= days && daysUntil(date) >= 0;
};

export const isExpired = (date: string): boolean => {
  return daysUntil(date) < 0;
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const getWeekKey = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24);
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber}`;
};

const weekDaysCN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export const formatDateWithWeek = (date: string | Date): string => {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekDay = weekDaysCN[d.getDay()];
  return `${month}月${day}日 ${weekDay}`;
};
