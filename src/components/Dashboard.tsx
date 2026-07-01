import TopBar from './TopBar'
import Panel from './Panel'

function Dashboard() {
  return (
    <div className="flex flex-col h-screen">
      <TopBar />

      <main className="flex flex-1 overflow-hidden">

        <aside className="w-56 border-r border-purple-500/15 p-4 flex flex-col gap-3">
          <Panel title="Orbital Traffic" accent="cyan">
            <p className="text-2xl font-medium text-cyan-300">2,847</p>
            <p className="text-[10px] text-slate-400">objets actifs suivis</p>
          </Panel>

          <Panel title="Collision Risk" accent="purple">
            <p className="text-2xl font-medium text-purple-300">7.2</p>
            <p className="text-[10px] text-green-400">LOW</p>
          </Panel>

          <Panel title="Recent Close Approaches" accent="cyan">
            <div className="flex flex-col gap-2">
              {[
                { name: 'COSMOS 482', dist: '52 km', color: 'text-amber-400' },
                { name: 'DEBRIS 003', dist: '30 km', color: 'text-slate-300' },
                { name: 'FENGYUN', dist: '181 km', color: 'text-slate-300' },
                { name: 'STARLINK-G1', dist: '0.4 km', color: 'text-red-400' },
              ].map((item) => (
                <div key={item.name} className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span className="text-[10px] text-slate-400">{item.name}</span>
                  <span className={`text-[10px] font-medium ${item.color}`}>{item.dist}</span>
                </div>
              ))}
            </div>
          </Panel>
        </aside>

        <section className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-600">Zone du globe</p>
          </div>
          <div className="p-4 border-t border-purple-500/15">
            <Panel title="Debris Classification" accent="purple">
              <div className="flex gap-4 items-center">
                <div className="flex flex-col gap-1 flex-1">
                  {[
                    { label: 'Payloads', val: '6,718', color: 'bg-cyan-400' },
                    { label: 'Rocket bodies', val: '2,005', color: 'bg-purple-400' },
                    { label: 'Debris', val: '13,977', color: 'bg-pink-400' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-[10px] text-slate-400 flex-1">{item.label}</span>
                      <span className="text-[10px] font-medium text-slate-200">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        </section>

        <aside className="w-56 border-l border-purple-500/15 p-4 flex flex-col gap-3">
          <Panel title="Rocket Bodies" accent="pink">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Objets en rentrée non contrôlée sous surveillance.
            </p>
            <div className="mt-2 bg-black/30 rounded-lg p-2 font-mono">
              <p className="text-[10px] text-cyan-300">periapsis: 148km</p>
              <p className="text-[10px] text-purple-300">apoapsis: 312km</p>
              <p className="text-[10px] text-pink-300">decay: ~6.2d</p>
            </div>
          </Panel>
        </aside>

      </main>
    </div>
  )
}

export default Dashboard