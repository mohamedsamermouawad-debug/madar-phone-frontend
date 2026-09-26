"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "./data";
import { DropdownMenu } from "./dropdown";
import { ChevronDownIcon } from "./icons";

export default function DesktopNav({ items, scrolled }: { items: NavItem[]; scrolled?: boolean }) {
  const pathname = usePathname();
  const textBase   = scrolled ? "text-gray-600 hover:text-gray-900" : "text-gray-900 hover:text-[#003048]";
  const textActive = scrolled ? "text-[#003048]" : "text-[#003048]";
  const underline  = "bg-[#0889A2]";

  return (
    <div className="flex items-center gap-0">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <div key={item.label} className="relative group">
            <Link
              href={item.href}
              className={`flex items-center gap-1 px-3 py-2 text-[12px] font-semibold whitespace-nowrap transition-colors relative
                ${isActive ? textActive : textBase}
              `}
            >
              {item.label}
              {(item.children || item.groups) && (
                <span className="transition-transform duration-200 group-hover:rotate-180">
                  <ChevronDownIcon />
                </span>
              )}
              <span className={`absolute bottom-0 right-0 left-0 h-0.5 ${underline} rounded-full transition-all duration-200
                ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"}
              `} />
            </Link>
            {(item.children || item.groups) && (
              <DropdownMenu items={item.children} groups={item.groups} />
            )}
          </div>
        );
      })}
    </div>
  );
}
