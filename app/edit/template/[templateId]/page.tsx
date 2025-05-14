'use client';

import { useParams } from 'next/navigation';
import EditTemplate, { TemplateWeddingData } from './EditTemplate';

const defaultWeddingData: TemplateWeddingData = {
    bride: '',
    groom: '',
    weddingTime: '',
    weddingDayOfWeek: '',
    lunarDay: '',
    familyGroom: { father: '', mother: '' },
    familyBride: { father: '', mother: '' },
    brideStory: '',
    groomStory: '',
    groomAddress: '',
    brideAddress: '',
    groomMapUrl: '',
    brideMapUrl: '',
    weddingDate: '',
};

export default function EditTemplatePage() {
    const { templateId } = useParams();

    // Ensure templateId is a string
    const id = Array.isArray(templateId) ? templateId[0] : templateId;

    // Load weddingData from localStorage or use default
    const weddingData =
        typeof window !== 'undefined' && id
            ? JSON.parse(localStorage.getItem(`WeddingData${id}`) || JSON.stringify(defaultWeddingData))
            : defaultWeddingData;

    return <EditTemplate weddingData={weddingData} templateId={id || ''} />;
}
