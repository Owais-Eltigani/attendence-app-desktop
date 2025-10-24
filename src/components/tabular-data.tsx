import { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { Button } from "./ui/button";
import * as XLSX from "xlsx";
// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const Tabular = () => {
  // Row Data: The data to be displayed.
  const [rowData, _setRowData] = useState([
    {
      No: 3,
      "Student Name": "Alice Johnson",
      "Enrollment No": "ENR003",
      "Submitted at": "2024-10-01 10:10 AM",
    },
    {
      No: 4,
      "Student Name": "Bob Brown",
      "Enrollment No": "ENR004",
      "Submitted at": "2024-10-01 10:15 AM",
    },

    {
      No: 5,
      "Student Name": "Charlie Davis",
      "Enrollment No": "ENR005",
      "Submitted at": "2024-10-01 10:20 AM",
    },

    {
      No: 1,
      "Student Name": "John Doe",
      "Enrollment No": "ENR001",
      "Submitted at": "2024-10-01 10:00 AM",
    },
    {
      No: 2,
      "Student Name": "Jane Smith",
      "Enrollment No": "ENR002",
      "Submitted at": "2024-10-01 10:05 AM",
    },
    {
      No: 3,
      "Student Name": "Alice Johnson",
      "Enrollment No": "ENR003",
      "Submitted at": "2024-10-01 10:10 AM",
    },
    {
      No: 4,
      "Student Name": "Bob Brown",
      "Enrollment No": "ENR004",
      "Submitted at": "2024-10-01 10:15 AM",
    },

    {
      No: 5,
      "Student Name": "Charlie Davis",
      "Enrollment No": "ENR005",
      "Submitted at": "2024-10-01 10:20 AM",
    },
    {
      No: 1,
      "Student Name": "John Doe",
      "Enrollment No": "ENR001",
      "Submitted at": "2024-10-01 10:00 AM",
    },
    {
      No: 2,
      "Student Name": "Jane Smith",
      "Enrollment No": "ENR002",
      "Submitted at": "2024-10-01 10:05 AM",
    },
    {
      No: 3,
      "Student Name": "Alice Johnson",
      "Enrollment No": "ENR003",
      "Submitted at": "2024-10-01 10:10 AM",
    },
    {
      No: 4,
      "Student Name": "Bob Brown",
      "Enrollment No": "ENR004",
      "Submitted at": "2024-10-01 10:15 AM",
    },

    {
      No: 5,
      "Student Name": "Charlie Davis",
      "Enrollment No": "ENR005",
      "Submitted at": "2024-10-01 10:20 AM",
    },

    {
      No: 1,
      "Student Name": "John Doe",
      "Enrollment No": "ENR001",
      "Submitted at": "2024-10-01 10:00 AM",
    },
    {
      No: 2,
      "Student Name": "Jane Smith",
      "Enrollment No": "ENR002",
      "Submitted at": "2024-10-01 10:05 AM",
    },
  ]);

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, _setColDefs] = useState([
    { field: "No", centered: true },
    { field: "Student Name", sortable: true, filter: true, editable: true },
    { field: "Enrollment No", sortable: true, filter: true, editable: true },
    { field: "Submitted at" },
  ]);

  const handleXLESExport = () => {
    console.log("Exporting to Excel...");
    //
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rowData);
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "attendance_data.xlsx");
  };

  return (
    <div className="">
      <div className="bg-white border border-gray-200 rounded-lg max-h-96 min-h-40 shadow-sm flex-1">
        {/* Empty white box for future content */}
        <h1 className="text-lg font-semibold p-4 text-center text-gray-500">
          <div
            style={{ height: "300px", width: "100%", scrollbarWidth: "thin" }}
            className="ag-theme-alpine"
          >
            <AgGridReact rowData={rowData} columnDefs={colDefs} />
          </div>
        </h1>
        {/*          */}
      </div>
      <div className="flex flex-row justify-end mt-4 space-x-2  p-2">
        <Button onClick={handleXLESExport}>Export as Excel</Button>
        <Button>Export as CSV</Button>
      </div>
    </div>
  );
};

export default Tabular;
