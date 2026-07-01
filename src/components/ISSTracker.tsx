import useISS from '../hooks/useISS'

function ISSTracker() {
    const { position, loading, error } = useISS()

    if (loading) {
        return (
            <div className="flex flex-col gap-2">
                <div className="h-3 bg-slate-700/50 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-slate-700/50 rounded animate-pulse w-1/2" />
                <div className="h-3 bg-slate-700/50 rounded animate-pulse w-2/3" />
            </div>
        )
    }

    if (error) {
        return (
            <p className="text-[10px] text-red-400">{error}</p>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Latitude</span>
                <span className="text-[10px] font-medium text-cyan-300">
                    {position?.latitude.toFixed(2)}°
                </span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Longitude</span>
                <span className="text-[10px] font-medium text-cyan-300">
                    {position?.longitude.toFixed(2)}°
                </span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Altitude</span>
                <span className="text-[10px] font-medium text-purple-300">
                    {position?.altitude.toFixed(0)} km
                </span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Vitesse</span>
                <span className="text-[10px] font-medium text-green-400">
                    {position?.velocity.toFixed(0)} km/h
                </span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Région</span>
                <span className="text-[10px] font-medium text-yellow-300">
                    {position?.region}
                </span>
            </div>
            <div className="mt-1 pt-1 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[9px] text-slate-500">
                        Mise à jour toutes les 5s
                    </span>
                </div>
            </div>
        </div>
    )
}

export default ISSTracker