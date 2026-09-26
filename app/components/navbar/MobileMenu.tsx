"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { IoCloseOutline, IoChevronDown, IoChevronBack, IoPhonePortraitOutline, IoWatchOutline, IoHeadsetOutline, IoGameControllerOutline, IoLaptopOutline, IoTabletPortraitOutline, IoGridOutline } from "react-icons/io5";
import type { NavItem, NavChild } from "./data/navData";
import "./menu.css";

interface MobileMenuProps { items: NavItem[]; isOpen: boolean; onClose: () => void; }
const categoryIcons = [IoPhonePortraitOutline, IoWatchOutline, IoHeadsetOutline, IoGameControllerOutline, IoLaptopOutline, IoTabletPortraitOutline];

export default function MobileMenu({ items, isOpen, onClose }: MobileMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && !dialog?.open) dialog?.showModal();
    if (!isOpen && dialog?.open) dialog.close();
  }, [isOpen]);

  const renderLink = (child: NavChild, index: number) => (
    <Link key={`${child.href}-${index}`} href={child.href} onClick={onClose} aria-current={pathname === child.href ? "page" : undefined} className="menu-child-link">
      <span>{child.label}</span><IoChevronBack size={13} aria-hidden="true" />
    </Link>
  );

  return (
    <dialog ref={dialogRef} id="store-menu" className="store-menu" dir="rtl" aria-labelledby="store-menu-title" onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="menu-panel">
        <div className="menu-heading"><Image src="/logo.webp" alt="مدار" width={92} height={42} className="menu-logo"/><button autoFocus type="button" aria-label="إغلاق القائمة" onClick={onClose} className="menu-close"><IoCloseOutline size={23}/></button></div>
        <div className="menu-intro"><span>اكتشف مدار</span><h2 id="store-menu-title">تسوّق حسب القسم</h2><p>كل أجهزتك المفضلة، في مكان واحد.</p></div>
        <nav aria-label="أقسام المتجر" className="menu-categories">
          {items.map((item, index) => {
            const Icon = categoryIcons[index] ?? IoGridOutline;
            const hasChildren = !!(item.children?.length || item.groups?.length);
            const expanded = openDropdown === item.label;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const contents = <><span className="menu-category-icon"><Icon size={20}/></span><span className="menu-category-label">{item.label}</span>{hasChildren ? <IoChevronDown size={15} className={expanded ? "menu-chevron expanded" : "menu-chevron"}/> : <IoChevronBack size={14} className="menu-chevron"/>}</>;
            return <div key={item.label} className={`menu-category ${expanded ? "is-expanded" : ""}`}>
              {hasChildren ? <button type="button" className="menu-category-trigger" aria-expanded={expanded} aria-controls={`menu-section-${index}`} onClick={() => setOpenDropdown(expanded ? null : item.label)}>{contents}</button> : <Link href={item.href} onClick={onClose} aria-current={active ? "page" : undefined} className="menu-category-trigger">{contents}</Link>}
              {hasChildren && <div id={`menu-section-${index}`} hidden={!expanded} className="menu-subcategories">
                {item.groups?.map((group) => <section key={group.groupLabel} className="menu-group"><h3>{group.groupLabel}</h3><div className="menu-link-grid">{group.items.map(renderLink)}</div></section>)}
                {!!item.children?.length && <div className="menu-link-grid">{item.children.map(renderLink)}</div>}
              </div>}
            </div>;
          })}
        </nav>
        <div className="menu-bottom"><span>تقسيط بسعر الكاش</span><p>على سنتين بدون فوائد</p><Link href="/store" onClick={onClose}>تصفّح كل المنتجات <IoChevronBack size={14}/></Link></div>
      </div>
    </dialog>
  );
}
