"use client";
import React, { useRef, useState } from 'react';
import { UploadCloud, X, Check, Image as ImageIcon } from 'lucide-react';

/**
 * ImageUploadInput
 * Replaces old text URL input field with a 100% clickable upload field.
 * Preserves the exact same input element sizing, borders, and aesthetic,
 * so layout doesn't change, but clicking anywhere inside triggers file picker.
 */
export default function ImageUploadInput({
  value = '',
  file = null,
  previewUrl = '',
  onFileSelect,
  onClear,
  placeholder = 'ছবি আপলোড করতে এখানে ক্লিক করুন...',
  disabled = false,
  style = {}
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle native file selection
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const localPreview = URL.createObjectURL(selected);
      if (onFileSelect) {
        onFileSelect(selected, localPreview);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      const localPreview = URL.createObjectURL(droppedFile);
      if (onFileSelect) {
        onFileSelect(droppedFile, localPreview);
      }
    }
  };

  const hasImage = Boolean(file || value || previewUrl);
  const displayLabel = file 
    ? file.name 
    : (value && typeof value === 'string' && value.trim() ? 'বর্তমান ছবি সংরক্ষিত আছে (পরিবর্তন করতে ক্লিক করুন)' : placeholder);

  return (
    <div style={{ position: 'relative', width: '100%', flex: 1, ...style }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* Clickable Upload Field replacing the old URL input */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && fileInputRef.current) {
            e.preventDefault();
            fileInputRef.current.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          width: '100%',
          padding: '9px 12px',
          minHeight: '40px',
          borderRadius: 'var(--radius-md)',
          border: isDragging
            ? '1.5px dashed var(--primary)'
            : file
            ? '1.5px solid var(--primary)'
            : '1px solid var(--rule)',
          background: isDragging
            ? 'rgba(0, 108, 76, 0.06)'
            : file
            ? '#F0F9F5'
            : '#FFFFFF',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          userSelect: 'none',
          boxSizing: 'border-box'
        }}
        title="ডিভাইস থেকে ছবি আপলোড করতে ক্লিক করুন বা ছবি টেনে এনে ছেড়ে দিন"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
          {file ? (
            <Check size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
          ) : hasImage ? (
            <ImageIcon size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
          ) : (
            <UploadCloud size={16} color="var(--muted)" style={{ flexShrink: 0 }} />
          )}

          <span
            style={{
              fontSize: '13px',
              color: file ? 'var(--primary)' : hasImage ? 'var(--ink)' : 'var(--muted)',
              fontWeight: file ? 600 : 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {displayLabel}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Badge indicator */}
          <span
            onClick={() => {
              if (!disabled && fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '4px',
              background: file ? 'var(--primary)' : 'var(--rule)',
              color: file ? '#FFFFFF' : 'var(--ink)',
              fontWeight: 600,
              letterSpacing: '0.2px',
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
          >
            {file ? 'সিলেক্টেড' : 'আপলোড'}
          </span>

          {/* Clear button */}
          {hasImage && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
                if (onClear) onClear();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '4px'
              }}
              title="ছবি বাতিল করুন"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
