'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { calculateDateEnd } from '@/utils/dateHelpers';
import BillConfirmationModal from './BillConfirmationModal';

const betTypeOptions = [
  { key: '2', label: 'เลข 2 ตัว', description: 'เลือกบน-ล่าง', digits: 2 },
  { key: '3', label: 'เลข 3 ตัว', description: 'รองรับบนและโต๊ด', digits: 3 },
];

const betTargetLabels = {
  top: 'บน',
  bottom: 'ล่าง',
  tote: 'โต๊ด',
};

const presetAmounts = ['20', '50', '100', '200'];

const generateNumbers = (digits) => {
  const numbers = [];
  const max = Math.pow(10, digits);
  for (let i = 0; i < max; i++) {
    numbers.push(String(i).padStart(digits, '0'));
  }
  return numbers;
};

const generateThreeDigitPermutations = (number) => {
  if (number.length !== 3) return [];
  const digits = number.split('');
  const permutations = [
    digits[0] + digits[1] + digits[2],
    digits[0] + digits[2] + digits[1],
    digits[1] + digits[0] + digits[2],
    digits[1] + digits[2] + digits[0],
    digits[2] + digits[0] + digits[1],
    digits[2] + digits[1] + digits[0],
  ];
  return [...new Set(permutations)];
};

const canReverseNumber = (number, type) => {
  if (type === '2') {
    return number[0] !== number[1];
  }
  if (type === '3') {
    const digits = number.split('');
    return new Set(digits).size > 1;
  }
  return false;
};

