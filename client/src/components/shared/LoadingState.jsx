export default function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-40">
      <div className="space-y-4 w-full max-w-md">
        {/* Skeleton Loader */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg bg-gray-200 h-12 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
