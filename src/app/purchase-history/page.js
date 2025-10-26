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
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch purchase history.');
        }

        const data = await res.json();
        setBills(data);
      } catch (err) {
        console.error("Error fetching bills:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [token]);

  const handleSelectBill = (bill) => {
    setSelectedBill(bill);
  };

  const handleCloseModal = () => {
    setSelectedBill(null);
  };

  if (loading) return <p className="text-center mt-8">Loading history...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">ประวัติการซื้อ</h1>
      
      <div className="space-y-4">
        {bills.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">ไม่พบประวัติการซื้อ</p>
        ) : (
          bills.map(bill => (
            <div key={bill.id} className="bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-gray-200 dark:border-zinc-700 overflow-hidden">
              <BillHeader bill={bill} onToggle={() => handleSelectBill(bill)} />
            </div>
          ))
        )}
      </div>

      {selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={handleCloseModal}>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b dark:border-zinc-700 flex justify-between items-center">
                <h2 className="text-xl font-bold">รายละเอียดบิล ID: {String(selectedBill.id).slice(-8)}</h2>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">&times;</button>
            </div>
            <BillDetails bill={selectedBill} />
          </div>
        </div>
      )}
    </div>
  );
}
