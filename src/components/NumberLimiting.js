import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
const typeToThaiText = (type) => {
  switch (type) {
    case 'twoNumberTop': return '2 ตัวบน';
    case 'twoNumberButton': return '2 ตัวล่าง';
    case 'threeNumberTop': return '3 ตัวบน';
    case 'threeNumberTode': return '3 ตัวโต๊ด';
    default: return '';
  }
};

export default function NumberLimiting() {
  const { token } = useAuth();
  const [allLimitNumbers, setAllLimitNumbers] = useState([]); // Stores all limited numbers
  const [allClosedNumbers, setAllClosedNumbers] = useState([]); // Stores all closed numbers
  const [message, setMessage] = useState('');
  const [newLimitNumber, setNewLimitNumber] = useState({
    type: 'twoNumberTop',
    number: '',
    amountlimit: '',
  });
  const [editingLimitId, setEditingLimitId] = useState(null);
  const [newLimitAmount, setNewLimitAmount] = useState('');

  // Filtered limit numbers for display based on newLimitNumber.type
  const limitNumbersForDisplay = useMemo(() => {
    return allLimitNumbers.filter(ln => ln.type === newLimitNumber.type);
  }, [allLimitNumbers, newLimitNumber.type]);

  useEffect(() => {
    if (token) {
      fetchAllLimitNumbers();
      fetchAllClosedNumbers();
    }
  }, [token]);

  const fetchAllLimitNumbers = async () => {
    try {
      const res = await fetch('/api/limit-numbers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAllLimitNumbers(data);
      } else {
        setMessage(data.message || 'Failed to fetch limit numbers');
      }
    } catch (error) {
      setMessage('Network error fetching limit numbers');
      console.error('Error fetching limit numbers:', error);
    }
  };

  const fetchAllClosedNumbers = async () => {
    try {
      const res = await fetch('/api/close-numbers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAllClosedNumbers(data);
      } else {
        setMessage(data.message || 'Failed to fetch closed numbers for conflict check');
      }
    } catch (error) {
      setMessage('Network error fetching closed numbers for conflict check');
      console.error('Error fetching closed numbers for conflict check:', error);
    }
  };

  const isNumberClosed = (type, number) => {
    return allClosedNumbers.some(cn => cn.number === parseInt(number) && cn.type === type);
  };

  const isNumberLimited = (type, number) => {
    return allLimitNumbers.some(ln => ln.number === parseInt(number) && ln.type === type);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLimitNumber((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddLimit = async (e) => {
    e.preventDefault();
    setMessage('');

    const limitText = typeToThaiText(newLimitNumber.type);

    if (isNumberClosed(newLimitNumber.type, newLimitNumber.number)) {
      setMessage('Cannot limit a number that is already closed.');
      return;
    }

    if (isNumberLimited(newLimitNumber.type, newLimitNumber.number)) {
      setMessage('This number is already limited.');
      return;
    }

    try {
      const res = await fetch('/api/limit-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newLimitNumber, text: limitText }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Number limit added successfully');
        setNewLimitNumber({ type: 'twoNumberTop', number: '', amountlimit: '', text: '' });
        fetchAllLimitNumbers();
      } else {
        setMessage(data.message || 'Failed to add number limit');
      }
    } catch (error) {
      setMessage('Network error adding number limit');
      console.error('Error adding number limit:', error);
    }
  };

  const handleEditLimit = (limit) => {
    setEditingLimitId(limit.id);
    setNewLimitAmount(limit.amountlimit.toString());
  };

  const handleSaveLimit = async (limitId) => {
    try {
      const res = await fetch('/api/limit-numbers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id: limitId, amountlimit: newLimitAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Number limit updated successfully');
        setEditingLimitId(null);
        setNewLimitAmount('');
        fetchAllLimitNumbers();
      } else {
        setMessage(data.message || 'Failed to update number limit');
      }
    } catch (error) {
      setMessage('Network error updating number limit');
      console.error('Error updating number limit:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingLimitId(null);
    setNewLimitAmount('');
  };

  const handleDeleteLimit = async (limitId) => {
    try {
      const res = await fetch('/api/limit-numbers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id: limitId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Number limit deleted successfully');
        fetchAllLimitNumbers();
      } else {
        setMessage(data.message || 'Failed to delete number limit');
      }
    } catch (error) {
      setMessage('Network error deleting number limit');
      console.error('Error deleting number limit:', error);
    }
  };

  return (
    <div className="w-full mt-8">
      <h2 className="text-2xl font-semibold mb-4">Number Limiting</h2>
      {message && <p className="text-red-500 mb-4">{message}</p>}

      <form onSubmit={handleAddLimit} className="flex flex-col gap-4 mb-8 p-4 border rounded-lg dark:border-zinc-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="limitType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select
              id="limitType"
              name="type"
              value={newLimitNumber.type}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-zinc-700 dark:text-zinc-50"
            >
              <option value="twoNumberTop">2 ตัวบน</option>
              <option value="twoNumberButton">2 ตัวล่าง</option>
              <option value="threeNumberTop">3 ตัวบน</option>
              <option value="threeNumberButton">3 ตัวล่าง</option>
            </select>
          </div>
          <div>
            <label htmlFor="limitNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number</label>
            <input
              type="number"
              id="limitNumber"
              name="number"
              value={newLimitNumber.number}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-zinc-700 dark:text-zinc-50"
              required
            />
          </div>
          <div>
            <label htmlFor="limitAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Limit Amount</label>
            <input
              type="number"
              id="limitAmount"
              name="amountlimit"
              value={newLimitNumber.amountlimit}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-zinc-700 dark:text-zinc-50"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Add Limit
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-200 dark:bg-zinc-700">
            <tr>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Type</th>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Number</th>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Limit Amount</th>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Used</th>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {limitNumbersForDisplay.map((limit) => (
              <tr key={limit.id} className="border-b border-gray-200 dark:border-zinc-700">
                <td className="py-2 px-4">{limit.text}</td>
                <td className="py-2 px-4">{String(limit.number).padStart(limit.type.includes('three') ? 3 : 2, '0')}</td>
                <td className="py-2 px-4">
                  {editingLimitId === limit.id ? (
                    <input
                      type="number"
                      value={newLimitAmount}
                      onChange={(e) => setNewLimitAmount(e.target.value)}
                      className="w-24 p-1 border rounded dark:bg-zinc-700 dark:text-zinc-50"
                    />
                  ) : (
                    Number(limit.amountlimit).toFixed(2)
                  )}
                </td>
                <td className="py-2 px-4">{Number(limit.used).toFixed(2)}</td>
                <td className="py-2 px-4">
                  {editingLimitId === limit.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveLimit(limit.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditLimit(limit)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLimit(limit.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

