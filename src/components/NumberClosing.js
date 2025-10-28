'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { calculateDateEnd } from '@/utils/dateHelpers';

const generateNumbers = (digits) => {
  const numbers = [];
  const max = Math.pow(10, digits);
  for (let i = 0; i < max; i++) {
    numbers.push(String(i).padStart(digits, '0'));
  }
  return numbers;
};

const typeOptions = [
  { value: 'twoNumberTop', label: '2 ตัวบน', digits: 2 },
  { value: 'twoNumberButton', label: '2 ตัวล่าง', digits: 2 },
  { value: 'threeNumberTop', label: '3 ตัวบน', digits: 3 },
  { value: 'threeNumberTode', label: '3 ตัวโต๊ด', digits: 3 },
];

export default function NumberClosing() {
  const { token } = useAuth();
  const { showToast } = useNotification();
  const [allClosedNumbers, setAllClosedNumbers] = useState([]);
  const [allLimitNumbers, setAllLimitNumbers] = useState([]);
  const [selectedType, setSelectedType] = useState('twoNumberTop');
  const [quickNumber, setQuickNumber] = useState('');

  const currentOption = useMemo(
    () => typeOptions.find((opt) => opt.value === selectedType) ?? typeOptions[0],
    [selectedType],
  );

  const numberList = useMemo(
    () => generateNumbers(currentOption.digits),
    [currentOption.digits],
  );

  const fetchAllClosedNumbers = useCallback(async () => {
    try {
      const res = await fetch('/api/close-numbers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAllClosedNumbers(data);
      } else {
        showToast(data.message || 'ไม่สามารถดึงรายการเลขปิดได้', 'error');
      }
    } catch (error) {
      console.error('Error fetching closed numbers:', error);
      showToast('เกิดข้อผิดพลาดในการดึงรายการเลขปิด', 'error');
    }
  }, [token, showToast]);

  const fetchAllLimitNumbers = useCallback(async () => {
    try {
      const res = await fetch('/api/limit-numbers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAllLimitNumbers(data);
      } else {
        showToast(data.message || 'ไม่สามารถตรวจสอบเลขอั้นได้', 'error');
      }
    } catch (error) {
      console.error('Error fetching limit numbers:', error);
      showToast('เกิดข้อผิดพลาดในการตรวจสอบเลขอั้น', 'error');
    }
  }, [token, showToast]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      await fetchAllClosedNumbers();
      await fetchAllLimitNumbers();
    })();
  }, [token, fetchAllClosedNumbers, fetchAllLimitNumbers]);

  const isNumberClosed = (type, number) =>
    allClosedNumbers.some((cn) => cn.number === number && cn.type === type);

  const isNumberLimited = (type, number) =>
    allLimitNumbers.some((ln) => ln.number === number && ln.type === type);

  const toggleNumber = async (number) => {
    if (!token) return;

    const latestClosedRes = await fetch('/api/close-numbers', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const latestClosed = latestClosedRes.ok ? await latestClosedRes.json() : [];

    const latestLimitRes = await fetch('/api/limit-numbers', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const latestLimit = latestLimitRes.ok ? await latestLimitRes.json() : [];

    const currentlyClosed = latestClosed.some(
      (cn) => cn.number === number && cn.type === selectedType,
    );
    const currentlyLimited = latestLimit.some(
      (ln) => ln.number === number && ln.type === selectedType,
    );

    if (!currentlyClosed && currentlyLimited) {
      showToast(`ไม่สามารถปิดเลข ${number} (${currentOption.label}) ได้เพราะถูกจำกัดยอดอยู่`, 'warning');
      return;
    }

    try {
      if (currentlyClosed) {
        const closedEntry = latestClosed.find(
          (cn) => cn.number === number && cn.type === selectedType,
        );
        const res = await fetch('/api/close-numbers', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: closedEntry.id }),
        });
        if (res.ok) {
          showToast(`เปิดรับเลข ${number} แล้ว`, 'success');
          fetchAllClosedNumbers();
        } else {
          const data = await res.json();
          showToast(data.message || 'ไม่สามารถเปิดรับเลขได้', 'error');
        }
      } else {
        const res = await fetch('/api/close-numbers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: selectedType,
            number,
            text: currentOption.label,
            dateEnd: calculateDateEnd(),
          }),
        });
        if (res.ok) {
          showToast(`ปิดรับเลข ${number} แล้ว`, 'success');
          fetchAllClosedNumbers();
        } else {
          const data = await res.json();
          showToast(data.message || 'ไม่สามารถปิดรับเลขได้', 'error');
        }
      }
    } catch (error) {
      console.error('Error toggling number:', error);
      showToast('เกิดข้อผิดพลาดในการอัปเดตเลข', 'error');
    } finally {
      setQuickNumber('');
    }
  };

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    const value = quickNumber.trim();
    if (value.length !== currentOption.digits) {
      showToast(`กรุณากรอกเลขให้ครบ ${currentOption.digits} หลัก`, 'warning');
      return;
    }
    if (!/^\d+$/.test(value)) {
      showToast('กรุณากรอกเฉพาะตัวเลข', 'warning');
      return;
    }
    toggleNumber(value);
  };

  return (
    <div className="mobile-stack">
      <div className="mobile-stack sm:flex sm:items-end sm:gap-4">
        <div className="sm:w-64">
          <label htmlFor="numberType" className="text-sm font-medium text-[--color-text]">
            ประเภทเลข
          </label>
          <select
            id="numberType"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="mt-2 w-full rounded-md border border-[--color-border] px-4 py-3 text-sm"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleQuickSubmit} className="flex items-end gap-3">
          <div>
            <label htmlFor="quickNumber" className="text-sm font-medium text-[--color-text]">
              ปิด/เปิดเลขแบบด่วน
            </label>
            <input
              id="quickNumber"
              type="text"
              value={quickNumber}
              onChange={(e) => setQuickNumber(e.target.value)}
              maxLength={currentOption.digits}
              placeholder={currentOption.digits === 2 ? 'เช่น 19' : 'เช่น 789'}
              className="mt-2 w-24 rounded-md border border-[--color-border] px-3 py-3 text-center text-lg font-semibold tracking-widest"
            />
          </div>
          <button type="submit" className="btn-primary">
            สลับสถานะ
          </button>
        </form>
      </div>

      <div className="rounded-md border border-[--color-border] p-4">
        <p className="text-xs text-[--color-text-muted]">แตะตัวเลขเพื่อปิดหรือเปิดรับอีกครั้ง</p>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-10">
          {numberList.map((number) => {
            const closed = isNumberClosed(selectedType, number);
            return (
              <button
                key={number}
                type="button"
                onClick={() => toggleNumber(number)}
                className={`rounded-md border px-3 py-2 text-sm font-semibold ${ 
                  closed
                    ? 'border-[#fca5a5] bg-[#fff5f5] text-[#b91c1c]'
                    : 'border-[--color-border] bg-white text-[--color-text]'
                }`}
              >
                {number}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

