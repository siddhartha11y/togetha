// src/components/PostForm.jsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

/**
 * Reusable Post form with your original dark styling.
 * - Works for both Create and Edit flows
 * - Shows existing image (when editing) + live preview when a new file is chosen
 *
 * Props:
 *  - initialValues?: { title, imageUrl }
 *  - onSubmit: (FormData) => Promise<any>
 *  - submitLabel: string (e.g., "Post", "Update")
 *  - heading?: string (optional custom heading, otherwise derived from submitLabel)
 */
export default function PostForm({ initialValues, onSubmit, submitLabel = "Post", heading }) {
  const [form, setForm] = useState({
    title: initialValues?.title || "",
    image: null, // new file
  });

  const [previewUrl, setPreviewUrl] = useState(null); // preview of newly selected file

  // existing image (for edit) displayed if no new file chosen
  const existingImageUrl = useMemo(() => initialValues?.imageUrl || null, [initialValues]);

  useEffect(() => {
    // cleanup object URL when component unmounts or when a new image is selected
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files?.[0]) {
      const file = files[0];
      setForm((prev) => ({ ...prev, image: file }));
      // live preview
      const nextPreview = URL.createObjectURL(file);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return nextPreview;
      });
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      if (form.image) {
        formData.append("image", form.image);
      }
      await onSubmit(formData);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  // Derive heading if not provided
  const derivedHeading =
    heading || (submitLabel.toLowerCase().includes("update") || submitLabel.toLowerCase().includes("edit")
      ? "Edit Post"
      : "Create Post");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white relative overflow-hidden">
      {/* Left Illustration */}
      <img
        src="https://undraw.co/api/illustrations/random?color=6C63FF"
        alt="illustration"
        className="absolute left-0 top-1/2 -translate-y-1/2 w-64 opacity-30 pointer-events-none"
      />

      {/* Right Illustration */}
      <img
        src="https://undraw.co/api/illustrations/random?color=FF6584"
        alt="illustration"
        className="absolute right-0 top-1/2 -translate-y-1/2 w-64 opacity-30 pointer-events-none"
      />

      {/* Form Card (your exact styling) */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-lg relative z-10 border border-gray-700 hover:shadow-[0_0_20px_#6C63FF] transition-all duration-300"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">{derivedHeading}</h2>

        <input
          type="text"
          name="title"
          placeholder="Post Title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none transition"
          required
        />

        {/* Image input */}
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-gray-700 rounded-lg border border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-white file:bg-purple-600 hover:file:bg-purple-700 transition"
        />

        {/* Image preview area */}
        {(previewUrl || existingImageUrl) && (
          <div className="mb-4">
            <p className="text-sm text-gray-300 mb-2">Preview:</p>
            <img
              src={previewUrl || existingImageUrl}
              alt="preview"
              className="w-full max-h-64 object-cover rounded-lg border border-gray-700"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-purple-600 py-3 rounded-lg hover:bg-purple-700 transition-all duration-300 shadow-[0_0_10px_#6C63FF] hover:shadow-[0_0_20px_#6C63FF] font-semibold"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
