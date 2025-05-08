import { NavLink } from "react-router-dom";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";
import Cookies from "js-cookie";
import axios from "axios";
import { message } from "antd";
import React, { useState } from "react";
import ScheduleOverview from "./schedule-overview";
import LateComers from "./late-comers";
import { Clock, CalendarCheck } from "lucide-react"
import Loader from "../../components/Loader";
import CustomDatePicker from "../shift/custom-datepicker";
import Filter from './filter';
import { IRootState } from '../../store';
import { useSelector } from "react-redux";
const Index = () => {
    const user = useSelector((state: IRootState) => state.customerConfig.user) as Record<string, string> | null;
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get("token") || "";
    const secretKey = import.meta.env.VITE_DECREYPT_KEY;

    const [filters, setFilters] = useState({
        guard: '',
        site_name: '',
    });
    const [Loading, setLoading] = React.useState(true);
    const [Response, setresponse]: any = React.useState([]);
    const getCurrentWeekRange = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const start = new Date(today);
        start.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        return { start, end };
    };
    const [selectedRange, setSelectedRange] = React.useState<{ start: Date; end: Date }>(getCurrentWeekRange());
    const formatDate = (date: Date) => {
        console.log(date.getFullYear())
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    };
    const Dashdata = async () => {
        setLoading(true);
        try {
            const { start, end } = selectedRange;
            const startDate = formatDate(start); // Format as YYYY-MM-DD
            const endDate = formatDate(end);

            let query = `route=dashboard&start_date=${startDate}&end_date=${endDate}`;

            // Append filters if they are not empty
            if (filters.guard) {
                query += `&guard=${filters.guard}`;
            }
            if (filters.site_name) {
                query += `&site_name=${filters.site_name}`;
            }

            const { data } = await axios.get(`${endpoint}?${query}`, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status === false) {
                message.error(data.message);
            }
            setresponse(data.data);
        } catch (error) {
            message.error("Something went wrong while fetching roles!");

        }
        setLoading(false);
    };

    // React.useEffect(() => {
    //     Dashdata();
    // }, [selectedRange, filters]);



    return (

        <div className="">
      
                <div className="flex items-center justify-between p-2">
                    {/* Date range selector */}
                    < div className="grid gap-3" >
                        {/* <h1 className="text-2xl font-bold mb-6 text-gray-800">Schedule Management</h1> */}
                    </div>
                    <div className="flex items-center w-1/1.5 gap-2">
                        <CustomDatePicker selectedRange={selectedRange} onRangeChange={setSelectedRange} />
                        <Filter onFilterChange={setFilters} />
                    </div>

                </div>
            
       
                <div>
          
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                            <Card className='Dashboardtop'>

                                <CardBody className="flex flex-col items-center justify-center p-4 gap-4">
                                    <div className="Dashboardtop-icon">
                                        <div className='icon'>
                                            <img src="/assets/images/guard.png" alt="people" width={'40px'} />
                                        </div>
                                    </div>
                                    {/* <div className="total_number grid text-center"> People <span className="">{Response.Employee_total}</span></div> */}
                                </CardBody>

                            </Card>
                            <Card className='Dashboardtops'>

                                <CardBody className="flex flex-col items-center justify-center p-4 gap-4">
                                    <div className="Dashboardtop-icon">
                                        <div className='icon'>
                                            <p className='default-icon'>
                                                <img src="/assets/images/scheduling.png" alt="people" width={'40px'} />
                                            </p>

                                        </div>
                                    </div>
                                    <div className="total_number grid text-center"> Shifts <span className="">{Response.Shift_total}</span></div>
                                </CardBody>
                            </Card>
                            <Card className='Dashboardtop'>

                                <CardBody className="flex flex-col items-center justify-center p-4 gap-4">
                                    <div className="Dashboardtop-icon">
                                        <div className='icon'>
                                            <img src="/assets/images/working-time.png" alt="people" width={'40px'} />
                                        </div>
                                    </div>
                                    <div className="total_number grid text-center"> Time <span className="">{Response.total_hours} hr</span></div>
                                </CardBody>
                            </Card>
                            <Card className='Dashboardtop'>
                                <CardBody className="flex flex-col items-center justify-center p-4 gap-4">
                                    <div className="Dashboardtop-icon">
                                        <div className='icon'>
                                            <img src="/assets/images/survey.png" alt="people" width={'40px'} />
                                        </div>
                                    </div>
                                    <div className="total_number grid text-center"> Sites <span className="">{Response.site_total}</span></div>
                                </CardBody>
                            </Card>
                            <Card className='Dashboardtop'>
                                <CardBody className="flex flex-col items-center justify-center p-4 gap-4">
                                    <div className="Dashboardtop-icon">
                                        <div className='icon'>
                                            <img src="/assets/images/cooperation.png" alt="people" width={'40px'} />
                                        </div>
                                    </div>
                                    <div className="total_number grid text-center"> customer <span className="">{Response.Customer_total}</span></div>
                                </CardBody>
                            </Card>
                        </div>
                  
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className=" w-full mt-4">
                         
                                <Card className="p-4 h-[400px]">
                                    <div>
                                        <h3 className="text-base font-medium">Schedule overview</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Data shown includes saved shifts for the selected date range and filters
                                        </p>
                                    </div>
                                    <CardBody className="flex flex-col items-center justify-center min-h-[200px] text-center">
                                        <div className="rounded-full bg-gray-100 p-6 mb-4">
                                            <CalendarCheck className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium mb-2">We couldn&apos;t find any data</h3>
                                        <p className="text-sm text-muted-foreground">No shifts data found for the selected date range and filters.</p>
                                    </CardBody>
                                </Card>
                       
                                {/* <ScheduleOverview Responsedata={Response.Schedule_overview} daterange={selectedRange} /> */}
                          
                        </div>
                        <div className=" w-full mt-4">
                        
                                <Card className="p-4 h-[400px]">
                                    <div>
                                        <h3 className="text-base font-medium">Late comers</h3>

                                    </div>
                                    <CardBody className="flex flex-col items-center justify-center min-h-[200px] text-center">
                                        <div className="rounded-full bg-gray-100 p-6 mb-4">
                                            <Clock className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium mb-2">We couldn&apos;t find any late comers</h3>
                                        <p className="text-sm text-muted-foreground">No late comers found for the selected date range and filters.</p>
                                    </CardBody>
                                </Card>
                                
                                {/* <LateComers Responsedata={Response.getLateComers} /> */}
                     
                        </div>
                    </div>
                </div>
            
        </div>
    );
};

export default Index;
