import { PerspectivesConverge } from './components/PerspectivesConverge'
import './App.css'

function App() {
  return (
    <main>
      <PerspectivesConverge />

      {/* Context block — shows how the section sits within a page flow */}
      <section className="context-block">
        <p className="context-label">Section placement</p>
        <h3>An interactive neural network — perspectives flowing to Cape Town.</h3>
        <p>
          Hover or tap any node to watch light pulse through the graph toward the
          central conference hub. Scroll back up to explore the full-screen experience.
        </p>
      </section>
    </main>
  )
}

export default App
