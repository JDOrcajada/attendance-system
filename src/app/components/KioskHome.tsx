import { useState, useEffect } from "react";
import { QrCode, User } from "lucide-react";
import logoImage from "../../assets/logo.png";
import { KIOSK_API_BASE } from '../../imports/api';

const API = KIOSK_API_BASE;

interface EmployeeInfo {
  id: number;
  name: string;
  role: string;
  picture: string | null;
}

interface SuccessInfo {
  employee: EmployeeInfo;
  action: "IN" | "OUT" | "ONSITE";
  time: string;
  site?: string;
}

type Screen = "home" | "success" | "manual-logout" | "onsite-service";

export function KioskHome() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [employeeId, setEmployeeId] = useState("");
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Manual logout state
  const [logoutEmployeeId, setLogoutEmployeeId] = useState("");

  // Onsite service state
  const [onsiteEmployeeId, setOnsiteEmployeeId] = useState("");
  const [onsiteSite, setOnsiteSite] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const showSuccess = (info: SuccessInfo) => {
    setSuccessInfo(info);
    setCurrentScreen("success");
    setTimeout(() => {
      setCurrentScreen("home");
      setSuccessInfo(null);
      setErrorMsg("");
    }, 4000);
  };

  const handleScan = async (empId: string) => {
    if (!empId.trim()) return;
    setErrorMsg("");
    const id = parseInt(empId.trim(), 10);
    if (isNaN(id)) { setErrorMsg("Invalid employee ID"); setEmployeeId(""); return; }

    try {
      // Look up employee
      const empRes = await fetch(`${API}/employee/${id}`);
      if (!empRes.ok) {
        const d = await empRes.json();
        setErrorMsg(d.message || "Employee not found");
        setEmployeeId("");
        return;
      }
      const employee: EmployeeInfo = await empRes.json();

      // Determine action: try IN first, fall back to OUT
      let action: "IN" | "OUT" = "IN";
      const attRes = await fetch(`${API}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: id, action: "IN", location: "OFFICE" }),
      });

      if (!attRes.ok) {
        const d = await attRes.json();
        // Already clocked in → try OUT instead
        if (attRes.status === 409 && d.message?.includes("Already clocked in")) {
          action = "OUT";
          const outRes = await fetch(`${API}/attendance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employeeId: id, action: "OUT", location: "OFFICE" }),
          });
          if (!outRes.ok) {
            const od = await outRes.json();
            setErrorMsg(od.message || "Clock-out failed");
            setEmployeeId("");
            return;
          }
          const outData = await outRes.json();
          showSuccess({ employee, action: "OUT", time: new Date(outData.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) });
        } else {
          setErrorMsg(d.message || "Clock-in failed");
        }
        setEmployeeId("");
        return;
      }

      const inData = await attRes.json();
      showSuccess({ employee, action: "IN", time: new Date(inData.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) });
    } catch {
      setErrorMsg("Cannot reach server. Check your connection.");
    }
    setEmployeeId("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && employeeId.trim()) {
      handleScan(employeeId);
    }
  };

  const handleManualLogoutClick = () => {
    setCurrentScreen("manual-logout");
    setLogoutEmployeeId("");
    setErrorMsg("");
  };

  const handleOnsiteServiceClick = () => {
    setCurrentScreen("onsite-service");
    setOnsiteEmployeeId("");
    setOnsiteSite("");
    setErrorMsg("");
  };

  const handleTimeOut = async () => {
    if (!logoutEmployeeId.trim()) { setErrorMsg("Please enter your Employee ID"); return; }
    setErrorMsg("");
    const id = parseInt(logoutEmployeeId.trim(), 10);
    if (isNaN(id)) { setErrorMsg("Invalid employee ID"); return; }

    try {
      const empRes = await fetch(`${API}/employee/${id}`);
      if (!empRes.ok) { const d = await empRes.json(); setErrorMsg(d.message || "Employee not found"); return; }
      const employee: EmployeeInfo = await empRes.json();

      const res = await fetch(`${API}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: id, action: "OUT" }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.message || "Clock-out failed"); return; }

      setLogoutEmployeeId("");
      showSuccess({ employee, action: "OUT", time: new Date(data.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) });
    } catch {
      setErrorMsg("Cannot reach server. Check your connection.");
    }
  };

  const handleSaveSchedule = async () => {
    if (!onsiteEmployeeId.trim() || !onsiteSite.trim()) {
      setErrorMsg("Please fill in Employee ID and Site");
      return;
    }
    setErrorMsg("");
    const id = parseInt(onsiteEmployeeId.trim(), 10);
    if (isNaN(id)) { setErrorMsg("Invalid employee ID"); return; }

    try {
      const empRes = await fetch(`${API}/employee/${id}`);
      if (!empRes.ok) { const d = await empRes.json(); setErrorMsg(d.message || "Employee not found"); return; }
      const employee: EmployeeInfo = await empRes.json();

      // Update location/site on existing clock-in record only
      const res = await fetch(`${API}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: id, action: "IN", location: "ONSITE", site: onsiteSite }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.message || "Failed to update location"); return; }

      setOnsiteEmployeeId(""); setOnsiteSite("");
      showSuccess({
        employee,
        action: "ONSITE",
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        site: onsiteSite,
      });
    } catch {
      setErrorMsg("Cannot reach server. Check your connection.");
    }
  };

  const handleCancel = () => {
    setCurrentScreen("home");
    setLogoutEmployeeId("");
    setOnsiteEmployeeId("");
    setOnsiteSite("");
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="SmartQ Systems" className="h-16 w-auto" />
            <div className="text-3xl font-bold text-slate-900">SMARTQ SYSTEMS</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: "#32AD32" }}>
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-gray-600 mt-0.5">{formatDate(currentTime)}</div>
          </div>
        </div>
      </div>

      {/* Reminder Banner */}
      <div className="bg-white/90 px-6 py-3 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm font-semibold" style={{ color: "#32AD32" }}>
            REMINDER: For onsite service, click ONSITE SERVICE to time out. Don't forget to time out after office or onsite work.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-10">
        <div className="max-w-3xl mx-auto">
          {currentScreen === "home" && (
            <div className="space-y-8">
              {/* TAP YOUR ID Section */}
              <div className="text-center space-y-6">
                <h1 className="text-4xl font-bold" style={{ color: "#32AD32" }}>
                  TAP YOUR ID
                </h1>
                
                {/* QR Code Placeholder */}
                <div className="flex justify-center mt-4">
                  <div className="w-40 h-40 border-4 rounded-lg flex items-center justify-center" style={{ borderColor: "#32AD32" }}>
                    <QrCode className="w-20 h-20" style={{ color: "#32AD32" }} />
                  </div>
                </div>

                {/* Employee ID Input */}
                <div className="max-w-2xl mx-auto mt-6">
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => { setEmployeeId(e.target.value); setErrorMsg(""); }}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter employee number"
                    autoFocus
                    className="w-full px-5 py-3 text-lg text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                  {errorMsg && (
                    <p className="mt-2 text-red-600 font-semibold text-center">{errorMsg}</p>
                  )}
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center max-w-xl mx-auto">
                <button
                  onClick={handleOnsiteServiceClick}
                  className="flex-1 py-4 text-white text-xl font-bold rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: "#32AD32" }}
                >
                  ONSITE SERVICE
                </button>
                <button
                  onClick={handleManualLogoutClick}
                  className="flex-1 py-4 text-white text-xl font-bold rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: "#32AD32" }}
                >
                  MANUAL LOGOUT
                </button>
              </div>
            </div>
          )}

          {currentScreen === "success" && successInfo && (
            <div className="space-y-6">
              {/* Success Card */}
              <div className="border-4 rounded-lg p-8" style={{ borderColor: "#32AD32" }}>
                <div className="text-center space-y-5">
                  {/* Employee Photo */}
                  <div className="flex justify-center">
                    <div className="w-32 h-32 rounded border-4 border-white shadow-lg overflow-hidden flex items-center justify-center bg-gray-200">
                      {successInfo.employee.picture
                        ? <img src={successInfo.employee.picture} className="w-full h-full object-cover" alt="photo" />
                        : <User className="w-16 h-16 text-gray-500" />
                      }
                    </div>
                  </div>

                  {/* Employee Name */}
                  <h2 className="text-4xl font-bold" style={{ color: "#32AD32" }}>
                    {successInfo.employee.name || `Employee #${successInfo.employee.id}`}
                  </h2>

                  {/* Action label */}
                  <p className="text-2xl font-bold" style={{ color: "#32AD32" }}>
                    {successInfo.action === "IN" ? "CLOCKED IN" : successInfo.action === "OUT" ? "CLOCKED OUT" : "LOCATION UPDATED TO ONSITE"}
                  </p>

                  {/* Time / Site Information */}
                  <div className="flex flex-col items-center gap-3 text-lg">
                    {successInfo.action === "ONSITE" ? (
                      <div>
                        <span className="font-semibold" style={{ color: "#32AD32" }}>Site: </span>
                        <span className="font-bold" style={{ color: "#32AD32" }}>{successInfo.site}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold" style={{ color: "#32AD32" }}>
                          {successInfo.action === "IN" ? "Time In: " : "Time Out: "}
                        </span>
                        <span className="font-bold" style={{ color: "#32AD32" }}>{successInfo.time}</span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <p className="text-xl font-bold" style={{ color: "#32AD32" }}>
                    {formatDate(currentTime).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentScreen === "manual-logout" && (
            <div className="space-y-6">
              {/* Manual Logout Section */}
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold" style={{ color: "#32AD32" }}>
                  ENTER YOUR ID
                </h1>

                {/* Employee ID Input */}
                <div className="max-w-2xl mx-auto">
                  <input
                    type="text"
                    value={logoutEmployeeId}
                    onChange={(e) => { setLogoutEmployeeId(e.target.value); setErrorMsg(""); }}
                    onKeyPress={(e) => { if (e.key === "Enter") handleTimeOut(); }}
                    placeholder=""
                    className="w-full px-5 py-4 text-xl text-center border-2 border-gray-900 rounded-lg focus:outline-none focus:border-gray-700"
                    autoFocus
                  />
                  {errorMsg && (
                    <p className="mt-2 text-red-600 font-semibold text-center">{errorMsg}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center max-w-xl mx-auto mt-10">
                <button
                  onClick={handleTimeOut}
                  className="flex-1 py-4 text-white text-xl font-bold rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: "#32AD32" }}
                >
                  TIME OUT
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-4 text-white text-xl font-bold rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: "#32AD32" }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {currentScreen === "onsite-service" && (
            <div className="space-y-6">
              {/* Onsite Service Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      value={onsiteEmployeeId}
                      onChange={(e) => { setOnsiteEmployeeId(e.target.value); setErrorMsg(""); }}
                      placeholder="EMPLOYEE ID"
                      className="w-full px-5 py-4 text-lg text-center border-2 border-gray-900 rounded-lg focus:outline-none focus:border-gray-700 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={onsiteSite}
                      onChange={(e) => { setOnsiteSite(e.target.value); setErrorMsg(""); }}
                      placeholder="SITE"
                      className="w-full px-5 py-4 text-lg text-center border-2 border-gray-900 rounded-lg focus:outline-none focus:border-gray-700 placeholder-gray-400"
                    />
                  </div>
                </div>
                {errorMsg && (
                  <p className="text-red-600 font-semibold text-center">{errorMsg}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center max-w-xl mx-auto mt-10">
                <button
                  onClick={handleSaveSchedule}
                  className="flex-1 py-4 text-white text-xl font-bold rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: "#32AD32" }}
                >
                  SAVE SCHEDULE
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-4 text-white text-xl font-bold rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: "#32AD32" }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
