'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

const typeToThaiText = (type) => {
  switch (type) {
    case 'twoNumberTop': return '2 ตัวบน';
    case 'twoNumberButton': return '2 ตัวล่าง';
    case 'threeNumberTop': return '3 ตัวบน';
    case 'threeNumberTode': return '3 ตัวโต๊ด';
    default: return '';
  }
};

export default function BillConfirmationModal({ billItems, remark, onConfirm, onCancel }) {
  const { token } = useAuth();
  const [validatedItems, setValidatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const validateBill = async () => {
      if (!token || billItems.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [closedRes, limitedRes] = await Promise.all([
          fetch('/api/close-numbers', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/limit-numbers', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!closedRes.ok || !limitedRes.ok) {
          throw new Error('Failed to fetch validation data.');
        }

        const allClosedNumbers = await closedRes.json();
        const allLimitNumbers = await limitedRes.json();

        const finalItems = [];
        const limitUsage = {}; // Track usage within this bill to handle multiple same limited numbers

        for (const group of billItems) {
          for (const num of group.numbers) {
            const processBet = (type, amount) => {
              const isClosed = allClosedNumbers.some(cn => cn.number === num && cn.type === type);
              const limitedEntry = allLimitNumbers.find(ln => ln.number === num && ln.type === type);

              let itemState = 'รับได้';
              let finalAmount = amount;

              if (isClosed) {
                itemState = 'เลขปิด';
                finalAmount = 0;
              } else if (limitedEntry) {
                const limitKey = `${type}-${num}`;
                const currentUsage = limitUsage[limitKey] || parseFloat(limitedEntry.used);
                const availableAmount = parseFloat(limitedEntry.amountlimit) - currentUsage;

                if (amount <= availableAmount) {
                  itemState = 'รับได้';
                  finalAmount = amount;
                  limitUsage[limitKey] = currentUsage + amount;
                } else {
                  itemState = 'ลิมิต';
                  finalAmount = 0;
                }
              }

              finalItems.push({
                type,
                number: num,
                amount: finalAmount,
                text: typeToThaiText(type),
                state: itemState,
              });
            };

            if (group.top > 0) processBet(num.length === 3 ? 'threeNumberTop' : 'twoNumberTop', group.top);
            if (group.bottom > 0) processBet('twoNumberButton', group.bottom);
            if (group.tote > 0) processBet('threeNumberTode', group.tote);
          }
        }

        setValidatedItems(finalItems);
      } catch (err) {
        setError('Error validating bill: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    validateBill();
  }, [billItems, token]);

  const totalAmount = useMemo(() => {
    return validatedItems.reduce((sum, item) => sum + item.amount, 0);
  }, [validatedItems]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">ยืนยันรายการ</h2>
        {loading && <p>กำลังตรวจสอบรายการ...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto mb-4 rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-zinc-700">
                    <th className="p-2 text-left text-sm font-semibold">เลข</th>
                    <th className="p-2 text-left text-sm font-semibold">ประเภท</th>
                    <th className="p-2 text-right text-sm font-semibold">ราคา</th>
                    <th className="p-2 text-center text-sm font-semibold">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {validatedItems.map((item, index) => (
                    <tr key={index} className={`border-t ${item.state !== 'รับได้' ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                      <td className="p-2 font-mono">{item.number}</td>
                      <td className="p-2">{item.text}</td>
                      <td className="p-2 text-right font-mono">{item.amount.toFixed(2)}</td>
                      <td className={`p-2 text-center font-semibold ${item.state !== 'รับได้' ? 'text-red-500' : 'text-green-500'}`}>{item.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {remark && <p className="mb-4"><strong>หมายเหตุ:</strong> {remark}</p>}
            <div className="text-xl font-bold text-right mb-6">ยอดรวมที่รับได้: {totalAmount.toFixed(2)} บาท</div>
            <div className="flex justify-end gap-4">
              <button onClick={onCancel} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">ยกเลิก</button>
              <button onClick={() => onConfirm(validatedItems, remark)} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">ยืนยันการบันทึก</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}