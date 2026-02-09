import { useEffect, useRef } from 'react';

interface Thread {
  id: number;
  x: number;
  y: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  layer: 'back' | 'mid' | 'hero';
}

interface FloatingThreadsProps {
  density?: 'minimal' | 'light' | 'medium';
  layer?: 'back' | 'mid' | 'hero';
}

const FloatingThreads = ({ density = 'light', layer = 'back' }: FloatingThreadsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threadsRef = useRef<Thread[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Thread count based on density
    const threadCount = {
      minimal: 3,
      light: 5,
      medium: 8
    }[density];

    // Opacity based on layer
    const baseOpacity = {
      back: 0.05,
      mid: 0.08,
      hero: 0.12
    }[layer];

    // Initialize threads
    const initThreads = () => {
      threadsRef.current = Array.from({ length: threadCount }, (_, i) => ({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 100 + Math.random() * 200,
        angle: Math.random() * Math.PI * 2,
        speed: 0.0002 + Math.random() * 0.0003, // Very slow
        opacity: baseOpacity + Math.random() * 0.03,
        layer
      }));
    };
    initThreads();

    // Animation loop
    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 1;

      threadsRef.current.forEach((thread) => {
        // Gentle drift motion
        const driftX = Math.sin(time * thread.speed) * 50;
        const driftY = Math.cos(time * thread.speed * 0.7) * 30;
        
        const startX = thread.x + driftX;
        const startY = thread.y + driftY;
        const endX = startX + Math.cos(thread.angle) * thread.length;
        const endY = startY + Math.sin(thread.angle) * thread.length;

        // Create gradient for thread
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        
        // Use brand gold color (hsl(36, 40%, 58%)) converted to rgba
        const brandGold = `rgba(198, 174, 136, ${thread.opacity})`;
        const transparent = `rgba(198, 174, 136, 0)`;
        
        gradient.addColorStop(0, transparent);
        gradient.addColorStop(0.5, brandGold);
        gradient.addColorStop(1, transparent);

        // Draw thread with soft curves
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        // Add gentle curve using quadratic bezier
        const controlX = (startX + endX) / 2 + Math.sin(time * thread.speed * 2) * 20;
        const controlY = (startY + endY) / 2 + Math.cos(time * thread.speed * 2) * 20;
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.5; // Hairline thickness
        ctx.lineCap = 'round';
        ctx.filter = 'blur(0.5px)'; // Slight blur for depth
        ctx.stroke();
        ctx.filter = 'none';

        // Slowly rotate thread
        thread.angle += thread.speed * 0.5;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [density, layer]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: layer === 'back' ? 0 : layer === 'mid' ? 10 : 5,
        mixBlendMode: 'normal'
      }}
    />
  );
};

export default FloatingThreads;
