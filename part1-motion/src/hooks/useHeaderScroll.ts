import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useHeaderScroll(headerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      const onScroll = () => {
        header.dataset.scrolled = window.scrollY > 32 ? 'true' : 'false'
      }
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }

    gsap.set(header, { '--scroll': 0 })

    const tween = gsap.to(header, {
      '--scroll': 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: '+=100',
        scrub: 0.45,
      },
    })

    const refresh = () => ScrollTrigger.refresh()
    const refreshTimer = window.setTimeout(refresh, 1700)
    window.addEventListener('resize', refresh)

    return () => {
      window.clearTimeout(refreshTimer)
      window.removeEventListener('resize', refresh)
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [headerRef])
}
