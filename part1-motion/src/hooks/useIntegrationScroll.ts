import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useIntegrationScroll(
  pageRef: RefObject<HTMLElement | null>,
  ready: boolean,
) {
  useEffect(() => {
    const page = pageRef.current
    if (!page || !ready || prefersReducedMotion()) return

    window.scrollTo(0, 0)

    const refresh = () => ScrollTrigger.refresh()
    const rafId = window.requestAnimationFrame(refresh)
    const refreshTimers = [
      window.setTimeout(refresh, 80),
      window.setTimeout(refresh, 400),
    ]

    const ctx = gsap.context(() => {
      const hero = page.querySelector<HTMLElement>('[data-scroll-block="hero"]')
      const heroReveals = page.querySelectorAll<HTMLElement>('[data-scroll-item="hero-reveal"]')
      const heroInner = page.querySelector<HTMLElement>('[data-scroll-item="hero-inner"]')
      const heroOrb = page.querySelector<HTMLElement>('[data-scroll-item="hero-orb"]')
      const heroCue = page.querySelector<HTMLElement>('[data-scroll-item="hero-cue"]')
      const statement = page.querySelector<HTMLElement>('[data-scroll-block="statement"]')
      const statementLine1 = page.querySelector<HTMLElement>('[data-scroll-item="statement-line1"]')
      const statementLine2 = page.querySelector<HTMLElement>('[data-scroll-item="statement-line2"]')
      const pillars = page.querySelectorAll<HTMLElement>('[data-scroll-item="pillar-card"]')
      const friends = page.querySelector<HTMLElement>('[data-scroll-block="friends"]')
      const conference = page.querySelector<HTMLElement>('[data-scroll-block="conference"]')
      const conferenceScrim = page.querySelector<HTMLElement>('[data-scroll-item="conference-scrim"]')
      const conferenceInner = page.querySelector<HTMLElement>('[data-scroll-item="conference-inner"]')
      const conferenceItems = page.querySelectorAll<HTMLElement>('[data-scroll-item="conference-reveal"]')
      const joinItems = page.querySelectorAll<HTMLElement>('[data-scroll-item="join-reveal"]')
      const joinInner = page.querySelector<HTMLElement>('[data-scroll-item="join-inner"]')
      const partnersItems = page.querySelectorAll<HTMLElement>('[data-scroll-item="partners-reveal"]')
      const partnersInner = page.querySelector<HTMLElement>('[data-scroll-item="partners-inner"]')
      const footer = page.querySelector<HTMLElement>('[data-scroll-block="footer"]')
      const footerItems = page.querySelectorAll<HTMLElement>('[data-scroll-item="footer-reveal"]')

      if (hero && heroReveals.length) {
        gsap.set(heroReveals, { opacity: 0, y: 52 })
        if (heroInner) gsap.set(heroInner, { opacity: 1, y: 0 })
        if (heroCue) gsap.set(heroCue, { opacity: 0 })
        if (heroOrb) gsap.set(heroOrb, { opacity: 0, scale: 0.88 })

        const entrance = gsap.timeline({ delay: 0.12 })
        entrance
          .to(heroOrb, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, 0)
          .to(
            heroReveals,
            { opacity: 1, y: 0, duration: 1.05, stagger: 0.11, ease: 'power3.out' },
            0.08,
          )
          .to(heroCue, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.55)

        if (heroInner) {
          gsap.fromTo(
            heroInner,
            { opacity: 1, y: 0 },
            {
              opacity: 0.12,
              y: -90,
              ease: 'none',
              scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: 0.85,
              },
            },
          )
        }

        if (heroOrb) {
          gsap.fromTo(
            heroOrb,
            { y: 0, scale: 1 },
            {
              y: 100,
              scale: 1.18,
              ease: 'none',
              scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: 1.1,
              },
            },
          )
        }

        if (heroCue) {
          gsap.to(heroCue, {
            opacity: 0,
            y: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: '+=120',
              scrub: true,
            },
          })
        }
      }

      if (statement && statementLine1 && statementLine2) {
        const pinDistance = () => Math.round(window.innerHeight * 1.45)

        gsap.set(statementLine1, { opacity: 0, y: 56 })
        gsap.set(statementLine2, { opacity: 0, y: 72, scale: 0.96 })

        const statementTl = gsap.timeline({
          scrollTrigger: {
            trigger: statement,
            start: 'top top',
            end: () => `+=${pinDistance()}`,
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        statementTl
          .to(statementLine1, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' })
          .to({}, { duration: 0.26 })
          .to(statementLine1, { opacity: 0, y: -64, duration: 0.22, ease: 'power2.in' })
          .to(
            statementLine2,
            { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: 'power3.out' },
            '-=0.14',
          )
          .to({}, { duration: 0.26 })
      }

      if (pillars.length) {
        gsap.set(pillars, { opacity: 0, y: 56 })
        gsap.to(pillars, {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: pillars[0].parentElement,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      if (friends) {
        const friendsItems = friends.querySelectorAll<HTMLElement>('[data-scroll-item]')
        gsap.set(friendsItems, { opacity: 0, x: -32 })
        gsap.to(friendsItems, {
          opacity: 1,
          x: 0,
          duration: 1,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: friends,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      if (conferenceScrim && conference) {
        const conferenceBg = conference.querySelector<HTMLElement>('[data-scroll-item="conference-bg"]')

        if (conferenceBg) {
          gsap.fromTo(
            conferenceBg,
            { scale: 1.08, y: 0 },
            {
              scale: 1,
              y: -40,
              ease: 'none',
              scrollTrigger: {
                trigger: conference,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
              },
            },
          )
        }

        gsap.fromTo(
          conferenceScrim,
          { scale: 1.1 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: conference,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.4,
            },
          },
        )
      }

      if (conferenceItems.length && conferenceInner) {
        gsap.set(conferenceItems, { opacity: 0, y: 48 })
        gsap.to(conferenceItems, {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: conferenceInner,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      if (joinItems.length && joinInner) {
        gsap.set(joinItems, { opacity: 0, y: 36 })
        gsap.to(joinItems, {
          opacity: 1,
          y: 0,
          duration: 0.95,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: joinInner,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      if (partnersItems.length && partnersInner) {
        gsap.set(partnersItems, { opacity: 0, y: 32 })
        gsap.to(partnersItems, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: partnersInner,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      if (footerItems.length && footer) {
        gsap.set(footerItems, { opacity: 0, y: 32 })
        gsap.to(footerItems, {
          opacity: 1,
          y: 0,
          duration: 0.95,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    }, page)

    window.addEventListener('resize', refresh)

    return () => {
      window.cancelAnimationFrame(rafId)
      refreshTimers.forEach((id) => window.clearTimeout(id))
      window.removeEventListener('resize', refresh)
      ctx.revert()
    }
  }, [pageRef, ready])
}
