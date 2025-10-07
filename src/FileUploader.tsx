import { Upload } from "lucide-react";
import { useCallback } from "react";
import { Card } from "./ui/card";

interface FileUploaderProps {
  onFileUpload: (data: any[]) => void;
}

export const FileUploader = ({ onFileUpload }: FileUploaderProps) => {
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

        const data = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line) => {
            const values = line.split(",");
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index]?.trim();
            });
            return row;
          });

        onFileUpload(data);
      };
      reader.readAsText(file);
    },
    [onFileUpload]
  );

  return (
    <Card className="border-2 border-dashed border-muted hover:border-primary transition-colors duration-300">
      <label className="flex flex-col items-center justify-center px-8 py-12 cursor-pointer">
        <Upload className="w-12 h-12 mb-4 text-primary" />
        <span className="text-lg font-medium mb-2">Upload CSV File</span>
        <span className="text-sm text-muted-foreground text-center">
          Click to browse or drag and drop your OHLC data
        </span>
        <span className="text-xs text-muted-foreground mt-2">
          (Date, Open, High, Low, Close)
        </span>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>
    </Card>
  );
};
