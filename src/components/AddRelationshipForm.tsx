import React, { useState } from 'react';
import { FolderPlus, Plus, Folder } from 'lucide-react';
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
        className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
      >
        <div className="p-1 bg-white/20 rounded group-hover:bg-white/30 transition-colors duration-300">
          <Plus size={14} />
        </div>
        Add New Sync Relationship
      </button>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <FolderPlus className="text-blue-400" size={16} />
        </div>
        <h3 className="text-lg font-semibold text-white">Add New Sync Relationship</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-300">
              Source Directory
            </label>
            <div className="relative group">
              <Folder className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-blue-400 transition-colors duration-200" size={14} />
              <input
                type="text"
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
                placeholder="/Users/username/Documents/Projects"
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-500 backdrop-blur-sm transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-300">
              Destination Directory
            </label>
            <div className="relative group">
              <Folder className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-blue-400 transition-colors duration-200" size={14} />
              <input
                type="text"
                value={destinationPath}
                onChange={(e) => setDestinationPath(e.target.value)}
                placeholder="/Volumes/Backup/Projects"
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-500 backdrop-blur-sm transition-all duration-200"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-300">
            Custom Folder Name <span className="text-gray-500">(Optional)</span>
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Leave empty to use original name"
            className="w-full px-3 py-2 text-sm bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-500 backdrop-blur-sm transition-all duration-200"
          />
        </div>

        <div className="flex items-center justify-between pt-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
          >
            Add Relationship
          </button>
        </div>
      </form>
    </div>
  );
};