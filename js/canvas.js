// HTML Canvas Charts Logic
const CanvasChart = {
    drawCircularChart: (canvasId, percentage, color) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.lineWidth = 15;
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)';
        ctx.stroke();

        // Calculate end angle based on percentage
        const endAngle = (percentage / 100) * 2 * Math.PI;

        // Draw progress circle
        ctx.beginPath();
        // Start from top (-Math.PI / 2)
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, (-Math.PI / 2) + endAngle, false);
        ctx.lineWidth = 15;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color || getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
        ctx.stroke();

        // Draw text
        ctx.font = 'bold 30px Outfit, sans-serif';
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${percentage}%`, centerX, centerY);
    }
};
