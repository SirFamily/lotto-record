'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { calculateDateEnd } from '@/utils/dateHelpers';

const typeToThaiText = (type) => {
  switch (type) {
    case 'twoNumberTop': return '2 ตัวบน';
    case 'twoNumberButton': return '2 ตัวล่าง';
    case 'threeNumberTop': return '3 ตัวบน';
    case 'threeNumberTode': return '3 ตัวโต๊ด';
    default: return '';
  }
};

const generateNumbers = (digits) => {
  const numbers = [];
  const max = Math.pow(10, digits);
  for (let i = 0; i < max; i++) {
    numbers.push(String(i).padStart(digits, '0'));
  }
  return numbers;
};

const generateThreeDigitPermutations = (number) => {
  if (number.length !== 3) return [];
  const digits = number.split('');
  const permutations = [
    digits[0] + digits[1] + digits[2],
    digits[0] + digits[2] + digits[1],
    digits[1] + digits[0] + digits[2],
    digits[1] + digits[2] + digits[0],
    digits[2] + digits[0] + digits[1],
    digits[2] + digits[1] + digits[0]
  ];
  return [...new Set(permutations)];
};

const canReverseNumber = (number, type) => {
  if (type === "2") {
    return number[0] !== number[1];
  }
  if (type === "3") {
    const digits = number.split('');
    return new Set(digits).size > 1;
  }
  return false;
};

