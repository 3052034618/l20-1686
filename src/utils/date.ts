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
