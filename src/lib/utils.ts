import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

export const formatNumber = (num: number) => {
    if (typeof num !== 'number') return '0';
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
};

export const getFlagUrl = (code: string, width: number = 40) => `https://flagcdn.com/w${width}/${code.toLowerCase()}.png`;

export const generateSparkline = () => Array.from({ length: 20 }, () => Math.floor(Math.random() * 100));
