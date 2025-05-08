import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import Timeprocessing from '../../public/assets/sidebar/timeprocessing';
const endpoint = import.meta.env.VITE_API_LIVEHOST;
const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
const token = Cookies.get("token") || "";
const initialState = {
    customers: [],
    allcustomers: [],
    site: [],
    gaurds: [],
    services: [],
    company: [],
    guardShifts: [],
    activecompany: {},
    loading: false,
    shift: [],
    pagination: {
        currentPage: 1,
        pageSize: 10,
        totalRecords: 0,
        totalPages: 1
    },
    isAuthenticated: false,
    user: null,
    permissions: {},
    error: null,
    roles: [],
    timeprocessing: [],
    isToggled: false,
};

const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

export const fetchCustomers = createAsyncThunk(
    'customer/fetchCustomers',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${endpoint}?route=admin/Get/Customer`, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {
                return data.Data;
            } else {
                return rejectWithValue("Failed to fetch customers.");
            }
        } catch (error) {
            return rejectWithValue("Error fetching customer data.");
        }
    }
);

export const fetchRoles = createAsyncThunk(
    'customer/fetchRoles',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${endpoint}?route=admin/get/role`, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (data.status) {
                return data.data;
            } else {
                return rejectWithValue("Failed to fetch roles.");
            }
        } catch (error) {
            return rejectWithValue("Error fetching roles.");
        }
    }
);

export const companylist = createAsyncThunk(
    'customer/companylist',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${endpoint}?route=company/list/get`, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {
                return data.data;

            }
        } catch (error) {
            return rejectWithValue("Failed to fetch company.");
        }
    }
)


export const updateCompany = createAsyncThunk(
    'customer/updateCompany',
    async (formData: FormData, { rejectWithValue }) => {
        try {

            const { data } = await axios.post(`${endpoint}?route=company/data/edit`, formData, {
                headers: {
                    'x-api-key': apiKey,

                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {
                return data.Data;

            }
        } catch (error) {
            return rejectWithValue("Failed to fetch company.");
        }
    }
)


export const activeCompany = createAsyncThunk(
    'customer/activeCompany',
    async (id: string, { rejectWithValue }) => {
        try {

            const { data } = await axios.post(`${endpoint}?route=company/active/deactive&ID=${id}`, null, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {
                window.location.reload()
                return data.Data;


            }

        } catch (error) {
            return rejectWithValue("Failed to fetch company.");
        }
    }
)


export const defaultCompany = createAsyncThunk(
    'customer/defaultCompany',
    async (_, { rejectWithValue }) => {
        try {

            const { data } = await axios.get(`${endpoint}?route=Active/company`, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {

                return data.data;

            }

        } catch (error) {
            return rejectWithValue("Failed to fetch company.");
        }
    }
)

export const fetchAllCustomers = createAsyncThunk(
    'customer/fetchAllCustomers',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${endpoint}?route=Api/Customer`, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {
                return data.Data;
            } else {
                return rejectWithValue("Failed to fetch customers.");
            }
        } catch (error) {
            return rejectWithValue("Error fetching customer data.");
        }
    }
);


export const fetchCustomersSite = createAsyncThunk(
    'customer/fetchCustomersSite',
    async ({ customerId }: { customerId: any }, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${endpoint}?route=dropdown/site/Options&Customer=${customerId}`, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {
                return data.Data;
            } else {
                return rejectWithValue("Failed to fetch customers.");
            }
        } catch (error) {
            return rejectWithValue("Error fetching customer data.");
        }
    }
);

export const fetchGaurd = createAsyncThunk(
    'customer/fetchGaurd',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${endpoint}?route=APS/Employer/Dropdown/Options`, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {
                return data.Data;
            } else {
                return rejectWithValue("Failed to fetch customers.");
            }
        } catch (error) {
            return rejectWithValue("Error fetching customer data.");
        }
    }
);

