'use client';

const statusTone = (state) => {
  switch (state) {
    case 'ผ่านการตรวจสอบ':
      return 'text-[#166534]';
    case 'ปิดรับเลขแล้ว':
      return 'text-[#b91c1c]';
    case 'เกินวงเงินที่กำหนด':
      return 'text-[#b45309]';
    default:
      return 'text-[--color-text-muted]';
  }
};

const formatter = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default function BillDetails({ bill }) {
  if (!bill) return null;

  const billCode = String(bill.id).slice(-8).toUpperCase();
  const totalItems = bill.items?.length ?? 0;
  const amount = Number(bill.amount || 0);

  return (
    <div className="mobile-stack border-t border-[--color-border] p-5">
      <div className="mobile-stack rounded-md border border-[--color-border] bg-[--color-surface] p-4 text-sm">
        <div className="flex justify-between">
          <p className="font-semibold text-[--color-text]">รหัสบิล:</p>
          <p className="text-[--color-text-muted]">#{billCode}</p>
        </div>
        <div className="flex justify-between">
          <p className="font-semibold text-[--color-text]">วันที่สร้าง:</p>
          <p className="text-[--color-text-muted]">{bill.createAt ? formatter.format(new Date(bill.createAt)) : 'ไม่ระบุ'}</p>
        </div>
        <div className="flex justify-between">
          <p className="font-semibold text-[--color-text]">วันสิ้นสุด:</p>
          <p className="text-[--color-text-muted]">{bill.dateEnd ? formatter.format(new Date(bill.dateEnd)) : 'ไม่ระบุ'}</p>
        </div>
        <div className="flex justify-between">
          <p className="font-semibold text-[--color-text]">จำนวนรายการ:</p>
          <p className="text-[--color-text-muted]">{totalItems} รายการ</p>
        </div>
        <div className="flex justify-between">
          <p className="font-semibold text-[--color-text]">ยอดรวมบิล:</p>
          <p className="font-semibold text-lg text-blue-600">{amount.toFixed(2)} บาท</p>
        </div>
      </div>

      {bill.remark && (
        <div className="rounded-md border border-[--color-border] bg-[--color-surface] px-4 py-3 text-sm text-[--color-text]">
          <span className="font-semibold">หมายเหตุ:</span> {bill.remark}
        </div>
      )}

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
            {bill.items.map((item) => {
              const amount = Number(item.amount || 0);
              return (
                <tr key={item.id}>
                  <td className="font-mono text-sm tracking-widest">{item.number}</td>
                  <td>{item.text}</td>
                  <td className="text-right">{amount.toFixed(2)}</td>
                  <td className={`text-center text-sm font-semibold ${statusTone(item.state)}`}>
                    {item.state}
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