import { COUNDER_LINKS } from '../constants/counderLinks'
import { CONFERENCE_HERO_IMAGE } from '../constants/media'
import { CounderLogoMark } from './CounderLogoMark'
import { ScrollLink } from './ScrollLink'
import styles from './MockHomeSlice.module.css'

export function MockHero() {
  return (
    <section id="top" className={styles.hero} data-scroll-block="hero" aria-label="Introduction">
      <div className={styles.heroInner} data-scroll-item="hero-inner">
        <p className={styles.heroEyebrow} data-scroll-item="hero-reveal">
          The Network for Collective Understanding
        </p>
        <h1 className={styles.heroTitle} data-scroll-item="hero-reveal">
          Everybody wants to understand
          <br />
          what is going on in the world.
        </h1>
        <p className={styles.heroLead} data-scroll-item="hero-reveal">
          We gather remarkable people from completely different worlds — when their
          perspectives connect, understanding begins.
        </p>
        <div className={styles.heroActions} data-scroll-item="hero-reveal">
          <ScrollLink href="#network" className={styles.heroBtnPrimary}>
            Explore the network
          </ScrollLink>
          <a
            href={COUNDER_LINKS.join}
            className={styles.heroBtnGhost}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join
          </a>
        </div>
      </div>
      <div className={styles.heroOrb} data-scroll-item="hero-orb" aria-hidden="true" />
      <div className={styles.heroScrollCue} data-scroll-item="hero-cue" aria-hidden="true">
        <span className={styles.heroScrollLine} />
      </div>
    </section>
  )
}

export function MockStatementAbove() {
  return (
    <section className={styles.statement} data-scroll-block="statement" aria-label="Statement">
      <div className={styles.statementStage}>
        <div className={styles.statementLine} data-scroll-item="statement-line1">
          <p className={styles.statementText}>
            Most try to figure it
            <br />
            out alone.
          </p>
        </div>
        <div className={styles.statementLine} data-scroll-item="statement-line2">
          <p className={styles.statementAccent}>
            We decided to
            <br />
            do it together.
          </p>
        </div>
      </div>
    </section>
  )
}

const PILLARS = [
  {
    id: 'network',
    title: 'The Network',
    body: 'Where perspectives stay connected — across industries, continents, and time zones. Year-round.',
    href: '#network',
    external: COUNDER_LINKS.network,
    label: 'Learn more',
  },
  {
    id: 'conference',
    title: 'The Conference',
    body: '500 perspectives from all over the world, in one place. Once a year. Cape Town.',
    href: '#conference',
    external: COUNDER_LINKS.conference,
    label: 'Learn more',
  },
  {
    id: 'friends',
    title: 'Counder & Friends',
    body: 'Partner-hosted events and a celebration that brings thousands together for insight and connection.',
    href: '#friends',
    external: COUNDER_LINKS.friends,
    label: 'Learn more',
  },
] as const

export function MockPillars() {
  return (
    <section className={styles.pillars} data-scroll-block="pillars" aria-label="Counder offerings">
      <div className={styles.pillarsGrid}>
        {PILLARS.map((pillar, i) => (
          <article
            key={pillar.id}
            className={styles.pillarCard}
            data-scroll-item="pillar-card"
            data-pillar-index={i}
          >
            <h3 className={styles.pillarTitle}>{pillar.title}</h3>
            <p className={styles.pillarBody}>{pillar.body}</p>
            <div className={styles.pillarActions}>
              <ScrollLink href={pillar.href} className={styles.pillarLink}>
                {pillar.label}
              </ScrollLink>
              <a
                href={pillar.external}
                className={styles.pillarExternal}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${pillar.title} on counder.com`}
              >
                ↗
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function MockConferenceBelow() {
  return (
    <section
      className={styles.conference}
      id="conference"
      data-scroll-block="conference"
      aria-label="Counder Conference 2027"
    >
      <img
        className={styles.conferenceBg}
        src={CONFERENCE_HERO_IMAGE}
        alt=""
        loading="lazy"
        decoding="async"
        data-scroll-item="conference-bg"
      />
      <div className={styles.conferenceScrim} data-scroll-item="conference-scrim" aria-hidden="true" />
      <CounderLogoMark className={styles.conferenceMark} />
      <div className={styles.conferenceInner} data-scroll-item="conference-inner">
        <h3 className={styles.conferenceTitle} data-scroll-item="conference-reveal">
          Counder Conference 2027.
          <br />
          25&ndash;29 January: Cape Town.
        </h3>
        <p className={styles.conferenceLens} data-scroll-item="conference-reveal">
          This year&rsquo;s lens: The AI Inflection.
        </p>
        <a
          href={COUNDER_LINKS.join}
          className={styles.conferenceCta}
          data-scroll-item="conference-reveal"
          target="_blank"
          rel="noopener noreferrer"
        >
          Join
        </a>
      </div>
    </section>
  )
}

export function MockJoinStrip() {
  return (
    <section id="join" className={styles.joinStrip} data-scroll-block="join" aria-label="Join Counder">
      <div className={styles.joinInner} data-scroll-item="join-inner">
        <h3 className={styles.joinTitle} data-scroll-item="join-reveal">
          Ready to connect?
        </h3>
        <p className={styles.joinBody} data-scroll-item="join-reveal">
          Apply to join the network — curious people from every continent, every discipline.
        </p>
        <a
          href={COUNDER_LINKS.join}
          className={styles.joinCta}
          data-scroll-item="join-reveal"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apply to join
        </a>
      </div>
    </section>
  )
}

export function MockPartnersStrip() {
  return (
    <section id="partners" className={styles.partnersStrip} data-scroll-block="partners">
      <div className={styles.partnersInner} data-scroll-item="partners-inner">
        <p className={styles.partnersEyebrow} data-scroll-item="partners-reveal">
          Partner with us
        </p>
        <h3 className={styles.partnersTitle} data-scroll-item="partners-reveal">
          Bring your community into the conversation.
        </h3>
        <a
          href={COUNDER_LINKS.partners}
          className={styles.partnersCta}
          data-scroll-item="partners-reveal"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get in touch
        </a>
      </div>
    </section>
  )
}

export function MockFriendsNote() {
  return (
    <section id="friends" className={styles.friendsNote} data-scroll-block="friends" aria-label="Counder and Friends">
      <p className={styles.friendsText} data-scroll-item="friends-text">
        <strong>Counder &amp; Friends</strong> — where the network opens up. A day of partner-hosted
        events and celebration for further insight and connection.
      </p>
      <a
        href={COUNDER_LINKS.friends}
        className={styles.friendsLink}
        data-scroll-item="friends-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        Explore Counder &amp; Friends
      </a>
    </section>
  )
}

export function MockFooter() {
  return (
    <footer className={styles.footer} id="about" data-scroll-block="footer" aria-hidden="true">
      <p className={styles.footerTitle} data-scroll-item="footer-reveal">
        We gather to understand.
      </p>
      <p className={styles.footerBody} data-scroll-item="footer-reveal">
        Counder is the network for collective understanding. Curious people from every continent,
        every discipline — coming together to make sense of what&rsquo;s going on in the world.
      </p>
      <p className={styles.footerMeta} data-scroll-item="footer-reveal">
        The Network for Collective Understanding
      </p>
    </footer>
  )
}
