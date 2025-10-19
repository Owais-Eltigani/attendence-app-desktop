"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, BookOpen } from "lucide-react";

interface SessionFormProps {
  sessionData: {
    subjectName: string;
    classroomNo: string;
    section: string;
    semester: string;
  };
  setSessionData: (data: any) => void;
  onCreateSession: () => void;
}

export function SessionForm({
  sessionData,
  setSessionData,
  onCreateSession,
}: SessionFormProps) {
  const handleInputChange = (field: string, value: string) => {
    setSessionData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    sessionData.subjectName &&
    sessionData.classroomNo &&
    sessionData.section &&
    sessionData.semester;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Create New Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subject Name */}
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-sm font-medium">
            Subject Name
          </Label>
          <Input
            id="subject"
            placeholder="Enter Course id/name"
            value={sessionData.subjectName}
            onChange={(e) => handleInputChange("subjectName", e.target.value)}
            className="w-full"
          />
        </div>

        {/* Classroom Number */}
        <div className="space-y-2">
          <Label htmlFor="classroom" className="text-sm font-medium">
            Classroom No.
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="classroom"
              placeholder="Enter classroom number"
              value={sessionData.classroomNo}
              onChange={(e) => handleInputChange("classroomNo", e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Section Dropdown */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Section</Label>
          <Select
            value={sessionData.section}
            onValueChange={(value) => handleInputChange("section", value)}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select section" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Section A</SelectItem>
              <SelectItem value="B">Section B</SelectItem>
              <SelectItem value="C">Section C</SelectItem>
              <SelectItem value="D">Section D</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Semester Dropdown */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Semester</Label>
          <Select
            value={sessionData.semester}
            onValueChange={(value) => handleInputChange("semester", value)}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select semester" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1st Semester</SelectItem>
              <SelectItem value="2">2nd Semester</SelectItem>
              <SelectItem value="3">3rd Semester</SelectItem>
              <SelectItem value="4">4th Semester</SelectItem>
              <SelectItem value="5">5th Semester</SelectItem>
              <SelectItem value="6">6th Semester</SelectItem>
              <SelectItem value="7">7th Semester</SelectItem>
              <SelectItem value="8">8th Semester</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Create Session Button */}
        <Button
          onClick={onCreateSession}
          disabled={!isFormValid}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
          onPress={() => console.log("Create Session")}
        >
          Create Session & Generate QR Code
        </Button>
      </CardContent>
    </Card>
  );
}
