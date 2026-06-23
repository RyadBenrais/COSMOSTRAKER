import TopBar from "./TopBar";

function Dashboard(){
    return(
        <div className="flex flex-col h-screen">
            <TopBar />

            <main className="flex flex-1 overflow-hidden">
                <aside className="w-56 border-r border-purple-500/15 p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                    Panneau gauche
                </p>
                </aside>

                <section className="flex-1 flex items-center justify-center">
                    <p className="text-slate-600"> Zone du globe</p>
                </section>

                <aside className="w-56 border-1 border-purple-500/15 p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                    Panneau droite
                </p>
                </aside>
            </main>
        </div>
    )
}

export default Dashboard
