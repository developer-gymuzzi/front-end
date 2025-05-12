import { Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { IRootState } from '../../store';
import { toggleRTL, toggleTheme, toggleSidebar } from '../../store/themeConfigSlice';
import { useTranslation } from 'react-i18next';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from '@nextui-org/react';
import IconMenu from '../Icon/IconMenu';
import Swal from 'sweetalert2';
import IconLogout from '../Icon/IconLogout';
import { ChevronDown, Power } from 'lucide-react';
import Cookies from 'js-cookie';
import axios from 'axios';
import Profile from './Profile';
import { Popover } from 'antd';
const Header = () => {
    const token = Cookies.get('token');
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const navigate = useNavigate();

    const location = useLocation();

    useEffect(() => {
        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }, [location]);

    const toUpperCase = (text: any) => (text ? text.toUpperCase() : '');

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch<any>();

    function createMarkup(messages: any) {
        return { __html: messages };
    }

    const [search, setSearch] = useState(false);

    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };
    const [flag, setFlag] = useState(themeConfig.locale);

    const { t } = useTranslation();
    function deleteCookie(name: any) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
    async function SignOut() {
        Swal.fire({
            title: 'Log Out',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Log Out',
            reverseButtons: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.post(`${endpoint}?route=User/Log-out`, null, {
                        headers: {
                            'x-api-key': apiKey,
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (response.data.status === true) {
                        const cookiesToDelete = ['token'];
                        cookiesToDelete.forEach((cookie) => deleteCookie(cookie));
                        Swal.fire('Logged Out!', 'You have been logged out successfully.', 'success');
                        window.location.href = '/';
                    }
                } catch (error) {
                    console.error('Logout failed:', error);
                    Swal.fire('Error', 'Failed to log out. Please try again.', 'error');
                }
            }
        });
    }

    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="shadow-sm">
                <div className="relative bg-white flex w-full items-center px-5 py-2.5 dark:bg-black">
                    <div className="horizontal-logo flex lg:hidden justify-between items-center ltr:mr-2 rtl:ml-2">
                        <Link to="/" className="main-logo flex items-center shrink-0">
                            {/* <img
                                className="w-[50px] ltr:-ml-1 rtl:-mr-1 inline"
                                src={activeCompanyData?.logo}
                                alt={activeCompanyData?.Name}
                            /> */}
                            <img className="w-[140px]" src="/assets/images/gym_logo.png" alt="logo" />
                        </Link>
                    </div>

                    <div className="sm:flex-1 ltr:sm:ml-0 ltr:ml-auto sm:rtl:mr-0 rtl:mr-auto flex items-center space-x-1.5 lg:space-x-2 rtl:space-x-reverse dark:text-[#d0d2d6]">
                        <div className="sm:ltr:mr-auto sm:rtl:ml-auto">
                            <button
                                type="button"
                                className="collapse-icon w-8 h-8 rounded-full flex items-center  dark:text-white-light transition duration-300 rtl:rotate-180"
                                onClick={() => dispatch(toggleSidebar())}
                            >
                                <IconMenu className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative w-64">
                            {/* Dropdown button */}
                            <button
                                onClick={toggleDropdown}
                                className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown menu */}
                            {isOpen && (
                                <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                    <ul className="py-1 max-h-60 overflow-auto"></ul>
                                </div>
                            )}
                        </div>
                        <div className="dropdown shrink-0 flex items-center space-x-2">
                            
                            {/* <Popover
                                trigger={'hover'}
                                arrow={false}
                                rootClassName="w-[700px]"
                                content={
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <Profile />
                                    </Suspense>
                                }
                            >
                                <div className="hover:bg-[#ffffff29] bg-[#ffffff00] h-[40px]  rounded-[10px] p-[10px] h-[50px] flex">
                                    <Avatar size="sm" className="ml-1 " src={''} color="secondary" showFallback name="sdc" />
                                    <span className="mt-1 ml-2 truncate w-auto pr-1 text-[14px]"> </span>
                                </div>
                            </Popover> */}

                            <div className="dropdown shrink-0 flex">
                                <NavLink to="#" onClick={SignOut}>
                                    <Power className="text-red-500" />
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
