// app/template/template_2/[inviteeName]/page.tsx
import Mau2InviteeName from './Mau2InviteeName';

// Define the Page component with Next.js dynamic route params
export default function Page({ params }: { params: { inviteeName: string } }) {
    return <Mau2InviteeName inviteeName={params.inviteeName} />;
}

// Generate static parameters for pre-rendering
export async function generateStaticParams() {
    const inviteeNames = ['Nguyen Van A', 'Tran Thi B', 'Le Van C']; // Replace with actual list
    return inviteeNames.map((inviteeName) => ({
        inviteeName,
    }));
}
