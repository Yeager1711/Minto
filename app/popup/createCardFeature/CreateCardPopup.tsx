'use client';
import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import styles from './CreateCardPopup.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faXmark } from '@fortawesome/free-solid-svg-icons';

interface CreateCardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { bank: string; accountNumber: string; accountHolder: string }) => void;
}

interface Bank {
  id: string;
  name: string;
  logo?: string;
}

interface BankApiResponse {
  data: Bank[];
}

const CreateCardPopup: React.FC<CreateCardPopupProps> = ({ isOpen, onClose, onSubmit }) => {
  const [bank, setBank] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountHolder, setAccountHolder] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isAnimatingOut, setIsAnimatingOut] = useState<boolean>(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState<boolean>(false);
  const wasOpenedRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingBanks(true);
      const fetchBanks = async () => {
        try {
          const response = await fetch('https://api.vietqr.io/v2/banks', {
            headers: {
              'Content-Type': 'application/json',
              // Thêm API key nếu VietQR yêu cầu
            },
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: BankApiResponse = await response.json();
          setBanks([{ id: '', name: 'Chọn ngân hàng', logo: '' }, ...data.data]);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách ngân hàng';
          setError(errorMessage);
        } finally {
          setIsLoadingBanks(false);
        }
      };
      fetchBanks();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      wasOpenedRef.current = true;
      setIsAnimatingOut(false);
      setBank('');
      setAccountNumber('');
      setAccountHolder('');
      setError('');
    } else if (wasOpenedRef.current) {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setIsAnimatingOut(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCreateCardClick = () => {
    if (!bank || !accountNumber || !accountHolder) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    onSubmit({ bank, accountNumber, accountHolder });
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatAccountNumber = (number: string): string => {
    const cleaned = number.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,3}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatOptionLabel = (
    { name, logo }: Bank,
    { context }: { context: 'menu' | 'value' }
  ): JSX.Element => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {logo ? (
        <img
          src={logo}
          alt={name}
          style={{
            width: context === 'value' ? '5rem' : '3rem',
            height: context === 'value' ? '5rem' : '3rem',
            objectFit: 'contain',
          }}
        />
      ) : (
        <div
          style={{
            width: context === 'value' ? '5rem' : '3rem',
            height: context === 'value' ? '5rem' : '3rem',
          }}
        />
      )}
      <span style={{ fontSize: '1.4rem' }}>{name}</span>
    </div>
  );

  const selectedBank = banks.find((b) => b.id === bank);

  if (!isOpen && !isAnimatingOut) return null;

  return (
    <div
      className={`${styles.popupOverlay} ${isOpen ? styles.animateIn : ''}`}
      onClick={handleOverlayClick}
    >
      <div
        className={`${styles.popupContainer} ${isOpen && !isAnimatingOut ? styles.animateContainer : ''}`}
      >
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <span className={styles.brand}>⚡ Minto</span>
            <button className={styles.closeButton} onClick={onClose}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
          <h3 className={styles.title}>Tạo QR tích hợp thẻ ngân hàng</h3>
          <div className={styles.content}>
            <div className={styles.left}>
              <div className={styles.description}>
                <h3>Thẻ tích hợp QR</h3>
                <p>
                  Tạo thẻ thanh toán với mã QR tích hợp sẵn, để khách mời quét và gửi tiền kèm lời
                  chúc từ xa. Mã QR sẽ được tạo tự động ngay sau khi bạn nhập thông tin thẻ, đảm bảo
                  giao dịch nhanh chóng và an toàn. Phù hợp cho mọi dịp lễ, sự kiện, hoặc giao dịch cá
                  nhân.
                </p>
              </div>
              <div className={styles.form}>
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.inputWrapper}>
                  <div className={styles.inputField}>
                    {isLoadingBanks ? (
                      <div className={styles.input}>Đang tải ngân hàng...</div>
                    ) : (
                      <Select
                        options={banks}
                        getOptionLabel={(option: Bank) => option.name}
                        getOptionValue={(option: Bank) => option.id}
                        value={banks.find((option) => option.id === bank) || null}
                        onChange={(option: Bank | null) => setBank(option?.id || '')}
                        formatOptionLabel={formatOptionLabel}
                        className={styles.reactSelect}
                        classNamePrefix="react-select"
                        placeholder="Chọn ngân hàng"
                        isDisabled={isLoadingBanks}
                        styles={{
                          control: (base) => ({
                            ...base,
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '4px',
                            minHeight: '80px',
                          }),
                          singleValue: (base) => ({
                            ...base,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                          }),
                          option: (base) => ({
                            ...base,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px',
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                      />
                    )}
                  </div>
                  <div className={styles.inputField}>
                    <input
                      type="text"
                      placeholder="Số tài khoản"
                      value={accountNumber}
                      onChange={(e) =>
                        setAccountNumber(e.target.value.replace(/\D/g, '').toUpperCase())
                      }
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.inputField}>
                    <input
                      type="text"
                      placeholder="Chủ tài khoản"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                      className={styles.input}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.bank_card}>
                {selectedBank?.logo && bank ? (
                  <img
                    src={selectedBank.logo}
                    alt={`${selectedBank.name} logo`}
                    className={styles.bankLogo}
                    style={{ maxWidth: '100px', maxHeight: '50px' }}
                  />
                ) : (
                  <h3>{bank ? selectedBank?.name : 'Minto Feature'}</h3>
                )}
                <h2>{accountNumber ? formatAccountNumber(accountNumber) : 'XXX XXX XXX'}</h2>
                <h4>{accountHolder || 'CLIENT NAME'}</h4>
              </div>
            </div>
          </div>
          <div className={styles.footer}>
            <button type="submit" className={styles.submitButton} onClick={handleCreateCardClick}>
              Tạo thẻ <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCardPopup;