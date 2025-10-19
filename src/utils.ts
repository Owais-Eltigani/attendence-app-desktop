export const validateSessionFormData = ({
  subjectName,
  classroomNo,
  section,
  semester,
}: {
  subjectName: string;
  classroomNo: string;
  section: string;
  semester: string;
}) => {
  return subjectName && classroomNo && section && semester;
};
