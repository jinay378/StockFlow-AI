import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  getProfile,
  updateProfile,
  changePassword,
  getTeamMembers,
  addTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
  type TeamMember,
  isAdmin,
} from "../services/auth.service";
import {
  Users,
  Shield,
  ShieldCheck,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);

  // Profile State
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // Password State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Team Management State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"staff" | "manager">("staff");
  const [newMemberPhone, setNewMemberPhone] = useState("+91 ");
  const [addingMember, setAddingMember] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [teamSuccess, setTeamSuccess] = useState("");

  // Stock Badge Toggle
  const [showStockBadge, setShowStockBadge] = useState(
    localStorage.getItem("hideStockBadge") !== "true"
  );

  const handleToggleStockBadge = () => {
    const next = !showStockBadge;
    setShowStockBadge(next);
    localStorage.setItem("hideStockBadge", next ? "false" : "true");
    window.dispatchEvent(new Event("stock-badge-preference-changed"));
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const profile = await getProfile();
      setUsername(profile.username);
      setEmail(profile.email);
      setRole(profile.role);

      if (profile.role.toLowerCase() === "admin") {
        await loadTeam();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTeam = async () => {
    try {
      const members = await getTeamMembers();
      setTeamMembers(members);
    } catch (err) {
      console.error("Failed to load team:", err);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage("");
    setSavingProfile(true);

    try {
      await updateProfile(username);
      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setProfileMessage("Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password should be at least 6 characters.");
      return;
    }

    setSavingPassword(true);

    try {
      await changePassword(oldPassword, newPassword);
      setPasswordMessage("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      setPasswordError(
        err?.response?.data?.detail ?? "Unable to change password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError("");
    setTeamSuccess("");

    if (!newMemberName.trim() || !newMemberEmail.trim() || !newMemberPassword) {
      setTeamError("Please fill in all required fields.");
      return;
    }

    try {
      setAddingMember(true);
      await addTeamMember({
        username: newMemberName.trim(),
        email: newMemberEmail.trim().toLowerCase(),
        password: newMemberPassword,
        phone: newMemberPhone.trim(),
        role: newMemberRole,
      });

      setTeamSuccess(`Account for ${newMemberName} created successfully with role ${newMemberRole.toUpperCase()}.`);
      setNewMemberName("");
      setNewMemberEmail("");
      setNewMemberPassword("");
      setNewMemberPhone("+91 ");
      setShowAddMemberModal(false);
      await loadTeam();
    } catch (err: any) {
      console.error(err);
      setTeamError(err?.response?.data?.detail ?? "Failed to add team member.");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRoleChange = async (memberId: number, newRole: string) => {
    try {
      await updateTeamMemberRole(memberId, newRole);
      setTeamSuccess("Member role updated successfully.");
      await loadTeam();
    } catch (err: any) {
      console.error(err);
      setTeamError(err?.response?.data?.detail ?? "Failed to update role.");
    }
  };

  const handleRemoveMember = async (memberId: number, memberName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove ${memberName} from your company team?`
    );
    if (!confirmDelete) return;

    try {
      await removeTeamMember(memberId);
      setTeamSuccess(`${memberName} has been removed.`);
      await loadTeam();
    } catch (err: any) {
      console.error(err);
      setTeamError(err?.response?.data?.detail ?? "Failed to remove member.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 mb-2" />
        <p className="text-sm">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2 max-w-5xl pb-28">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Company Settings & Access Control
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your organization profile, staff role permissions, notifications, and security
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Account Profile
            </h2>
            <p className="text-xs text-slate-400">Your personal user credentials and company authority</p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Full Name / Display Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-800 dark:text-white focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Access Role & Authority Level
            </label>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                <Shield size={14} />
                {role === "admin" ? "Company Owner & Admin" : role === "manager" ? "Store Manager" : "Frontline Staff"}
              </span>
              <span className="text-xs text-slate-400">
                {role === "admin" ? "Full access to financial reports, settings, and staff management." : role === "manager" ? "Operational access to products, stock, and orders." : "Restricted access to POS sales, products catalog, and inventory."}
              </span>
            </div>
          </div>

          {profileMessage && (
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={16} />
              {profileMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={savingProfile}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      {/* Team Members & Staff Access Control (Admin Only) */}
      {isAdmin() && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Users size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Company Team & Staff Access
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold">
                    {teamMembers.length} Members
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Manage staff accounts and control their access to company data
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddMemberModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
            >
              <UserPlus size={15} />
              <span>+ Add Staff Member</span>
            </button>
          </div>

          {teamSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{teamSuccess}</span>
            </div>
          )}

          {teamError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{teamError}</span>
            </div>
          )}

          {/* Role Comparison Matrix Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Shield size={13} /> Admin (Owner)
              </span>
              <p className="text-slate-500 text-[11px]">
                Full master control across financial reports, team staff, settings, inventory, sales, and purchases.
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <ShieldCheck size={13} /> Manager
              </span>
              <p className="text-slate-500 text-[11px]">
                Can manage catalog, stock adjustments, purchase orders, sales orders, and operational reports.
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Users size={13} /> Staff (Restricted)
              </span>
              <p className="text-slate-500 text-[11px]">
                Frontline POS sales, catalog lookups, customer add. <strong>Blocked</strong> from financial reports, purchases, and settings.
              </p>
            </div>
          </div>

          {/* Team Members Table */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <span>{member.username}</span>
                      {member.is_owner && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-1.5 py-0.5 rounded font-semibold">
                          Owner
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono text-xs">
                      {member.email}
                    </td>

                    <td className="p-3.5">
                      {member.is_owner ? (
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 capitalize">
                          {member.role}
                        </span>
                      ) : (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none cursor-pointer"
                        >
                          <option value="staff">Staff (Restricted Access)</option>
                          <option value="manager">Manager (Operational)</option>
                          <option value="admin">Admin (Full Control)</option>
                        </select>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      {!member.is_owner && (
                        <button
                          onClick={() => handleRemoveMember(member.id, member.username)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition cursor-pointer"
                          title="Remove team member"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <UserPlus size={18} className="text-emerald-500" />
                <span>Create Staff Account</span>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Staff Member Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tanay Shah"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-900 dark:text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Staff Login Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. tanay@gmail.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-900 dark:text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newMemberPassword}
                  onChange={(e) => setNewMemberPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-900 dark:text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Role Assignment
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-900 dark:text-white focus:border-emerald-500 cursor-pointer"
                >
                  <option value="staff">Staff — Frontline POS, Catalog & Customers (Restricted)</option>
                  <option value="manager">Manager — Inventory, Restocking & Purchases</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingMember}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {addingMember ? "Creating..." : "Create Staff Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Theme & Display */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Theme & Display
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Dark Mode
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Toggle between light and dark visual themes.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
              theme === "dark" ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                theme === "dark" ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Notification Preferences
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Show Low Stock Badge
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Display the live alert count badge on the navigation bell icon.
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleStockBadge}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
              showStockBadge ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                showStockBadge ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <KeyRound size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Security & Password
            </h2>
            <p className="text-xs text-slate-400">Update your sign-in password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSave} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-800 dark:text-white focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-800 dark:text-white focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-800 dark:text-white focus:border-emerald-500"
              required
            />
          </div>

          {passwordError && (
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">{passwordError}</p>
          )}

          {passwordMessage && (
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{passwordMessage}</p>
          )}

          <button
            type="submit"
            disabled={savingPassword}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {savingPassword ? "Saving..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
