import { useEffect } from 'react';

export const useDisableDevTools = () => {
    useEffect(() => {
        const disableDevTools = (e: KeyboardEvent) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'U')
            ) {
                e.preventDefault();
            }
        };

        const disableContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        document.addEventListener('keydown', disableDevTools);
        document.addEventListener('contextmenu', disableContextMenu);

        return () => {
            document.removeEventListener('keydown', disableDevTools);
            document.removeEventListener('contextmenu', disableContextMenu);
        };
    }, []);
};
