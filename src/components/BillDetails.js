'use client';

export default function BillDetails({ bill }) {
  if (!bill) return null;

  return (
    <div className="p-4 border-t border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/50">
      {bill.remark && <p className="mb-3"><strong>หมายเหตุ:</strong> {bill.remark}</p>}
      <div className="overflow-x-auto rounded-md border dark:border-zinc-600">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-zinc-700">
            <tr>
              <th className="p-2 text-left font-semibold">เลข</th>
              <th className="p-2 text-left font-semibold">ประเภท</th>
              <th className="p-2 text-right font-semibold">ราคา</th>
              <th className="p-2 text-center font-semibold">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map(item => (
              <tr key={item.id} className={`border-t dark:border-zinc-600 ${item.state !== 'รับได้' ? 'bg-red-50 dark:bg-red-900/20 text-gray-500 dark:text-gray-400' : ''}`}>
                <td className="p-2 font-mono">{item.number}</td>
                <td className="p-2">{item.text}</td>
                <td className="p-2 text-right font-mono">{parseFloat(item.amount).toFixed(2)}</td>
                <td className={`p-2 text-center font-semibold ${item.state !== 'รับได้' ? 'text-red-500' : 'text-green-500'}`}>
                  {item.state}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
