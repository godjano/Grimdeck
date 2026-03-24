import { useRef } from 'react';
import { db } from '../db';

export function PhotoUpload({ modelId, currentPhoto }: { modelId: number; currentPhoto?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      // Resize to max 400px to save storage
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const max = 400;
        const scale = Math.min(max / img.width, max / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        await db.models.update(modelId, { photoUrl: compressed });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="photo-upload">
      {currentPhoto ? (
        <div className="photo-preview">
          <img src={currentPhoto} alt="Model" />
          <button className="btn btn-sm btn-ghost" onClick={() => inputRef.current?.click()}>Change</button>
          <button className="btn btn-sm btn-danger" onClick={() => db.models.update(modelId, { photoUrl: '' })}>✕</button>
        </div>
      ) : (
        <button className="btn btn-sm btn-ghost" onClick={() => inputRef.current?.click()}>Add Photo</button>
      )}
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}
