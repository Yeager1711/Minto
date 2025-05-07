'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import EditPopup from 'app/popup/EditPopup/EditPopup';
import InviteePopup from 'app/popup/InviteePopup/InviteePopup';
import styles from './edit_control.module.css';

interface Template2WeddingData {
    bride: string;
    groom: string;
    weddingDate: string;
    weddingTime: string;
    weddingDayOfWeek: string;
    familyGroom: { father: string; mother: string };
    familyBride: { father: string; mother: string };
    brideStory: string;
    groomStory: string;
    groomAddress: string;
    brideAddress: string;
    groomMapUrl: string;
    brideMapUrl: string;
}

interface Template1WeddingData {
    banner: { image: string };
    couple: {
        names: string;
        groom: { name: string; image: string };
        bride: { name: string; image: string };
    };
    invitation: {
        title: string;
        subtitle: string;
        day: string;
        month: string;
        year: string;
        dayOfWeek: string;
        time: string;
        lunarDate: string;
        monthYear: string;
    };
    loveQuote_1: string;
    loveQuote_2: string;
    familyInfo: {
        groomFamily: { title: string; father: string; mother: string };
        brideFamily: { title: string; father: string; mother: string };
    };
    eventDetails: string;
    calendar: { month: string; days: (string | number)[]; highlightDay: number };
    location: {
        groomLocation: { name: string; address: string; mapEmbedUrl: string };
        brideLocation: { name: string; address: string; mapEmbedUrl: string };
    };
    coupleImages: { src: string; alt: string; isCenter?: boolean }[];
    thumnailImages: { src: string; alt: string; isCenter?: boolean }[];
}

interface EditControlsProps<T extends Template1WeddingData | Template2WeddingData> {
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
}

const EditControls = <T extends Template1WeddingData | Template2WeddingData>({
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
                <InviteePopup quantity={quantity} totalPrice={totalPrice} onClose={onInviteePopupClose} id={id} />
            )}
        </>
    );
};

export default EditControls;
