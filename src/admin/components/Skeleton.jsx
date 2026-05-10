import React from "react";

const Skeleton = ({ width, height, rounded = false, count = 1 }) => {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`bg-white/5 animate-pulse ${rounded ? 'rounded-full' : 'rounded-lg'}`}
          style={{ width: width || '100%', height: height || '20px' }}
        />
      ))}
    </div>
  );
};

export default Skeleton;
