'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { calculateDateEnd } from '@/utils/dateHelpers';

const generateNumbers = (digits) => {
  const numbers = [];
  const max = Math.pow(10, digits);
  for (let i = 0; i < max; i++) {
    numbers.push(String(i).padStart(digits, '0'));
  }
  return numbers;
};

export default function NumberClosing() {
  const { token } = useAuth();
  const [allClosedNumbers, setAllClosedNumbers] = useState([]); // Stores all closed numbers
  const [allLimitNumbers, setAllLimitNumbers] = useState([]); // Stores all limited numbers
  const [message, setMessage] = useState('');
  const [selectedType, setSelectedType] = useState('twoNumberTop');

  const twoDigitNumbers = useMemo(() => generateNumbers(2), []);
  const threeDigitNumbers = useMemo(() => generateNumbers(3), []);

  // Filtered closed numbers for display based on selectedType
  const closedNumbersForDisplay = useMemo(() => {
    return allClosedNumbers.filter(cn => cn.type === selectedType);
  }, [allClosedNumbers, selectedType]);

  useEffect(() => {
    if (token) {
      fetchAllClosedNumbers();
      fetchAllLimitNumbers();
    }
  }, [token]);

  // Refetch closed numbers when selectedType changes for display purposes
  useEffect(() => {
    if (token) {
      // No need to refetch all, just re-filter for display
    }
  }, [selectedType, token]);

  const fetchAllClosedNumbers = async () => {
    try {
      const res = await fetch('/api/close-numbers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAllClosedNumbers(data);
      } else {
        setMessage(data.message || 'Failed to fetch closed numbers');
      }
    } catch (error) {
      setMessage('Network error fetching closed numbers');
      console.error('Error fetching closed numbers:', error);
    }
  };

  const fetchAllLimitNumbers = async () => {
    try {
      const res = await fetch('/api/limit-numbers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAllLimitNumbers(data);
      } else {
        setMessage(data.message || 'Failed to fetch limit numbers for conflict check');
      }
    } catch (error) {
      setMessage('Network error fetching limit numbers for conflict check');
      console.error('Error fetching limit numbers for conflict check:', error);
    }
  };

  const isNumberClosed = (type, number) => {
    return allClosedNumbers.some(cn => cn.number === number && cn.type === type);
  };

  const isNumberLimited = (type, number) => {
    return allLimitNumbers.some(ln => ln.number === number && ln.type === type);
  };

  const typeToThaiText = (type) => {
    switch (type) {
      case 'twoNumberTop': return '2 ตัวบน';
      case 'twoNumberButton': return '2 ตัวล่าง';
      case 'threeNumberTop': return '3 ตัวบน';
      case 'threeNumberTode': return '3 ตัวโต๊ด';
      default: return '';
    }
  };

  const toggleNumber = async (number) => {
    const numString = number;

    // Fetch latest data from DB for real-time check
    const latestClosedRes = await fetch('/api/close-numbers', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const latestClosedData = await latestClosedRes.json();
    const latestAllClosedNumbers = latestClosedRes.ok ? latestClosedData : [];

    const latestLimitedRes = await fetch('/api/limit-numbers', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const latestLimitedData = await latestLimitedRes.json();
    const latestAllLimitNumbers = latestLimitedRes.ok ? latestLimitedData : [];

    const isNumberCurrentlyClosed = latestAllClosedNumbers.some(cn => cn.number === numString && cn.type === selectedType);
    const isNumberCurrentlyLimited = latestAllLimitNumbers.some(ln => ln.number === numString && ln.type === selectedType);

    if (!isNumberCurrentlyClosed && isNumberCurrentlyLimited) {
      setMessage(`Cannot close number ${numString} (${typeToThaiText(selectedType)}) because it is already limited.`);
      return;
    }

    try {
      if (isNumberCurrentlyClosed) {
        const closedEntry = latestAllClosedNumbers.find(cn => cn.number === numString && cn.type === selectedType);
        const res = await fetch('/api/close-numbers', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ id: closedEntry.id }),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage(`Number ${numString} (${typeToThaiText(selectedType)}) unclosed successfully`);
          fetchAllClosedNumbers(); // Refresh local state after successful operation
        } else {
          setMessage(data.message || 'Failed to unclose number');
        }
      } else {
        const dateEnd = calculateDateEnd(); // Calculate dateEnd
        const res = await fetch('/api/close-numbers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ type: selectedType, number: numString, text: typeToThaiText(selectedType), dateEnd }),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage(`Number ${numString} (${typeToThaiText(selectedType)}) closed successfully`);
          fetchAllClosedNumbers(); // Refresh local state after successful operation
        } else {
          setMessage(data.message || 'Failed to close number');
        }
      }
    } catch (error) {
      setMessage('Network error toggling number');
      console.error('Error toggling number:', error);
    }
  };

  const renderNumberButtons = (numbers) => (
    <div className="grid grid-cols-10 gap-2 mt-4">
      {numbers.map((number) => (
        <button
          key={number}
          onClick={() => toggleNumber(number)}
          className={`p-2 rounded text-white ${isNumberClosed(selectedType, number) ? 'bg-red-500' : 'bg-gray-500'} hover:opacity-80`}
        >
          {number}
        </button>
      ))}
    </div>
  );

  return (
    <div className="w-full mt-8">
      <h2 className="text-2xl font-semibold mb-4">Number Closing</h2>
      {message && <p className="text-red-500 mb-4">{message}</p>}

      <div className="mb-4">
        <label htmlFor="numberType" className="block text-lg font-medium text-gray-700 dark:text-gray-300">Select Type:</label>
        <select
          id="numberType"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-zinc-700 dark:text-zinc-50"
        >
          <option value="twoNumberTop">2 ตัวบน</option>
          <option value="twoNumberButton">2 ตัวล่าง</option>
          <option value="threeNumberTop">3 ตัวบน</option>
          <option value="threeNumberTode">3 ตัวโต๊ด</option>
        </select>
      </div>

      {selectedType.includes('twoNumber') && (
        <div>
          <h3 className="text-xl font-semibold mt-4">2-Digit Numbers</h3>
          {renderNumberButtons(twoDigitNumbers)}
        </div>
      )}

      {selectedType.includes('threeNumber') && (
        <div>
          <h3 className="text-xl font-semibold mt-4">3-Digit Numbers</h3>
          {renderNumberButtons(threeDigitNumbers)}
        </div>
      )}
    </div>
  );
}
