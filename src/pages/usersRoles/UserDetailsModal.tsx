import { RxCross2 } from 'react-icons/rx';

export default function UserDetailsModal({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: any }) {
    if (!isOpen || !user) return null;

    const formatRoleLabel = (val: string) => {
        if (val === 'gym_owner') return 'Gym Owner';
        if (val === 'admin') return 'Admin';
        if (val === 'user') return 'User';
        return val.charAt(0).toUpperCase() + val.slice(1);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl relative max-h-[95vh] overflow-y-auto">
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition">
                    <RxCross2 size={18} className="text-gray-700" />
                </button>

                {/* Header */}
                <div className="p-6 border-b flex items-center gap-4">
                    {/* Profile Image / Avatar */}
                    {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-20 h-20 rounded-full object-cover shadow" />
                    ) : user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover shadow" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-700 shadow">{user.name?.charAt(0).toUpperCase() || 'U'}</div>
                    )}

                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs">{formatRoleLabel(user.role)}</span>

                            {/* <span
                                className={`px-3 py-1 rounded-full text-xs ${
                                    user.approved ? "bg-green-100" : "bg-yellow-100"
                                }`}
                            >
                                {user.approved ? "Approved" : "Pending Approval"}
                            </span> */}

                            <span className={`px-3 py-1 rounded-full text-xs ${user.isDeleted ? 'bg-red-100' : 'bg-green-100'}`}>{user.isDeleted ? 'Deleted' : 'Active'}</span>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8">
                    {/* Wallet */}
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-500 mb-1">Wallet Balance</p>
                        <p className="text-3xl font-semibold text-gray-800">₹{user.wallet}</p>
                    </div>

                    {/* Personal + Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div className="space-y-4">
                            <SectionTitle title="Personal Information" />
                            <Item label="Full Name" value={user.name} />
                            <Item label="Gender" value={user.gender || 'Not specified'} />
                            <Item label="Date of Birth" value={user.dob || '---'} />
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                            <SectionTitle title="Account & Contact" />
                            <Item label="Email" value={user.email} />
                            <Item label="Phone" value={user.phone || '---'} />
                            <Item label="Role" value={formatRoleLabel(user.role)} />
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-4">
                        <SectionTitle title="Additional Information" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Item label="Account Status" value={user.isDeleted ? 'Deleted' : 'Active'} />
                            <Item label="Approval Status" value={user.approved ? 'Approved' : 'Pending'} />
                            <Item
                                label="Last Login"
                                value={
                                    user.lastLogin
                                        ? new Date(user.lastLogin).toLocaleString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                          })
                                        : 'Never'
                                }
                            />

                            <Item label="Member Since" value={user.createdAt?.split('T')[0]} />
                        </div>
                    </div>

                    {/* Verification */}
                    <div className="space-y-4">
                        <SectionTitle title="Verification Status" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Item label="Email Verification" value={user.emailVerified ? 'Verified' : 'Not Verified'} />
                            <Item label="Phone Verification" value={user.phoneVerified ? 'Verified' : 'Not Verified'} />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-4">
                        <SectionTitle title="Account Dates" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Item label="Created At" value={user.createdAt?.split('T')[0]} />
                            <Item label="Last Updated" value={user.updatedAt?.split('T')[0]} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* Components */

function Item({ label, value }: any) {
    return (
        <div className="border p-3 rounded-lg bg-white">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-gray-800 font-medium">{value}</p>
        </div>
    );
}

function SectionTitle({ title }: any) {
    return <h3 className="text-lg font-semibold text-gray-800">{title}</h3>;
}