export default function LotterySaleForm() {
  const { token } = useAuth();
  const { showLoading, hideLoading, showToast } = useNotification();

  const [currentBetType, setCurrentBetType] = useState('2');
  const [previewNumbers, setPreviewNumbers] = useState([]);
  const [numberInput, setNumberInput] = useState('');
  const [amounts, setAmounts] = useState({ top: '', bottom: '', tote: '' });
  const [billItems, setBillItems] = useState([]);
  const [remark, setRemark] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isThreeDigit = currentBetType === '3';
  const numberInputMaxLength = isThreeDigit ? 3 : 2;
  const activeTargets = isThreeDigit ? ['top', 'tote'] : ['top', 'bottom'];

  const handleBetTypeChange = (type) => {
    setCurrentBetType(type);
    setPreviewNumbers([]);
    setNumberInput('');
    setAmounts({ top: '', bottom: '', tote: '' });
    showToast(type === '2' ? 'สลับเป็นเลข 2 ตัว' : 'สลับเป็นเลข 3 ตัว', 'info');
  };

  const validateNumberInput = (value, type) => {
    if (!value) {
      return { valid: false, message: 'กรุณากรอกเลขก่อนเพิ่ม' };
    }
    if (!/^\d+$/.test(value)) {
      return { valid: false, message: 'เลขต้องเป็นตัวเลขเท่านั้น' };
    }
    const requiredLength = type === '2' ? 2 : 3;
    if (value.length !== requiredLength) {
      return { valid: false, message: `เลขประเภทนี้ต้องมี ${requiredLength} หลัก` };
    }
    return { valid: true, number: value };
  };

  const handleNumberInputChange = (e) => {
    const value = e.target.value;
    if (value.length > numberInputMaxLength) return;
    if (!/^\d*$/.test(value)) return;
    setNumberInput(value);
    if (value.length === numberInputMaxLength) {
      addNumberToPreview(value);
    }
  };

  const handleNumberInputKeyDown = (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      handleReversePreviewNumbers();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      addNumberToPreview(numberInput);
    }
  };

  const addNumberToPreview = (numValue) => {
    const validation = validateNumberInput(numValue, currentBetType);
    if (!validation.valid) {
      showToast(validation.message, 'warning');
      return;
    }
    setPreviewNumbers((prev) => [...prev, validation.number]);
    setNumberInput('');
  };

  const removeFromPreview = (index) => {
    setPreviewNumbers((prev) => prev.filter((_, i) => i !== index));
  };

  const clearPreview = () => {
    setPreviewNumbers([]);
    showToast('ล้างรายการเลขแล้ว', 'info');
  };

  const removeDuplicates = () => {
    setPreviewNumbers((prev) => {
      const unique = [...new Set(prev)];
      if (unique.length !== prev.length) {
        showToast('ลบเลขซ้ำออกแล้ว', 'success');
      }
      return unique;
    });
  };

  const addDuplicateNumbers = () => {
    const duplicates = generateNumbers(numberInputMaxLength).filter((num) => {
      const digits = num.split('');
      return digits.every((d) => d === digits[0]);
    });
    setPreviewNumbers((prev) => [...prev, ...duplicates]);
    showToast('เพิ่มเลขเบิ้ล/ตองเข้ารายการแล้ว', 'success');
  };

  const handleReversePreviewNumbers = () => {
    if (previewNumbers.length === 0) {
      showToast('ยังไม่มีเลขให้กลับ', 'warning');
      return;
    }

    const reversedNumbers = [];
    previewNumbers.forEach((num) => {
      if (!canReverseNumber(num, currentBetType)) return;
      if (num.length === 2) {
        const reversed = num.split('').reverse().join('');
        if (!previewNumbers.includes(reversed)) reversedNumbers.push(reversed);
      } else if (num.length === 3) {
        generateThreeDigitPermutations(num).forEach((perm) => {
          if (!previewNumbers.includes(perm)) reversedNumbers.push(perm);
        });
      }
    });

    if (reversedNumbers.length === 0) {
      showToast('ไม่มีเลขใหม่หลังกลับเลข', 'info');
    } else {
      setPreviewNumbers((prev) => [...new Set([...prev, ...reversedNumbers])]);
      showToast(`เพิ่มเลขกลับ ${reversedNumbers.length} รายการ`, 'success');
    }
  };

  const setAmountValue = (target, value) => {
    setAmounts((prev) => ({ ...prev, [target]: value }));
  };

  const addPresetAmount = (target, value) => {
    const current = parseFloat(amounts[target] || '0');
    const next = (current + parseFloat(value)).toString();
    setAmountValue(target, next);
  };

  const addBillItem = () => {
    if (previewNumbers.length === 0) {
      showToast('กรุณาเพิ่มเลขก่อนนำเข้าตาราง', 'warning');
      return;
    }

    const topNum = parseFloat(amounts.top) || 0;
    const bottomNum = !isThreeDigit ? parseFloat(amounts.bottom) || 0 : 0;
    const toteNum = isThreeDigit ? parseFloat(amounts.tote) || 0 : 0;

    if (topNum === 0 && bottomNum === 0 && toteNum === 0) {
      showToast('กรุณาระบุยอดอย่างน้อยหนึ่งช่อง', 'warning');
      return;
    }

    const newBillItem = {
      id: Date.now(),
      numbers: [...previewNumbers],
      top: topNum,
      bottom: bottomNum,
      tote: toteNum,
    };

    setBillItems((prev) => [...prev, newBillItem]);
    setPreviewNumbers([]);
    setAmounts({ top: '', bottom: '', tote: '' });
    showToast('เพิ่มลงตารางโพยแล้ว', 'success');
  };

  const deleteBillItem = (id) => {
    setBillItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveBill = () => {
    if (billItems.length === 0) {
      showToast('ยังไม่มีรายการโพยให้บันทึก', 'warning');
      return;
    }
    setIsModalOpen(true);
  };

  const confirmSaveBill = async (validatedItems, confirmedRemark) => {
    setIsModalOpen(false);
    showLoading('กำลังบันทึกโพย...');
    try {
      const dateEnd = calculateDateEnd();
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ remark: confirmedRemark, items: validatedItems, dateEnd }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('บันทึกโพยเรียบร้อย', 'success');
        handleCancelBill();
      } else {
        showToast(data.message || 'ไม่สามารถบันทึกโพยได้', 'error');
      }
    } catch (error) {
      console.error('Error saving bill:', error);
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
    } finally {
      hideLoading();
    }
  };

  const cancelSaveBill = () => {
    setIsModalOpen(false);
  };

  const handleCancelBill = () => {
    setBillItems([]);
    setRemark('');
    setPreviewNumbers([]);
    setAmounts({ top: '', bottom: '', tote: '' });
  };

  const totalAmount = useMemo(() => {
    return billItems.reduce((sum, item) => {
      const itemCount = item.numbers.length;
      const totalForItem = (item.top + item.bottom + item.tote) * itemCount;
      return sum + totalForItem;
    }, 0);
  }, [billItems]);

  return (
    <div className="mobile-stack">
      {isModalOpen && (
        <BillConfirmationModal
          billItems={billItems}
          remark={remark}
          onConfirm={confirmSaveBill}
          onCancel={cancelSaveBill}
        />
      )}

      <section className="mobile-stack rounded-md border border-[--color-border] p-4 sm:p-5">
        <p className="text-sm font-medium text-[--color-text]">เลือกประเภทเลข</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {betTypeOptions.map((option) => {
            const isActive = option.key === currentBetType;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => handleBetTypeChange(option.key)}
                className={`rounded-md border px-4 py-3 text-left transition-colors ${ 
                  isActive
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-transparent border-[--color-border] hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                <p className="font-semibold">{option.label}</p>
                <p className={`text-xs ${isActive ? 'text-blue-200' : 'text-[--color-text-muted]'}`}>{option.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-md border border-dashed border-[--color-border] p-3">
        {previewNumbers.length === 0 ? (
          <p className="text-center text-sm text-[--color-text-muted]">
            เพิ่มเลขเพื่อเตรียมบันทึก ระบบจะแสดงที่นี่ก่อนนำลงตาราง
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {previewNumbers.map((num, index) => (
                                <button
                                  key={`${num}-${index}`}
                                  type="button"
                                  onClick={() => removeFromPreview(index)}
                                  className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  {num} &times;
                                </button>            ))}
          </div>
        )}
      </section>

      <section className="mobile-stack rounded-md border border-[--color-border] p-4 sm:p-5">
        <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleReversePreviewNumbers}
              className="btn-outline text-xs"
            >
              กลับเลข
            </button>
            <button
              type="button"
              onClick={removeDuplicates}
              className="btn-outline text-xs"
            >
              ลบเลขซ้ำ
            </button>
            <button
              type="button"
              onClick={addDuplicateNumbers}
              className="btn-outline text-xs"
            >
              เพิ่มเลขเบิ้ล/ตอง
            </button>
            <button
              type="button"
              onClick={clearPreview}
              className="btn-danger-outline text-xs"
            >
              ล้างรายการ
            </button>
          </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="mobile-stack">
            <label htmlFor="number-input" className="text-sm font-medium text-[--color-text]">
              ใส่เลขที่นี่
            </label>
            <input
              id="number-input"
              type="text"
              value={numberInput}
              onChange={handleNumberInputChange}
              onKeyDown={handleNumberInputKeyDown}
              maxLength={numberInputMaxLength}
              placeholder={isThreeDigit ? 'ใส่เลข 3 ตัว' : 'ใส่เลข 2 ตัว'}
              className="w-full rounded-md border border-[--color-border] px-4 py-3 text-sm"
            />
          </div>
          {activeTargets.map((target) => (
            <div key={target} className="mobile-stack">
              <label className="text-sm font-medium text-[--color-text]">
                ใส่ราคา ({betTargetLabels[target]})
              </label>
              <input
                type="number"
                min={0}
                step="1"
                value={amounts[target]}
                placeholder={'ราคา'}
                onChange={(e) => setAmountValue(target, e.target.value)}
                className="w-full rounded-md border border-[--color-border] px-4 py-3 text-sm"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mobile-stack">
        <button
          type="button"
          onClick={addBillItem}
          className="btn-primary w-full"
        >
          เพิ่มลงตารางโพย
        </button>

        <div className="table-wrapper">
          <table className="table-simple">
            <thead>
              <tr>
                <th>ประเภท</th>
                <th>รายการเลข</th>
                <th className="text-right">ยอดต่อเลข</th>
                <th className="text-right">จำนวนเลข</th>
                <th className="text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {billItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-sm text-[--color-text-muted]">
                    ยังไม่มีรายการในโพย
                  </td>
                </tr>
              ) : (
                billItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.numbers[0].length === 2 ? 'เลข 2 ตัว' : 'เลข 3 ตัว'}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {item.numbers.map((num, index) => (
                          <span
                            key={`${num}-${index}`}
                            className="rounded-md border border-[--color-border] px-2 py-1 text-xs"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-right text-sm text-[--color-text-muted]">
                      {item.top > 0 && <div>บน: {item.top.toFixed(2)}</div>}
                      {item.bottom > 0 && <div>ล่าง: {item.bottom.toFixed(2)}</div>}
                      {item.tote > 0 && <div>โต๊ด: {item.tote.toFixed(2)}</div>}
                    </td>
                    <td className="text-right">{item.numbers.length}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => deleteBillItem(item.id)}
                        className="btn-danger text-xs"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mobile-stack rounded-md border border-[--color-border] p-4 sm:p-5">
        <label htmlFor="bill-remark" className="text-sm font-medium text-[--color-text]">
          หมายเหตุ (ถ้ามี)
        </label>
        <input
          id="bill-remark"
          type="text"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="เช่น โพยลูกค้าประจำ หรือเก็บเงินแล้ว"
          className="mt-2 w-full rounded-md border border-[--color-border] px-4 py-3 text-sm"
        />
      </section>

      <section className="mobile-stack rounded-md border border-[--color-border] p-4 sm:p-5 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-[--color-text-muted]">ยอดรวมสุทธิ</p>
          <p className="text-2xl font-semibold text-[--color-text]">
            {totalAmount.toFixed(2)} บาท
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleCancelBill}
            className="btn-outline"
          >
            รีเซ็ตแบบฟอร์ม
          </button>
          <button
            type="button"
            onClick={handleSaveBill}
            className="btn-primary"
          >
            บันทึกโพย
          </button>
        </div>
      </section>
    </div>
  );
}
