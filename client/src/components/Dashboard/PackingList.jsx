import React, { useState } from 'react';
import { Plus, Trash2, Check, Edit2, X, Save } from 'lucide-react';
import { api } from '../../services/api';
import Button from '../UI/Button';
import Input from '../UI/Input';

const PackingList = ({ destination, onUpdateDestination }) => {
  const [newItem, setNewItem] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemName, setEditingItemName] = useState('');
  const [loading, setLoading] = useState(false);

  const addItem = async () => {
    if (!newItem.trim()) return;
    setLoading(true);
    try {
      const response = await api.post(`/packing/${destination._id}/items`, {
        name: newItem.trim(),
      });
      onUpdateDestination(response.data);
      setNewItem('');
    } catch (error) {
      console.error('Error adding item:', error);
    }
    setLoading(false);
  };

  // ✅ Fixed toggleItem: always send name and packed
  const toggleItem = async (itemId, currentPacked, currentName) => {
    try {
      const response = await api.put(`/packing/${destination._id}/items/${itemId}`, {
        name: currentName,
        packed: !currentPacked,
      });
      onUpdateDestination(response.data);
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const startEditingItem = (item) => {
    setEditingItemId(item._id);
    setEditingItemName(item.name);
  };

  const cancelEditingItem = () => {
    setEditingItemId(null);
    setEditingItemName('');
  };

  const saveEditingItem = async (itemId) => {
    if (!editingItemName.trim()) return;
    try {
      const response = await api.put(`/packing/${destination._id}/items/${itemId}`, {
        name: editingItemName.trim(),
      });
      onUpdateDestination(response.data);
      cancelEditingItem();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await api.delete(`/packing/${destination._id}/items/${itemId}`);
        onUpdateDestination(response.data);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const clearAllItems = async () => {
    if (window.confirm('Are you sure you want to clear all packing items? This action cannot be undone.')) {
      try {
        const response = await api.delete(`/packing/${destination._id}/items`);
        onUpdateDestination(response.data);
      } catch (error) {
        console.error('Error clearing items:', error);
      }
    }
  };

  const packedItems = destination.packingItems.filter((item) => item.packed);
  const totalItems = destination.packingItems.length;
  const progress = totalItems > 0 ? Math.round((packedItems.length / totalItems) * 100) : 0;

  const groupedItems = destination.packingItems.reduce((groups, item) => {
    const category = item.category || 'general';
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
    return groups;
  }, {});

  const categoryNames = {
    documents: 'Documents',
    clothing: 'Clothing',
    footwear: 'Footwear',
    electronics: 'Electronics',
    toiletries: 'Toiletries',
    accessories: 'Accessories',
    general: 'General Items',
  };

  const suggestedItems = ['Passport', 'Phone Charger', 'Toothbrush', 'T-shirts', 'Shorts', 'Sandals'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Packing List</h3>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">{packedItems.length} / {totalItems} items packed</div>
            <div className="text-lg font-bold text-blue-600">{progress}%</div>
          </div>
          {totalItems > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearAllItems}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Add New Item */}
      <div className="flex space-x-2 mb-6">
        <Input
          placeholder="Add new item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
          className="flex-1"
        />
        <Button
          onClick={addItem}
          loading={loading}
          disabled={!newItem.trim()}
          className="flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Add Item</span>
        </Button>
      </div>

      {/* Items by Category */}
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            {categoryNames[category] || category}
            <span className="ml-2 text-xs text-gray-500">({items.filter(item => item.packed).length}/{items.length})</span>
          </h4>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item._id}
                className={`flex items-center justify-between p-3 rounded-lg border group
                  ${item.packed
                    ? 'bg-green-50 border-green-200'
                    : item.suggested
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <button
                    onClick={() => toggleItem(item._id, item.packed, item.name)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                      ${item.packed
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
                    type="button"
                  >
                    {item.packed && <Check className="h-3 w-3 text-white" />}
                  </button>

                  {editingItemId === item._id ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <Input
                        value={editingItemName}
                        onChange={(e) => setEditingItemName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') saveEditingItem(item._id);
                          if (e.key === 'Escape') cancelEditingItem();
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => saveEditingItem(item._id)} className="p-1">
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditingItem} className="p-1">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className={`flex-1 ${item.packed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {item.name}
                      </span>
                      {item.suggested && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Suggested</span>
                      )}
                    </>
                  )}
                </div>

                {editingItemId !== item._id && (
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditingItem(item)} className="text-gray-400 hover:text-blue-600 transition-colors p-1" type="button">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteItem(item._id)} className="text-gray-400 hover:text-red-600 transition-colors p-1" type="button">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Suggested Items */}
      {destination.packingItems.length === 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Suggested Items</h4>
          <div className="flex flex-wrap gap-2">
            {suggestedItems.map((item) => (
              <button
                key={item}
                onClick={() => setNewItem(item)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                type="button"
              >
                <Plus className="h-3 w-3 inline mr-1" />
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {totalItems === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No items added yet. Start by adding your first packing item!</p>
        </div>
      )}
    </div>
  );
};

export default PackingList;
