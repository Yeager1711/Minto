'use client';
import * as React from 'react';
import styles from './navCenter.module.css';
import GeminiButton from 'app/AI_Service/gemini_button/Gemini';
import { useLiquidGlass } from '../useLiquidGlass/useLiquidGlass';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadset } from '@fortawesome/free-solid-svg-icons';

interface NavCenterProps {
    onOpenReply: () => void; // Callback để mở GeminiReply
    onToggleSupport: () => void; // Callback để mở/đóng SupportError
}

function NavCenter({ onOpenReply, onToggleSupport }: NavCenterProps) {
    const cardRef = React.useRef<HTMLDivElement>(null);
    useLiquidGlass(cardRef);

    return (
        <div className={styles.NavCenter}>
            <div className={styles.layout_liquidGlass}>
                <div className={styles.card__layout_liquidGlass} ref={cardRef}>
                    <div className={styles.layout_contrain}></div>
                    <div className={styles.ingredient}>
                        <div className={styles.btn_control}>
                            <GeminiButton onClick={onOpenReply} />
                        </div>
                        <div className={styles.btn_control} onClick={onToggleSupport}>
                            <div className={styles.support}>
                                <FontAwesomeIcon icon={faHeadset} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavCenter;

// 'use client';
// import * as React from 'react';
// import styles from './liquid.module.scss';

// function NavCenter() {
//     return (
//         <>
//             <div className={styles.NavCenter}>
//                 <div className={styles.layout_liquidGlass}>
//                     <div className={styles.card__layout_liquidGlass}>
//                         <div className={styles.layout_contrain}></div>

//                         <div className={styles.ingredient}>
//                             <button className={styles.btn}>←</button>
//                             <button className={styles.btn_fit}>Animation Test</button>
//                             <button className={styles.btn}>-</button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* 👇 chỉ còn morphLens filter */}
//             <svg style={{ display: 'none', width: '0', height: '0' }}>
//                 <filter id="meltEffect">
//                     <feTurbulence type="turbulence" baseFrequency="0.01 0.02" numOctaves="10" result="turb" />
//                     <feDisplacementMap
//                         in="SourceGraphic"
//                         in2="turb"
//                         scale="20"
//                         xChannelSelector="R"
//                         yChannelSelector="G"
//                     />
//                 </filter>
//             </svg>
//         </>
//     );
// }

// export default NavCenter;
