import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Construction } from 'lucide-react';

export const Analytics: React.FC = () => {
  return (
    <div className="pt-8 px-4 pb-24 min-h-screen bg-transparent flex flex-col">
      <PageHeader 
        title="Thống kê" 
        subtitle="Theo dõi và phân tích chi tiêu" 
      />
      <div className="flex-1 flex flex-col items-center justify-center -mt-16">
        <EmptyState 
          icon={Construction}
          message="Tính năng đang được phát triển"
        />
      </div>
    </div>
  );
};
