'use client';
import * as React from 'react';
import { useState, useRef } from 'react';
import { DndContext, useDraggable, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import styles from './design_product.module.scss';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Component con để xử lý kéo thả và điều chỉnh kích thước
interface DraggableTextProps {
    id: string;
    className: string;
    children: React.ReactNode;
    position: { x: number; y: number };
    size: { width: number; height: number; fontSize: number };
    isActive: boolean;
    onDoubleClick: (id: string) => void;
}

const DraggableText: React.FC<DraggableTextProps> = ({ id, className, children, position, size, isActive, onDoubleClick }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id,
    });

    const style = {
        transform: `translate3d(${position.x + (transform?.x || 0)}px, ${position.y + (transform?.y || 0)}px, 0)`,
        width: `${size.width}px`,
        height: `${size.height}px`,
    };

    const textStyle = {
        fontSize: `${size.fontSize}px`,
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDoubleClick(id);
    };

    return (
        <div
            ref={setNodeRef}
            className={`${className} ${isActive ? styles.active : ''}`}
            style={style}
            onDoubleClick={handleDoubleClick}
            {...listeners}
            {...attributes}
        >
            <span style={textStyle}>{children}</span>
            {isActive && (
                <div className={styles.resize_controls}>
                    <div className={styles.resize_handle} data-direction="top-left"></div>
                    <div className={styles.resize_handle} data-direction="top-right"></div>
                    <div className={styles.resize_handle} data-direction="bottom-left"></div>
                    <div className={styles.resize_handle} data-direction="bottom-right"></div>
                </div>
            )}
        </div>
    );
};

