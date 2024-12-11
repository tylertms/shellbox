import { directionalLight } from "../render/scene";

const draggable = document.getElementById('draggable');
const outer = document.querySelector('.outer-circle');


let isDragging = false;
let startX, startY;
let initialLeft, initialTop;


const outerRect = outer.getBoundingClientRect();
const outerRadius = outerRect.width / 2;
const innerRadius = draggable.offsetWidth / 2;


const center = {
  x: outerRadius,
  y: outerRadius
};

draggable.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', dragging);
document.addEventListener('mouseup', dragEnd);

draggable.addEventListener('touchstart', dragStart, { passive: false });
document.addEventListener('touchmove', dragging, { passive: false });
document.addEventListener('touchend', dragEnd);

function dragStart(e) {
  e.preventDefault();
  isDragging = true;
  
  if (e.type === 'mousedown') {
    startX = e.clientX;
    startY = e.clientY;
  } else if (e.type === 'touchstart') {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }
  
  const rect = draggable.getBoundingClientRect();
  initialLeft = rect.left - outerRect.left;
  initialTop = rect.top - outerRect.top;
}

function dragging(e) {
  if (!isDragging) return;

  e.preventDefault();

  let currentX, currentY;

  if (e.type === 'mousemove') {
    currentX = e.clientX;
    currentY = e.clientY;
  } else if (e.type === 'touchmove') {
    currentX = e.touches[0].clientX;
    currentY = e.touches[0].clientY;
  }

  const dx = currentX - startX;
  const dy = currentY - startY;

  let newLeft = initialLeft + dx;
  let newTop = initialTop + dy;

  const distance = Math.sqrt(
    Math.pow(newLeft + innerRadius - center.x, 2) +
    Math.pow(newTop + innerRadius - center.y, 2)
  );

  const maxDistance = outerRadius - innerRadius;

  if (distance > maxDistance) {
    const angle = Math.atan2(newTop + innerRadius - center.y, newLeft + innerRadius - center.x);
    newLeft = center.x + Math.cos(angle) * maxDistance - innerRadius - 2;
    newTop = center.y + Math.sin(angle) * maxDistance - innerRadius - 2;
  }

  
  draggable.style.left = `${newLeft}px`;
  draggable.style.top = `${newTop}px`;
  
  const scale = 1.2
  directionalLight.position.set((newLeft - 39) / scale, 20, (newTop - 38) / scale / 0.95);
}

function dragEnd() {
  isDragging = false;
}