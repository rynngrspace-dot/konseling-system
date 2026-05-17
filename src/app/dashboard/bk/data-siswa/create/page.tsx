import { StudentConsole } from "./console";

export default async function CreateStudentPage() {
  return (
    <StudentConsole
      initialStudent={null}
      initialSiswaId=""
    />
  );
}
