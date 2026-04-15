'use client'

import { useEffect, useRef } from "react";

const FONT_SIZE = 16;
const TICK_MS = 100;
const SPAWN_CHANCE = 0.03;
const MAX_TRAIL = 20;
const FADE_ALPHA = 0.12;

function MatrixRain({
                        brightColor = "#0f0",
                        dimColor = "#0a0",
                        bgColor = "#000",
                        glowColor = "#0f0",
                        className = ""
                    }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animId = 0;
        let lastTick = 0;
        let columns = 0;
        let drops = [];
        let chars = [];

        const randomDigit = () => String(Math.floor(Math.random() * 10));

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;

            const dpr = window.devicePixelRatio || 1;
            const w = parent.clientWidth;
            const h = parent.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const newCols = Math.floor(w / FONT_SIZE);

            if (newCols !== columns) {
                const oldDrops = drops;
                const oldChars = chars;
                drops = new Array(newCols).fill(-1);
                chars = new Array(newCols).fill(null).map(() => []);

                for (let i = 0; i < Math.min(newCols, oldDrops.length); i++) {
                    drops[i] = oldDrops[i];
                    chars[i] = oldChars[i] || [];
                }
                columns = newCols;
            }

            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, w, h);
        };

        resize();
        window.addEventListener("resize", resize);

        const tick = () => {
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.width / dpr;
            const h = canvas.height / dpr;
            const maxRow = Math.floor(h / FONT_SIZE);

            ctx.fillStyle = bgColor;
            ctx.globalAlpha = FADE_ALPHA;
            ctx.fillRect(0, 0, w, h);
            ctx.globalAlpha = 1;

            ctx.font = `${FONT_SIZE}px monospace`;
            ctx.textBaseline = "top";

            for (let i = 0; i < columns; i++) {
                if (drops[i] < 0) {
                    if (Math.random() < SPAWN_CHANCE) {
                        drops[i] = 0;
                        chars[i] = [];
                    }
                    continue;
                }

                const x = i * FONT_SIZE;
                const digit = randomDigit();
                chars[i][drops[i]] = digit;

                ctx.shadowColor = glowColor;
                ctx.shadowBlur = 10;
                ctx.fillStyle = brightColor;
                ctx.fillText(digit, x, drops[i] * FONT_SIZE);
                ctx.shadowBlur = 0;

                if (drops[i] > 0 && chars[i][drops[i] - 1]) {
                    ctx.fillStyle = dimColor;
                    ctx.fillText(chars[i][drops[i] - 1], x, (drops[i] - 1) * FONT_SIZE);
                }

                drops[i]++;

                if (drops[i] >= maxRow + MAX_TRAIL) {
                    drops[i] = -1;
                    chars[i] = [];
                }
            }
        };

        const loop = (ts) => {
            animId = requestAnimationFrame(loop);
            if (ts - lastTick >= TICK_MS) {
                lastTick = ts;
                tick();
            }
        };

        animId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, [brightColor, dimColor, bgColor, glowColor]);

    return (
        <div className={`absolute inset-0 -z-[1] overflow-hidden ${className}`} style={{ background: bgColor }}>
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
}

export default MatrixRain;