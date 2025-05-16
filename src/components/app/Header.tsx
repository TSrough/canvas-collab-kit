
import React from 'react';
import { Button } from '@/components/ui/button';
import { Toolbar } from '@/components/ui/Toolbar';

interface HeaderProps {
  onExport: () => void;
  onSave: () => void;
  onLoad: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onExport, onSave, onLoad }) => {
  return (
    <div className="flex items-center justify-between border-b p-2 h-14 bg-background">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold">DiagramFlow</h1>
        
        <div className="hidden md:flex space-x-1">
          <Button variant="ghost" size="sm">File</Button>
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm">View</Button>
          <Button variant="ghost" size="sm">Help</Button>
        </div>
      </div>
      
      <Toolbar className="flex-grow max-w-xl mx-4" />
      
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onLoad}>
          Open
        </Button>
        <Button size="sm" variant="outline" onClick={onSave}>
          Save
        </Button>
        <Button size="sm" variant="default" onClick={onExport}>
          Export
        </Button>
      </div>
    </div>
  );
};
