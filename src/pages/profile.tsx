"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Camera,
  Edit3,
  Save,
  X,
  User,
  Mail,
  Shield,
  Wallet,
  Calendar,
  Phone,
  CheckCircle,
  XCircle,
  ChevronDown,
  Lock,
} from "lucide-react";

import { message } from "antd";
import axios from "axios";
import Cookies from "js-cookie";
import { useSelector, useDispatch } from "react-redux";
import type { IRootState, AppDispatch } from "../store";
import { profile as fetchProfile } from "../store/customerConfigSlice";

/* ---------------------------- UI COMPONENTS ---------------------------- */
const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = "" }: any) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = "" }: any) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
);
const CardContent = ({ children, className = "" }: any) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const Input = ({ className = "", type = "text", ...props }) => (
  <input
    type={type}
    className={`w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
      placeholder-gray-500 ${className}`}
    {...props}
  />
);

const Label = ({ children, className = "", htmlFor, ...props }: any) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props}>
    {children}
  </label>
);

const PrimaryButton = ({ children, onClick, disabled = false, className = "" }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg
      hover:shadow-xl transform hover:scale-105 transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${className}`}
  >
    {children}
  </button>
);

const SecondaryButton = ({ children, onClick, className = "" }: any) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl border-2 border-gray-200
      hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 ${className}`}
  >
    {children}
  </button>
);

const IconButton = ({ children, onClick, className = "" }: any) => (
  <button onClick={onClick} className={`p-3 bg-white text-gray-600 rounded-full shadow-md hover:shadow-lg hover:text-blue-600 transition-all duration-200 ${className}`}>
    {children}
  </button>
);

const ReadOnlyField = ({ label, value, icon: Icon }: any) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </Label>
    <div className="p-3 bg-gray-50 rounded-xl border-2 border-gray-100 text-gray-600">{value || "Not provided"}</div>
  </div>
);

