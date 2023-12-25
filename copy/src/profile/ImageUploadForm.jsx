import { useState } from "react";

function ImageUploadForm() {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // You can implement your upload logic here.
    if (selectedImage) {
      // Use the selectedImage for your upload process.
      console.log(selectedImage);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="imageInput"
          />
          <label htmlFor="imageInput" className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Select Image
          </label>
          {selectedImage && (
            <p className="mt-2">Selected Image: {selectedImage.name}</p>
          )}
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Upload Image
        </button>
      </form>
    </div>
  );
}

export default ImageUploadForm;