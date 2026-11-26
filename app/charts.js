// HomeLedger charts: small hand-rolled canvas charts, no libraries.
// drawDonut renders a spending-by-category ring with a total in the middle;
// drawBars renders a vertical bar chart (monthly totals or one month's
// categories). Both scale for high-DPI screens and draw nothing when the
// canvas is hidden, so a page that never shows a chart costs nothing.

function setupCanvas(canvas, cssWidth, cssHeight) {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(cssWidth * ratio);
  canvas.height = Math.round(cssHeight * ratio);
  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return ctx;
}

function drawDonut(canvas, slices, centerLabel, centerValue) {
  if (!canvas) return;
  const box = canvas.parentElement.getBoundingClientRect();
  const size = Math.max(180, Math.min(230, Math.floor(box.width) || 230));
  const ctx = setupCanvas(canvas, size, size);
  const cx = size / 2;
  const cy = size / 2;
  const outer = size / 2 - 8;
  const inner = outer - 34;
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) {
    ctx.fillStyle = '#9a938a';
    ctx.font = '15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No spending yet', cx, cy);
    return;
  }
  let angle = -Math.PI / 2;
  for (const slice of slices) {
    const sweep = (slice.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    angle += sweep;
  }
  // Cut out the middle, then label it with the month's total.
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#2b2620';
  ctx.font = '700 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(centerLabel, cx, cy - 8);
  ctx.font = '700 20px system-ui, sans-serif';
  ctx.fillText(centerValue, cx, cy + 18);
}

function drawBars(canvas, bars, options) {
  if (!canvas) return;
  const opts = options || {};
  const box = canvas.parentElement.getBoundingClientRect();
  const width = Math.max(280, Math.floor(box.width) || 520);
  const height = opts.height || 240;
  const ctx = setupCanvas(canvas, width, height);
  const padLeft = 56;
  const padBottom = 30;
  const padTop = 14;
  const chartWidth = width - padLeft - 16;
  const chartHeight = height - padTop - padBottom;
  const max = Math.max.apply(null, bars.map((b) => b.value).concat([1]));
  const niceMax = Math.ceil(max / 500) * 500;
  // Gridlines and value labels.
  ctx.strokeStyle = '#e6ded2';
  ctx.fillStyle = '#7a7268';
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'right';
  for (let step = 0; step <= 4; step++) {
    const value = (niceMax * step) / 4;
    const y = padTop + chartHeight - (chartHeight * step) / 4;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - 16, y);
    ctx.stroke();
    ctx.fillText('$' + Math.round(value).toLocaleString('en-US'), padLeft - 8, y + 4);
  }
  // Bars with month/category labels.
  const slot = chartWidth / bars.length;
  const barWidth = Math.min(56, slot * 0.6);
  ctx.textAlign = 'center';
  bars.forEach((bar, index) => {
    const barHeight = (bar.value / niceMax) * chartHeight;
    const x = padLeft + slot * index + (slot - barWidth) / 2;
    const y = padTop + chartHeight - barHeight;
    ctx.fillStyle = bar.color || '#2e7d5b';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, barWidth, barHeight, [5, 5, 0, 0]);
    else ctx.rect(x, y, barWidth, barHeight);
    ctx.fill();
    ctx.fillStyle = '#2b2620';
    ctx.font = '700 12px system-ui, sans-serif';
    ctx.fillText(moneyShort(bar.value), x + barWidth / 2, y - 6);
    ctx.fillStyle = '#7a7268';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(bar.label, x + barWidth / 2, height - 10);
  });
}

// A thin horizontal progress bar, drawn as HTML so text stays selectable.
// Returns the element's HTML; the caller drops it into a budget or goal card.
function progressBarHTML(used, limit, color) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const over = used > limit;
  const barColor = over ? '#c0392b' : color || '#2e7d5b';
  return (
    '<div class="bar-track" role="progressbar" aria-valuenow="' + pct +
    '" aria-valuemin="0" aria-valuemax="100" aria-label="' + pct + '% used">' +
    '<div class="bar-fill" style="width:' + pct + '%;background:' + barColor + '"></div></div>'
  );
}
