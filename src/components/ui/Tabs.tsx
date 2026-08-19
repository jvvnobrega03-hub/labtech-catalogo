'use client';

import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div>
      <div className="border-b border-[#D8EEF5]">
        <nav className="flex gap-8" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`
                pb-4 text-sm font-semibold uppercase tracking-wider transition-all duration-200
                border-b-2 -mb-px
                ${
                  activeTab === tab.id
                    ? 'text-[#087A9F] border-[#087A9F]'
                    : 'text-[#102833]/60 border-transparent hover:text-[#087A9F] hover:border-[#D8EEF5]'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="pt-6" role="tabpanel">
        {activeContent}
      </div>
    </div>
  );
}
