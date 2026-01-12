'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
    const searchParams = useSearchParams();
    const query = searchParams?.get('q') ?? '';

    return (
        <nav className={styles.nav}>
            <div className={styles.inner}>
                <div className={styles.brand}>
                    <Link href="/matches" className={styles.brandLink}>
                        <span className={styles.brandMark}>PS</span>
                        Picia Sport
                    </Link>
                </div>

                <div className={styles.actions}>
                    <form className={styles.search} action="/matches" method="get" role="search">
                        <span className={styles.searchIcon}>⌕</span>
                        <input
                            type="search"
                            name="q"
                            placeholder="Rechercher un match"
                            defaultValue={query}
                        />
                        <button type="submit" className={styles.searchButton} aria-label="Lancer la recherche">
                            OK
                        </button>
                    </form>
                </div>
            </div>
        </nav>
    );
}
