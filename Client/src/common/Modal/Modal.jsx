// import React, { useEffect, useRef } from 'react';

// const Modal = ({ isOpen, onClose, title, children, size = 'md', width }) => {
//   const modalRef = useRef(null);
  
//   const sizeClasses = {
//     sm: 'max-w-sm',
//     md: 'max-w-md',
//     lg: 'max-w-lg',
//     xl: 'max-w-xl',
//     '2xl': 'max-w-2xl',
//     full: 'w-full max-w-full',
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (modalRef.current && !modalRef.current.contains(event.target)) {
//         onClose();
//       }
//     };

//     const handleEscape = (event) => {
//       if (event.key === 'Escape') {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//       document.addEventListener('keydown', handleEscape);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//       document.removeEventListener('keydown', handleEscape);
//     };
//   }, [isOpen, onClose]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-200 p-4">
//       <div 
//         ref={modalRef}
//         style={width ? { width } : {}}
//         className={`bg-white rounded-lg shadow-xl ${
//           width ? '' : sizeClasses[size] || 'max-w-md'
//         } w-full`}
//       >
//         <div className="flex justify-between items-center p-6 pb-2 border-b">
//           <h3 className="text-lg font-medium text-gray-900">{title}</h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-500 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
//             aria-label="Close modal"
//           >
//             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>
        
//         <div className="p-6 max-h-[80vh] overflow-y-auto">
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Modal;











import React, { useEffect, useRef } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  width, 
  headerRight, 
  createdBy, // New prop
  modifiedBy, // New prop
}) => {
  const modalRef = useRef(null);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'w-full max-w-full',
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-200 p-4">
      <div 
        ref={modalRef}
        style={width ? { width } : {}}
        className={`bg-white rounded-lg shadow-xl ${
          width ? '' : sizeClasses[size] || 'max-w-md'
        } w-full`}
      >
        <div className="flex justify-between items-center p-6 pb-2 border-b">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className="flex items-center space-x-4">
            {/* Conditional rendering for Created By and Modified By */}
            {(createdBy || modifiedBy) && (
              <div className="text-sm text-gray-500 flex space-x-4">
                {createdBy && (
                  <div>
                    <span className="font-semibold">Created by:</span> {createdBy}
                  </div>
                )}
                {modifiedBy && (
                  <div>
                    <span className="font-semibold">Modified by:</span> {modifiedBy}
                  </div>
                )}
              </div>
            )}
            {headerRight && (
              <div className="text-sm text-gray-500">
                {headerRight}
              </div>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;








