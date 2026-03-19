import { useState, useEffect } from "react";
import { QrCode, User } from "lucide-react";
import { employees, clockIn, clockOut, getTodayAttendance, saveOnsiteSchedule, type AttendanceRecord } from "../data/mockData";
import logoImage from "../../assets/logo.png";

type Screen = "home" | "success" | "manual-logout" | "onsite-service";

export function KioskHome() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [employeeId, setEmployeeId] = useState("");
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<{ id: string; name: string } | null>(null);
  
  // Manual logout state
  const [logoutEmployeeId, setLogoutEmployeeId] = useState("");
  
  // Onsite service state
  const [onsiteEmployeeId, setOnsiteEmployeeId] = useState("");
  const [onsiteSite, setOnsiteSite] = useState("");
  const [onsiteTimeIn, setOnsiteTimeIn] = useState("");
  const [onsiteTimeOut, setOnsiteTimeOut] = useState("");

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

  const handleClockIn = (empId: string) => {
    const employee = employees.find(e => e.id.toLowerCase() === empId.toLowerCase());
    
    if (!employee) {
      alert("Employee ID not found");
      setEmployeeId("");
      return;
    }

    const result = clockIn(employee.id, employee.name);
    
    if (result.success && result.record) {
      setCurrentEmployee({ id: employee.id, name: employee.name });
      setCurrentRecord(result.record);
      setCurrentScreen("success");
      setEmployeeId("");
      
      // Auto return to home after 3 seconds
      setTimeout(() => {
        setCurrentScreen("home");
        setCurrentRecord(null);
        setCurrentEmployee(null);
      }, 3000);
    } else {
      alert(result.message);
      setEmployeeId("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && employeeId.trim()) {
      handleClockIn(employeeId);
    }
  };

  const handleManualLogoutClick = () => {
    setCurrentScreen("manual-logout");
    setLogoutEmployeeId("");
  };

  const handleOnsiteServiceClick = () => {
    setCurrentScreen("onsite-service");
    setOnsiteEmployeeId("");
    setOnsiteSite("");
    setOnsiteTimeIn("");
    setOnsiteTimeOut("");
  };

  const handleTimeOut = () => {
    if (!logoutEmployeeId.trim()) {
      alert("Please enter your Employee ID");
      return;
    }

    const employee = employees.find(e => e.id.toLowerCase() === logoutEmployeeId.toLowerCase());
    
    if (!employee) {
      alert("Employee ID not found");
      setLogoutEmployeeId("");
      return;
    }

    const result = clockOut(employee.id);
    
    if (result.success && result.record) {
      setCurrentEmployee({ id: employee.id, name: employee.name });
      setCurrentRecord(result.record);
      setCurrentScreen("success");
      setLogoutEmployeeId("");
      
      // Auto return to home after 3 seconds
      setTimeout(() => {
        setCurrentScreen("home");
        setCurrentRecord(null);
        setCurrentEmployee(null);
      }, 3000);
    } else {
      alert(result.message);
      setLogoutEmployeeId("");
    }
  };

  const validate12HourTime = (value: string) => {
    // Accepts format like 08:30 AM, 12:00 PM, etc.
    const normalized = value.trim().toUpperCase();
    return /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(normalized);
  };

  const handleSaveSchedule = () => {
    if (!onsiteEmployeeId.trim() || !onsiteSite.trim() || !onsiteTimeIn.trim() || !onsiteTimeOut.trim()) {
      alert("Please fill in all fields");
      return;
    }

    if (!validate12HourTime(onsiteTimeIn) || !validate12HourTime(onsiteTimeOut)) {
      alert("Time must be in the format 00:00 AM (e.g. 08:30 AM)");
      return;
    }

    const employee = employees.find(e => e.id.toLowerCase() === onsiteEmployeeId.toLowerCase());
    
    if (!employee) {
      alert("Employee ID not found");
      setOnsiteEmployeeId("");
      return;
    }
    
    const result = saveOnsiteSchedule(
      employee.id,
      employee.name,
      onsiteSite,
      onsiteTimeIn.toUpperCase(),
      onsiteTimeOut.toUpperCase()
    );
    
    if (result.success) {
      setCurrentEmployee({ id: employee.id, name: employee.name });
      setCurrentRecord({
        id: String(Date.now()),
        employeeId: employee.id,
        employeeName: employee.name,
        date: new Date().toISOString().split('T')[0],
        timeIn: onsiteTimeIn.toUpperCase(),
        timeOut: onsiteTimeOut.toUpperCase(),
        location: "Onsite",
        site: onsiteSite,
      });
      setCurrentScreen("success");
      setOnsiteEmployeeId("");
      setOnsiteSite("");
      setOnsiteTimeIn("");
      setOnsiteTimeOut("");
      
      // Auto return to home after 3 seconds
      setTimeout(() => {
        setCurrentScreen("home");
        setCurrentRecord(null);
        setCurrentEmployee(null);
      }, 3000);
    } else {
      alert(result.message);
      setOnsiteEmployeeId("");
    }
  };

  const handleCancel = () => {
    setCurrentScreen("home");
    setLogoutEmployeeId("");
    setOnsiteEmployeeId("");
    setOnsiteSite("");
    setOnsiteTimeIn("");
    setOnsiteTimeOut("");
  };

  // Quick scan simulation
  const handleQuickScan = (empId: string) => {
    handleClockIn(empId);
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
                    onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter employee number"
                    className="w-full px-5 py-3 text-lg text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>

                {/* Quick Test Buttons (for demo) */}
                <div className="text-sm text-gray-500 mt-3">
                  Quick test:
                  <div className="flex gap-2 justify-center mt-2">
                    {employees.slice(0, 3).map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => handleQuickScan(emp.id)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                      >
                        {emp.id}
                      </button>
                    ))}
                  </div>
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

          {currentScreen === "success" && currentEmployee && currentRecord && (
            <div className="space-y-6">
              {/* Success Card */}
              <div className="border-4 rounded-lg p-8" style={{ borderColor: "#32AD32" }}>
                <div className="text-center space-y-5">
                  {/* Employee Photo Placeholder */}
                  <div className="flex justify-center">
                    <div className="w-32 h-32 bg-gray-300 rounded border-4 border-white shadow-lg flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-500" />
                    </div>
                  </div>

                  {/* Employee Name */}
                  <h2 className="text-4xl font-bold" style={{ color: "#32AD32" }}>
                    {currentEmployee.name}
                  </h2>

                  {/* Time Information */}
                  <div className="flex flex-col items-center gap-3 text-lg">
                    {currentRecord.location === "Onsite" ? (
                      <>
                        <div>
                          <span className="font-semibold" style={{ color: "#32AD32" }}>Site: </span>
                          <span className="font-bold" style={{ color: "#32AD32" }}>{currentRecord.site}</span>
                        </div>
                        <div>
                          <span className="font-semibold" style={{ color: "#32AD32" }}>Scheduled Time In: </span>
                          <span className="font-bold" style={{ color: "#32AD32" }}>{currentRecord.timeIn}</span>
                        </div>
                        <div>
                          <span className="font-semibold" style={{ color: "#32AD32" }}>Scheduled Time Out: </span>
                          <span className="font-bold" style={{ color: "#32AD32" }}>{currentRecord.timeOut}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="font-semibold" style={{ color: "#32AD32" }}>Time In: </span>
                          <span className="font-bold" style={{ color: "#32AD32" }}>{currentRecord.timeIn}</span>
                        </div>
                        <div>
                          <span className="font-semibold" style={{ color: "#32AD32" }}>Time Out: </span>
                          <span className="font-bold" style={{ color: "#32AD32" }}>
                            {currentRecord.timeOut || ""}
                          </span>
                        </div>
                      </>
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
                    onChange={(e) => setLogoutEmployeeId(e.target.value.toUpperCase())}
                    placeholder=""
                    className="w-full px-5 py-4 text-xl text-center border-2 border-gray-900 rounded-lg focus:outline-none focus:border-gray-700"
                    autoFocus
                  />
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
                      onChange={(e) => setOnsiteEmployeeId(e.target.value.toUpperCase())}
                      placeholder="EMPLOYEE ID"
                      className="w-full px-5 py-4 text-lg text-center border-2 border-gray-900 rounded-lg focus:outline-none focus:border-gray-700 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={onsiteSite}
                      onChange={(e) => setOnsiteSite(e.target.value)}
                      placeholder="SITE"
                      className="w-full px-5 py-4 text-lg text-center border-2 border-gray-900 rounded-lg focus:outline-none focus:border-gray-700 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={onsiteTimeIn}
                      onChange={(e) => setOnsiteTimeIn(e.target.value)}
                      placeholder="TIME IN (e.g. 08:00 AM)"
                      className="w-full px-5 py-4 text-lg text-center border-2 border-gray-900 rounded-lg focus:outline-none focus:border-gray-700 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={onsiteTimeOut}
                      onChange={(e) => setOnsiteTimeOut(e.target.value)}
                      placeholder="TIME OUT (e.g. 05:00 PM)"
                      className="w-full px-5 py-4 text-lg text-center border-2 border-gray-900 rounded-lg focus:outline-none focus:border-gray-700 placeholder-gray-400"
                    />
                  </div>
                </div>
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