export default function LotterySaleForm() {
  const { token } = useAuth();
  const [currentBetType, setCurrentBetType] = useState("2");
  const [previewNumbers, setPreviewNumbers] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [numberInput, setNumberInput] = useState('');
  const [amountTop, setAmountTop] = useState('0');
  const [amountBottom, setAmountBottom] = useState('0');
  const [amountTote, setAmountTote] = useState('0');
  const [remark, setRemark] = useState('');
  const [message, setMessage] = useState('');

  const isThreeDigit = currentBetType === "3";
  const numberInputMaxLength = isThreeDigit ? 3 : 2;

  const handleBetTypeChange = (type) => {
    setCurrentBetType(type);
    setPreviewNumbers([]);
    setNumberInput('');
    setAmountTop('0');
    setAmountBottom('0');
    setAmountTote('0');
    setMessage('');
  };

  const validateNumberInput = (value, type) => {
    if (!value || value.length === 0) return { valid: false, message: "กรุณากรอกเลข" };
    if (!/^\d+$/.test(value)) return { valid: false, message: "กรุณากรอกเฉพาะตัวเลข" };
    const requiredLength = type === "2" ? 2 : 3;
    if (value.length !== requiredLength) return { valid: false, message: `เลข ${type} ตัวต้องมี ${requiredLength} หลัก` };
    return { valid: true, number: value };
  };

  const validateAmountInput = (amount) => {
    if (!amount || amount.length === 0) return { valid: false, message: "กรุณากรอกจำนวนเงิน" };
    if (!/^[0-9.]+$/.test(amount)) return { valid: false, message: "กรุณากรอกเฉพาะตัวเลข" };
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0) return { valid: false, message: "จำนวนเงินต้องเป็นตัวเลขและมากกว่า 0" };
    return { valid: true, amount: num };
  };

  const handleNumberInputChange = (e) => {
    const value = e.target.value;
    if (value.length > numberInputMaxLength) return;
    if (!/^[0-9]*$/.test(value)) return;
    setNumberInput(value);
    if (value.length === numberInputMaxLength) {
      addNumberToPreview(value);
    }
  };

  const handleNumberInputKeyDown = (e) => {
    if (e.key === " ") {
      e.preventDefault();
      handleReversePreviewNumbers();
    } else if (e.key === "Enter") {
      e.preventDefault();
      addNumberToPreview(numberInput);
    }
  };

  const addNumberToPreview = (numValue) => {
    setMessage('');
    const validation = validateNumberInput(numValue, currentBetType);
    if (!validation.valid) {
      setMessage(validation.message);
      return;
    }

    const numToAdd = validation.number;
    // Removed duplicate check to allow adding the same number multiple times
    // if (previewNumbers.includes(numToAdd)) {
    //   setMessage('เลขนี้มีอยู่ใน Preview แล้ว');
    //   return;
    // }

    setPreviewNumbers((prev) => [...prev, numToAdd]);
    setNumberInput('');
  };

  const removeFromPreview = (index) => {
    setPreviewNumbers((prev) => prev.filter((_, i) => i !== index));
  };

  const clearPreview = () => setPreviewNumbers([]);

  const removeDuplicates = () => {
    setPreviewNumbers((prev) => [...new Set(prev)]);
    setMessage('ลบเลขซ้ำเรียบร้อยแล้ว');
  };

  const addDuplicateNumbers = () => {
    const duplicates = generateNumbers(currentBetType === "2" ? 2 : 3).filter(num => {
      const digits = num.split('');
      return digits.every(d => d === digits[0]); // Check if all digits are the same
    });
    const newNumbers = [...previewNumbers, ...duplicates];
    setPreviewNumbers(newNumbers);
    setMessage('เพิ่มเลขเบิ้ลเรียบร้อยแล้ว');
  };

  const handleReversePreviewNumbers = () => {
    if (previewNumbers.length === 0) return;
    const reversedNumbers = [];
    previewNumbers.forEach(num => {
      if (!canReverseNumber(num, currentBetType)) return;

      if (num.length === 2) {
        const reversed = num.split('').reverse().join('');
        if (!previewNumbers.includes(reversed)) reversedNumbers.push(reversed);
      } else if (num.length === 3) {
        generateThreeDigitPermutations(num).forEach(perm => {
          if (!previewNumbers.includes(perm)) reversedNumbers.push(perm);
        });
      }
    });
    setPreviewNumbers(prev => [...new Set([...prev, ...reversedNumbers])]);
  };

  const addBillItem = () => {
    if (previewNumbers.length === 0) { setMessage("กรุณาเพิ่มหมายเลขก่อน"); return; }
    const topNum = parseFloat(amountTop) || 0;
    const botNum = currentBetType === "2" ? (parseFloat(amountBottom) || 0) : 0;
    const toteNum = currentBetType === "3" ? (parseFloat(amountTote) || 0) : 0;
    if (topNum === 0 && botNum === 0 && toteNum === 0) { setMessage('กรุณากรอกจำนวนเงินอย่างน้อยหนึ่งช่อง'); return; }

    const newBillItems = [];
    if (topNum > 0) {
      const type = isThreeDigit ? 'threeNumberTop' : 'twoNumberTop';
      const text = typeToThaiText(type);
      previewNumbers.forEach(num => {
        newBillItems.push({ type, text, number: num, amount: topNum });
      });
    }
    if (botNum > 0) {
      const type = 'twoNumberButton';
      const text = typeToThaiText(type);
      previewNumbers.forEach(num => {
        newBillItems.push({ type, text, number: num, amount: botNum });
      });
    }
    if (toteNum > 0) {
      const type = 'threeNumberTode';
      const text = typeToThaiText(type);
      previewNumbers.forEach(num => {
        newBillItems.push({ type, text, number: num, amount: toteNum });
      });
    }

    setBillItems(prev => [...prev, ...newBillItems]);
    setPreviewNumbers([]);
    setAmountTop('0');
    setAmountBottom('0');
    setAmountTote('0');
  };

  const deleteBillItem = (index) => {
    setBillItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveBill = async () => {
    if (billItems.length === 0) { setMessage('ไม่มีรายการบิลให้บันทึก'); return; }

    const itemsToSubmit = billItems.map(item => ({
      ...item,
      text: typeToThaiText(item.type),
      state: 'รับได้', // Default state for now
    }));

    try {
      const dateEnd = calculateDateEnd();
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ remark, items: itemsToSubmit, dateEnd }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`บันทึกบิลเรียบร้อยแล้ว!`);
        handleCancelBill();
      } else {
        setMessage(data.message || 'ไม่สามารถบันทึกบิลได้');
      }
    } catch (error) {
      setMessage('Network error saving bill');
      console.error('Error saving bill:', error);
    }
  };

  const handleCancelBill = () => {
    setBillItems([]);
    setRemark('');
    setMessage('ยกเลิกบิลแล้ว');
  };

  const totalAmount = useMemo(() => {
    return billItems.reduce((sum, item) => sum + item.amount, 0);
  }, [billItems]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100">
      <h3 className="text-2xl md:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
        บันทึกการซื้อหวยรัฐบาล
      </h3>

      {message && <div className="fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 bg-blue-500 text-white">{message}</div>}

      <div className="flex flex-wrap gap-3 mb-8">
        <button onClick={() => handleBetTypeChange("2")} className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${currentBetType === "2" ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 shadow-lg shadow-yellow-200' : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'}`}>2 ตัว</button>
        <button onClick={() => handleBetTypeChange("3")} className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${currentBetType === "3" ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 shadow-lg shadow-yellow-200' : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'}`}>3 ตัว</button>
      </div>

      <div className="mb-6">
        <div className="flex gap-3 items-start flex-col md:flex-row">
          <div id="preview-container" className="preview-container flex-1 w-full border-2 border-dashed border-blue-300 rounded-xl p-4 flex flex-wrap gap-2 bg-blue-50/50">
            {previewNumbers.length === 0 ? <span className="text-gray-400 text-lg">เลขที่เลือก...</span> : previewNumbers.map((num, index) => (
              <button key={index} onClick={() => removeFromPreview(index)} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all shadow-md hover:shadow-lg font-semibold">{num}</button>
            ))}
          </div>
          <div className="flex md:flex-col gap-2 w-full md:w-auto">
            <button onClick={clearPreview} className="flex-1 md:flex-none px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium"><i className="fas fa-trash-alt"></i><span className="md:hidden">ยกเลิก</span></button>
            <button onClick={removeDuplicates} className="flex-1 md:flex-none px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium"><i className="fas fa-ban"></i><span className="md:hidden">ลบซ้ำ</span></button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          <button onClick={addDuplicateNumbers} className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"><i className="fas fa-plus"></i>เลขเบิ้ล</button>
          <button onClick={handleReversePreviewNumbers} className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"><i className="fas fa-redo-alt"></i>เลขกลับ</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">ใส่เลข</label>
          <input id="number-input" type="text" value={numberInput} onChange={handleNumberInputChange} onKeyDown={handleNumberInputKeyDown} maxLength={numberInputMaxLength} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold text-lg" placeholder={`กรอกเลข ${currentBetType} ตัว`} />
          <p className="text-xs text-gray-500 mt-1">กด Space เพื่อกลับเลขใน Preview</p>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">บน</label>
          <input id="amount-top" type="text" value={amountTop} onChange={(e) => setAmountTop(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold text-lg" />
        </div>
        {!isThreeDigit && (
          <div id="bottom-amount-container">
            <label className="block text-sm font-semibold mb-2 text-gray-700">ล่าง</label>
            <input id="amount-bottom" type="text" value={amountBottom} onChange={(e) => setAmountBottom(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold text-lg" />
          </div>
        )}
        {isThreeDigit && (
          <div id="tote-amount-container">
            <label className="block text-sm font-semibold mb-2 text-gray-700">โต๊ด</label>
            <input id="amount-tote" type="text" value={amountTote} onChange={(e) => setAmountTote(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold text-lg" />
          </div>
        )}
        <div className="flex items-end md:col-span-2">
          <button onClick={addBillItem} className="w-full px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-bold"><i className="fas fa-plus"></i>เพิ่มบิล</button>
        </div>
      </div>

      <div className="overflow-x-auto mb-6 rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">หมายเลข</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">การจ่าย</th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">ลบ</th>
            </tr>
          </thead>
          <tbody id="bill-items">
            {billItems.length === 0 ? (
              <tr><td colSpan="3" className="px-4 py-12 text-center text-gray-500 text-lg">ไม่มีรายการบิล</td></tr>
            ) : (
              billItems.map((item, index) => (
                <tr key={index} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 font-semibold">{item.number}</td>
                  <td className="px-4 py-4 text-sm font-semibold">{item.text}: {item.amount}</td>
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => deleteBillItem(index)} className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"><i className="fas fa-trash-alt"></i></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
        <label htmlFor="bill-notes" className="block text-sm font-semibold mb-2 text-gray-700">หมายเหตุ:</label>
        <input id="bill-notes" type="text" value={remark} onChange={(e) => setRemark(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="บันทึกเพิ่มเติมสำหรับบิลนี้ (ถ้ามี)" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t-2 border-gray-200">
        <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          รวม: <span>{totalAmount.toFixed(2)}</span> บาท
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={handleCancelBill} className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl font-semibold">ล้างตาราง</button>
          <button onClick={handleSaveBill} className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl font-bold">บันทึกบิล</button>
        </div>
      </div>
    </div>
  );
}
