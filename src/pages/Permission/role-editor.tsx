"use client"

import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Button } from "@nextui-org/react"
import { Permission, PermissionGroup } from "./permission.types"

export default function RoleEditor() {
  const { roleId } = useParams()
  const navigate = useNavigate()

  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  /* ================= FETCH ALL PERMISSIONS ================= */
  const fetchPermissions = async () => {
    const token = Cookies.get("token")

    const { data } = await axios.get(
      `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/permission/all`,
      { headers: { token } }
    )

    if (!data?.success || !Array.isArray(data.data)) return

    const grouped: Record<string, Permission[]> = {}

    data.data.forEach((perm: Permission) => {
      if (!grouped[perm.module]) grouped[perm.module] = []
      grouped[perm.module].push(perm)
    })

    const formatted: PermissionGroup[] = Object.keys(grouped).map(
      (module) => ({
        module,
        permissions: grouped[module],
      })
    )

    setPermissionGroups(formatted)
  }

  /* ================= FETCH ROLE PERMISSIONS ================= */
  const fetchRolePermissions = async () => {
    const token = Cookies.get("token")

    const { data } = await axios.get(
      `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/roles/permissions/${roleId}`,
      { headers: { token } }
    )

    if (data?.success && Array.isArray(data.data)) {
      // 🔥 FIX: extract permissionId only
      const permissionIds = data.data.map(
        (item: { permissionId: string }) => item.permissionId
      )

      setSelectedPermissions(permissionIds)
    }
  }

  /* ================= TOGGLE PERMISSION ================= */
  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  /* ================= SAVE PERMISSIONS ================= */
  const savePermissions = async () => {
    try {
      const token = Cookies.get("token")
      setLoading(true)

      const payload = {
        permissionId: selectedPermissions, // always array
      }

      const { data } = await axios.put(
        `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/roles/assign-permissions/${roleId}`,
        payload,
        { headers: { token } }
      )

      if (!data?.success) {
        alert(data.message)
        return
      }

      navigate(-1)
    } catch (err: any) {
      alert(err?.response?.data?.message || "Save failed")
    } finally {
      setLoading(false)
    }
  }

  /* ================= ON LOAD ================= */
  useEffect(() => {
    Promise.all([
      fetchPermissions(),
      fetchRolePermissions(),
    ]).finally(() => setPageLoading(false))
  }, [])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold mb-4">
        Edit Role Permissions
      </h1>

      {pageLoading ? (
        <p className="text-gray-500">Loading permissions…</p>
      ) : (
        permissionGroups.map((group) => (
          <div key={group.module} className="mb-5">
            <h2 className="font-semibold mb-2">{group.module}</h2>

            <div className="grid grid-cols-2 gap-2">
              {group.permissions.map((perm) => (
                <label
                  key={perm._id}
                  className="flex items-center gap-2 bg-white p-2 rounded border cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm._id)}
                    onChange={() => togglePermission(perm._id)}
                  />
                  <span>{perm.key}</span>
                </label>
              ))}
            </div>
          </div>
        ))
      )}

      <Button
        isLoading={loading}
        className="mt-6 bg-[#113354] text-white"
        onPress={savePermissions}
      >
        Save Permissions
      </Button>
    </div>
  )
}
