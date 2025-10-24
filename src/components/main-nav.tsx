
'use client';

import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Map,
  Package,
  PlusCircle,
  Store,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react';
import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useSession } from 'next-auth/react';

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders/create', label: 'Create Order', icon: PlusCircle },
  { href: '/orders', label: 'View Orders', icon: ClipboardList },
  { href: '/load-sheets', label: 'Load Sheets', icon: Truck },
  { href: '/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/sku', label: 'SKU Master', icon: Package },
  { href: '/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/routes', label: 'Route Plans', icon: Map },
  { href: '/outlets', label: 'Outlets', icon: Store },
  { href: '/users', label: 'User Management', icon: Users },
];

export default function MainNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as string | undefined;

  const filteredLinks = links.filter((l) => {
    if (l.href === '/users') {
      return role === 'Admin';
    }
    return true;
  });

  return (
    <SidebarMenu>
      {filteredLinks.map((link) => (
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
