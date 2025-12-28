import React, { useEffect, useRef } from 'react';

const CursorEffect = () => {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const mouse = useRef({ x: 0, y: 0 });
    const animationFrameId = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle class
        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                this.life = 1;
                this.decay = Math.random() * 0.01 + 0.01;
                this.color = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life -= this.decay;
                this.size *= 0.98;
            }

            draw(ctx) {
                ctx.save();
                ctx.globalAlpha = this.life;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Mouse move handler
        const handleMouseMove = (e) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;

            // Create new particles
            for (let i = 0; i < 3; i++) {
                particles.current.push(new Particle(e.clientX, e.clientY));
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particles.current = particles.current.filter(particle => {
                particle.update();
                particle.draw(ctx);
                return particle.life > 0 && particle.size > 0.1;
            });

            // Draw glow around cursor
            if (particles.current.length > 0) {
                const gradient = ctx.createRadialGradient(
                    mouse.current.x, mouse.current.y, 0,
                    mouse.current.x, mouse.current.y, 60
                );
                gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
                gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(mouse.current.x, mouse.current.y, 60, 0, Math.PI * 2);
                ctx.fill();
            }

            animationFrameId.current = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        />
    );
};

export default CursorEffect;
