import React, { useState } from 'react';
import { FolderPlus, Plus, Folder, ArrowRight } from 'lucide-react';
import { FolderRelationship } from '../types';
import { removeQuotesFromPath } from '../utils/localStorage';

interface AddRelationshipFormProps {
  onAdd: (relationship: Omit<FolderRelationship, 'id'>) => void;
}

export const AddRelationshipForm: React.FC<AddRelationshipFormProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sourcePath, setSourcePath] = useState('');
  const [destinationPath, setDestinationPath] = useState('');
  const [customName, setCustomName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sourcePath || !destinationPath) return;

    // Remove quotes from paths before processing
    const cleanSourcePath = removeQuotesFromPath(sourcePath.trim());
    const cleanDestinationPath = removeQuotesFromPath(destinationPath.trim());

    const originalName = cleanSourcePath.split('/').pop() || cleanSourcePath.split('\\').pop() || 'Unknown';
    
    onAdd({
      sourcePath: cleanSourcePath,
      destinationPath: cleanDestinationPath,
      originalName,
      customName: customName || originalName,
      lastSync: null,
      status: 'pending',
      filesCount: Math.floor(Math.random() * 1000) + 50,
      size: `${(Math.random() * 500 + 50).toFixed(1)} MB`
    });

    // Reset form
    setSourcePath('');
    setDestinationPath('');
    setCustomName('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
      >
        <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
          <Plus size={16} />
        </div>
        Add New Sync Relationship
      </button>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
          <FolderPlus className="text-blue-400" size={20} />
        </div>
        <h3 className="text-xl font-semibold text-white">Add New Sync Relationship</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Source Directory
            </label>
            <div className="relative group">
              <Folder className="absolute left-4 top-4 text-gray-500 group-focus-within:text-blue-400 transition-colors duration-200" size={18} />
              <input
                type="text"
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
                placeholder="/Users/username/Documents/Projects"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-500 backdrop-blur-sm transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Destination Directory
            </label>
            <div className="relative group">
              <Folder className="absolute left-4 top-4 text-gray-500 group-focus-within:text-blue-400 transition-colors duration-200" size={18} />
              <input
                type="text"
                value={destinationPath}
                onChange={(e) => setDestinationPath(e.target.value)}
                placeholder="/Volumes/Backup/Projects"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-500 backdrop-blur-sm transition-all duration-200"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Custom Folder Name <span className="text-gray-500">(Optional)</span>
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Leave empty to use original name"
            className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-500 backdrop-blur-sm transition-all duration-200"
          />
        </div>

        <div className="flex items-center justify-between pt-6">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 text-gray-400 hover:text-white transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
          >
            Add Relationship
          </button>
        </div>
      </form>
    </div>
  );
};