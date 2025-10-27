'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import BillHeader from '@/components/BillHeader';
import BillDetails from '@/components/BillDetails';

export default function PurchaseHistoryPage() {
  const { token } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(true);
      return;
    }

    const fetchBills = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await fetch('/api/bills', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'ไม่สามารถดึงประวัติโพยได้');
        }

        const data = await res.json();
        setBills(data);
      } catch (err) {
        console.error('Error fetching bills:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[--color-text-muted]">
        กำลังโหลดประวัติโพย...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card px-6 py-8 text-center text-sm text-[#7f1d1d] border border-[#fca5a5] bg-[#fff5f5]">
        เกิดข้อผิดพลาด: {error}
      </div>
    );
  }

  return (
    <div className="mobile-stack pb-8">
      <section className="card p-6 sm:p-8">
        <div className="pill">ประวัติโพย</div>
        <h1 className="section-heading mt-4">ตรวจสอบโพยย้อนหลังได้ทุกเมื่อ</h1>
        <p className="section-copy mt-3">
          เลือกโพยเพื่อดูรายละเอียดเลขและสถานะอย่างละเอียด ช่วยตรวจสอบยอดก่อนปิดรอบและติดตามการขายได้ง่ายขึ้น
        </p>
      </section>

      <section className="mobile-stack">
        {bills.length === 0 ? (
          <div className="card px-5 py-6 text-center text-sm text-[--color-text-muted]">
            ยังไม่มีประวัติโพยในระบบ
          </div>
        ) : (
          <div className="mobile-stack">
            {bills.map((bill) => (
              <BillHeader key={bill.id} bill={bill} onToggle={() => setSelectedBill(bill)} />
            ))}
          </div>
        )}
      </section>

      {selectedBill && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setSelectedBill(null)}
        >
                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[--color-border] px-5 py-4">
              <p className="text-sm font-semibold text-[--color-text]">
                รายละเอียดโพย #{String(selectedBill.id).slice(-8).toUpperCase()}
              </p>
              <button
                type="button"
                onClick={() => setSelectedBill(null)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[--color-border]"
                aria-label="ปิดหน้าต่างรายละเอียดโพย"
              >
                ×
              </button>
            </div>
            <BillDetails bill={selectedBill} />
          </div>
        </div>
      )}
    </div>
  );
}
