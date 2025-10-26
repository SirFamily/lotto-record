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

export default function BillDetails({ bill }) {
  if (!bill) return null;

  return (
    <div className="mobile-stack border-t border-[--color-border] p-5">
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
