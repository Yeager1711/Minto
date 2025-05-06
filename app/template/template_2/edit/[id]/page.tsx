// app/template/[id]/edit/[id]/page.tsx
import Template2 from './Template2';
import { NextPage } from 'next';

// Tắt quy tắc no-explicit-any cho dòng này
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Page: NextPage<{ params: any }> = ({ params }) => {
    console.log('Page ID from params:', params.id);
    return <Template2 id={params.id} />;
};

export async function generateStaticParams() {
    const ids = ['template_1', 'template_2', 'pro_1', 'pro_2', 'pro_3', 'pro_4', 'pro_5'];
    return ids.map((id) => ({
        id,
    }));
}

export default Page;