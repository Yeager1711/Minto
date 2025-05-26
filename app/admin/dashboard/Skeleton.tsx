import styles from './dashboard.module.css';

interface SkeletonProps {
    type: 'text' | 'chart' | 'box' | 'circle' | 'small';
}

const Skeleton: React.FC<SkeletonProps> = ({ type }) => {
    const classMap = {
        text: styles.skeleton_text,
        chart: styles.skeleton_chart,
        box: styles.skeleton_box,
        circle: styles.skeleton_circle,
        small: styles.skeleton_small,
    };

    return <div className={`${styles.skeleton} ${classMap[type]}`}></div>;
};

export default Skeleton;