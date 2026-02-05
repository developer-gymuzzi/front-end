export type Permission = {
  _id: string
  key: string
  module: string
}

export type PermissionGroup = {
  module: string
  permissions: Permission[]
}
