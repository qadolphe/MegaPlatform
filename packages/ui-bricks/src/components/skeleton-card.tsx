import styles from './skeleton-card.module.css';

export const SkeletonCard = () => {
    return (
        <div className={styles.card}>
            <div className={styles.cardContent}>
                <div className={`${styles.skeletonText} ${styles.title}`} />
                <div className={`${styles.skeletonText} ${styles.desc}`} />
                <div className={`${styles.skeletonText} ${styles.descShort}`} />
                <div className={`${styles.skeletonText} ${styles.price}`} />
                <div className={styles.button} />
            </div>
        </div>
    );
}
