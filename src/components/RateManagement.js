'use client';

import { useState, useEffect } from 'react';
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

export default function RateManagement() {
  const { token } = useAuth();
  const [rates, setRates] = useState([]);
  const [editingRateId, setEditingRateId] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      fetchRates();
    }
  }, [token]);

  const fetchRates = async () => {
    try {
      const res = await fetch('/api/rates', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setRates(data);
      } else {
        setMessage(data.message || 'Failed to fetch rates');
      }
    } catch (error) {
      setMessage('Network error fetching rates');
      console.error('Error fetching rates:', error);
    }
  };

  const handleEdit = (rate) => {
    setEditingRateId(rate.id);
    setNewPrice(rate.price.toString());
  };

  const handleSave = async (rateId) => {
    try {
      const res = await fetch('/api/rates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id: rateId, price: newPrice }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Rate updated successfully');
        setEditingRateId(null);
        setNewPrice('');
        fetchRates(); // Refresh rates
      } else {
        setMessage(data.message || 'Failed to update rate');
      }
    } catch (error) {
      setMessage('Network error updating rate');
      console.error('Error updating rate:', error);
    }
  };

  const handleCancel = () => {
    setEditingRateId(null);
    setNewPrice('');
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-4">Rate Management</h2>
      {message && <p className="text-red-500 mb-4">{message}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-200 dark:bg-zinc-700">
            <tr>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Type</th>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Text</th>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Price</th>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <tr key={rate.id} className="border-b border-gray-200 dark:border-zinc-700">
                <td className="py-2 px-4">{typeToThaiText(rate.type)}</td>
                <td className="py-2 px-4">{rate.text}</td>
                <td className="py-2 px-4">
                  {editingRateId === rate.id ? (
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-24 p-1 border rounded dark:bg-zinc-700 dark:text-zinc-50"
                    />
                  ) : (
                    Number(rate.price).toFixed(2)
                  )}
                </td>
                <td className="py-2 px-4">
                  {editingRateId === rate.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(rate.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(rate)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
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
