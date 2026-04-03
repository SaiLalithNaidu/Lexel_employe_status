import { Link } from "react-router-dom";
import { HiOutlineClipboardList } from "react-icons/hi";
import Avatar from "../shared/Avatar";

export default function MemberCard({ member }) {
  return (
    <Link
      to={`/employees/${member.id}`}
      className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-primary-200 transition group"
    >
      <div className="flex items-center gap-4">
        <Avatar user={member} size="md" />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary-600 transition truncate">
            {member.firstName} {member.lastName}
          </h3>
          <p className="text-xs text-slate-500 truncate">
            {member.designation}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <HiOutlineClipboardList className="text-sm" />
        <span>
          {member.activeTaskCount} active task
          {member.activeTaskCount !== 1 ? "s" : ""}
        </span>
      </div>
    </Link>
  );
}
