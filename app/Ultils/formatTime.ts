export const formatTime = (time: string): string => {
    if (!time) return 'Not set';
    const [hours] = time.split(':');
    const hourNum = parseInt(hours, 10);
    return `${hourNum}h`;
};