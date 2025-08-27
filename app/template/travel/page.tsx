import * as React from 'react';
import styles from './travel.module.css';

const cards = [
    {
        title: 'Virtual Tour 360°',
        desc: 'As you arrive on your cruise to the Bahamas you will discover beaches and interesting hikes in the hinterland, as well as lots of sports.',
        cta: 'Start now',
    },
    {
        title: 'Location',
        desc: 'MSC Cruises has helped this country set up an environmental paradise for vacationing in harmony with nature in one of its most astonishing locations.',
        cta: 'Read More',
    },
    {
        title: 'Map & Amenities',
        desc: 'Ocean Cay is part of the Bimini chain of islands in the western Bahamas, 20 miles (32 km) south of Bimini and just 65 miles (104.5 km) east of Miami.',
        cta: 'Read More',
    },
];

function Travel() {
    return (
        <div className={styles.travel}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.brand}>
                    <span className={styles.logoDot} />
                    <span className={styles.logoText}>Gee Volt</span>
                    <span className={styles.logoSub}>MSC Marine Reserve · Bahamas</span>
                </div>

                <nav className={styles.nav}>
                    <a href="#">Book a Cruise</a>
                    <a href="#">Book excursion</a>
                    <a href="#">My MSC ▾</a>
                    <a href="#">Contacts</a>
                </nav>

                <button className={styles.menuBtn} aria-label="Open menu">
                    Menu
                </button>
            </header>

            {/* Left timeline dots */}
            <aside className={styles.timeline} aria-hidden="true">
                <ul>
                    <li className={styles.active} />
                    <li />
                    <li />
                    <li />
                    <li />
                </ul>
            </aside>

            {/* Main hero content */}
            <main className={styles.hero}>
                <section className={styles.copy}>
                    <h1>Overview</h1>
                    <p>
                        MSC Cruises has helped this country set up an environmental paradise and an exclusive area for
                        vacationing in harmony with nature in one of its most astonishing locations.
                    </p>
                    <a className={styles.linkMore} href="#">
                        More
                    </a>
                </section>

                <section className={styles.cards}>
                    {cards.map((c, i) => (
                        <article className={styles.card} key={i}>
                            <h3>{c.title}</h3>
                            <p>{c.desc}</p>
                            <button className={styles.cardCta}>
                                <span>+</span> {c.cta}
                            </button>
                        </article>
                    ))}
                </section>
            </main>

            {/* Bottom controls */}
            <footer className={styles.footer}>
                <div className={styles.progressDots} aria-label="slides">
                    <span className={styles.dot + ' ' + styles.dotActive} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                </div>

                <div className={styles.nextPrev}>
                    <button className={styles.ghostBtn}>Prev</button>
                    <button className={styles.ghostBtn}>Next</button>
                </div>

                <div className={styles.actions}>
                    <button className={styles.circleBtn} aria-label="Share">
                        ↗
                    </button>
                    <button className={styles.circleBtn} aria-label="Ask us">
                        💬
                    </button>
                </div>
            </footer>
        </div>
    );
}

export default Travel;
