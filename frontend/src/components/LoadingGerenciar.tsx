// components/LoadingGerenciar.tsx
export default function LoadingGerenciar() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
        <div key={item} className="bg-white border border-gray-100 rounded-xl px-6 py-5 shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-3/4 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse mt-2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}