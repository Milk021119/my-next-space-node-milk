export default function PostSkeleton() {
  return (
    <div className="mb-24 animate-pulse">
      {/* 模拟 ID 和日期 */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-4 w-16 bg-slate-200 rounded shadow-sm"></div>
        <div className="h-4 w-24 bg-slate-200 rounded shadow-sm"></div>
        <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
      </div>
      
      {/* 模拟标题 */}
      <div className="h-10 w-3/4 bg-slate-300 rounded-lg mb-6 shadow-sm"></div>
      
      {/* 模拟正文 (多行) */}
      <div className="space-y-3 mb-8">
        <div className="h-4 w-full bg-slate-200 rounded"></div>
        <div className="h-4 w-full bg-slate-200 rounded"></div>
        <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
        <div className="h-4 w-4/6 bg-slate-200 rounded"></div>
      </div>

      {/* 模拟按钮 */}
      <div className="h-8 w-24 bg-slate-200 rounded-full"></div>
    </div>
  );
}
