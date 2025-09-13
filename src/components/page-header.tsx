import type { ReactNode } from 'react';
import { SidebarTrigger } from './ui/sidebar';
import UserNav from './user-nav';

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {actions}
        <UserNav />
      </div>
    </header>
  );
}
