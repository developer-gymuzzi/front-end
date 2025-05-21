import { message } from 'antd';
import axios from 'axios';
import Cookies from "js-cookie";


const endpoint = import.meta.env.VITE_API_LIVEHOST;

const verifyToken = async()=>{
     const token = Cookies.get("token");
  if (!token) return false;
    try {
    const {data} = await axios.get(`${endpoint}/v1/admin/verify/verifytoken`,{
        headers:{
            token
        }
    })

  if(data.success === 1){
         return true;
  }
    } catch (error) {
        message.error('Failed to verify token')
    }
}

export default verifyToken;