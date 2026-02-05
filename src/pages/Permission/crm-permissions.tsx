"use client"

import { useEffect, useState } from "react"
import { PencilIcon, UserPlus } from "lucide-react"
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react"
import { NavLink } from "react-router-dom"
import axios from "axios"
import Cookies from "js-cookie"

/* ================= TYPES ================= */

type Role = {
  _id: string
  name: string
}

type AdminUser = {
  _id: string
  name: string
  email: string
  roleId: string | null
  roleName: string | null
}

/* ================= COMPONENT ================= */

export default function CrmPermissions() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
  })

  /* ================= FETCH STAFF ================= */
  const fetchStaff = async () => {
    const token = Cookies.get("token")

    const { data } = await axios.get(
      `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/staff/all-staff`,
      { headers: { token } }
    )

    if (data?.success) {
      setUsers(data.data)
    }
  }

  /* ================= FETCH ROLES ================= */
  const fetchRoles = async () => {
    const token = Cookies.get("token")

    const { data } = await axios.get(
      `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/roles/all`,
      { headers: { token } }
    )

    if (data?.success) {
      setRoles(data.data)
    }
  }

  /* ================= CREATE STAFF ================= */
  const createStaff = async () => {
    try {
      const token = Cookies.get("token")

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/staff/create-staff`,
        form,
        { headers: { token } }
      )

      if (!data.success) {
        alert(data.message)
        return
      }

      alert("Staff created successfully")
      fetchStaff()

      setForm({
        name: "",
        email: "",
        password: "",
        roleId: "",
      })

      onOpenChange()
    } catch (err: any) {
      alert(err?.response?.data?.message || "Create failed")
    }
  }

  /* ================= ASSIGN ROLE ================= */
  const assignRole = async (userId: string, roleId: string) => {
    try {
      const token = Cookies.get("token")
      setLoadingUserId(userId)

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/staff/assign-role/${userId}`,
        { roleId },
        { headers: { token } }
      )

      if (!data.success) {
        alert(data.message)
        return
      }

      // update UI immediately
      const roleName =
        roles.find((r) => r._id === roleId)?.name || null

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? { ...u, roleId, roleName }
            : u
        )
      )
    } catch (err: any) {
      alert(err?.response?.data?.message || "Role update failed")
    } finally {
      setLoadingUserId(null)
    }
  }

  /* ================= ON LOAD ================= */
  useEffect(() => {
    fetchStaff()
    fetchRoles()
  }, [])

  /* ================= UI ================= */

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Permission Management</h1>

        <Button onPress={onOpen} className="bg-[#113354] text-white">
          <UserPlus size={16} /> Add Staff
        </Button>
      </div>

      {/* ================= STAFF LIST ================= */}
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white p-4 rounded border flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.roleName && (
                <p className="text-xs text-gray-400">
                  Role: {user.roleName}
                </p>
              )}
            </div>

            <div className="flex gap-3 items-center">
              {/* ROLE SELECT */}
              <select
                className="border px-3 py-2 rounded"
                value={user.roleId || ""}
                disabled={loadingUserId === user._id}
                onChange={(e) =>
                  assignRole(user._id, e.target.value)
                }
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>

              {/* EDIT ROLE PERMISSIONS */}
              {/* {user.roleId && (
                <NavLink
                  to={`/permission/roles/edit/${user.roleId}`}
                  className="text-gray-500 hover:text-indigo-600"
                >
                  <PencilIcon size={16} />
                </NavLink>
              )} */}
            </div>
          </div>
        ))}
      </div>

      {/* ================= CREATE STAFF MODAL ================= */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Create Staff</ModalHeader>
          <ModalBody className="space-y-3">
            <input
              className="border p-2 rounded"
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
            <input
              className="border p-2 rounded"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
            <input
              className="border p-2 rounded"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
            <select
              className="border p-2 rounded"
              value={form.roleId}
              onChange={(e) =>
                setForm({ ...form, roleId: e.target.value })
              }
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
          </ModalBody>
          <ModalFooter>
            <Button
              onPress={createStaff}
              className="bg-[#113354] text-white"
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
