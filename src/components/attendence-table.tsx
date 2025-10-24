"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, UserCheck, UserX, Clock } from "lucide-react";

interface AttendanceTableProps {
  sessionData: {
    subjectName: string;
    classroomNo: string;
    section: string;
    semester: string;
  };
}
export const rowData = [
  {
    No: 3,
    "Student Name": "Alice Johnson",
    "Enrollment No": "ENR003",
    "Submitted at": "10:10 AM",
  },
  {
    No: 4,
    "Student Name": "Bob Brown",
    "Enrollment No": "ENR004",
    "Submitted at": "10:15 AM",
  },

  {
    No: 5,
    "Student Name": "Charlie Davis",
    "Enrollment No": "ENR005",
    "Submitted at": "10:20 AM",
  },

  {
    No: 1,
    "Student Name": "John Doe",
    "Enrollment No": "ENR001",
    "Submitted at": "10:00 AM",
  },
  {
    No: 2,
    "Student Name": "Jane Smith",
    "Enrollment No": "ENR002",
    "Submitted at": "10:05 AM",
  },
  {
    No: 3,
    "Student Name": "Alice Johnson",
    "Enrollment No": "ENR003",
    "Submitted at": "10:10 AM",
  },
  {
    No: 4,
    "Student Name": "Bob Brown",
    "Enrollment No": "ENR004",
    "Submitted at": "10:15 AM",
  },

  {
    No: 5,
    "Student Name": "Charlie Davis",
    "Enrollment No": "ENR005",
    "Submitted at": "10:20 AM",
  },
  {
    No: 1,
    "Student Name": "John Doe",
    "Enrollment No": "ENR001",
    "Submitted at": "10:00 AM",
  },
  {
    No: 2,
    "Student Name": "Jane Smith",
    "Enrollment No": "ENR002",
    "Submitted at": "10:05 AM",
  },
  {
    No: 3,
    "Student Name": "Alice Johnson",
    "Enrollment No": "ENR003",
    "Submitted at": "10:10 AM",
  },
  {
    No: 4,
    "Student Name": "Bob Brown",
    "Enrollment No": "ENR004",
    "Submitted at": "10:15 AM",
  },

  {
    No: 5,
    "Student Name": "Charlie Davis",
    "Enrollment No": "ENR005",
    "Submitted at": "10:20 AM",
  },

  {
    No: 1,
    "Student Name": "John Doe",
    "Enrollment No": "ENR001",
    "Submitted at": "10:00 AM",
  },
  {
    No: 2,
    "Student Name": "Jane Smith",
    "Enrollment No": "ENR002",
    "Submitted at": "10:05 AM",
  },
];

// Mock student data
const mockStudents = [
  { id: "ST001", name: "Alice Johnson", rollNo: "2021001", status: "present" },
  { id: "ST002", name: "Bob Smith", rollNo: "2021002", status: "absent" },
  { id: "ST003", name: "Carol Davis", rollNo: "2021003", status: "present" },
  { id: "ST004", name: "David Wilson", rollNo: "2021004", status: "late" },
  { id: "ST005", name: "Emma Brown", rollNo: "2021005", status: "present" },
  { id: "ST006", name: "Frank Miller", rollNo: "2021006", status: "absent" },
  { id: "ST007", name: "Grace Lee", rollNo: "2021007", status: "present" },
  { id: "ST008", name: "Henry Taylor", rollNo: "2021008", status: "present" },
];

export function AttendanceTable({ sessionData }: AttendanceTableProps) {
  const [students, setStudents] = useState(mockStudents);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.includes(searchTerm)
  );

  const toggleAttendance = (studentId: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          const statuses = ["present", "absent", "late"];
          const currentIndex = statuses.indexOf(student.status);
          const nextStatus = statuses[(currentIndex + 1) % statuses.length];
          return { ...student, status: nextStatus };
        }
        return student;
      })
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <UserCheck className="h-3 w-3 mr-1" />
            Present
          </Badge>
        );
      case "absent":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <UserX className="h-3 w-3 mr-1" />
            Absent
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Late
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const presentCount = students.filter((s) => s.status === "present").length;
  const absentCount = students.filter((s) => s.status === "absent").length;
  const lateCount = students.filter((s) => s.status === "late").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Attendance Sheet - {sessionData.subjectName}
          </CardTitle>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">Present: {presentCount}</span>
            <span className="text-red-600">Absent: {absentCount}</span>
            <span className="text-yellow-600">Late: {lateCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Section: {sessionData.section}</span>
          <span>Semester: {sessionData.semester}</span>
          <span>Room: {sessionData.classroomNo}</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Attendance Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium">Roll No.</th>
                  <th className="text-left p-4 font-medium">Student Name</th>
                  <th className="text-center p-4 font-medium">Status</th>
                  <th className="text-center p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className={
                      index % 2 === 0 ? "bg-background" : "bg-muted/30"
                    }
                  >
                    <td className="p-4 font-mono text-sm">{student.rollNo}</td>
                    <td className="p-4 font-medium">{student.name}</td>
                    <td className="p-4 text-center">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAttendance(student.id)}
                      >
                        Mark
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No students found matching your search.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
