const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;
import { useRouter } from 'next/navigation';

export const useHandleViewJob = () => {
    const router = useRouter();

    const handleViewJob = async (jobId: number) => {
        try {
            const response = await fetch(`${apiUrl}/jobs/view/${jobId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to post view for job ${jobId}: ${response.statusText}`);
            }

            // Mở trang mới thay vì điều hướng router
            window.open(`/jobs/job_details/${jobId}`, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('Error while viewing the job:', error);
        }
    };

    return handleViewJob;
};
