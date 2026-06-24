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
        </aside>

        <section className="flex-1 flex items-center justify-center">
          <p className="text-slate-600">Zone du globe</p>
        </section>

        <aside className="w-56 border-l border-purple-500/15 p-4 flex flex-col gap-3">
          <Panel title="Rocket Bodies" accent="pink">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Objets en rentrée non contrôlée sous surveillance.
            </p>
          </Panel>
        </aside>
      </main>
    </div>
  )
}

export default Dashboard