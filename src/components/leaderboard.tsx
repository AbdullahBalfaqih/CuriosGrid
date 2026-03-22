'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Zap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const topCreators = [
  { walletAddress: '5xRZBfP9gA7kYbP3eC8vN1fG6H2aJdK4sL9mN5bV', generations: 128 },
  { walletAddress: '9aT3ChL2dE8fG5iJ7kL9mN1oP3qR5tV8wXzY9bA', generations: 112 },
  { walletAddress: 'DpG7FjK8wX4yZ2aB6cE9fH3iL5mN7oP9qRsTuV', generations: 98 },
  { walletAddress: 'HqV1sL5mN7oP9qR2tV4wX6yZ8aB1cE3fG5iJk', generations: 85 },
];

type LiveTrend = {
  topic: string;
  generations: number;
};

const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function Leaderboard() {
  const [hottestTrends, setHottestTrends] = useState<LiveTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalTrends = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/trends?sub=worldnews&limit=4');
        if (!response.ok) {
          throw new Error('Failed to fetch trends');
        }
        const data = await response.json();
        
        const formattedTrends: LiveTrend[] = data.map((child: any) => ({
          topic: child.data.title,
          generations: child.data.score,
        }));

        // Sort trends by generations in descending order
        formattedTrends.sort((a, b) => b.generations - a.generations);

        setHottestTrends(formattedTrends);
      } catch (error) {
        console.warn("Error fetching global trends:", error);
        // Fallback data is already sorted
        setHottestTrends([
          { topic: 'Global Tech', generations: 1542 },
          { topic: 'Future AI', generations: 1321 },
          { topic: 'Space Exploration', generations: 1109 },
          { topic: 'Green Energy', generations: 987 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalTrends();
  }, []);

  return (
    <section className="w-full py-24 bg-neutral-950/40">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-5xl font-bold text-white mb-4">Platform Activity</h2>
          <p className="text-neutral-400 text-lg mb-12">
            See what's popular on CurioGrid right now. Here are the top creators and the most generated-for trends on the platform today.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-card border-border rounded-3xl h-full shadow-2xl shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <Crown className="text-primary" />
                  Top Creators Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {topCreators.map((creator, index) => (
                    <li key={creator.walletAddress} className="flex items-center gap-4 bg-neutral-900/50 p-3 rounded-xl border border-transparent hover:border-primary/20 transition-all">
                      <span className="font-bold text-lg text-neutral-500 w-6">#{index + 1}</span>
                      <Avatar>
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${creator.walletAddress}`} />
                        <AvatarFallback>{creator.walletAddress.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="font-mono text-white flex-grow">{truncateAddress(creator.walletAddress)}</span>
                      <span className="font-mono text-primary font-bold">{creator.generations.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-card border-border rounded-3xl h-full shadow-2xl shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <Zap className="text-primary fill-primary" />
                  Hottest Trends Globally
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4 pt-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-3/5" />
                          <Skeleton className="h-5 w-1/5" />
                        </div>
                        <Skeleton className="h-2.5 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {hottestTrends.map((trend) => (
                      <li key={trend.topic} className="p-3 rounded-xl hover:bg-neutral-900/50">
                        <div className="flex justify-between items-center mb-1 gap-4">
                            <p className="font-semibold text-white truncate min-w-0" title={trend.topic}>
                                {trend.topic}
                            </p>
                            <span className="font-mono text-neutral-400 text-sm flex-shrink-0">
                                {trend.generations.toLocaleString()}
                            </span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${hottestTrends.length > 0 ? (trend.generations / hottestTrends[0].generations) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
