import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface TradeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const TradeSelect: React.FC<TradeSelectProps> = ({ value, onChange, className }) => {
  const [trades, setTrades] = useState<string[]>([]);

  useEffect(() => {
    const fetchTrades = async () => {
      const snapshot = await getDocs(collection(db, 'trades'));
      const tradesData = snapshot.docs.map(doc => doc.data().name || doc.id);
      setTrades(tradesData);
    };
    fetchTrades();
  }, []);

  return (
    <select
      className={className}
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">All Trades</option>
      {trades.map(trade => (
        <option key={trade} value={trade}>{trade}</option>
      ))}
    </select>
  );
};

export default TradeSelect; 