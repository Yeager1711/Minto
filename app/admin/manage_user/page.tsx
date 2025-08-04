'use client';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styles from './manage_user.module.scss';

// Define interfaces for type safety
interface Role {
    role_id: number;
    name: string;
}

interface User {
    user_id: number;
    full_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    created_at: string | null;
    role: Role;
}

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

const ManageUser: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    throw new Error('No access token found. Please log in.');
                }

                const response = await fetch(`${apiUrl}/users/all-users`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data: User[] = await response.json();
                setUsers(data);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.h1}>User Management</h1>
            <table className={styles.userTable}>
                <thead className={styles.thead}>
                    <tr className={styles.tr}>
                        <th className={styles.th}>ID</th>
                        <th className={styles.th}>Full Name</th>
                        <th className={styles.th}>Email</th>
                        <th className={styles.th}>Phone</th>
                        <th className={styles.th}>Address</th>
                        <th className={styles.th}>Created At</th>
                        <th className={styles.th}>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.user_id} className={styles.tr}>
                            <td className={styles.td} data-label="ID">
                                {user.user_id}
                            </td>
                            <td className={styles.td} data-label="Full Name">
                                {user.full_name}
                            </td>
                            <td className={styles.td} data-label="Email">
                                {user.email}
                            </td>
                            <td className={styles.td} data-label="Phone">
                                {user.phone || '-'}
                            </td>
                            <td className={styles.td} data-label="Address">
                                {user.address || '-'}
                            </td>
                            <td className={styles.td} data-label="Created At">
                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                            </td>
                            <td className={styles.td} data-label="Role">
                                {user.role.name}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUser;
