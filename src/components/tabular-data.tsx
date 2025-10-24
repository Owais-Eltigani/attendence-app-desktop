import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { Button } from "./ui/button";
import * as XLSX from "xlsx";
import { useSession } from "@/contexts/SessionContext";
import { useEffect, useState } from "react";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

interface StudentData {
  name: string;
  enrollmentNo: string;
  sessionId: string;
  No?: number;
  submittedAt?: string;
  Notes?: string;
}

const Tabular = () => {
  // Access session data from context
  const { subjectName, section, semester } = useSession();
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);

  useEffect(() => {
    // Listen for real-time attendance updates
    let len = studentsData.length;
    const unsubscribe = window.electronAPI?.onAttendanceUpdate(
      (studentData: StudentData) => {
        // Add new student to the list
        setStudentsData((prev) => [
          ...prev,
          { ...studentData, No: ++len, Notes: "" },
        ]);
        console.log("� Received attendance update:", studentData);
      }
    );

    // Cleanup on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  //? create a path depending on session data (relative path for folder structure)
  const folderPath = `Sec ${section}/${semester}th Sem/${subjectName.toUpperCase()}`;

  //? save the file as dd-mm-yyyy.xlsx
  const date = new Date();
  const today = `${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()}`;

  const handleXLESExport = async () => {
    console.log("Exporting to Excel...");

    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(studentsData);
      XLSX.utils.book_append_sheet(wb, ws, "Attendance");

      // Write to array buffer instead of file
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      // Use Electron API to save with proper directory creation
      const result = await window.electronAPI?.saveExcelFile(
        wbout,
        `${today}.xlsx`,
        folderPath
      );

      if (result?.success) {
        console.log(`✅ File saved successfully at: ${result.path}`);
        // File explorer will open automatically via shell.showItemInFolder()
      } else {
        console.error("❌ Failed to save file:", result?.error);
        alert(`Failed to save file: ${result?.error}`);
      }
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert(`Error: ${error}`);
    }
  };

  const handleCSVExport = async () => {
    console.log("Exporting to CSV...");

    try {
      // Create workbook
      const ws = XLSX.utils.json_to_sheet(studentsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance");

      // Write to array buffer
      const wbout = XLSX.write(wb, { bookType: "csv", type: "array" });

      // Use Electron API to save with proper directory creation
      const result = await window.electronAPI?.saveExcelFile(
        wbout,
        `${today}.csv`,
        folderPath
      );

      if (result?.success) {
        console.log(`✅ CSV saved successfully at: ${result.path}`);
        // File explorer will open automatically via shell.showItemInFolder()
      } else {
        console.error("❌ Failed to save CSV:", result?.error);
        alert(`Failed to save file: ${result?.error}`);
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert(`Error: ${error}`);
    }
  };

  const colDefs = [
    { field: "No", centered: true },
    { field: "studentName", sortable: true, filter: true, editable: true },
    { field: "enrollmentNo", sortable: true, filter: true, editable: true },
    { field: "submittedAt", sortable: true, filter: true },
    {
      field: "Note",
      editable: true,
    },
  ];
  return (
    <div className="">
      <div className="bg-white border border-gray-200 rounded-lg max-h-96 min-h-40 shadow-sm flex-1">
        {/* Empty white box for future content */}
        <h1 className="text-lg font-semibold p-4 text-center text-gray-500">
          <div
            style={{ height: "300px", width: "100%", scrollbarWidth: "thin" }}
            className="ag-theme-alpine"
          >
            <AgGridReact
              rowData={studentsData}
              columnDefs={colDefs}
              rowNumbers={true}
            />
          </div>
        </h1>
        {/*          */}
      </div>
      <div className="flex flex-row justify-between mt-4 space-x-2  p-2">
        <div className="text-xs text-gray-400 self-end">
          *The file will be saved at Documents/{folderPath}
        </div>
        <div className="space-x-2">
          <Button onClick={handleXLESExport}>Export as Excel</Button>
          <Button onClick={handleCSVExport}>Export as CSV</Button>
        </div>
      </div>
    </div>
  );
};

export default Tabular;
