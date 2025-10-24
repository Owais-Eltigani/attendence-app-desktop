import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { Button } from "./ui/button";
import * as XLSX from "xlsx";
import { rowData } from "./attendence-table";
// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const Tabular = () => {
  // Column Definitions: Defines the columns to be displayed.
  const colDefs = [
    { field: "No", centered: true },
    { field: "Student Name", sortable: true, filter: true, editable: true },
    { field: "Enrollment No", sortable: true, filter: true, editable: true },
    { field: "Submitted at" },
  ];

  const handleXLESExport = () => {
    console.log("Exporting to Excel...");
    //
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rowData);
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "attendance_data.xlsx");
  };

  const handleCSVExport = () => {
    console.log("Exporting to CSV...");
    //
    const ws = XLSX.utils.json_to_sheet(rowData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "attendance_data.csv", { bookType: "csv" });
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
        <Button onClick={handleCSVExport}>Export as CSV</Button>
      </div>
    </div>
  );
};

export default Tabular;
