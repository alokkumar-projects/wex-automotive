import { useSpring, useMotionValue } from 'framer-motion';

function physicsForAcceleration(acc) {
  const a = Math.max(8, Math.min(25, acc ?? 16));
  const t = (25 - a) / (25 - 8);
  const stiffness = 80 + t * 220;
  const damping = 30 - t * 15;
  return { stiffness, damping };
}

export function useVehicleParallax(acceleration) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const { stiffness, damping } = physicsForAcceleration(acceleration);
  const tx = useSpring(mx, { stiffness, damping });
  const ty = useSpring(my, { stiffness, damping });

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    mx.set(dx * 30);
    my.set(dy * 30);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return {
    motionStyle: { x: tx, y: ty },
    eventHandlers: { onMouseMove: onMove, onMouseLeave: onLeave },
  };
}