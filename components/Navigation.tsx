'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3 } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/keywords', label: 'Keywords' },
    { href: '/companies', label: 'Companies' },
  ];

  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">Market Sentiment</span>
          </div>

          <div className="flex gap-6">
            {links.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
