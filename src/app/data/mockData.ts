export interface Employee {
  id: string;
  name: string;
  department: string;
  photo?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  location: "Company" | "Onsite";
  site?: string;
}

export const employees: Employee[] = [
  { id: "EMP001", name: "JUAN DELA CRUZ", department: "Engineering" },
  { id: "EMP002", name: "MARIA SANTOS", department: "Human Resources" },
  { id: "EMP003", name: "PEDRO GARCIA", department: "Sales" },
  { id: "EMP004", name: "ANNA REYES", department: "Engineering" },
  { id: "EMP005", name: "JOSE CRUZ", department: "Marketing" },
];

// Helper function to get attendance storage
export function getAttendanceStorage(): AttendanceRecord[] {
  const stored = localStorage.getItem('attendance_records');
  return stored ? JSON.parse(stored) : [];
}

// Helper function to save attendance
export function saveAttendanceStorage(records: AttendanceRecord[]): void {
  localStorage.setItem('attendance_records', JSON.stringify(records));
}

// Helper function to clock in
export function clockIn(employeeId: string, employeeName: string): { success: boolean; message: string; record?: AttendanceRecord } {
  const records = getAttendanceStorage();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  
  // Check if employee already has a record for today without time out
  const existingRecord = records.find(
    r => r.employeeId === employeeId && r.date === today && !r.timeOut
  );
  
  if (existingRecord) {
    // If they've already clocked in, treat a second scan as clocking out
    existingRecord.timeOut = timeString;
    saveAttendanceStorage(records);

    return {
      success: true,
      message: `Successfully clocked out at ${timeString}`,
      record: existingRecord,
    };
  }
  
  // Clock in (first scan today)
  const newRecord: AttendanceRecord = {
    id: String(Date.now()),
    employeeId,
    employeeName,
    date: today,
    timeIn: timeString,
    timeOut: null,
    location: "Company",
  };
  
  records.push(newRecord);
  saveAttendanceStorage(records);
  
  return { 
    success: true, 
    message: `Successfully clocked in at ${timeString}`,
    record: newRecord
  };
}

// Helper function to clock out
export function clockOut(employeeId: string): { success: boolean; message: string; record?: AttendanceRecord } {
  const records = getAttendanceStorage();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  
  // Find today's record
  const existingRecord = records.find(
    r => r.employeeId === employeeId && r.date === today && !r.timeOut
  );
  
  if (!existingRecord) {
    return { 
      success: false, 
      message: "You have not clocked in yet today"
    };
  }
  
  // Clock out
  existingRecord.timeOut = timeString;
  saveAttendanceStorage(records);
  
  return { 
    success: true, 
    message: `Successfully clocked out at ${timeString}`,
    record: existingRecord
  };
}

// Helper function to save onsite schedule
export function saveOnsiteSchedule(
  employeeId: string,
  employeeName: string,
  site: string,
  timeIn: string,
  timeOut: string
): { success: boolean; message: string } {
  const records = getAttendanceStorage();
  const today = new Date().toISOString().split('T')[0];
  
  const newRecord: AttendanceRecord = {
    id: String(Date.now()),
    employeeId,
    employeeName,
    date: today,
    timeIn,
    timeOut,
    location: "Onsite",
    site,
  };
  
  records.push(newRecord);
  saveAttendanceStorage(records);
  
  return { 
    success: true, 
    message: "Onsite schedule saved successfully"
  };
}

// Helper function to get today's attendance for an employee
export function getTodayAttendance(employeeId: string): AttendanceRecord | null {
  const records = getAttendanceStorage();
  const today = new Date().toISOString().split('T')[0];
  
  return records.find(
    r => r.employeeId === employeeId && r.date === today
  ) || null;
}
