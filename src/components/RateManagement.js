'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

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
  const { showLoading, hideLoading, showToast } = useNotification();
  const [rates, setRates] = useState([]);
  const [editingRateId, setEditingRateId] = useState(null);
  const [newPrice, setNewPrice] = useState('');

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
      } else {
        showToast(data.message || 'ไม่สามารถดึงอัตราจ่ายได้', 'error');
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
    }
  }, [token, showToast]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      await fetchRates();
    })();
  }, [token, fetchRates]);

  const handleEdit = (rate) => {
    setEditingRateId(rate.id);
    setNewPrice(rate.price.toString());
  };

  const handleSave = async (rateId) => {
    showLoading('กำลังบันทึกอัตราจ่าย...');
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
        showToast('บันทึกอัตราจ่ายเรียบร้อย', 'success');
        setEditingRateId(null);
        setNewPrice('');
        fetchRates();
      } else {
        showToast(data.message || 'ไม่สามารถอัปเดตอัตราจ่ายได้', 'error');
      }
    } catch (error) {
      console.error('Error updating rate:', error);
      showToast('เกิดข้อผิดพลาดในการอัปเดตอัตราจ่าย', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleCancel = () => {
    setEditingRateId(null);
    setNewPrice('');
  };

  return (
    <div className="mobile-stack">
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
