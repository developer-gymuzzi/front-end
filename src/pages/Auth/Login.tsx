import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import { Button } from '@nextui-org/react';
import Google_svg from '/assets/images/google.svg';
import { google_login } from '../../utils/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';
import Loader from '../../components/Loader';
import Animation from './Animation';
import Cookies from 'js-cookie';
import IconEye from '../../components/Icon/IconEye';
import { Mail, Lock, Eye, EyeOff, Dumbbell } from 'lucide-react';
import verifyToken from '../../utils/verifyToken';
const LoginBoxed = () => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const navigate = useNavigate();
    const [formData, setFormData] = React.useState<{
        username: string;
        password: string;
    }>({
        username: '',
        password: '',
    });

    const secretKey = import.meta.env.VITE_DECREYPT_KEY;
    const [showPassword, setShowPassword] = React.useState(false);
    const encryptData = (data: string) => {
        const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString();
        return encrypted;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // React.useEffect(() => {
    //     const verifyToken = async () => {
    //         const token = Cookies.get('token');
    //         if (!token) return;

    //         const endpoint = import.meta.env.VITE_API_LIVEHOST;
    //         const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;

    //         try {
    //             const response = await axios.post(`${endpoint}?route=APS/Token/Verify`, null, {
    //                 headers: {
    //                     'x-api-key': apiKey,
    //                     'Content-Type': 'application/json',
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             });

    //             if (response.data.status === true) {
    //                 navigate('/dashboard'); // Redirect to dashboard if token is valid
    //             }
    //         } catch (error) {
    //             console.error('Token verification failed:', error);
    //         }
    //     };

    //     verifyToken();
    // }, [navigate]);

    const [error, setError] = React.useState('');

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();

        const endpoint = import.meta.env.VITE_API_LIVEHOST;
        const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;

        const body = {
            email: formData.username,
            password: formData.password,
        };

        setIsLoading(true);
        try {
            const { data } = await axios.post(`${endpoint}/v1/auth/authlogin`, body, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (data.success === 1) {
                setError('');
                const encryptedExpireAt = encryptData(data.data.expireAt.toString());
                toast.success('OTP has been sent to your email.');
                navigate(`/otp?clientEmail=${data.data.client_email}&expire=${encryptedExpireAt}`);
            } else {
                setError(data.message);
                toast.error('Authorization failed!');
            }
        } catch (error) {
            console.error('Error during login:', error);
            toast.error('Something went wrong. Please try again.'); 
        } finally {
            setIsLoading(false);
        }
    }

      React.useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("token");
      if (!token) return; // No token, stay on login page

      const user = await verifyToken();
      if (user) {
        // Redirect based on role
        if (user.role === "admin") {
          navigate("/companylist", { replace: true });
        } else if (user.role === "gym_owner") {
          navigate("/gym", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
      // else token invalid: stay on login page
    };

    checkAuth();
  }, [navigate]);

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[url(/assets/images/gym_bg.png)] bg-cover bg-center bg-no-repeat px-4 py-6 dark:bg-[#060818] sm:px-8 overflow-hidden">
            <Animation />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <Loader />
                </div>
            )}
            <div className="relative w-full max-w-[480px] h-auto mx-2 sm:mx-4 rounded-xl overflow-hidden shadow-lg">
                {/* Background with gym pattern */}
                <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
                <div
                    className="absolute inset-0 z-0 bg-gradient-to-br from-[#1a2a36] to-[#0d1c28]"
                    style={{
                        backgroundImage: `url('/placeholder.svg?height=600&width=800')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundBlendMode: 'overlay',
                    }}
                ></div>

                <div className="relative flex flex-col justify-center rounded-xl bg-black/80 backdrop-blur-sm px-6 py-8 sm:w-full h-full mx-auto shadow-2xl z-10">
                    <div className="mx-auto w-full max-w-[380px] sm:max-w-[420px]">
                        <div className="mb-8 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-red-600 p-3 rounded-full">
                                    <Dumbbell size={32} className="text-white" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-extrabold uppercase !leading-snug text-white md:text-3xl">
                                GymUiz <span className="text-red-600">LOGIN</span>
                            </h1>
                            <p className="text-sm font-bold leading-normal text-gray-300">Enter your credentials to start your workout journey</p>
                        </div>

                        <form className="space-y-5 text-white" onSubmit={onSubmit}>
                            {error && <p className="text-red-500 text-sm mt-2 text-center bg-black/50 p-2 rounded-md">{error}</p>}

                            <div>
                                <label htmlFor="Email" className="text-sm font-medium">
                                    Email
                                </label>
                                <div className="relative text-gray-300">
                                    <input
                                        id="username"
                                        type="email"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Enter Email"
                                        className="ps-10 w-full border border-gray-700 rounded-md bg-gray-900/80 focus:border-red-600 focus:ring-red-600 transition-all"
                                        disabled={isLoading}
                                    />
                                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="Password" className="text-sm font-medium">
                                    Password
                                </label>
                                <div className="relative text-gray-300">
                                    <input
                                        id="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter Password"
                                        className="ps-10 pr-10 w-full border border-gray-700 rounded-md bg-gray-900/80 focus:border-red-600 focus:ring-red-600 transition-all"
                                        disabled={isLoading}
                                    />
                                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                        <Lock className="h-4 w-4 text-gray-400" />
                                    </span>
                                    <button type="button" className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200" onClick={() => setShowPassword((prev) => !prev)}>
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                disabled={isLoading}
                                type="submit"
                                className="!mt-6 w-full border-0 uppercase shadow-xl bg-gradient-to-r from-red-700 to-red-500 text-white hover:from-red-600 hover:to-red-400 active:from-red-800 active:to-red-600 transition-all font-bold py-6"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        GETTING PUMPED...
                                    </div>
                                ) : (
                                    'LOGIN'
                                )}
                            </Button>
                        </form>

                        {/* <div className="mt-6 text-center text-gray-300">
            <p>
              New to our gym?{" "}
              <a href="#" className="text-red-500 hover:text-red-400 font-bold underline transition">
                SIGN UP NOW
              </a>
            </p>
          </div> */}

                        <div className="mt-8 border-t border-gray-700 pt-6">
                            <p className="text-xs text-center text-gray-400">💪 Train hard. Recover smart. Repeat. 💪</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginBoxed;
