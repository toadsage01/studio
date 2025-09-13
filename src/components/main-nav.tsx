
'use client';

import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  ClipboardList,
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
  { href: '/orders', label: 'Orders & Invoices', icon: ClipboardList },
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
            isActive={pathname.startsWith(link.href) && (link.href === '/' ? pathname === '/' : true)}
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
