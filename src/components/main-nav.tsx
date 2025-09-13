
'use client';

import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  ClipboardList,
  FilePlus2,
  FileText,
  LayoutDashboard,
  Map,
  Package,
  Store,
  Truck,
  Warehouse,
} from 'lucide-react';
import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders', label: 'All Orders', icon: ClipboardList },
  { href: '/invoices', label: 'Create Invoices', icon: FilePlus2 },
  { href: '/invoices/list', label: 'Invoices List', icon: FileText },
  { href: '/load-sheets', label: 'Load Sheets', icon: Truck },
  { href: '/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/routes', label: 'Route Plans', icon: Map },
  { href: '/outlets', label: 'Outlets', icon: Store },
  { href: '/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/sku', label: 'SKU Master', icon: Package },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === link.href}
            tooltip={link.label}
          >
            <Link href={link.href}>
              <link.icon />
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
