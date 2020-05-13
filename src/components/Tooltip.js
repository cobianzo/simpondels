import React from 'react'
import '../css/Tooltip.scss';

function Tooltip({ tooltipMsg }) {

  if (!tooltipMsg) return null;
  return (
    <div className='Tooltip'>
      {tooltipMsg}
    </div>
  );
}

export default Tooltip;