export const fetchServices = createAsyncThunk(
    'customer/fetchServices',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${endpoint}?route=dropdown/services/Options`, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {
                return data.Data;
            } else {
                return rejectWithValue("Failed to fetch customers.");
            }
        } catch (error) {
            return rejectWithValue("Error fetching customer data.");
        }
    }
);

export const fetchGuardShift = createAsyncThunk(
    'customer/fetchGuardShift',
    async ({ page, pageSize, Accept_status, filters }: { page: number; pageSize: number; Accept_status: string; filters: any }, { rejectWithValue }) => {
        try {
            let url = `${endpoint}?route=Guard/Shift/Lists&page=${page}&pageSize=${pageSize}&filter[Accept_status]=${Accept_status}`;

            // Dynamically add filters only if they have valid values
            const params = new URLSearchParams();

            if (filters.site_name) {
                params.append("filter[LIKESites.site_name]", filters.site_name);
            }

            if (filters.BETWEENshift_date && Array.isArray(filters.BETWEENshift_date) && filters.BETWEENshift_date.length === 2) {
                params.append("filter[BETWEENshift_date]", `${filters.BETWEENshift_date[0]},${filters.BETWEENshift_date[1]}`);
            }

            if (filters.customer_Name) {
                params.append("filter[LIKECustomers.customer_Name]", filters.customer_Name);
            }

            if (filters.Service_name) {
                params.append("filter[LIKEServices.Service_name]", filters.Service_name);
            }

            // Append the parameters to the URL
            url += `&${params.toString()}`;

            console.log("API Request URL:", url); // Debugging

            const { data } = await axios.get(url, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status === true) {
                return {
                    shifts: data.Data,
                    pagination: data.Pagination,
                };
            } else {
                return rejectWithValue("Failed to fetch shifts.");
            }
        } catch (error) {
            console.error("API Fetch Error:", error); // Debugging
            return rejectWithValue("Error fetching shift data.");
        }
    }

);

export const fetchtimeprocessing = createAsyncThunk(
    'customer/fetchtimeprocessing',
    async ({ start, end, filters }: { start: Date, end: Date, filters: Record<string, string | number> }, { rejectWithValue }) => {
        try {
            // Format the start and end dates to YYYY-MM-DD format
            const startDate = formatDate(new Date(start));
            const endDate = formatDate(new Date(end));
            // Initialize queryParams to hold all the query parameters
            const queryParams = new URLSearchParams();
            queryParams.append("filter[BETWEENshift_date]", `${startDate},${endDate}`);
            queryParams.append("filter[Guard_Schedule.delete_status]", "0")
            // Append any additional filters to the query params
            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    queryParams.append(`filter[${key}]`, String(value));
                }
            });

            // Construct the final URL by appending queryParams
            const url = `${endpoint}?route=Time/Processing/list&${queryParams.toString()}`;

            // Make the API request
            const { data } = await axios.get(url, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            // Check if the response is successful and return the data
            if (data.status) {
                return data.data;
            } else {
                return rejectWithValue("Failed to fetch time processing data.");
            }
        } catch (error) {
            // Handle and log errors accordingly
            return rejectWithValue(error || "Error fetching time processing data.");
        }
    }
);




export const fetchUserShift = createAsyncThunk(
    'customer/fetchUserShift',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${endpoint}?route=User/Shift/List`, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {
                return data.Data;
            } else {
                return rejectWithValue("Failed to fetch customers.");
            }
        } catch (error) {
            return rejectWithValue("Error fetching customer data.");
        }
    }
);



const customerSlice = createSlice({
    name: 'customer',
    initialState,
    reducers: {
        toggleState: (state) => {
            state.isToggled = !state.isToggled;
        },
        setAuthState: (state, action: PayloadAction<{ user: any; permissions: Record<string, string[]> }>) => {
            state.user = action.payload.user;
            state.permissions = action.payload.permissions;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.loading = false;
                state.customers = action.payload;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(companylist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(companylist.fulfilled, (state, action) => {
                state.loading = false;
                state.company = action.payload;
            })
            .addCase(companylist.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(updateCompany.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCompany.fulfilled, (state, action) => {
                state.loading = false;
                state.company = action.payload;
            })
            .addCase(updateCompany.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(activeCompany.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(activeCompany.fulfilled, (state, action) => {
                state.loading = false;

            })
            .addCase(activeCompany.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(defaultCompany.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(defaultCompany.fulfilled, (state, action) => {
                state.loading = false;
                state.activecompany = action.payload;
            })
            .addCase(defaultCompany.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(fetchRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = action.payload;
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(fetchAllCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllCustomers.fulfilled, (state, action) => {
                state.loading = false;
                state.allcustomers = action.payload;
            })
            .addCase(fetchAllCustomers.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(fetchCustomersSite.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomersSite.fulfilled, (state, action) => {
                state.loading = false;
                state.site = action.payload;
            })
            .addCase(fetchCustomersSite.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(fetchGaurd.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGaurd.fulfilled, (state, action) => {
                state.loading = false;
                state.gaurds = action.payload;
            })
            .addCase(fetchGaurd.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(fetchServices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchServices.fulfilled, (state, action) => {
                state.loading = false;
                state.services = action.payload;
            })
            .addCase(fetchServices.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(fetchGuardShift.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGuardShift.fulfilled, (state, action) => {
                state.loading = false;
                state.guardShifts = action.payload.shifts;
                console.log(action.payload.shifts)
                state.pagination = action.payload.pagination;

            })
            .addCase(fetchGuardShift.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(fetchtimeprocessing.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchtimeprocessing.fulfilled, (state, action) => {
                state.loading = false;
                state.timeprocessing = action.payload


            })
            .addCase(fetchtimeprocessing.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
            .addCase(fetchUserShift.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserShift.fulfilled, (state, action) => {
                state.loading = false;
                state.shift = action.payload


            })
            .addCase(fetchUserShift.rejected, (state, action) => {
                state.loading = false;
                message.error(action.payload as string);
            })
    },
});

export const { toggleState, setAuthState } = customerSlice.actions;
export default customerSlice.reducer;

