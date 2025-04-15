'use client';
import React, { useState, useRef, useEffect } from 'react';
import styles from './styles/home.module.scss';
import Recruitment from './recruitment/page';

// Định nghĩa kiểu cho box item
interface BoxItem {
    text: string;
    basePosition: { top: number; left?: number; right?: number };
}

function Home() {
    const textItems: string[] = ['Find', "What's", 'Next'];

    const boxItemsData: BoxItem[] = [
        { text: 'Robotics', basePosition: { top: -350, left: -600 } },
        { text: 'Cyber Security', basePosition: { top: -350, left: -200 } },
        { text: 'Web3', basePosition: { top: -350, left: 200 } },
        { text: 'Mental Health', basePosition: { top: -350, left: 600 } },
        { text: 'Vue JS Developers', basePosition: { top: -200, left: -500 } },
        { text: 'iOS Developers', basePosition: { top: -200, left: -100 } },
        { text: 'React Developers', basePosition: { top: -200, left: 300 } },
        { text: 'Android Developers', basePosition: { top: -200, left: 700 } },
        { text: 'Boston', basePosition: { top: 0, left: -700 } },
        { text: 'Flutter Developers', basePosition: { top: 350, left: -800 } },
        { text: 'Aerospace', basePosition: { top: 0, left: 500 } },
        { text: 'Artificial Intelligence', basePosition: { top: 0, left: 700 } },
        { text: 'Sass', basePosition: { top: 200, left: -600 } },
        { text: 'Denver', basePosition: { top: 200, left: -200 } },
        { text: 'Full Stack Developer', basePosition: { top: 200, left: 200 } },
        { text: 'Senior', basePosition: { top: 200, left: 600 } },
        { text: 'Hà Nội', basePosition: { top: 350, left: -500 } },
        { text: 'TP.HCM', basePosition: { top: 350, left: -100 } },
        { text: 'Đà Nẵng', basePosition: { top: 100, left: 300 } },
        { text: 'Cần Thơ', basePosition: { top: 350, left: 700 } },
        { text: 'Hải Phòng', basePosition: { top: -300, left: -800 } },
        { text: 'Frontend Developers', basePosition: { top: -400, left: 0 } },
        { text: 'Backend Developers', basePosition: { top: 300, left: 800 } },
        { text: 'DevOps', basePosition: { top: 400, left: -300 } },
        { text: 'Data Science', basePosition: { top: 180, left: -470 } },
        { text: 'Machine Learning', basePosition: { top: 380, left: 300 } },
        { text: 'Blockchain', basePosition: { top: -90, left: -800 } },
        { text: 'UI/UX Design', basePosition: { top: -290, left: 800 } },
        { text: 'Game Development', basePosition: { top: 90, left: -800 } },
        { text: 'Cloud Computing', basePosition: { top: -400, left: 800 } },
    ];

    const [boxItems, setBoxItems] = useState<BoxItem[]>([]);
    const sectionRef = useRef<HTMLDivElement>(null);
    const boxRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
    const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const targetPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const currentPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const initializePositions = () => {
            setBoxItems(boxItemsData);
            boxRefs.current = boxItemsData.map(() => React.createRef<HTMLDivElement>());
        };

        initializePositions();
        window.addEventListener('resize', initializePositions);
        return () => window.removeEventListener('resize', initializePositions);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!sectionRef.current) return;

        const rect = sectionRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;

        mousePositionRef.current = { x: mouseX, y: mouseY };
        targetPositionRef.current = {
            x: -(mouseX * 0.2),
            y: -(mouseY * 0.2),
        };
    };

    useEffect(() => {
        const lerp = (start: number, end: number, factor: number): number => start + (end - start) * factor;

        const updatePositions = () => {
            currentPositionRef.current.x = lerp(currentPositionRef.current.x, targetPositionRef.current.x, 0.1);
            currentPositionRef.current.y = lerp(currentPositionRef.current.y, targetPositionRef.current.y, 0.1);

            boxItems.forEach((box, index) => {
                const boxElement = boxRefs.current[index]?.current;
                if (boxElement) {
                    const sectionWidth = sectionRef.current?.offsetWidth || window.innerWidth;
                    const sectionHeight = sectionRef.current?.offsetHeight || window.innerHeight;
                    const boxWidth = boxElement.offsetWidth;
                    const boxHeight = boxElement.offsetHeight;

                    let newLeft: number;
                    if (box.basePosition.right !== undefined) {
                        newLeft = sectionWidth / 2 - box.basePosition.right - boxWidth + currentPositionRef.current.x;
                    } else {
                        newLeft = (box.basePosition.left || 0) + currentPositionRef.current.x;
                    }

                    const newTop = box.basePosition.top + currentPositionRef.current.y;

                    const maxLeft = sectionWidth / 2 - boxWidth - 50;
                    const minLeft = -sectionWidth / 2 + 50;
                    const maxTop = sectionHeight / 2 - boxHeight - 50;
                    const minTop = -sectionHeight / 2 + boxHeight + 50;

                    boxElement.style.left = `${Math.max(minLeft, Math.min(maxLeft, newLeft))}px`;
                    boxElement.style.top = `${Math.max(minTop, Math.min(maxTop, newTop))}px`;
                    boxElement.style.right = 'auto';
                }
            });

            animationFrameRef.current = requestAnimationFrame(updatePositions);
        };

        animationFrameRef.current = requestAnimationFrame(updatePositions);

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [boxItems]);

    return (
        <>
            <div
                className={styles.recruitment_home}
                ref={sectionRef}
                onMouseMove={handleMouseMove}
                style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}
            >
                <div className={styles.text_wrapper}>
                    <div className={styles.text_container} style={{ zIndex: 10 }}>
                        {textItems.map((item, index) => (
                            <span
                                key={index}
                                className={styles.text_item}
                                style={{ animationDelay: `${index * 0.2}s` }}
                            >
                                {item}
                            </span>
                        ))}
                    </div>

                    {boxItems.map((box, index) => (
                        <div
                            key={index}
                            ref={boxRefs.current[index]}
                            className={styles.box_item}
                            style={{
                                animationDelay: `${1.2 + index * 0.15}s`,
                                top: `${box.basePosition.top}px`,
                                ...(box.basePosition.left !== undefined
                                    ? { left: `${box.basePosition.left}px` }
                                    : { right: `${box.basePosition.right}px` }),
                                position: 'absolute',
                                zIndex: 5,
                            }}
                        >
                            {box.text}
                        </div>
                    ))}
                </div>
            </div>

            <Recruitment />
        </>
    );
}

export default Home;
