'use client';

import { useState, useEffect, useMemo } from 'react';
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

const stateClass = (state) => {
  switch (state) {
    case 'ผ่านการตรวจสอบ':
      return 'rounded-md border border-[#bbf7d0] bg-[#ecfdf3] px-3 py-1 text-xs font-semibold text-[#166534]';
    case 'ปิดรับเลขแล้ว':
      return 'rounded-md border border-[#fecaca] bg-[#fff5f5] px-3 py-1 text-xs font-semibold text-[#7f1d1d]';
    case 'เกินวงเงินที่กำหนด':
      return 'rounded-md border border-[#fde68a] bg-[#fff7e6] px-3 py-1 text-xs font-semibold text-[#854d0e]';
    default:
      return 'rounded-md border border-[--color-border] bg-[--color-surface] px-3 py-1 text-xs font-semibold text-[--color-text]';
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
          fetch('/api/close-numbers', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/limit-numbers', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!closedRes.ok || !limitedRes.ok) {
          throw new Error('ไม่สามารถตรวจสอบเลขอั้นหรือเลขปิดได้');
        }

        const allClosedNumbers = await closedRes.json();
        const allLimitNumbers = await limitedRes.json();

        const finalItems = [];
        const limitUsage = {};

        for (const group of billItems) {
          for (const num of group.numbers) {
            const processBet = (type, amount) => {
              const isClosed = allClosedNumbers.some(
                (cn) => cn.number === num && cn.type === type,
              );
              const limitedEntry = allLimitNumbers.find(
                (ln) => ln.number === num && ln.type === type,
              );

              let itemState = 'ผ่านการตรวจสอบ';
              let finalAmount = amount;

              if (isClosed) {
                itemState = 'ปิดรับเลขแล้ว';
                finalAmount = 0;
              } else if (limitedEntry) {
                const limitKey = `${type}-${num}`;
                const alreadyUsed = limitUsage[limitKey] ?? parseFloat(limitedEntry.used);
                const available = parseFloat(limitedEntry.amountlimit) - alreadyUsed;

                if (available <= 0) {
                  itemState = 'เกินวงเงินที่กำหนด';
                  finalAmount = 0;
                } else if (amount > available) {
                  itemState = 'เกินวงเงินที่กำหนด';
                  finalAmount = parseFloat(available.toFixed(2));
                  limitUsage[limitKey] = alreadyUsed + finalAmount;
                } else {
                  limitUsage[limitKey] = alreadyUsed + amount;
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

            if (group.top > 0) {
              const type = num.length === 3 ? 'threeNumberTop' : 'twoNumberTop';
              processBet(type, group.top);
            }
            if (group.bottom > 0) {
              processBet('twoNumberButton', group.bottom);
            }
            if (group.tote > 0) {
              processBet('threeNumberTode', group.tote);
            }
          }
        }

        setValidatedItems(finalItems);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    validateBill();
  }, [billItems, token]);

  const totalAmount = useMemo(
    () => validatedItems.reduce((sum, item) => sum + item.amount, 0),
    [validatedItems],
  );

  const rejectedItems = validatedItems.filter(
    (item) => item.state !== 'ผ่านการตรวจสอบ' && item.amount === 0,
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="card w-full max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[--color-border] px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-[--color-text]">ตรวจสอบโพยก่อนบันทึก</p>
            <p className="text-xs text-[--color-text-muted]">
              ระบบช่วยเช็กเลขปิดและวงเงินให้อัตโนมัติ
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[--color-border]"
            aria-label="ปิดหน้าต่างตรวจสอบโพย"
          >
            ×
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-5 mobile-stack">
          {loading && (
            <div className="rounded-md border border-[--color-border] bg-[--color-surface] px-4 py-6 text-center text-sm text-[--color-text-muted]">
              กำลังตรวจสอบข้อมูลโพย...
            </div>
          )}

          {error && (
            <div className="rounded-md border border-[#fca5a5] bg-[#fff5f5] px-4 py-3 text-sm text-[#7f1d1d]">
              ตรวจสอบไม่สำเร็จ: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="table-wrapper">
                <table className="table-simple">
                  <thead>
                    <tr>
                      <th>เลข</th>
                      <th>ประเภท</th>
                      <th className="text-right">ยอดรับ</th>
                      <th className="text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validatedItems.map((item, index) => (
                      <tr key={`${item.number}-${item.type}-${index}`}>
                        <td className="font-mono text-sm tracking-widest">{item.number}</td>
                        <td>{item.text}</td>
                        <td className="text-right">{item.amount.toFixed(2)}</td>
                        <td className="text-center">
                          <span className={stateClass(item.state)}>{item.state}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {remark && (
                <div className="rounded-md border border-[--color-border] bg-[--color-surface] px-4 py-3 text-sm text-[--color-text-muted]">
                  <span className="font-semibold text-[--color-text]">หมายเหตุ:</span> {remark}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-[--color-text-muted]">
                  รายการทั้งหมด {validatedItems.length} รายการ • ปฏิเสธ {rejectedItems} รายการ
                </div>
                <div className="text-right">
                  <p className="text-xs text-[--color-text-muted]">ยอดรับสุทธิ</p>
                  <p className="text-xl font-semibold text-[--color-text]">
                    {totalAmount.toFixed(2)} บาท
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={onCancel} className="btn-outline">
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={() => onConfirm(validatedItems, remark)}
                  className="btn-primary"
                >
                  ยืนยันบันทึกโพย
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
