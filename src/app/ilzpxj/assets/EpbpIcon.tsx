import React from 'react';

const EpbpIcon = ({ width = 110, height = 40, color = 'currentColor', ...props }) => {
  return (
    <React.Fragment>
      <svg
        width={width}
        height={height}
        stroke={color}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <g>
          <ellipse stroke="#58aa34" ry="15.0625" rx="15.0625" id="svg_16" cy="20" cx="24.06562" strokeWidth="0" fill="#2563eb" />
          <path transform="rotate(104.846 26.8855 20.6936)" stroke="#ffffff" id="svg_32" d="m17.33143,28.12356l9.55402,-14.86l9.55402,14.86l-19.10805,0z" strokeWidth="2" fill="none" />
          <text strokeWidth="0" fontWeight="bold" textAnchor="start" fontFamily="Noto Sans JP" fontSize="18" id="svg_35" y="26.095" x="46.78715" stroke="#2563eb" fill="#111827">E</text>
          <text fontWeight="bold" textAnchor="start" fontFamily="Noto Sans JP" fontSize="18" id="svg_38" y="26.095" x="62.04567" strokeWidth="0" stroke="#2563eb" fill="#2563eb">P</text>
          <text fontWeight="bold" textAnchor="start" fontFamily="Noto Sans JP" fontSize="18" id="svg_39" y="26.095" x="76.29536" strokeWidth="0" stroke="#2563eb" fill="#111827">B</text>
          <text fontWeight="bold" textAnchor="start" fontFamily="Noto Sans JP" fontSize="18" id="svg_40" y="26.095" x="91.17556" strokeWidth="0" stroke="#2563eb" fill="#2563eb">P</text>
        </g>
      </svg>
    </React.Fragment>
  );
};

export default EpbpIcon;