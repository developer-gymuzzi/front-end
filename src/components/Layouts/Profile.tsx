import { Avatar, AvatarGroup, Card } from "@nextui-org/react";
import { Clock, Mail, User, Building2, UserCircle, History, CalendarClock } from 'lucide-react'
import { IRootState } from '../../store';
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { formatDate } from "../date_formate";
function Profile() {
    const user = useSelector((state: IRootState) => state.customerConfig.user) as Record<string, string> | null;
    return (
        <>
            <div className="">
                <span className="font-semibold">Profile Information:</span>
                <div className="border-b mt-2 mb-2" />


                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Card className="p-2 rounded-[10px]">
                            <span className="font-semibold">Window History</span>
                            <div className="border-b mt-2 mb-2" />

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-0">
                                    <div className="font-medium">OS:</div>
                                    <div className="text-muted-foreground">{user?.OS}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-0">
                                    <div className="font-medium">Browser:</div>
                                    <div className="text-muted-foreground">{user?.BROWSER}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-0">
                                    <div className="font-medium">Logged Ip:</div>
                                    <div className="text-muted-foreground">{user?.IPADDRESS}</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div>
                        <Card className="p-3 rounded-[10px]">
                            <span className="font-semibold">Profile Information</span>
                            <div className="border-b mt-2 mb-2" />

                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <Avatar showFallback name={user?.first_name} size="lg" src="" />
                                    <div>
                                        <h3 className="text-sm font-semibold">{user?.first_name} {user?.last_name}</h3>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Email:</span>
                                        <span className="text-muted-foreground">{user?.email}</span>
                                    </div>


                                    <div className="flex items-center gap-2">
                                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Role:</span>
                                        <span className="text-muted-foreground">{user?.role}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Last Login:</span>
                                        <span className="text-muted-foreground">{formatDate(user?.Last_login, "m d , Y , H:i:s A")}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
                <div className="mt-3 mb-3" />
                {/* <Card className="rounded-[10px] p-2">
                    <div className="header-modal flex justify-between">
                        <span className="flex gap-2">
                            <div className="w-[25px] h-[25px] p-[2px] rounded-[100px] bg-[#2fc6f6]">
                                <CalendarClock strokeWidth={1.25} size={'20px'} color="white" />
                            </div>
                            <NavLink to={`/login-sheet`}>
                                <span className="text-link">Login history</span>
                            </NavLink>
                        </span>
                        <span className="text-sm">{formatDate(user?.Last_login, "m d , Y , H:i:s A")}</span>
                    </div>
                </Card> */}
            </div>
        </>
    )
}

export default Profile;