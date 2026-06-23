function project3D(x, y, z) {
  return {
    x: x + z * 0.45,
    y: y - z * 0.28
  };
}

function drawCube(ctx, x, y, w, h, d, fillColor) {
  const a = project3D(x, y, 0);
  const b = project3D(x + w, y, 0);
  const c = project3D(x + w, y + h, 0);
  const d0 = project3D(x, y + h, 0);
  const e = project3D(x, y, d);
  const f = project3D(x + w, y, d);
  const g = project3D(x + w, y + h, d);
  const h0 = project3D(x, y + h, d);

  ctx.fillStyle = fillColor;
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.lineTo(d0.x, d0.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.moveTo(e.x, e.y);
  ctx.lineTo(f.x, f.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(a.x, a.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.moveTo(b.x, b.y);
  ctx.lineTo(f.x, f.y);
  ctx.lineTo(g.x, g.y);
  ctx.lineTo(c.x, c.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawShadow(ctx, x, y, width) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(x, y, width, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
