export function drawWheel({ canvas, ctx, characters, colors }) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (characters.length === 0) return;

    const sliceAngle = (2 * Math.PI) / characters.length;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;

    characters.forEach((character, index) => {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, index * sliceAngle, (index + 1) * sliceAngle);
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(index * sliceAngle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#e4d5b7";
        ctx.font = "12px 'Poppins', sans-serif";
        ctx.fillText(character.isim, radius - 15, 4);
        ctx.restore();
    });
}

export function getWinningCharacter(characters, currentRotation) {
    if (characters.length === 0) return null;

    const actualRotation = currentRotation % 360;
    const sliceDegree = 360 / characters.length;
    const winningIndex = Math.floor(((360 - actualRotation + 270) % 360) / sliceDegree);

    return characters[winningIndex];
}

