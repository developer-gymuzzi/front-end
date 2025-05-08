import React, { useState, useEffect } from 'react';
import { Button, InputOtp } from "@nextui-org/react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
import Animation from './Animation';

const secretkey = import.meta.env.VITE_DECREYPT_KEY;

function decryptExpireAt(encryptedExpireAt: any) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedExpireAt, secretkey);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        return decryptedData ? parseInt(decryptedData, 10) : null;
    } catch (error) {
        console.error('Error decrypting expireAt:', error);
        return null;
    }
}

function encryptExpireAt(expireAt: number): string {
    try {
        const encrypted = CryptoJS.AES.encrypt(expireAt.toString(), secretkey).toString();
        return encrypted;
    } catch (error) {
        console.error('Error encrypting expireAt:', error);
        return '';
    }
}

function Otp() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<{ otp: string }>({ otp: '' });
    const [isExpired, setIsExpired] = useState<boolean>(false);
    const [clientId, setClientId] = useState<string | null>(null);
    const [expireAt, setExpireAt] = useState<number | null>(null);
    const [loadingResend, setLoadingResend] = useState<boolean>(false);
    const [loadingOtp, setLoadingOtp] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(120); // Set 2 minutes (120 seconds)

    const navigate = useNavigate();
    const location = useLocation();
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const newClientId = queryParams.get('clientId');
        const newExpireAt = queryParams.get('expire');

        if (newClientId && newExpireAt) {
            const decryptedExpireAt = decryptExpireAt(newExpireAt);
            setClientId(newClientId);
            setExpireAt(decryptedExpireAt);
        } else {
            toast.error('Invalid link, clientId or expire time missing.');
            navigate('/');
        }
    }, [location.search, navigate]);

    useEffect(() => {
        if (expireAt && Date.now() > expireAt) {
            setIsExpired(true);
        }
    }, [expireAt]);

    // Countdown timer for Resend OTP
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000); // Decrement every second

            return () => clearInterval(timer);
        } else {
            // Enable resend button after 2 minutes
            setIsExpired(false);
        }
    }, [timeLeft]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoadingOtp(true);

        const body = {
            client_id: clientId,
            verificationCode: formData.otp,
        };

        try {
            const { data } = await axios.post(`${endpoint}?route=admin/auth/two-factor`, body, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
            });

            setLoadingOtp(false);

            if (data.status === true) {
                toast.success('OTP Verified Successfully!');
                Cookies.set('token', data.jwt, { expires: 3 });
              
                setTimeout(() => {
                    navigate('/dashboard');
                    window.location.reload(); 
                }, 2000);
            } else {
                toast.error('OTP Verification Failed. Please try again.');
            }
        } catch (error) {
            setLoadingOtp(false); 
            toast.error('An error occurred. Please try again later.');
        }
    };

    const resendOtp = async () => {
        if (timeLeft > 0) {
            toast.warning(`You must wait ${timeLeft} seconds before resending OTP.`);
            return;
        }

        setLoadingResend(true); // Set loader for resend OTP

        const body = {
            client_id: clientId,
        };

        try {
            const { data } = await axios.post(`${endpoint}?route=admin/otp/resend`, body, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
            });

            setLoadingResend(false); // Remove loader after API response

            if (data.status === true) {
                toast.success('OTP Resent Successfully!');
                const newClientId = data.data.client_id;
                const newExpireAt = data.data.expireAt;

                // Encrypt the new expireAt value
                const encryptedExpireAt = encryptExpireAt(newExpireAt);

                // Update query params in the URL with encrypted expireAt
                setClientId(newClientId); updateQueryParams(newClientId, encryptedExpireAt);
                setExpireAt(newExpireAt);
                setIsExpired(false); // Reset expiry state when OTP is resent
                setTimeLeft(120); // Reset countdown timer to 2 minutes
            } else {
                toast.error('Failed to resend OTP. Please try again.');
            }
        } catch (error) {
            setLoadingResend(false); // Remove loader after error
            toast.error('An error occurred. Please try again later.');
        }
    };

    const updateQueryParams = (newClientId: string, newExpireAt: string) => { // Expect newExpireAt to be a string
        const url = new URL(window.location.href);
        url.searchParams.set('clientId', newClientId);
        url.searchParams.set('expire', newExpireAt);
        window.history.pushState({}, '', url.toString());
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[url(/assets/images/login_bg.jpg)] bg-cover bg-center bg-no-repeat px-4 py-6 dark:bg-[#060818] sm:px-8 overflow-hidden">
            <Animation />
            <div className="relative w-full max-w-[360px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[480px] xl:max-w-[500px] h-auto mx-2 sm:mx-4 rounded-xl bg-gradient-to-br from-[#ffffff] via-[#f1f1f1] to-[#e4e4e4] dark:bg-gradient-to-br from-[#0E1726] to-[#1A2436] overflow-hidden shadow-lg">
                <div className="relative flex flex-col justify-center rounded-xl bg-white/90 backdrop-blur-xl dark:bg-black/90 px-6 py-8 sm:w-full h-full mx-auto shadow-2xl">
                    <div className="mx-auto w-full max-w-[380px] sm:max-w-[420px]">
                        <div className="mb-8 text-center">
                            <h1 className="text-2xl font-extrabold uppercase !leading-snug text-[#0d3051] md:text-3xl">Enter OTP</h1>
                            <p className="text-sm font-bold leading-normal text-gray-700 dark:text-gray-300">Please enter the OTP sent to your email</p>
                        </div>
                        <form className="space-y-5 dark:text-white" onSubmit={onSubmit}>
                            <div>
                                <div className="relative flex items-center justify-center">
                                    <InputOtp
                                        type='number'
                                        value={formData.otp}
                                        onChange={handleChange}
                                        name="otp"
                                        length={6}
                                        placeholder="Enter OTP"
                                        disabled={isExpired || isLoading || loadingOtp}
                                        className=""
                                    />
                                </div>
                            </div>
                            <Button
                                disabled={!formData.otp || isLoading || loadingOtp}
                                type="submit"
                                className="!mt-6 w-full border-0 uppercase shadow-xl bg-[#0d3051] text-white hover:bg-primary-dark active:bg-primary-dark transition"
                            >
                                {loadingOtp ? 'Verifying OTP...' : 'Submit OTP'}
                            </Button>
                        </form>
                        <div className="relative my-7 text-center md:mb-9">
                            <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-gray-300 dark:bg-gray-600"></span>
                        </div>

                        <div className="text-center dark:text-white">
                            <Button onPress={resendOtp} disabled={loadingResend || timeLeft > 0} >
                                {loadingResend ? 'Resending OTP...' : timeLeft > 0 ? `Resend in ${timeLeft}s` : 'RESEND OTP'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Otp;
