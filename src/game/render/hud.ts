export const fx_drawHUD = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  integrity: number,
  cash: number,
  stars: number,
  boost: number,
  speed: number
): void => {
  // Integrity bar (top left)
  const barWidth = 180;
  const barHeight = 20;
  const barX = 20;
  const barY = 20;

  ctx.fillStyle = '#222';
  ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
  ctx.fillStyle = '#444';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  const integrityColor = integrity > 50 ? '#2ecc71' : integrity > 25 ? '#f1c40f' : '#e74c3c';
  ctx.fillStyle = integrityColor;
  ctx.fillRect(barX, barY, barWidth * (integrity / 100), barHeight);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`INTEGRITY: ${Math.round(integrity)}%`, barX + 4, barY + 15);

  // Cash (top right)
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`$${cash.toLocaleString()}`, width - 20, 38);
  ctx.textAlign = 'left';

  // Wanted stars
  const starSize = 22;
  const starY = 60;
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < stars ? '#f1c40f' : '#333';
    drawStar(ctx, width - 30 - i * 28, starY, starSize / 2);
  }

  // Boost bar (bottom left)
  const boostBarWidth = 120;
  const boostBarHeight = 12;
  const boostX = 20;
  const boostY = height - 40;

  ctx.fillStyle = '#222';
  ctx.fillRect(boostX - 2, boostY - 2, boostBarWidth + 4, boostBarHeight + 4);
  ctx.fillStyle = '#333';
  ctx.fillRect(boostX, boostY, boostBarWidth, boostBarHeight);
  ctx.fillStyle = '#00bfff';
  ctx.fillRect(boostX, boostY, boostBarWidth * (boost / 100), boostBarHeight);

  ctx.fillStyle = '#fff';
  ctx.font = '10px monospace';
  ctx.fillText('NITRO', boostX + 4, boostY + 10);

  // Speed indicator
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`${Math.round(speed * 10)} MPH`, 20, height - 60);
};

const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void => {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
};
