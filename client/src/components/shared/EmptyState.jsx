import { HiOutlineInboxIn } from "react-icons/hi";

export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-40 text-center">
      <HiOutlineInboxIn size={48} className="text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
