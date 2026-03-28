'use client';

import Spline from '@splinetool/react-spline';
import { useState } from 'react';

interface ThreeDProps {
  className?: string;
  sceneUrl?: string;
}

const ThreeD = ({ className = "", sceneUrl = "https://prod.spline.design/KFonZGtsoUXP-qx7/scene.splinecode" }: ThreeDProps) => {
  const [hasError, setHasError] = useState(false);

  const handleError = (error: Error | unknown) => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 p-8">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
          </div>
          <h3 className="text-lg font-semibold mb-2">3D Model Unavailable</h3>
          <p className="text-sm text-gray-600">
            Sorry, the 3D model couldn&apos;t be loaded at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Spline 
        scene={sceneUrl} 
        onError={handleError}
      />
    </div>
  );
};

export default ThreeD;