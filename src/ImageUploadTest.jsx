import { useState } from 'react';
import { supabase } from './supabase';

function ImageUploadTest() {
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');

  async function uploadImage(event) {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image must be smaller than 5 MB.');
      return;
    }

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const { error } = await supabase.storage
      .from('findit-images')
      .upload(fileName, file);

    if (error) {
      setMessage('Upload failed: ' + error.message);
      return;
    }

    const { data } = supabase.storage
      .from('findit-images')
      .getPublicUrl(fileName);

    setImageUrl(data.publicUrl);
    setMessage('Image uploaded successfully!');
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>FindIt AI - Image Upload Test</h2>

      <input
        type="file"
        accept="image/*"
        onChange={uploadImage}
      />

      <p>{message}</p>

      {imageUrl && (
        <div>
          <h3>Uploaded Image:</h3>
          <img
            src={imageUrl}
            alt="Uploaded item"
            width="200"
          />
        </div>
      )}
    </div>
  );
}

export default ImageUploadTest;