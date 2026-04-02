import { NavLink } from "react-router-dom";
import {
  HiOutlineCode,
  HiOutlineClipboardCheck,
  HiOutlineViewGrid,
  HiOutlineX,
} from "react-icons/hi";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: HiOutlineViewGrid },
  { to: "/teams/development", label: "Development Team", icon: HiOutlineCode },
  {
    to: "/teams/testing",
    label: "Testing Team",
    icon: HiOutlineClipboardCheck,
  },
  { to: "/teams/others", label: "Others", icon: HiOutlineViewGrid },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-40 transform transition-transform duration-200 
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Menu
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg"
          >
            <HiOutlineX className="text-lg text-slate-500" />
          </button>
        </div>

        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <item.icon className="text-lg flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
