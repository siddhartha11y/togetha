import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  RotateCw, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Crop, 
  Download,
  Check,
  ArrowLeft,
  Maximize
} from "lucide-react";

export default function ImageEditor({ imageUrl, isOpen, onClose, onSave }) {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Reset values when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setCropMode(false);
    }
  }, [isOpen]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.1));
  };

  const handleFitToScreen = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    // In a real implementation, you would apply the transformations to the image
    // For now, we'll just close the modal and call onSave
    onSave && onSave({
      zoom,
      rotation,
      position,
      cropArea: cropMode ? cropArea : null
    });
    onClose();
  };

  const resetTransforms = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setCropMode(false);
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 100000, pointerEvents: 'auto' }}
      onClick={onClose}
    >
      {/* Blurred Background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      
      {/* Image Editor Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 w-full h-full max-w-7xl max-h-screen p-2 sm:p-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-t-2xl p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </motion.button>
            <h2 className="text-white font-semibold text-lg">Edit Image</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTransforms}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Reset
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Check size={16} />
              Apply
            </motion.button>
          </div>
        </div>

        {/* Image Container */}
        <div 
          ref={containerRef}
          className="flex-1 bg-gray-900/95 backdrop-blur-sm relative overflow-hidden flex items-center justify-center p-4"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ minHeight: '60vh' }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.img
              ref={imageRef}
              src={imageUrl}
              alt="Edit preview"
              className="max-w-full max-h-full object-contain cursor-move select-none shadow-2xl"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease',
                maxWidth: '90vw',
                maxHeight: '70vh'
              }}
              onMouseDown={handleMouseDown}
              draggable={false}
            />
            
            {/* Crop overlay */}
            {cropMode && (
              <div 
                className="absolute border-2 border-white border-dashed bg-black/20 pointer-events-none"
                style={{
                  left: `${cropArea.x}%`,
                  top: `${cropArea.y}%`,
                  width: `${cropArea.width}%`,
                  height: `${cropArea.height}%`
                }}
              />
            )}
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-b-2xl p-4 flex flex-wrap items-center justify-center gap-4 border-t border-gray-700 min-h-[80px]">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomOut}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <ZoomOut size={20} />
            </motion.button>
            <span className="text-white text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomIn}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <ZoomIn size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFitToScreen}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
              title="Fit to screen"
            >
              <Maximize size={20} />
            </motion.button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-700"></div>

          {/* Rotation Controls */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRotateLeft}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <RotateCcw size={20} />
            </motion.button>
            <span className="text-white text-sm w-12 text-center">{rotation}°</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRotateRight}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <RotateCw size={20} />
            </motion.button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-700"></div>

          {/* Crop Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCropMode(!cropMode)}
            className={`p-2 rounded-full transition-colors ${
              cropMode 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
            }`}
          >
            <Crop size={20} />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  // Create a portal container if it doesn't exist
  let portalContainer = document.getElementById('image-editor-portal');
  if (!portalContainer) {
    portalContainer = document.createElement('div');
    portalContainer.id = 'image-editor-portal';
    portalContainer.style.position = 'fixed';
    portalContainer.style.top = '0';
    portalContainer.style.left = '0';
    portalContainer.style.width = '100%';
    portalContainer.style.height = '100%';
    portalContainer.style.zIndex = '100000';
    portalContainer.style.pointerEvents = 'none';
    document.body.appendChild(portalContainer);
  }
  
  return createPortal(modalContent, portalContainer);
}