/* ---------------------------- MAIN COMPONENT ---------------------------- */

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // profile save loading
  const [credsLoading, setCredsLoading] = useState(false); // credentials update loading

  interface Profile {
    name?: string;
    phone?: string;
    gender?: string;
    dob?: string;
    profileImage?: string;
    avatar?: string;
    email?: string;
    role?: string;
    emailVerified?: boolean;
    wallet?: number;
    createdAt?: string;
    updatedAt?: string;
    cloudinary_public_id?: string;
  }

  const profile = useSelector((state: IRootState) => state.customerConfig.profileData) as Profile;
  const dispatch: AppDispatch = useDispatch();

  /* ---------------------------------- FORM DATA ---------------------------------- */
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    gender: profile?.gender || "",
    dob: profile?.dob || "",
    email: profile?.email || "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        gender: profile.gender || "",
        dob: profile.dob || "",
        email: profile.email || "",
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [profile]);

  /* ---------------------------------- IMAGE PREVIEW ---------------------------------- */

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const endpoint = import.meta.env.VITE_API_LIVEHOST;
  const token = Cookies.get("token");

  /* ----------------------------- IMAGE UPLOAD (CLOUDINARY) ----------------------------- */
  const uploadToCloudinary = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "unsigned_profileImage");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const result = await response.json();
    return { secureUrl: result.secure_url, publicId: result.public_id };
  };

  /* ---------------------------------- SAVE PROFILE ---------------------------------- */
  const updateProfile = async () => {
    try {
      setIsLoading(true);

      // Basic validation
      if (!formData.name || !formData.name.trim()) {
        message.error("Name is required");
        setIsLoading(false);
        return;
      }

      let uploadedImageUrl = profile.profileImage || "";
      let uploadedPublicId = profile.cloudinary_public_id || "";

      if (selectedFile) {
        const uploaded = await uploadToCloudinary(selectedFile);
        uploadedImageUrl = uploaded.secureUrl;
        uploadedPublicId = uploaded.publicId;
      }

      const { data } = await axios.put(
        `${endpoint}/v1/auth/update`,
        {
          name: formData.name,
          phone: formData.phone,
          gender: formData.gender,
          dob: formData.dob,
          profileImage: uploadedImageUrl,
          cloudinary_public_id: uploadedPublicId,
        },
        { headers: { token, "Content-Type": "application/json" } }
      );

      if (data.success === 1) {
        message.success(data.message || "Profile updated successfully");
        dispatch(fetchProfile());
        setIsEditing(false);
        setSelectedFile(null);
        setImagePreview(null);
      } else {
        message.error(data.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("Update profile error:", err);
      message.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------- UPDATE CREDENTIALS ---------------------------------- */
  const updateCredentials = async () => {
    try {
      if (!formData.email && (!formData.currentPassword || !formData.newPassword)) {
        message.error("Nothing to update");
        return;
      }

      setCredsLoading(true);

      const { data } = await axios.put(
        `${endpoint}/v1/auth/update-credentials`,
        {
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        { headers: { token, "Content-Type": "application/json" } }
      );

      if (data.success === 1) {
        message.success(data.message || "Credentials updated successfully");
        dispatch(fetchProfile());
        setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      } else {
        message.error(data.message || "Failed to update credentials");
      }
    } catch (error: any) {
      console.error("updateCredentials error:", error);
      message.error(error.response?.data?.message || "Failed to update credentials");
    } finally {
      setCredsLoading(false);
    }
  };

  /* ---------------------------------- IMAGE CHANGE ---------------------------------- */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // security check
    if (!file.type.startsWith("image/")) {
      message.error("Only image files allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error("Max 5MB file size allowed");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  /* ------------------------------ Date Formatting ------------------------------ */
  const formatDateTime = (iso?: string) => {
    if (!iso) return "N/A";
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  /* ---------------------------------- UI RETURN ---------------------------------- */

  if (!profile) return <div className="max-w-6xl mx-auto p-8">Loading profile...</div>;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* ------------------------ LEFT PROFILE CARD ------------------------ */}
      <div className="lg:col-span-2">
        <Card className="shadow-lg">

          {/* HEADER */}
          <div className="bg-[#071d3f] p-8 text-white relative">
            <div className="flex items-center gap-6">

              {/* PROFILE IMAGE */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={imagePreview || profile.profileImage || profile.avatar || "/placeholder.svg"}
                    className="w-full h-full object-cover"
                    alt="profile"
                  />
                </div>

                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
                    <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" />
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>

              {/* USER INFO */}
              <div>
                <h2 className="text-3xl font-bold">{profile.name}</h2>
                <p className="text-blue-100">{profile.email}</p>

                {/* Created and Updated Timestamps */}
                <p className="text-blue-200 text-sm mt-2">Member Since: {formatDateTime(profile.createdAt)}</p>
                <p className="text-blue-200 text-sm">Last Updated: {formatDateTime(profile.updatedAt)}</p>
              </div>
            </div>

            <div className="absolute right-6 top-6">
              {!isEditing ? (
                <IconButton onClick={() => setIsEditing(true)}>
                  <Edit3 className="w-5 h-5" />
                </IconButton>
              ) : (
                <div className="flex gap-2">
                  <IconButton onClick={() => { setIsEditing(false); setImagePreview(null); setSelectedFile(null); }}>
                    <X className="w-5 h-5" />
                  </IconButton>
                </div>
              )}
            </div>
          </div>

          {/* PROFILE FIELDS */}
          <CardContent>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NAME */}
              <div className="space-y-2">
                <Label>Full Name</Label>
                {isEditing ? (
                  <Input value={formData.name} onChange={(e:any) => handleInputChange("name", e.target.value)} />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl border-2 border-transparent">{profile.name}</div>
                )}
              </div>

              {/* PHONE */}
              <div className="space-y-2">
                <Label>Phone</Label>
                {isEditing ? (
                  <Input value={formData.phone} onChange={(e:any) => handleInputChange("phone", e.target.value)} />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl border-2 border-transparent">{profile.phone || "Not provided"}</div>
                )}
              </div>

              {/* DOB */}
              <div className="space-y-2">
                <Label>DOB</Label>
                {isEditing ? (
                  <Input type="date" value={formData.dob} onChange={(e:any) => handleInputChange("dob", e.target.value)} />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl border-2 border-transparent">{profile.dob || "Not provided"}</div>
                )}
              </div>

              {/* GENDER */}
              <div className="space-y-2">
                <Label>Gender</Label>
                {isEditing ? (
                  <Input value={formData.gender} onChange={(e:any) => handleInputChange("gender", e.target.value)} />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl border-2 border-transparent">{profile.gender || "Not provided"}</div>
                )}
              </div>
            </div>

            {/* Image Preview Section */}
            {isEditing && imagePreview && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h3 className="text-sm font-semibold text-blue-800 mb-3">Image Preview</h3>
                <div className="flex items-center gap-4">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-blue-300" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">New profile image selected</p>
                    <p className="text-blue-600">This will be your new profile picture</p>
                  </div>
                </div>
              </div>
            )}

            {/* SAVE PROFILE BUTTON (single button with loader) */}
            {isEditing && (
              <div className="mt-6">
                <PrimaryButton className="inline-flex items-center gap-3" onClick={updateProfile} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Profile</span>
                    </>
                  )}
                </PrimaryButton>
              </div>
            )}
          </CardContent>
        </Card>

        {/* --------------------- CREDENTIALS CARD --------------------- */}
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Update Credentials
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* EMAIL */}
            <Label>Email Address</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e:any) => handleInputChange("email", e.target.value)}
              placeholder="Enter new email"
            />

            {/* CURRENT PASSWORD */}
            <Label className="mt-4">Current Password</Label>
            <Input
              type="password"
              value={formData.currentPassword}
              onChange={(e:any) => handleInputChange("currentPassword", e.target.value)}
              placeholder="Enter current password"
            />

            {/* NEW PASSWORD */}
            <Label className="mt-4">New Password</Label>
            <Input
              type="password"
              value={formData.newPassword}
              onChange={(e:any) => handleInputChange("newPassword", e.target.value)}
              placeholder="Enter new password"
            />

            {/* BUTTON */}
            <div className="mt-6">
              <PrimaryButton onClick={updateCredentials} disabled={credsLoading}>
                {credsLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>Update Credentials</>
                )}
              </PrimaryButton>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ------------------------ RIGHT SIDEBAR ------------------------ */}
      <div className="space-y-6">

        <Card>
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
          </CardHeader>
          <CardContent>
            <ReadOnlyField label="Email" value={profile.email} icon={Mail} />
            <ReadOnlyField label="Role" value={profile.role} icon={Shield} />
            <div className="mt-4">
              <div className="text-sm text-gray-500">Member Since</div>
              <div className="text-sm text-gray-700">{formatDateTime(profile.createdAt)}</div>
            </div>
            <div className="mt-2">
              <div className="text-sm text-gray-500">Last Updated</div>
              <div className="text-sm text-gray-700">{formatDateTime(profile.updatedAt)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-green-50 text-center rounded-xl">
              <div className="text-3xl font-bold">₹{typeof profile.wallet === "number" ? profile.wallet.toFixed(2) : profile.wallet || 0}</div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
