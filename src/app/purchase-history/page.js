'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import BillHeader from '@/components/BillHeader';
import BillDetails from '@/components/BillDetails';
import DateFilter from '@/components/DateFilter';

// Helper function to format date to YYYY-MM-DD for input[type=date]
function formatDateForInput(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function PurchaseHistoryPage() {
  const { token } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  
  // State for the filter UI, lifted up from DateFilter
  const [filterType, setFilterType] = useState('today');
  const [monthValue, setMonthValue] = useState('');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // State to trigger data fetching
  const [activeDateFilter, setActiveDateFilter] = useState({ start: null, end: null });

  useEffect(() => {
    // Initialize default values for the filter inputs
    const today = new Date();
    const initialMonth = today.toISOString().slice(0, 7);
    setMonthValue(initialMonth);
    setCustomStart(formatDateForInput(today));
    setCustomEnd(formatDateForInput(today));

    // Trigger initial fetch for today
    const { start, end } = getDayRange(today);
    setActiveDateFilter({ start, end });
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(true);
      return;
    }

    const fetchBills = async () => {
      if (!activeDateFilter.start || !activeDateFilter.end) return;

      try {
        setError('');
        setLoading(true);

        const params = new URLSearchParams();
        params.append('startDate', activeDateFilter.start.toISOString());
        params.append('endDate', activeDateFilter.end.toISOString());

        const res = await fetch(`/api/bills?${params.toString()}`, {
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
  }, [token, activeDateFilter]);

  const getDayRange = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const handleSearch = () => {
    let startDate, endDate;
    const today = new Date();

    switch (filterType) {
      case 'today':
        ({ start: startDate, end: endDate } = getDayRange(today));
        break;
      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        ({ start: startDate, end: endDate } = getDayRange(yesterday));
        break;
      case 'thisWeek':
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay());
        ({ start: startDate } = getDayRange(firstDayOfWeek));
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
        ({ end: endDate } = getDayRange(lastDayOfWeek));
        break;
      case 'lastWeek':
        const endOfLastWeek = new Date(today);
        endOfLastWeek.setDate(today.getDate() - today.getDay() - 1);
        ({ end: endDate } = getDayRange(endOfLastWeek));
        const startOfLastWeek = new Date(endOfLastWeek);
        startOfLastWeek.setDate(startOfLastWeek.getDate() - 6);
        ({ start: startDate } = getDayRange(startOfLastWeek));
        break;
      case 'month':
        const [year, monthNum] = monthValue.split('-');
        startDate = new Date(year, monthNum - 1, 1);
        endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
        break;
      case 'custom':
        startDate = new Date(customStart);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(customEnd);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        return;
    }
    setActiveDateFilter({ start: startDate, end: endDate });
  };

  if (loading && bills.length === 0) { // Show initial loading screen
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
          ใช้ฟิลเตอร์ด้านล่างเพื่อค้นหาโพยตามช่วงวันที่ที่ต้องการ
        </p>
      </section>

      <DateFilter 
        filterType={filterType}
        monthValue={monthValue}
        customStart={customStart}
        customEnd={customEnd}
        onFilterTypeChange={setFilterType}
        onMonthChange={setMonthValue}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
        onSearch={handleSearch}
      />

      <section className="mobile-stack">
        {loading && <div className="text-center text-sm text-[--color-text-muted]">กำลังค้นหา...</div>}
        {!loading && bills.length === 0 ? (
          <div className="card px-5 py-6 text-center text-sm text-[--color-text-muted]">
            ไม่พบประวัติโพยในช่วงวันที่ที่เลือก
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
