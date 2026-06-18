import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { IntroSplash } from './components/IntroSplash'
import { MockIntegrationPage } from './components/MockIntegrationPage'
import { PerspectivesConverge } from './components/PerspectivesConverge'
import './App.css'

type AppView = 'landing' | 'integration'

function App() {
  const skipIntro = useMemo(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const [view, setView] = useState<AppView>('landing')
  const [showIntro, setShowIntro] = useState(() => !skipIntro)
  const mainRef = useRef<HTMLDivElement>(null)
  const introRunRef = useRef(0)

  useEffect(() => {
    window.scrollTo(0, 0)
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [view])

  useEffect(() => {
    if (showIntro || !mainRef.current) return

    if (view === 'integration') {
      gsap.set(mainRef.current, { opacity: 1, scale: 1, clearProps: 'transform' })
      return
    }

    gsap.fromTo(
      mainRef.current,
      { opacity: 0.78, scale: 1.015 },
      { opacity: 1, scale: 1, duration: 0.65, ease: 'power3.out', clearProps: 'transform' },
    )
  }, [showIntro, view])

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false)
  }, [])

  const handleViewSwitch = () => {
    const nextView: AppView = view === 'landing' ? 'integration' : 'landing'
    setView(nextView)
    if (!skipIntro) {
      introRunRef.current += 1
      setShowIntro(true)
    }
  }

  const introVisible = !skipIntro && showIntro

  return (
    <>
      <div ref={mainRef} className="app-main">
        {view === 'landing' ? (
          <PerspectivesConverge variant="standalone" />
        ) : (
          <MockIntegrationPage animationsReady={!introVisible} />
        )}

        <button
          type="button"
          className={`view-switch ${!introVisible ? 'view-switch--visible' : ''}`}
          onClick={handleViewSwitch}
          tabIndex={introVisible ? -1 : 0}
        >
          {view === 'landing' ? 'View homepage integration' : 'Back to section only'}
        </button>
      </div>

      {introVisible && (
        <IntroSplash key={introRunRef.current} onComplete={handleIntroComplete} />
      )}
    </>
  )
}

export default App
