export type Country = {
  code: string;
  name: string;
  sub: string;
};

export type Trend = {
  id: number;
  topic: string;
  fullTitle: string;
  volume: number;
  growth: number;
  sparkline: number[];
  category: string;
  region: string;
  url?: string;
};

export type FetchTrendsResult = {
  data: Trend[];
  isReal: boolean;
  source: string;
  error: string | null;
};
