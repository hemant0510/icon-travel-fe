"use client";

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabSwitcherProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export default function TabSwitcher({
  tabs,
  activeTab,
  onTabChange,
}: TabSwitcherProps) {
  return (
    <div className="flex gap-1 rounded-xl bg-white/30 p-1 backdrop-blur-sm">
      {tabs.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              active
                ? "gradient-primary text-white shadow-md"
                : "text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
