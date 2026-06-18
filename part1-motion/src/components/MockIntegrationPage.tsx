import { useRef } from 'react'
import { useIntegrationScroll } from '../hooks/useIntegrationScroll'
import { CounderHeader } from './CounderHeader'
import {
  MockConferenceBelow,
  MockFooter,
  MockFriendsNote,
  MockHero,
  MockJoinStrip,
  MockPartnersStrip,
  MockPillars,
  MockStatementAbove,
} from './MockHomeSlice'
import { PerspectivesConverge } from './PerspectivesConverge'
import styles from './MockIntegrationPage.module.css'

export function MockIntegrationPage({ animationsReady = true }: { animationsReady?: boolean }) {
  const pageRef = useRef<HTMLDivElement>(null)
  useIntegrationScroll(pageRef, animationsReady)

  return (
    <div ref={pageRef} className={styles.page} data-anim-ready={animationsReady ? '' : undefined}>
      <CounderHeader />

      <main>
        <MockHero />
        <MockStatementAbove />
        <MockPillars />
        <PerspectivesConverge variant="embedded" />
        <MockFriendsNote />
        <MockConferenceBelow />
        <MockJoinStrip />
        <MockPartnersStrip />
      </main>

      <MockFooter />
    </div>
  )
}
