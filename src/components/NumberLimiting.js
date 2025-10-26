'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { calculateDateEnd } from '@/utils/dateHelpers';

const typeOptions = [
  { value: 'twoNumberTop', label: '2 ตัวบน', digits: 2 },
  { value: 'twoNumberButton', label: '2 ตัวล่าง', digits: 2 },
  { value: 'threeNumberTop', label: '3 ตัวบน', digits: 3 },
  { value: 'threeNumberTode', label: '3 ตัวโต๊ด', digits: 3 },
];

const typeToThaiText = (type) => {
  const option = typeOptions.find((opt) => opt.value === type);
  return option ? option.label : 'ไม่ทราบประเภท';
};

export default function NumberLimiting() {
  const { token } = useAuth();
  const [allLimitNumbers, setAllLimitNumbers] = useState([]);
  const [allClosedNumbers, setAllClosedNumbers] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [newLimitNumber, setNewLimitNumber] = useState({
    type: 'twoNumberTop',
    number: '',
    amountlimit: '',
  });
  const [editingLimitId, setEditingLimitId] = useState(null);
  const [newLimitAmount, setNewLimitAmount] = useState('');

  const displayLimits = useMemo(
    () => allLimitNumbers.filter((ln) => ln.type === newLimitNumber.type),
    [allLimitNumbers, newLimitNumber.type],
  );

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
  };

  const fetchAllLimitNumbers = useCallback(async () => {
    try {
      const res = await fetch('/api/limit-numbers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAllLimitNumbers(data);
        showMessage('');
      } else {
        showMessage(data.message || 'ไม่สามารถดึงเลขอั้นได้', 'error');
      }
    } catch (error) {
      console.error('Error fetching limit numbers:', error);
      showMessage('เกิดข้อผิดพลาดในการดึงเลขอั้น', 'error');
    }
  }, [token]);

  const fetchAllClosedNumbers = useCallback(async () => {
    try {
      const res = await fetch('/api/close-numbers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAllClosedNumbers(data);
      } else {
        showMessage(data.message || 'ไม่สามารถตรวจสอบเลขปิดได้', 'error');
      }
    } catch (error) {
      console.error('Error fetching closed numbers:', error);
      showMessage('เกิดข้อผิดพลาดในการตรวจสอบเลขปิด', 'error');
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      await fetchAllLimitNumbers();
      await fetchAllClosedNumbers();
    })();
  }, [token, fetchAllLimitNumbers, fetchAllClosedNumbers]);

  const isNumberClosed = (type, number) =>
    allClosedNumbers.some((cn) => cn.number === number && cn.type === type);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'number') {
      const option = typeOptions.find((opt) => opt.value === newLimitNumber.type) ?? typeOptions[0];
      if (!/^\d*$/.test(value)) {
        showMessage('กรุณากรอกเฉพาะตัวเลข', 'warning');
        return;
      }
      if (value.length > option.digits) {
        showMessage(`เลขประเภทนี้ต้องมี ${option.digits} หลัก`, 'warning');
        return;
      }
    }
    setNewLimitNumber((prev) => ({ ...prev, [name]: value }));
    showMessage('');
  };

  const handleAddLimit = async (e) => {
    e.preventDefault();
    const option = typeOptions.find((opt) => opt.value === newLimitNumber.type) ?? typeOptions[0];
    const sanitizedNumber = newLimitNumber.number.trim();
    if (sanitizedNumber.length !== option.digits) {
      showMessage(`กรุณากรอกเลขให้ครบ ${option.digits} หลัก`, 'warning');
      return;
    }
    if (!/^\d+$/.test(sanitizedNumber)) {
      showMessage('กรุณากรอกเฉพาะตัวเลข', 'warning');
      return;
    }

    const latestClosedRes = await fetch('/api/close-numbers', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const latestClosed = latestClosedRes.ok ? await latestClosedRes.json() : [];
    const isClosed = latestClosed.some(
      (cn) => cn.number === sanitizedNumber && cn.type === newLimitNumber.type,
    );
    if (isClosed) {
      showMessage('เลขนี้ถูกปิดรับอยู่ ไม่สามารถจำกัดยอดได้', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/limit-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newLimitNumber,
          number: sanitizedNumber,
          text: option.label,
          dateEnd: calculateDateEnd(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('เพิ่มเลขอั้นเรียบร้อย', 'success');
        setNewLimitNumber({ type: newLimitNumber.type, number: '', amountlimit: '' });
        fetchAllLimitNumbers();
      } else {
        showMessage(data.message || 'ไม่สามารถเพิ่มเลขอั้นได้', 'error');
      }
    } catch (error) {
      console.error('Error adding limit number:', error);
      showMessage('เกิดข้อผิดพลาดในการเพิ่มเลขอั้น', 'error');
    }
  };

  const handleEditLimit = (limit) => {
    setEditingLimitId(limit.id);
    setNewLimitAmount(limit.amountlimit.toString());
  };

  const handleSaveLimit = async (limitId) => {
    if (!newLimitAmount || Number(newLimitAmount) <= 0) {
      showMessage('กรุณากรอกยอดจำกัดที่มากกว่า 0', 'warning');
      return;
    }
    try {
      const res = await fetch('/api/limit-numbers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: limitId, amountlimit: newLimitAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('บันทึกยอดจำกัดเรียบร้อย', 'success');
        setEditingLimitId(null);
        setNewLimitAmount('');
        fetchAllLimitNumbers();
      } else {
        showMessage(data.message || 'ไม่สามารถอัปเดตยอดจำกัดได้', 'error');
      }
    } catch (error) {
      console.error('Error updating limit amount:', error);
      showMessage('เกิดข้อผิดพลาดในการอัปเดตยอดจำกัด', 'error');
    }
  };

  const handleDeleteLimit = async (limitId) => {
    try {
      const res = await fetch('/api/limit-numbers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: limitId }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('ลบเลขอั้นเรียบร้อย', 'success');
        fetchAllLimitNumbers();
      } else {
        showMessage(data.message || 'ไม่สามารถลบเลขอั้นได้', 'error');
      }
    } catch (error) {
      console.error('Error deleting limit number:', error);
      showMessage('เกิดข้อผิดพลาดในการลบเลขอั้น', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingLimitId(null);
    setNewLimitAmount('');
  };

  const bannerClass =
    messageType === 'success'
      ? 'border border-[#bbf7d0] bg-[#ecfdf3] text-[#166534]'
      : messageType === 'warning'
      ? 'border border-[#fde68a] bg-[#fff7e6] text-[#854d0e]'
      : 'border border-[#fca5a5] bg-[#fff5f5] text-[#7f1d1d]';

  return (
    <div className="mobile-stack">
      <form
        onSubmit={handleAddLimit}
        className="grid gap-4 rounded-md border border-[--color-border] p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="mobile-stack">
          <label htmlFor="limitType" className="text-sm font-medium text-[--color-text]">
            ประเภทเลข
          </label>
          <select
            id="limitType"
            name="type"
            value={newLimitNumber.type}
            onChange={handleInputChange}
            className="rounded-md border border-[--color-border] px-3 py-3 text-sm"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mobile-stack">
          <label htmlFor="limitNumber" className="text-sm font-medium text-[--color-text]">
            เลข
          </label>
          <input
            id="limitNumber"
            name="number"
            type="text"
            value={newLimitNumber.number}
            onChange={handleInputChange}
            maxLength={typeOptions.find((opt) => opt.value === newLimitNumber.type)?.digits ?? 2}
            placeholder="เช่น 19"
            className="rounded-md border border-[--color-border] px-3 py-3 text-sm"
            required
          />
        </div>

        <div className="mobile-stack">
          <label htmlFor="limitAmount" className="text-sm font-medium text-[--color-text]">
            ยอดรับสูงสุด (บาท)
          </label>
          <input
            id="limitAmount"
            name="amountlimit"
            type="number"
            min={0}
            step="0.01"
            value={newLimitNumber.amountlimit}
            onChange={handleInputChange}
            placeholder="เช่น 500"
            className="rounded-md border border-[--color-border] px-3 py-3 text-sm"
            required
          />
        </div>

        <div className="flex items-end">
          <button type="submit" className="btn-primary btn-block">
            เพิ่มเลขอั้น
          </button>
        </div>
      </form>

      {message && messageType !== 'info' && (
        <div className={`rounded-md px-4 py-3 text-sm ${bannerClass}`}>{message}</div>
      )}

      <div className="rounded-md border border-[--color-border]">
        <div className="flex items-center justify-between border-b border-[--color-border] px-4 py-3">
          <p className="text-sm font-semibold text-[--color-text]">
            รายการเลขอั้น ({typeToThaiText(newLimitNumber.type)})
          </p>
        </div>

        <div className="table-wrapper border-none">
          <table className="table-simple">
            <thead>
              <tr>
                <th>เลข</th>
                <th>ยอดจำกัด</th>
                <th>ยอดใช้แล้ว</th>
                <th>คงเหลือ</th>
                <th className="text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {displayLimits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-sm text-[--color-text-muted]">
                    ยังไม่มีเลขอั้นสำหรับประเภทนี้
                  </td>
                </tr>
              ) : (
                displayLimits.map((limit) => {
                  const paddedNumber = String(limit.number).padStart(
                    typeOptions.find((opt) => opt.value === limit.type)?.digits ?? 2,
                    '0',
                  );
                  const amountLimit = Number(limit.amountlimit);
                  const used = Number(limit.used);
                  const remaining = amountLimit - used;
                  const nearingLimit = remaining <= amountLimit * 0.1;
                  const closed = isNumberClosed(limit.type, limit.number);

                  return (
                    <tr key={limit.id}>
                      <td className="font-mono text-sm tracking-widest">{paddedNumber}</td>
                      <td className="text-[--color-text]">
                        {editingLimitId === limit.id ? (
                          <input
                            type="number"
                            value={newLimitAmount}
                            onChange={(e) => setNewLimitAmount(e.target.value)}
                            className="w-24 rounded-md border border-[--color-border] px-2 py-2 text-sm text-right"
                          />
                        ) : (
                          amountLimit.toFixed(2)
                        )}
                      </td>
                      <td className="text-[--color-text-muted]">{used.toFixed(2)}</td>
                      <td className={nearingLimit ? 'text-[#b45309]' : 'text-[#15803d]'}>
                        {remaining.toFixed(2)}
                      </td>
                      <td className="text-right">
                        {editingLimitId === limit.id ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleSaveLimit(limit.id)} className="btn-primary">
                              บันทึก
                            </button>
                            <button onClick={handleCancelEdit} className="btn-outline">
                              ยกเลิก
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {!closed && (
                              <button onClick={() => handleEditLimit(limit)} className="btn-outline">
                                แก้ไข
                              </button>
                            )}
                            <button onClick={() => handleDeleteLimit(limit.id)} className="btn-danger">
                              ลบ
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
