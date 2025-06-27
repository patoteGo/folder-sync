import React, { useState } from 'react';
import { Edit3, Trash2, RefreshCw, FolderOpen, Calendar, HardDrive, ToggleLeft, ToggleRight, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { FolderRelationship } from '../types';
import { StatusBadge } from './StatusBadge';
import { removeQuotesFromPath } from '../utils/localStorage';

interface RelationshipTableProps {
  relationships: FolderRelationship[];
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<FolderRelationship>) => void;
  onSync: (id: string) => void;
  onToggleAutoSync: (id: string, enabled: boolean) => void;
}

export const RelationshipTable: React.FC<RelationshipTableProps> = ({
  relationships,
  onDelete,
  onEdit,
  onSync,
  onToggleAutoSync
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editData, setEditData] = useState({
    customName: '',
    sourcePath: '',
    destinationPath: ''
  });

  const handleEdit = (relationship: FolderRelationship) => {
    setEditingId(relationship.id);
    setEditData({
      customName: relationship.customName,
      sourcePath: relationship.sourcePath,
      destinationPath: relationship.destinationPath
    });
  };

  const handleSaveEdit = (id: string) => {
    // Remove quotes from paths before saving
    const cleanedEditData = {
      customName: editData.customName,
      sourcePath: removeQuotesFromPath(editData.sourcePath.trim()),
      destinationPath: removeQuotesFromPath(editData.destinationPath.trim())
    };
    
    onEdit(id, cleanedEditData);
    setEditingId(null);
    setEditData({ customName: '', sourcePath: '', destinationPath: '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ customName: '', sourcePath: '', destinationPath: '' });
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (relationships.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-900/30 backdrop-blur-xl rounded-xl border border-gray-700/50">
        <div className="p-3 bg-gray-800/50 rounded-lg w-fit mx-auto mb-4">
          <FolderOpen className="text-gray-500" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No sync relationships yet</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
          Create your first directory sync relationship to start managing your folder synchronization.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden shadow-xl">
      <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-800/30">
        <h3 className="text-lg font-semibold text-white">Sync Relationships</h3>
        <p className="text-gray-400 text-sm mt-0.5">{relationships.length} configured relationships</p>
      </div>

      <div className="divide-y divide-gray-700/50">
        {relationships.map((relationship) => {
          const isExpanded = expandedItems.has(relationship.id);
          const isEditing = editingId === relationship.id;

          return (
            <div key={relationship.id} className="bg-gray-800/20 hover:bg-gray-800/40 transition-all duration-200">
              {/* Header - Always Visible */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Title */}
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <button
                      onClick={() => toggleExpanded(relationship.id)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-all duration-200 mt-0.5"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {relationship.customName}
                      </h4>
                      <div className="w-1/2">
                        <p className="text-xs text-gray-400 break-all leading-relaxed">
                          {relationship.sourcePath} → {relationship.destinationPath}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    <StatusBadge status={relationship.status} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                  {!isEditing && (
                    <>
                      <button
                        onClick={() => onSync(relationship.id)}
                        className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-500/30"
                        title="Sync now"
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(relationship)}
                        className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-600/50"
                        title="Edit relationship"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(relationship.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/30"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-3 border-t border-gray-700/30">
                  <div className="space-y-3 pt-3">
                    {/* Paths Section */}
                    <div className="grid md:grid-cols-2 gap-3">
                      {/* Source Path */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-blue-500/20 rounded border border-blue-500/30">
                            <FolderOpen size={12} className="text-blue-400" />
                          </div>
                          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Source Directory</div>
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.sourcePath}
                            onChange={(e) => setEditData(prev => ({ ...prev, sourcePath: e.target.value }))}
                            className="w-full px-2 py-1.5 text-xs bg-gray-800/50 border border-gray-600/50 rounded text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 font-mono"
                            placeholder="Enter source directory path"
                          />
                        ) : (
                          <div className="text-xs text-gray-300 font-mono bg-gray-800/50 px-2 py-1.5 rounded break-all">
                            {relationship.sourcePath}
                          </div>
                        )}
                      </div>

                      {/* Destination Path */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-emerald-500/20 rounded border border-emerald-500/30">
                            <FolderOpen size={12} className="text-emerald-400" />
                          </div>
                          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Destination Directory</div>
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.destinationPath}
                            onChange={(e) => setEditData(prev => ({ ...prev, destinationPath: e.target.value }))}
                            className="w-full px-2 py-1.5 text-xs bg-gray-800/50 border border-gray-600/50 rounded text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 font-mono"
                            placeholder="Enter destination directory path"
                          />
                        ) : (
                          <div className="text-xs text-gray-300 font-mono bg-gray-800/50 px-2 py-1.5 rounded break-all">
                            {relationship.destinationPath}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Settings and Info Row */}
                    <div className="grid md:grid-cols-4 gap-3">
                      {/* Custom Name */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Custom Name</div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.customName}
                            onChange={(e) => setEditData(prev => ({ ...prev, customName: e.target.value }))}
                            className="w-full px-2 py-1.5 text-xs bg-gray-800/50 border border-gray-600/50 rounded text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                            placeholder="Enter custom name"
                          />
                        ) : (
                          <div className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-1.5 rounded border border-blue-500/20">
                            {relationship.customName}
                          </div>
                        )}
                      </div>

                      {/* Auto-Sync Toggle */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Auto-Sync</div>
                        <button
                          onClick={() => onToggleAutoSync(relationship.id, !relationship.autoSync)}
                          className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-all duration-200 w-full justify-center ${
                            relationship.autoSync !== false
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30'
                          }`}
                        >
                          {relationship.autoSync !== false ? (
                            <ToggleRight size={12} />
                          ) : (
                            <ToggleLeft size={12} />
                          )}
                          {relationship.autoSync !== false ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      {/* Storage Info */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Storage</div>
                        <div className="flex items-center gap-1 text-xs text-gray-300 bg-gray-800/50 px-2 py-1.5 rounded">
                          <div className="p-1 bg-gray-700/50 rounded">
                            <HardDrive size={10} className="text-gray-400" />
                          </div>
                          <div>
                            <div className="font-medium">{relationship.size || 'Unknown'}</div>
                            <div className="text-xs text-gray-400">
                              {relationship.filesCount?.toLocaleString() || 0} files
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Last Sync */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Last Sync</div>
                        <div className="flex items-center gap-1 text-xs text-gray-300 bg-gray-800/50 px-2 py-1.5 rounded">
                          <div className="p-1 bg-gray-700/50 rounded">
                            <Calendar size={10} className="text-gray-400" />
                          </div>
                          <span>{formatDate(relationship.lastSync)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Edit Controls */}
                    {isEditing && (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
                        <button
                          onClick={() => handleSaveEdit(relationship.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/30 transition-all duration-200 text-xs font-medium"
                        >
                          <Save size={12} />
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-all duration-200 text-xs font-medium"
                        >
                          <X size={12} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};