export default function DesignProduct() {
    // State to store input values
    const [groomName, setGroomName] = useState('Huỳnh Nam');
    const [brideName, setBrideName] = useState('Huỳnh Nam');
    const [date, setDate] = useState('2025-05-15');
    const [time, setTime] = useState('17:00');

    // State to store positions of draggable elements
    const [positions, setPositions] = useState({
        'groom-name': { x: 0, y: 0 },
        'bride-name': { x: 0, y: 0 },
        'day-of-week': { x: 0, y: 0 },
        'month': { x: 0, y: 0 },
        'day': { x: 0, y: 0 },
        'year': { x: 0, y: 0 },
    });

    // State to store sizes of draggable elements (width, height, fontSize)
    const [sizes, setSizes] = useState({
        'groom-name': { width: 500, height: 100, fontSize: 90 },
        'bride-name': { width: 500, height: 100, fontSize: 90 },
        'day-of-week': { width: 100, height: 30, fontSize: 20 },
        'month': { width: 150, height: 40, fontSize: 30 },
        'day': { width: 100, height: 50, fontSize: 40 },
        'year': { width: 100, height: 40, fontSize: 45 },
    });

    // State to track the active element
    const [activeElement, setActiveElement] = useState<string | null>(null);

    // Ref to capture the invitation div
    const invitationRef = useRef<HTMLDivElement>(null);

    // Ref to the control panel to prevent closing when clicking inside
    const controlPanelRef = useRef<HTMLDivElement>(null);

    // Format the date for display
    const formatDate = (dateString: string) => {
        const dateObj = new Date(dateString);
        const month = dateObj.toLocaleString('default', { month: 'long' }).toUpperCase();
        const day = dateObj.getDate();
        const year = dateObj.getFullYear();
        const dayOfWeek = dateObj.toLocaleString('default', { weekday: 'long' });
        return { month, day, year, dayOfWeek };
    };

    const { month, day, year, dayOfWeek } = formatDate(date);

    // Handle drag start to set active element
    const handleDragStart = (event: DragStartEvent) => {
        const { id } = event.active;
        // Reset activeElement khi kéo thả để tránh hiển thị border
        if (!activeElement || activeElement !== id) {
            setActiveElement(null);
        }
    };

    // Handle drag end to update position
    const handleDragEnd = (event: DragEndEvent) => {
        const { id } = event.active;
        const { x, y } = event.delta;

        setPositions((prev) => ({
            ...prev,
            [id]: {
                x: prev[id as keyof typeof prev].x + x,
                y: prev[id as keyof typeof prev].y + y,
            },
        }));
    };

    // Handle double click on element
    const handleElementDoubleClick = (id: string) => {
        setActiveElement(id);
    };

    // Handle click outside to deselect
    const handleDeselect = (e: React.MouseEvent) => {
        if (controlPanelRef.current && controlPanelRef.current.contains(e.target as Node)) {
            return; // Không ẩn bảng điều khiển nếu click bên trong control panel
        }
        setActiveElement(null);
    };

    // Handle position adjustment
    const handlePositionChange = (id: string, axis: 'x' | 'y', increment: number) => {
        setPositions((prev) => ({
            ...prev,
            [id]: {
                ...prev[id as keyof typeof prev],
                [axis]: prev[id as keyof typeof prev][axis] + increment,
            },
        }));
    };

    // Handle resizing
    const handleResize = (id: string, dimension: 'width' | 'height', increment: number) => {
        setSizes((prev) => {
            const currentSize = prev[id as keyof typeof prev];
            return {
                ...prev,
                [id]: {
                    ...currentSize,
                    [dimension]: Math.max(dimension === 'width' ? 50 : 20, currentSize[dimension] + increment),
                },
            };
        });
    };

    // Handle font size adjustment
    const handleFontSizeChange = (id: string, increment: number) => {
        setSizes((prev) => {
            const currentSize = prev[id as keyof typeof prev];
            return {
                ...prev,
                [id]: {
                    ...currentSize,
                    fontSize: Math.max(10, currentSize.fontSize + increment),
                },
            };
        });
    };

    // Function to handle saving as PDF
    const handleSaveAsPDF = async () => {
        if (invitationRef.current) {
            const canvas = await html2canvas(invitationRef.current, {
                scale: 2,
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height],
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('wedding-invitation.pdf');
        }
    };

    return (
        <section className={styles.DesignProduct} onClick={handleDeselect}>
            <h2>Trình chỉnh sửa</h2>

            <div className={styles.DesignProduct_wrapper}>
                <div className={styles.wedding_invitation}>
                    <div className={styles.wedding_invitation__input}>
                        <div className={styles.box_input}>
                            <span>Nhập tên chú rể</span>
                            <input type="text" value={groomName} onChange={(e) => setGroomName(e.target.value)} />
                        </div>

                        <div className={styles.box_input}>
                            <span>Nhập tên cô dâu</span>
                            <input type="text" value={brideName} onChange={(e) => setBrideName(e.target.value)} />
                        </div>

                        <div className={styles.box_input}>
                            <span>Ngày cưới</span>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>

                        <div className={styles.box_input}>
                            <span>Thời gian</span>
                            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                        </div>

                        <button className={styles.save_button} onClick={handleSaveAsPDF}>
                            Lưu mẫu
                        </button>
                    </div>

                    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <div className={styles.image_result} ref={invitationRef}>
                            <div className={styles.frame}>
                                <img src="/images/p_6/pd_6.png" alt="Floral Frame" className={styles.floral} />
                                <div className={styles.wooden_frame}></div>
                                <div className={styles.drape}></div>
                            </div>

                            <DraggableText
                                id="groom-name"
                                className={styles.groom_name}
                                position={positions['groom-name']}
                                size={sizes['groom-name']}
                                isActive={activeElement === 'groom-name'}
                                onDoubleClick={handleElementDoubleClick}
                            >
                                <span>{groomName}</span>
                            </DraggableText>

                            <DraggableText
                                id="bride-name"
                                className={styles.bride_name}
                                position={positions['bride-name']}
                                size={sizes['bride-name']}
                                isActive={activeElement === 'bride-name'}
                                onDoubleClick={handleElementDoubleClick}
                            >
                                <span>{brideName}</span>
                            </DraggableText>

                            <DraggableText
                                id="day-of-week"
                                className={styles.dayOfWeek}
                                position={positions['day-of-week']}
                                size={sizes['day-of-week']}
                                isActive={activeElement === 'day-of-week'}
                                onDoubleClick={handleElementDoubleClick}
                            >
                                <span>{dayOfWeek}</span>
                            </DraggableText>

                            <DraggableText
                                id="month"
                                className={styles.month}
                                position={positions['month']}
                                size={sizes['month']}
                                isActive={activeElement === 'month'}
                                onDoubleClick={handleElementDoubleClick}
                            >
                                <span>{month}</span>
                            </DraggableText>

                            <DraggableText
                                id="day"
                                className={styles.day}
                                position={positions['day']}
                                size={sizes['day']}
                                isActive={activeElement === 'day'}
                                onDoubleClick={handleElementDoubleClick}
                            >
                                <span>{day}</span>
                            </DraggableText>

                            <DraggableText
                                id="year"
                                className={styles.year}
                                position={positions['year']}
                                size={sizes['year']}
                                isActive={activeElement === 'year'}
                                onDoubleClick={handleElementDoubleClick}
                            >
                                <span>{year}</span>
                            </DraggableText>
                        </div>
                    </DndContext>
                </div>

                {activeElement && (
                    <div className={styles.controls} ref={controlPanelRef}>
                        <div className={styles.control_panel}>
                            <h3>Điều chỉnh {activeElement}</h3>
                            <div>
                                <label>Tọa độ X: {positions[activeElement as keyof typeof positions].x}px</label>
                                <button onClick={() => handlePositionChange(activeElement, 'x', 10)}>+</button>
                                <button onClick={() => handlePositionChange(activeElement, 'x', -10)}>-</button>
                            </div>
                            <div>
                                <label>Tọa độ Y: {positions[activeElement as keyof typeof positions].y}px</label>
                                <button onClick={() => handlePositionChange(activeElement, 'y', 10)}>+</button>
                                <button onClick={() => handlePositionChange(activeElement, 'y', -10)}>-</button>
                            </div>
                            <div>
                                <label>Chiều rộng: {sizes[activeElement as keyof typeof sizes].width}px</label>
                                <button onClick={() => handleResize(activeElement, 'width', 10)}>+</button>
                                <button onClick={() => handleResize(activeElement, 'width', -10)}>-</button>
                            </div>
                            <div>
                                <label>Chiều cao: {sizes[activeElement as keyof typeof sizes].height}px</label>
                                <button onClick={() => handleResize(activeElement, 'height', 10)}>+</button>
                                <button onClick={() => handleResize(activeElement, 'height', -10)}>-</button>
                            </div>
                            <div>
                                <label>Kích thước chữ: {sizes[activeElement as keyof typeof sizes].fontSize}px</label>
                                <button onClick={() => handleFontSizeChange(activeElement, 2)}>+</button>
                                <button onClick={() => handleFontSizeChange(activeElement, -2)}>-</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}