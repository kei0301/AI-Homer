import React, { useRef, useEffect } from 'react';

let ROWS;
let COLS;

const NUM_PARTICLES = ( ( ROWS = 100 ) * ( COLS = 190 ) );
const THICKNESS = Math.pow( 400, 2 );
const SPACING = 20;
const MARGIN = 0;
const COLOR = 300;
const DRAG = 0.2;
const EASE = 0.25;

const particle = {
  vx: 0,
  vy: 0,
  x: 0,
  y: 0
};

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  let ctx, list, mx, my, man;

  useEffect(() => {
    const init = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      ctx = canvas.getContext('2d');
      man = false;
      list = [];

      const w = canvas.width = COLS * SPACING + MARGIN * 2;
      const h = canvas.height = ROWS * SPACING + MARGIN * 2;

      container.style.marginLeft = Math.round(w * -0.5) + 'px';
      container.style.marginTop = Math.round(h * -0.5) + 'px';

      for (let i = 0; i < NUM_PARTICLES; i++) {
        const p = Object.create(particle);
        p.x = p.ox = MARGIN + SPACING * (i % COLS);
        p.y = p.oy = MARGIN + SPACING * Math.floor(i / COLS);
        list[i] = p;
      }

      container.addEventListener('mousemove', function (e) {
        const bounds = container.getBoundingClientRect();
        mx = e.clientX - bounds.left;
        my = e.clientY - bounds.top;
        man = true;
      });

      step();
    };

    const step = () => {
      if (man) {
        const t = +new Date() * 0.001;
        mx = canvasRef.current.width * 0.5 + (Math.cos(t * 2.1) * Math.cos(t * 0.9) * canvasRef.current.width * 0.45);
        my = canvasRef.current.height * 0.5 + (Math.sin(t * 3.2) * Math.tan(Math.sin(t * 0.8)) * canvasRef.current.height * 0.45);
      }

      for (let i = 0; i < NUM_PARTICLES; i++) {
        const p = list[i];
        const dx = mx - p.x;
        const dy = my - p.y;
        const d = dx * dx + dy * dy;
        let f = -THICKNESS / d;

        if (d < THICKNESS) {
          const t = Math.atan2(dy, dx);
          p.vx += f * Math.cos(t);
          p.vy += f * Math.sin(t);
        }

        p.x += (p.vx *= DRAG) + (p.ox - p.x) * EASE;
        p.y += (p.vy *= DRAG) + (p.oy - p.y) * EASE;
      }

      draw();
      requestAnimationFrame(step);
    };

    const draw = () => {
      const imageData = ctx.createImageData(canvasRef.current.width, canvasRef.current.height);
      const data = imageData.data;

      for (let i = 0; i < NUM_PARTICLES; i++) {
        const p = list[i];
        const n = (~~p.x + (~~p.y * canvasRef.current.width)) * 4;
        data[n] = data[n + 1] = data[n + 2] = COLOR;
        data[n + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);
    };

    init();

    // Cleanup event listener on unmount
    return () => {
      containerRef.current.removeEventListener('mousemove');
    };
  }, []);

  return (
    <div ref={containerRef} id="container">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ParticleCanvas;
