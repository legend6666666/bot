import React from 'react';
import { 
  Upload, 
  Download, 
  Scissors, 
  Copy, 
  Undo, 
  Redo, 
  Zap,
  Palette,
  Volume2,
  Type,
  Save
} from 'lucide-react';

interface ToolbarProps {
  onImportVideo: () => void;
  onExportVideo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onImportVideo,
  onExportVideo,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) => {
  const toolGroups = [
    {
      name: 'File',
      tools: [
        { name: 'Import', icon: Upload, action: onImportVideo, shortcut: 'Ctrl+I' },
        { name: 'Export', icon: Download, action: onExportVideo, shortcut: 'Ctrl+E' },
        { name: 'Save', icon: Save, action: () => {}, shortcut: 'Ctrl+S' }
      ]
    },
    {
      name: 'Edit',
      tools: [
        { name: 'Undo', icon: Undo, action: onUndo, disabled: !canUndo, shortcut: 'Ctrl+Z' },
        { name: 'Redo', icon: Redo, action: onRedo, disabled: !canRedo, shortcut: 'Ctrl+Y' },
        { name: 'Cut', icon: Scissors, action: () => {}, shortcut: 'Ctrl+X' },
        { name: 'Copy', icon: Copy, action: () => {}, shortcut: 'Ctrl+C' }
      ]
    },
    {
      name: 'Effects',
      tools: [
        { name: 'Effects', icon: Zap, action: () => {} },
        { name: 'Color', icon: Palette, action: () => {} },
        { name: 'Audio', icon: Volume2, action: () => {} },
        { name: 'Text', icon: Type, action: () => {} }
      ]
    }
  ];

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="flex items-center gap-6">
        {toolGroups.map((group, groupIndex) => (
          <div key={group.name} className="flex items-center gap-2">
            {groupIndex > 0 && <div className="w-px h-6 bg-gray-700 mx-2"></div>}
            {group.tools.map((tool) => (
              <button
                key={tool.name}
                onClick={tool.action}
                disabled={tool.disabled}
                className="relative group bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 text-white p-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                title={`${tool.name} ${tool.shortcut ? `(${tool.shortcut})` : ''}`}
              >
                <tool.icon size={18} />
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                  <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                    {tool.name}
                    {tool.shortcut && (
                      <span className="ml-2 text-gray-400">({tool.shortcut})</span>
                    )}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};