import { useEffect, useState } from 'react'

const SECTION_IDS = ['top', 'network', 'conference', 'friends', 'partners', 'join', 'about']

export function useActiveSection() {
  const [active, setActive] = useState('top')

  useEffect(() => {
    const onScroll = () => {
      const offset = window.scrollY + 120
      let current = SECTION_IDS[0]

      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= offset) current = id
      }

      setActive(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return active
}
