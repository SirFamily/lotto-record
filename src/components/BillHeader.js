'use client';

export default function BillHeader({ bill, onToggle }) {
  return (
    <div 
      className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
      onClick={onToggle}
    >
      <div>
        <p className="font-semibold text-lg">Bill ID: {String(bill.id).slice(-8)}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(bill.createAt).toLocaleString()}
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-xl text-blue-600 dark:text-blue-400">{parseFloat(bill.amount).toFixed(2)} บาท</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{bill.items.length} รายการ</p>
      </div>
    </div>
  );
}
