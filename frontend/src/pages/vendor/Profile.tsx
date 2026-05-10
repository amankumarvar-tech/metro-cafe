import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/api";

interface OperatingHour {
    day: string;
    open: string;
    close: string;
}

interface VendorProfile {
    _id: string;
    name: string;
    slug: string;
    stationLocation: {
        metroLine: string;
        stationName: string;
        booth: string;
    };
    operatingHours: OperatingHour[];
    settings: {
        acceptingOrders: boolean;
        averagePrepTime: number;
        currency: string;
    };
    isActive: boolean;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function VendorProfile() {
    const { user, token } = useAuthStore();
    const [profile, setProfile] = useState<VendorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [name, setName] = useState("");
    const [metroLine, setMetroLine] = useState("");
    const [stationName, setStationName] = useState("");
    const [booth, setBooth] = useState("");
    const [prepTime, setPrepTime] = useState(10);
    const [acceptingOrders, setAcceptingOrders] = useState(true);
    const [operatingHours, setOperatingHours] = useState<OperatingHour[]>(
        DAYS.map(day => ({ day, open: "09:00", close: "21:00" }))
    );

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/vendors/my", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const v = res.data.data.vendor;
            setProfile(v);
            setName(v.name);
            setMetroLine(v.stationLocation.metroLine);
            setStationName(v.stationLocation.stationName);
            setBooth(v.stationLocation.booth || "");
            setPrepTime(v.settings.averagePrepTime);
            setAcceptingOrders(v.settings.acceptingOrders);
            if (v.operatingHours?.length > 0) setOperatingHours(v.operatingHours);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleHourChange = (index: number, field: "open" | "close", value: string) => {
        const updated = [...operatingHours];
        updated[index][field] = value;
        setOperatingHours(updated);
    };

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            await api.put(`/vendors/${profile._id}`, {
                name,
                stationLocation: { metroLine, stationName, booth },
                operatingHours,
                settings: { acceptingOrders, averagePrepTime: prepTime, currency: "INR" }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("✅ Profile updated successfully!");
        } catch (err: any) {
            setMessage("❌ " + (err.response?.data?.message || "Error saving"));
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    if (loading) return <div className="text-white text-center p-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Vendor Profile</h1>

                {message && (
                    <div className="mb-4 p-3 rounded bg-gray-800 text-center">{message}</div>
                )}

                {/* Basic Info */}
                <div className="bg-gray-800 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-gray-400 text-sm">Shop Name</label>
                            <input value={name} onChange={e => setName(e.target.value)}
                                className="w-full mt-1 p-2 bg-gray-700 rounded border border-gray-600 text-white" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-gray-400 text-sm">Metro Line</label>
                                <input value={metroLine} onChange={e => setMetroLine(e.target.value)}
                                    className="w-full mt-1 p-2 bg-gray-700 rounded border border-gray-600 text-white" />
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Station</label>
                                <input value={stationName} onChange={e => setStationName(e.target.value)}
                                    className="w-full mt-1 p-2 bg-gray-700 rounded border border-gray-600 text-white" />
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Booth</label>
                                <input value={booth} onChange={e => setBooth(e.target.value)}
                                    className="w-full mt-1 p-2 bg-gray-700 rounded border border-gray-600 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings */}
                <div className="bg-gray-800 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Settings</h2>
                    <div className="flex items-center justify-between mb-4">
                        <span>Accepting Orders</span>
                        <button onClick={() => setAcceptingOrders(!acceptingOrders)}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${acceptingOrders ? "bg-green-600" : "bg-red-600"}`}>
                            {acceptingOrders ? "ON" : "OFF"}
                        </button>
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm">Avg Prep Time (minutes)</label>
                        <input type="number" value={prepTime} onChange={e => setPrepTime(Number(e.target.value))}
                            className="w-full mt-1 p-2 bg-gray-700 rounded border border-gray-600 text-white" />
                    </div>
                </div>

                {/* Operating Hours */}
                <div className="bg-gray-800 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Operating Hours</h2>
                    {operatingHours.map((h, i) => (
                        <div key={h.day} className="flex items-center gap-4 mb-3">
                            <span className="w-28 text-gray-300">{h.day}</span>
                            <input type="time" value={h.open} onChange={e => handleHourChange(i, "open", e.target.value)}
                                className="p-2 bg-gray-700 rounded border border-gray-600 text-white" />
                            <span className="text-gray-400">to</span>
                            <input type="time" value={h.close} onChange={e => handleHourChange(i, "close", e.target.value)}
                                className="p-2 bg-gray-700 rounded border border-gray-600 text-white" />
                        </div>
                    ))}
                </div>

                <button onClick={handleSave} disabled={saving}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold text-lg disabled:opacity-50">
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}