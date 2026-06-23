function TopBar() {
    return (
        <header className="flex items-center justify-between px-5 py-3 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"/>
                <span className="text-sm font-medium tracking-[3px] text-purple-300 uppercase">
                    Cosmos Tracker
                </span>               
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Live feed
                </span>
                <span> UTC 10:32:07</span>
                <span className="text-purple-300">2,847 objects tracked</span>
            </div>
        </header>
    )
}
export default TopBar