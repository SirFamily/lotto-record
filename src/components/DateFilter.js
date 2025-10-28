'use client';

// This is now a controlled component.
// It receives its state and handlers from a parent component.
export default function DateFilter({
  filterType,
  monthValue,
  customStart,
  customEnd,
  onFilterTypeChange,
  onMonthChange,
  onCustomStartChange,
  onCustomEndChange,
  onSearch,
}) {
  return (
    <div className="card p-4 sm:p-5 mobile-stack">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="filter" value="today" checked={filterType === 'today'} onChange={(e) => onFilterTypeChange(e.target.value)} />
          วันนี้
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="filter" value="yesterday" checked={filterType === 'yesterday'} onChange={(e) => onFilterTypeChange(e.target.value)} />
          เมื่อวาน
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="filter" value="thisWeek" checked={filterType === 'thisWeek'} onChange={(e) => onFilterTypeChange(e.target.value)} />
          สัปดาห์นี้
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="filter" value="lastWeek" checked={filterType === 'lastWeek'} onChange={(e) => onFilterTypeChange(e.target.value)} />
          สัปดาห์ที่แล้ว
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[auto_1fr_auto_1fr_auto_auto]">
        <div className="flex items-center gap-2">
          <input type="radio" name="filter" value="month" checked={filterType === 'month'} onChange={(e) => onFilterTypeChange(e.target.value)} />
          <label className="text-sm text-[--color-text-muted]">เดือน:</label>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="month" 
            value={monthValue} 
            onChange={(e) => onMonthChange(e.target.value)} 
            onClick={() => onFilterTypeChange('month')} 
            className="w-full rounded-md border border-[--color-border] px-3 py-2 text-sm" 
          />
        </div>

        <div className="flex items-center gap-2">
          <input type="radio" name="filter" value="custom" checked={filterType === 'custom'} onChange={(e) => onFilterTypeChange(e.target.value)} />
          <label className="text-sm text-[--color-text-muted]">วันที่:</label>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={customStart} 
            onChange={(e) => onCustomStartChange(e.target.value)} 
            onClick={() => onFilterTypeChange('custom')} 
            className="w-full rounded-md border border-[--color-border] px-3 py-2 text-sm" 
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-[--color-text-muted]">ถึง</label>
          <input 
            type="date" 
            value={customEnd} 
            onChange={(e) => onCustomEndChange(e.target.value)} 
            onClick={() => onFilterTypeChange('custom')} 
            className="w-full rounded-md border border-[--color-border] px-3 py-2 text-sm" 
          />
        </div>

        <button onClick={onSearch} className="btn-primary">ค้นหา</button>
      </div>
    </div>
  );
}