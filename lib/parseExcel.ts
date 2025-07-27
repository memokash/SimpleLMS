import * as XLSX from "xlsx";
import { Question } from "../types/quiz";

export function parseExcelToQuestions(file: File): Promise<Question[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(sheet);

      const questions: Question[] = rows.map((row, idx) => ({
        id: `${idx}`,
        type: row["Type"] as any,
        question: row["Question"],
        options: [row["A"], row["B"], row["C"], row["D"]].filter(Boolean),
        correctAnswers: row["Correct"].split(",").map((x: string) => x.trim()),
      }));

      resolve(questions);
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}
