'use clients'
import React from 'react';
import styles from './change_password.module.scss';
import SettingsLayout from '../control/page';

export default function ChangePasswordPage() {


    return (
        <section className={styles.ChangePasswordPage}>
            <SettingsLayout />
            <div className={styles.changePassword_container}>
                <h2 className={styles.changePassword__title}>Thay đổi mật khẩu</h2>
                <form className={styles.changePassword__form}>
                    <div className={styles.changePassword__form__group}>
                        <label className={styles.changePassword__form__label}>Mật khẩu mới</label>
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu mới"
                            className={styles.changePassword__form__input}
                        />
                    </div>
                    <div className={styles.changePassword__form__group}>
                        <label className={styles.changePassword__form__label}>Nhập lại mật khẩu</label>
                        <input
                            type="password"
                            placeholder="Nhập lại mật khẩu mới"
                            className={styles.changePassword__form__input}
                        />
                    </div>
                    <div className={styles.changePassword__form__checkbox}>
                        <input type="checkbox" id="logoutAll" />
                        <label htmlFor="logoutAll">Thoát tất cả các phiên bản đang nhập hiện tại</label>
                    </div>
                    <div className={styles.changePassword__form__buttons}>
                        <button
                            type="button"
                            className={styles.changePassword__form__button_cancel}
                            // onClick={() => console.log('Cancelled')}
                        >
                            Hủy
                        </button>
                        <button type="submit" className={styles.changePassword__form__button_submit}>
                            Cập nhật
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
