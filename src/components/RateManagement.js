'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

const typeToThaiText = (type) => {
  switch (type) {
    case 'twoNumberTop':
      return '2 ตัวบน';
    case 'twoNumberButton':
      return '2 ตัวล่าง';
    case 'threeNumberTop':
      return '3 ตัวบน';
    case 'threeNumberTode':
      return '3 ตัวโต๊ด';
    default:
      return 'ไม่ทราบประเภท';
  }
};

export default function RateManagement() {
  const { token } = useAuth();
  const [rates, setRates] = useState([]);
  const [editingRateId, setEditingRateId] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch('/api/rates', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setRates(data);
        setMessage('');
      } else {
        setMessage(data.message || 'ไม่สามารถดึงอัตราจ่ายได้');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      setMessageType('error');
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      await fetchRates();
    })();
  }, [token, fetchRates]);

  const handleEdit = (rate) => {
    setEditingRateId(rate.id);
    setNewPrice(rate.price.toString());
    setMessage('');
  };

  const handleSave = async (rateId) => {
    try {
      const res = await fetch('/api/rates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: rateId, price: newPrice }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('บันทึกอัตราจ่ายเรียบร้อย');
        setMessageType('success');
        setEditingRateId(null);
        setNewPrice('');
        fetchRates();
      } else {
        setMessage(data.message || 'ไม่สามารถอัปเดตอัตราจ่ายได้');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error updating rate:', error);
      setMessage('เกิดข้อผิดพลาดในการอัปเดตอัตราจ่าย');
      setMessageType('error');
    }
  };

  const handleCancel = () => {
    setEditingRateId(null);
    setNewPrice('');
  };

  const bannerClass =
    messageType === 'success'
      ? 'border border-[#bbf7d0] bg-[#ecfdf3] text-[#166534]'
      : 'border border-[#fca5a5] bg-[#fff5f5] text-[#7f1d1d]';

  return (
    <div className="mobile-stack">
      {message && messageType !== 'info' && (
        <div className={`rounded-md px-4 py-3 text-sm ${bannerClass}`}>{message}</div>
      )}

      <div className="table-wrapper">
        <table className="table-simple">
          <thead>
            <tr>
              <th>ประเภท</th>
              <th>คำอธิบาย</th>
              <th className="text-right">ราคาจ่าย (บาท)</th>
              <th className="text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => {
              const isEditing = editingRateId === rate.id;
              return (
                <tr key={rate.id}>
                  <td className="font-semibold text-[--color-text]">{typeToThaiText(rate.type)}</td>
                  <td className="text-[--color-text-muted]">{rate.text}</td>
                  <td className="text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-24 rounded-md border border-[--color-border] px-2 py-2 text-right text-sm"
                      />
                    ) : (
                      Number(rate.price).toFixed(2)
                    )}
                  </td>
                  <td className="text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleSave(rate.id)} className="btn-primary">
                          บันทึก
                        </button>
                        <button onClick={handleCancel} className="btn-outline">
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleEdit(rate)} className="btn-outline">
                        แก้ไข
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
