import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoutes';
const RejectedShift = lazy(() => import('../pages/HRM/rejectedShifts'));
const Index = lazy(() => import('../pages/dashboard/Index'));
const Login = lazy(() => import('../pages/Auth/Login'));
const Inventory = lazy(() => import('../pages/HRM/Inventory/Inventory'));
const Clock = lazy(() => import('../pages/HRM/Clocking/list'));
const ManagePeople = lazy(() => import('../pages/HRM/Trainers/Managepepople'));
const ManageSite = lazy(() => import('../pages/Manage_site/Manage'));
const AddGaurd = lazy(() => import('../pages/HRM/AddGaurds'));
const OTP = lazy(() => import('../pages/Auth/Otp'));
const Manage_services = lazy(() => import('../pages/Manage_services/manage'));
const Company = lazy(() => import('../pages/usersRoles/RolesUserList'));
const ManageTrash = lazy(() => import('../pages/Manage_site/manageTrash'));
const Addpepople = lazy(() => import('../pages/HRM/Trainers/Add_gaurd'));
const AddSite = lazy(() => import('../pages/Manage_site/AddorEditSite'));
const EditGaurd = lazy(() => import('../pages/HRM/Trainers/Edit_gaurd'));
const AddShift = lazy(() => import('../pages/Schedule/addShift'));
const Guardshift = lazy(() => import('../pages/guard/shift'));
const Permissions = lazy(() => import('../pages/Permission/crm-permissions'));
const Editpermissions = lazy(() => import('../pages/Permission/role-editor'));
const ScheduleInterface = lazy(() => import('../pages/shift/newtest'));
const ProfilePage = lazy(() => import('../pages/profile'));
const AddCompany = lazy(() => import('../pages/usersRoles/Companyadd'));
const Customertimetable = lazy(() => import('../pages/Timeprocessing/customer-time-table'));
const Shift = lazy(() => import('../pages/shift/schedule-interface'));
const Geolocation = lazy(() => import('../pages/Location/googlemap'));
const Gym = lazy(() => import('../pages/Gym/ManageGym'));
const GYmPage = lazy(() => import('../pages/Gym/Viewgym'));
const Earning = lazy(() => import('../pages/Earnings/list'));

const routes = [
    {
        path: '/',
        element: <Login />,
        layout: 'blank',
    },
    {
        path: '/otp',
        element: <OTP />,
        layout: 'blank',
    },
    {
        path: '/dashboard',
        element: <Index />,
    },
    {
        path: '/gym',
        element: (
            <ProtectedRoute allowedRoles={['gym_owner']}>
                <Gym />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/companylist',
        element: <Company />,
        layout: 'default',
    },
    {
        path: '/earning',
        element: (
            <ProtectedRoute allowedRoles={['admin']}>
                <Earning />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/gymView/:id',
        element: <GYmPage />,
        layout: 'default',
    },
    {
        path: '/addCompany',
        element: <AddCompany />,
        layout: 'blank',
    },
    {
        path: '/inventory',
        element: <Inventory />,
        layout: 'default',
    },
    {
        path: '/clock',
        element: <Clock />,
        layout: 'default',
    },
    {
        path: '/managepeople',
        element: <ManagePeople />,
        layout: 'default',
    },
    {
        path: '/add/user',
        element: <Addpepople />,
        layout: 'default',
    },
    {
        path: '/edit/user/:id',
        element: <EditGaurd />,
        layout: 'default',
    },
    {
        path: '/manage_site',
        element: <ManageSite />,
        layout: 'default',
    },
    {
        path: '/add/site',
        element: <AddSite />,
        layout: 'default',
    },
    {
        path: '/edit/site/:siteId',
        element: <AddSite />,
        layout: 'default',
    },
    {
        path: '/manage_customer',
        element: <ManageTrash />,
        layout: 'default',
    },
    {
        path: '/manage_services',
        element: <Manage_services />,
        layout: 'default',
    },
    {
        path: '/schedule',
        element: <Shift />,
        layout: 'default',
    },
    {
        path: '/add/Shift',
        element: <AddShift />,
        layout: 'default',
    },
    {
        path: '/timeprocessing',
        element: <Customertimetable />,
        layout: 'default',
    },
    {
        path: '/crm-permissions',
        element: <Permissions />,
        layout: 'default',
    },
    {
        path: '/crm-permissions/edit/:role_id',
        element: <Editpermissions />,
        layout: 'default',
    },
    {
        path: '/profile',
        element: <ProfilePage />,
        layout: 'default',
    },
    {
        path: '/rejectedShifts',
        element: <RejectedShift />,
        layout: 'default',
    },
    {
        path: '/guard/shift',
        element: <Guardshift />,
        layout: 'default',
    },
    {
        path: '/Geolocation',
        element: <Geolocation />,
        layout: 'default',
    },
    {
        path: '/ScheduleInterface',
        element: <ScheduleInterface />,
        layout: 'default',
    },
];

export { routes };
