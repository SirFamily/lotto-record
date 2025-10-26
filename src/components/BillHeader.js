'use client';

const formatter = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default function BillHeader({ bill, onToggle }) {
  const billCode = String(bill.id).slice(-8).toUpperCase();
  const totalItems = bill.items?.length ?? 0;
  const amount = Number(bill.amount || 0);

  const handleClick = () => {
    if (onToggle) onToggle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full rounded-md border border-[--color-border] bg-[--color-surface] px-4 py-3 text-left transition hover:border-[--color-primary]"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase text-[--color-text-muted]">โพย #{billCode}</p>
          <p className="text-sm text-[--color-text]">
            {bill.createAt ? formatter.format(new Date(bill.createAt)) : 'ไม่ระบุเวลา'}
          </p>
        </div>
        <div className="text-sm text-[--color-text] sm:text-right">
          <p className="text-base font-semibold">{amount.toFixed(2)} บาท</p>
          <p className="text-xs text-[--color-text-muted]">{totalItems} รายการ</p>
        </div>
      </div>
    </button>
  );
}
