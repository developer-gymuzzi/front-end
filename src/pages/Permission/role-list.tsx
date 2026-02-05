"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { PlusIcon, PencilIcon } from "lucide-react"
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
import Cookies from "js-cookie"

type Role = {
  _id: string
  name: string
  description: string
}

export default function Roles() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  const [form, setForm] = useState({
    name: "",
    description: "",
  })

  /* ================= GET ALL ROLES ================= */
  const getAllRoles = async () => {
    try {
      const token = Cookies.get("token")

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/roles/all`,
        {
          headers: {
            token: token,
          },
        }
      )

      if (!data.success) {
        alert(data.message)
        return
      }

      setRoles(data.data)
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to fetch roles")
    } finally {
      setPageLoading(false)
    }
  }

  /* ================= CREATE ROLE ================= */
  const createRole = async () => {
    try {
      const token = Cookies.get("token")
      setLoading(true)

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/roles/create`,
        form,
        {
          headers: {
            token: token,
          },
        }
      )

      if (!data.success) {
        alert(data.message)
        return
      }

      setRoles((prev) => [...prev, data.data])
      setForm({ name: "", description: "" })
      onOpenChange()
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create role")
    } finally {
      setLoading(false)
    }
  }

  /* ================= LOAD ON MOUNT ================= */
  useEffect(() => {
    getAllRoles()
  }, [])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Roles</h1>

        <Button onPress={onOpen} className="bg-[#113354] text-white">
          <PlusIcon size={16} /> Add Role
        </Button>
      </div>

      {/* ROLES LIST */}
      {pageLoading ? (
        <p className="text-gray-500">Loading roles...</p>
      ) : roles.length === 0 ? (
        <p className="text-gray-500">No roles found</p>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => (
            <div
              key={role._id}
              className="bg-white p-4 rounded border flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{role.name}</p>
                <p className="text-sm text-gray-500">
                  {role.description || "—"}
                </p>
              </div>

              <NavLink
                to={`/permission/roles/edit/${role._id}`}
                className="text-gray-500 hover:text-indigo-600"
              >
                <PencilIcon size={16} />
              </NavLink>
            </div>
          ))}
        </div>
      )}

      {/* CREATE ROLE MODAL */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Create Role</ModalHeader>
          <ModalBody className="space-y-3">
            <input
              className="border p-2 rounded w-full"
              placeholder="Role name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
            <textarea
              className="border p-2 rounded w-full"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button
              isLoading={loading}
              onPress={createRole}
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
