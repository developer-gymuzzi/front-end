import { Avatar, Card, Table, Tag } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { IRootState } from "../store";
import { Pencil } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const capitalizeFirstLetter = (string:any) => string.charAt(0).toUpperCase() + string.slice(1);
const formatAction = (action:any) => (action === "show" ? "view" : action);

const ProfilePage = () => {
  const permissions = useSelector((state: IRootState) => state.customerConfig.permissions) as Record<string, string[]>;
  const user = useSelector((state: IRootState) => state.customerConfig.user) as Record<string, string> | null;
  const navigate = useNavigate()
  const handleNaigate = ()=>{
    navigate(`/edit/guard/${user?.id}`)
  }
  const columns = [
    {
      title: "Module",
      dataIndex: "module",
      key: "module",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (actions: string[]) => (
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <Tag key={index} color="green">{formatAction(action)}</Tag>
          ))}
        </div>
      ),
    },
  ];

  const dataSource = Object.entries(permissions).map(([module, actions], index) => ({
    key: index,
    module: capitalizeFirstLetter(module),
    actions,
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <Card className="w-full max-w-3xl shadow-lg rounded-lg">
        {/* User Info */}
        <div className="flex items-center space-x-4 border-b pb-4 mb-4">
          <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500 text-white text-2xl" />
          <div>
          <div>
            <h2 className="text-xl font-semibold">{user?.first_name} {user?.last_name}</h2>
            </div>
            <p className="text-gray-500">{user?.email}</p>
            <Tag color="blue">{user?.role}</Tag>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-3">Permissions</h3>
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          bordered
        />
      </Card>
    </div>
  );
};

export default ProfilePage;
