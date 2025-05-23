import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AppDispatch, IRootState } from '../../store';
import { toggleSidebar, toggleRTL } from '../../store/themeConfigSlice';
import { useTranslation } from 'react-i18next';
import { Bell, ChevronDown, Power } from 'lucide-react';
import { Badge, message, Dropdown, Menu } from 'antd';
import Cookies from 'js-cookie';
import axios from 'axios';
import Swal from 'sweetalert2';
import socket from '../../socket';
import IconMenu from '../Icon/IconMenu';
import moment from 'moment';
import { activeGym } from '../../store/customerConfigSlice';

const Header = () => {
    const dispatch :AppDispatch = useDispatch();
    const location = useLocation();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const userRole = localStorage.getItem('userRole');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [flag, setFlag] = useState(themeConfig.locale);

    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;

    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState('All');
    const token = Cookies.get('token');

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    interface Gym {
        _id: string;
        name: string;
        // add other properties if needed
    }
    const { gyms } = useSelector((state: IRootState) => state.customerConfig) as { gyms: Gym[] };

    const handleSelectGym = (gymId:string) => {
    
        dispatch(activeGym(gymId));
        toggleDropdown(); 
    };

    useEffect(() => {
        const selector = document.querySelector(`ul.horizontal-menu a[href="${window.location.pathname}"]`);
        if (selector) {
            selector.classList.add('active');
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu')?.querySelectorAll('.nav-link');
                if (ele?.length) {
                    setTimeout(() => ele[0]?.classList.add('active'), 0);
                }
            }
        }
    }, [location]);

    // Fetch unread notifications
    const fetchNotification = async () => {
        try {
            const { data } = await axios.get(`${endpoint}/v1/admin/list/listingNotify`);
            if (data.success) {
                setNotifications(data.data || []);
            }
        } catch (error) {
            message.error('Failed to fetch notifications');
        }
    };

    const handleSingleNotificationClick = async (notificationId: string) => {
        try {
            await axios.put(`${endpoint}/v1/admin/list/markNotify/${notificationId}`);
            setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
        } catch (error) {
            message.error('Failed to mark as read');
        }
    };

    useEffect(() => {
        socket.emit('join-admin');

        socket.on('gym_updated', (notification: any) => {
            setNotifications((prev) => [notification, ...prev]);
        });

        socket.on('gym_registered', (notification: any) => {
            setNotifications((prev) => [notification, ...prev]);
        });

        fetchNotification();

        return () => {
            socket.off('gym_updated');
            socket.off('gym_registered');
        };
    }, []);

    // Logout function
    const SignOut = () => {
        Swal.fire({
            title: 'Log Out',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Log Out',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
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
                        document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                        Swal.fire('Logged Out!', 'You have been logged out.', 'success');
                        window.location.href = '/';
                    }
                } catch (error) {
                    Swal.fire('Error', 'Logout failed. Please try again.', 'error');
                }
            }
        });
    };

    // Notification dropdown menu
    const renderNotificationMenu = () => (
        <Menu className="max-w-sm w-[320px] p-0">
            {notifications.length === 0 ? (
                <Menu.Item disabled className="px-4 py-2 text-center text-gray-500">
                    No new notifications
                </Menu.Item>
            ) : (
                <div className={`${notifications.length > 3 ? 'max-h-72 overflow-y-auto' : ''} custom-scrollbar`}>
                    {notifications.map((noti) => (
                        <Menu.Item key={noti._id} className="whitespace-normal px-4 py-2 hover:bg-gray-50" onClick={() => handleSingleNotificationClick(noti._id)}>
                            <div className="flex flex-col gap-1">
                                <span className="font-medium text-gray-800">{noti.message}</span>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                    {noti.data?.changes?.map((change: string, idx: number) => (
                                        <li key={idx}>{change}</li>
                                    ))}
                                </ul>
                                <span className="text-xs text-gray-400">{moment(noti.createdAt).fromNow()}</span>
                            </div>
                        </Menu.Item>
                    ))}
                </div>
            )}
        </Menu>
    );

    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="shadow-sm">
                <div className="relative bg-white flex w-full items-center px-5 py-2.5 dark:bg-black">
                    <div className="horizontal-logo flex lg:hidden justify-between items-center">
                        <Link to="/" className="main-logo flex items-center shrink-0">
                            <img className="w-[140px]" src="/assets/images/gym_logo.png" alt="logo" />
                        </Link>
                    </div>

                    <div className="sm:flex-1 flex justify-between items-center dark:text-[#d0d2d6]">
                        <div>
                            <button type="button" className="collapse-icon w-8 h-8 rounded-full flex items-center" onClick={() => dispatch(toggleSidebar())}>
                                <IconMenu className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-5 relative">
                            <Dropdown overlay={renderNotificationMenu()} trigger={['click']}>
                                <div className="cursor-pointer relative">
                                    <Bell className="text-xl" />
                                    <Badge count={notifications.length} className="absolute -top-1 -right-1" />
                                </div>
                            </Dropdown>
                            {userRole === 'gym_owner' && (
                                <div className="relative w-64">
                                    {/* Dropdown button */}
                                    <button
                                        onClick={toggleDropdown}
                                        className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <span className="text-gray-700">Select Gym</span>
                                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown menu */}
                                    {isOpen && (
                                        <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                            <ul className="py-1 max-h-60 overflow-auto">
                                                {gyms.map((gym) => (
                                                    <li
                                                        key={gym._id}
                                                        className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors duration-150"
                                                        onClick={() => handleSelectGym(gym._id)}
                                                    >
                                                        {gym.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            <NavLink to="#" onClick={SignOut}>
                                <Power className="text-red-500" />
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
