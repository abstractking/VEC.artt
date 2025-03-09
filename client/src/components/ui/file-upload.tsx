import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onChange: (base64: string) => void;
  value: string | undefined;
  className?: string;
  accept?: string;
  maxSize?: number; // in MB
  previewWidth?: number;
  previewHeight?: number;
  label?: string;
  type?: "profile" | "cover" | "image";
}

export function FileUpload({
  onChange,
  value,
  className,
  accept = "image/*",
  maxSize = 5, // 5MB default
  previewWidth = 150,
  previewHeight = 150,
  label = "Choose a file",
  type = "image"
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setError(null);

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size too large. Maximum size is ${maxSize}MB.`);
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Make sure we have a base64 string
      if (typeof base64String === 'string' && base64String.startsWith('data:image/')) {
        console.log("Image successfully converted to base64");
        onChange(base64String);
      } else {
        console.error("Failed to convert image to base64 format");
        setError("Failed to process the image. Please try a different file.");
      }
    };
    reader.onerror = () => {
      console.error("FileReader error:", reader.error);
      setError("Failed to read the file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Adjust preview dimensions based on type
  const previewStyles = type === "cover" 
    ? { width: "100%", height: "100px", objectFit: "cover" as const } 
    : type === "profile"
    ? { width: "150px", height: "150px", objectFit: "cover" as const, borderRadius: "50%" }
    : { width: `${previewWidth}px`, height: `${previewHeight}px`, objectFit: "contain" as const };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
        aria-label="Upload file"
      />

      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            style={previewStyles}
            className="border rounded-md"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-secondary/50",
            type === "cover" && "h-[100px] flex flex-col justify-center",
            type === "profile" && "h-[150px] w-[150px] flex flex-col justify-center rounded-full"
          )}
        >
          <div className="flex flex-col items-center">
            {type === "profile" ? (
              <div className="rounded-full bg-background p-3 mb-2">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground mb-2" />
            )}
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-muted-foreground mt-1">
              or drag and drop
            </span>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}