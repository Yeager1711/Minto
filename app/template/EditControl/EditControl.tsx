'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import EditPopup from 'app/popup/EditPopup/EditPopup';
import InviteePopup from 'app/popup/InviteePopup/InviteePopup';
import styles from './edit_control.module.css';

// Define a minimal base interface for wedding data
interface BaseWeddingData {
    bride?: string; // Optional to allow flexibility
    groom?: string;
    weddingDate?: string;
    weddingTime?: string;
    weddingDayOfWeek?: string;
    lunarDay?: string;
    familyGroom?: { father: string; mother: string };
    familyBride?: { father: string; mother: string };
    brideStory?: string;
    groomStory?: string;
    groomAddress?: string;
    brideAddress?: string;
    groomMapUrl?: string;
    brideMapUrl?: string;
    invitation?: {
        day?: string;
        month?: string;
        year?: string;
        dayOfWeek?: string;
        time?: string;
        lunarDate?: string;
    };
}

// Define Template2WeddingData to match Template2Edit
interface Template2WeddingData extends BaseWeddingData {
    bride: string;
    groom: string;
    weddingDate: string;
    weddingTime: string;
    weddingDayOfWeek: string;
    lunarDay: string;
    familyGroom: { father: string; mother: string };
    familyBride: { father: string; mother: string };
    brideStory: string;
    groomStory: string;
    groomAddress: string;
    brideAddress: string;
    groomMapUrl: string;
    brideMapUrl: string;
}

// Interface for EditControls props
interface EditControlsProps<T extends BaseWeddingData> {
    weddingData: T;
    quantity: number;
    totalPrice: number;
    id: string;
    showEditPopup: boolean;
    showInviteePopup: boolean;
    setShowEditPopup: (value: boolean) => void;
    setShowInviteePopup: (value: boolean) => void;
    onSaveEdit: (updatedData: T) => void;
    onInviteePopupClose: () => void;
    templateType: 'template1' | 'template2';
    weddingImages?: { file: File; position: string }[];
}

const EditControls = <T extends BaseWeddingData>({
    weddingData,
    quantity,
    totalPrice,
    id,
    showEditPopup,
    showInviteePopup,
    setShowEditPopup,
    setShowInviteePopup,
    onSaveEdit,
    onInviteePopupClose,
    templateType,
    weddingImages = [],
}: EditControlsProps<T>) => {
    return (
        <>
            <div className={styles.buttonContainer}>
                <button className={styles.editButton} onClick={() => setShowEditPopup(true)}>
                    <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa thông tin
                </button>
                <button className={styles.nextButton} onClick={() => setShowInviteePopup(true)}>
                    Tiếp tục
                </button>
            </div>
            {showEditPopup && (
                <EditPopup
                    weddingData={weddingData}
                    onSave={onSaveEdit}
                    onClose={() => setShowEditPopup(false)}
                    templateType={templateType}
                />
            )}
            {showInviteePopup && (
                <InviteePopup
                    quantity={quantity}
                    totalPrice={totalPrice}
                    onClose={onInviteePopupClose}
                    id={id}
                    weddingImages={weddingImages}
                />
            )}
        </>
    );
};

export default EditControls;
