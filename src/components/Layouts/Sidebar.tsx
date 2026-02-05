import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toggleSidebar } from '../../store/themeConfigSlice';
import { IRootState } from '../../store';
import { useState, useEffect } from 'react';

/* ================= RBAC HELPERS ================= */

const getPermissions = (): string[] => {
    try {
        return JSON.parse(localStorage.getItem('permissions') || '[]');
    } catch {
        return [];
    }
};

const isSuperAdmin = (): boolean => {
    return JSON.parse(localStorage.getItem('isSuperAdmin') || 'false');
};

const hasPermission = (perm: string): boolean => {
    if (isSuperAdmin()) return true;
    return getPermissions().includes(perm);
};

/* ================= COMPONENT ================= */

const Sidebar = () => {
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);

    const location = useLocation();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => (oldValue === value ? '' : value));
    };

    useEffect(() => {
        const selector = document.querySelector(
            '.sidebar ul a[href="' + window.location.pathname + '"]'
        );
        if (selector) {
            selector.classList.add('active');
        }
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] z-50 transition-all duration-300 ${
                    semidark ? 'text-white-dark' : ''
                }`}
            >
                <div className="bg-[url(/assets/images/sidebar_bg.png)] dark:bg-black h-full">
                    <div className="flex justify-center items-center px-4 py-3">
                        <img className="w-[120px]" src="/assets/images/gymuzzi.jpg" alt="logo" />
                    </div>

                    <PerfectScrollbar className="h-[calc(100vh-80px)] relative mt-6">
                        <ul className="relative font-semibold space-y-0.5 p-4 py-0">
                            <li className="nav-item">
                                <ul>

                                    {/* ================= DASHBOARD ================= */}
                                  
                                        <li className="nav-item">
                                            <NavLink to="/dashboard" className="group" onClick={() => toggleMenu('')}>
                                                <div className="flex items-center">
                                                    <span className="ltr:pl-3 rtl:pr-3 sidebartext">
                                                        {t('Dashboard')}
                                                    </span>
                                                </div>
                                            </NavLink>
                                        </li>
                                   

                                    {/* ================= EARNINGS ================= */}
                                    {hasPermission('EARNINGS_VIEW') && (
                                        <li className="nav-item">
                                            <NavLink to="/earning" className="group" onClick={() => toggleMenu('')}>
                                                <div className="flex items-center">
                                                    <span className="ltr:pl-3 rtl:pr-3 sidebartext">
                                                        {t('Earning')}
                                                    </span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    )}

                                    {/* ================= TOPUPS ================= */}
                                    {hasPermission('TOPUPS_VIEW') && (
                                        <li className="nav-item">
                                            <NavLink to="/top-ups" className="group" onClick={() => toggleMenu('')}>
                                                <div className="flex items-center">
                                                    <span className="ltr:pl-3 rtl:pr-3 sidebartext">
                                                        {t('Top-ups')}
                                                    </span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    )}

                                    {/* ================= PEOPLE ================= */}
                                    {hasPermission('PEOPLE_VIEW') && (
                                        <li className="nav-item">
                                            <NavLink to="/companylist" className="group" onClick={() => toggleMenu('')}>
                                                <div className="flex items-center">
                                                    <span className="ltr:pl-3 rtl:pr-3 sidebartext">
                                                        {t('People')}
                                                    </span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    )}

                                    {/* ================= REQUESTS ================= */}
                                    {hasPermission('REQUESTS_VIEW') && (
                                        <li className="nav-item">
                                            <NavLink to="/adminRequest" className="group" onClick={() => toggleMenu('')}>
                                                <div className="flex items-center">
                                                    <span className="ltr:pl-3 rtl:pr-3 sidebartext">
                                                        {t('Requests')}
                                                    </span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    )}

                                    {/* ================= GYMS ================= */}
                                    {hasPermission('GYMS_VIEW') && (
                                        <li className="nav-item">
                                            <NavLink to="/gym" className="group" onClick={() => toggleMenu('')}>
                                                <div className="flex items-center">
                                                    <span className="ltr:pl-3 rtl:pr-3 sidebartext">
                                                        {t('Gym')}
                                                    </span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    )}

                                    {/* ================= TICKETS ================= */}
                                    {hasPermission('TICKETS_VIEW') && (
                                        <li className="nav-item">
                                            <NavLink to="/adminticket" className="group" onClick={() => toggleMenu('')}>
                                                <div className="flex items-center">
                                                    <span className="ltr:pl-3 rtl:pr-3 sidebartext">
                                                        {t('Ticket')}
                                                    </span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    )}

                                    {/* ================= ROLES ================= */}
                                    {hasPermission('ROLES_MANAGE') && (
                                        <li className="nav-item">
                                            <NavLink to="/roles" className="group" onClick={() => toggleMenu('')}>
                                                <div className="flex items-center">
                                                    <span className="ltr:pl-3 rtl:pr-3 sidebartext">
                                                        {t('Roles')}
                                                    </span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    )}

                                    {/* ================= SETTINGS ================= */}
                                    {hasPermission('SETTINGS_VIEW') && (
                                        <li className="nav-item">
                                            <NavLink to="/permissions" className="group" onClick={() => toggleMenu('')}>
                                                <div className="flex items-center">
                                                    <span className="ltr:pl-3 rtl:pr-3 sidebartext">
                                                        {t('Settings')}
                                                    </span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    )}

                                </ul>
                            </li>
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
