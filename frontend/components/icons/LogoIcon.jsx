import React from 'react';

export const LogoIcon = (props) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props} fill="currentColor">
    <defs>
      <path
        id="textCircleTop"
        d="M 30, 100 a 70,70 0 1,1 140,0"
        fill="transparent"
      />
      <path
        id="textCircleBottom"
        d="M 170, 100 a 70,70 0 1,1 -140,0"
        fill="transparent"
      />
    </defs>
    
    <path
      d="M45,100 h15 l10,-15 l10,25 l10,-20 l10,10 l5,-5 c5,-15 25,-15 30,0 l0,0"
      stroke="currentColor"
      fill="none"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    <text style={{ fontSize: '24px', letterSpacing: '3px', fontFamily: 'sans-serif' }}>
      <textPath href="#textCircleTop" startOffset="50%" textAnchor="middle">
        meetocure
      </textPath>
    </text>
    <text style={{ fontSize: '24px', letterSpacing: '3px', fontFamily: 'sans-serif' }}>
      <textPath href="#textCircleBottom" startOffset="50%" textAnchor="middle">
        meetocure
      </textPath>
    </text>

    <circle cx="26" cy="100" r="7" />
    <circle cx="174" cy="100" r="7" />
  </svg>
);
