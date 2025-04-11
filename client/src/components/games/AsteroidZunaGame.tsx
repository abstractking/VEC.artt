
import React, { useEffect, useRef } from 'react';

const AsteroidZunaGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameInitialized = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || gameInitialized.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    gameInitialized.current = true;

    // Star background cache
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = canvas.width;
    bgCanvas.height = canvas.height;
    const bgCtx = bgCanvas.getContext('2d')!;

    // Generate background once
    drawPixelGalaxy(bgCtx);

    // Game variables
    let ship = {x: canvas.width/2, y: canvas.height/2, radius:20, angle:0, speed:0, vx:0, vy:0, hp:3};
    let bullets: Array<{x: number, y: number, vx: number, vy: number}> = [];
    let asteroids: Array<{x: number, y: number, vx: number, vy: number, radius: number, level: 'easy' | 'moderate' | 'hard'}> = [];
    let bosses: Array<{x: number, y: number, vx: number, vy: number, radius: number, hp: number, maxHp: number}> = [];
    let wave = 1;
    let score = 0;
    let firing = false;
    let fireCooldown = 0;

    // Controls
    const keys: {[key: string]: boolean} = {};

    // Event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
      if(e.key === ' ') firing = false;
    };

    // Resize function
    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      bgCanvas.width = canvas.width;
      bgCanvas.height = canvas.height;
      drawPixelGalaxy(bgCtx);
    };

    handleResize();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);

    // Update UI elements
    const updateHUD = () => {
      const scoreElement = document.getElementById("score");
      const waveElement = document.getElementById("wave");
      const healthElement = document.getElementById("health");
      
      if (scoreElement) scoreElement.innerText = score.toString();
      if (waveElement) waveElement.innerText = wave.toString();
      if (healthElement) healthElement.innerText = ship.hp.toString();
    };

    // Drawing functions
    function drawPixelGalaxy(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      for(let i = 0; i < 400; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random()})`;
        ctx.fillRect(Math.random() * ctx.canvas.width, Math.random() * ctx.canvas.height, 1.5, 1.5);
      }

      for(let i = 0; i < 4; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        const r = 12 + Math.random() * 20;
        ctx.fillStyle = `hsl(${Math.random() * 360}, 60%, 50%)`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number = 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#0ff';
      ctx.strokeStyle = '#0ff';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(-15, 12);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-15, -12);
      ctx.closePath();
      ctx.stroke();
      
      if (keys['ArrowUp'] || keys['w']) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#f0f';
        ctx.strokeStyle = '#f0f';
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-20, 5);
        ctx.lineTo(-25, 0);
        ctx.lineTo(-20, -5);
        ctx.closePath();
        ctx.stroke();
      }
      
      ctx.restore();
    }

    function drawBullet(ctx: CanvasRenderingContext2D, x: number, y: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#fff';
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawAsteroid(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, level: 'easy' | 'moderate' | 'hard') {
      const colorMap = { 
        'easy': '#0f0',
        'moderate': '#f0f',
        'hard': '#f00'
      };
      const color = colorMap[level];
      
      ctx.save();
      ctx.translate(x, y);
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      
      for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2;
        const length = radius * 0.8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        ctx.stroke();
      }
      
      ctx.restore();
    }

    function drawBoss(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, hp: number, maxHp: number) {
      ctx.save();
      ctx.translate(x, y);
      
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#f0f';
      ctx.strokeStyle = '#f0f';
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      
      const spikes = 8;
      for (let i = 0; i < spikes; i++) {
        const angle = (i / spikes) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * (radius * 0.6), Math.sin(angle) * (radius * 0.6));
        ctx.lineTo(Math.cos(angle) * (radius * 1.2), Math.sin(angle) * (radius * 1.2));
        ctx.stroke();
      }
      
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#f0f';
      ctx.fillRect(-radius, -radius - 15, radius * 2 * (hp / maxHp), 8);
      
      ctx.restore();
    }

    function dist(x1: number, y1: number, x2: number, y2: number) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return Math.sqrt(dx*dx + dy*dy);
    }

    function takeDamage() {
      ship.hp--;
      if(ship.hp <= 0) {
        alert("Game Over!\nYour Score: " + score);
        ship = {x: canvas.width/2, y: canvas.height/2, radius:20, angle:0, speed:0, vx:0, vy:0, hp:3};
        asteroids = [];
        bosses = [];
        wave = 1;
        score = 0;
      }
      updateHUD();
    }

    function spawnWave() {
      let asteroidCount = 3 + Math.floor(wave * 1.5);
      for(let i = 0; i < asteroidCount; i++) {
        let radius = 20 + Math.random() * 30;
        let level: 'easy' | 'moderate' | 'hard' = 'easy';
        
        if (wave < 5) {
          level = 'easy';
        } else if (wave < 15) {
          level = Math.random() > 0.7 ? 'moderate' : 'easy';
        } else {
          const rand = Math.random();
          if (rand > 0.7) level = 'hard';
          else if (rand > 0.4) level = 'moderate';
          else level = 'easy';
        }
        
        asteroids.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2 * (1 + wave/20),
          vy: (Math.random() - 0.5) * 2 * (1 + wave/20),
          radius: radius,
          level: level
        });
      }
    }

    function spawnBoss() {
      const boss = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 80 + Math.min(wave * 2, 100),
        hp: 20 + wave * 5,
        maxHp: 20 + wave * 5
      };
      bosses.push(boss);
    }

    function update() {
      if(keys['ArrowLeft'] || keys['a']) ship.angle -= 0.06;
      if(keys['ArrowRight'] || keys['d']) ship.angle += 0.06;
      if(keys['ArrowUp'] || keys['w']) {
        ship.vx += Math.cos(ship.angle) * 0.2;
        ship.vy += Math.sin(ship.angle) * 0.2;
      }
      ship.vx *= 0.99; 
      ship.vy *= 0.99;
      ship.x += ship.vx;
      ship.y += ship.vy;

      if(ship.x < 0) ship.x += canvas.width;
      if(ship.x > canvas.width) ship.x -= canvas.width;
      if(ship.y < 0) ship.y += canvas.height;
      if(ship.y > canvas.height) ship.y -= canvas.height;

      if(keys[' '] && fireCooldown <= 0) {
        firing = true;
        bullets.push({
          x: ship.x + Math.cos(ship.angle) * ship.radius,
          y: ship.y + Math.sin(ship.angle) * ship.radius,
          vx: Math.cos(ship.angle) * 8,
          vy: Math.sin(ship.angle) * 8
        });
        fireCooldown = 10;
      }
      fireCooldown--;

      bullets = bullets.filter(b => {
        b.x += b.vx;
        b.y += b.vy;
        return (b.x >= 0 && b.x <= canvas.width && b.y >= 0 && b.y <= canvas.height);
      });

      if(asteroids.length === 0 && bosses.length === 0) {
        if(wave % 10 === 0) {
          spawnBoss();
        } else {
          spawnWave();
        }
        updateHUD();
        wave++;
      }

      asteroids.forEach(ast => {
        ast.x += ast.vx;
        ast.y += ast.vy;
        if(ast.x < 0) ast.x += canvas.width;
        if(ast.x > canvas.width) ast.x -= canvas.width;
        if(ast.y < 0) ast.y += canvas.height;
        if(ast.y > canvas.height) ast.y -= canvas.height;
      });

      bosses.forEach(boss => {
        boss.x += boss.vx;
        boss.y += boss.vy;
        if (boss.x < boss.radius || boss.x > canvas.width - boss.radius) boss.vx *= -1;
        if (boss.y < boss.radius || boss.y > canvas.height - boss.radius) boss.vy *= -1;
      });

      for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const b = bullets[bi];
        let bulletHit = false;

        for (let ai = asteroids.length - 1; ai >= 0; ai--) {
          const a = asteroids[ai];
          if (dist(b.x, b.y, a.x, a.y) < a.radius) {
            bulletHit = true;
            
            if (a.radius > 20) {
              for (let s = 0; s < 2; s++) {
                let newLevel: 'easy' | 'moderate' | 'hard' = 'easy';
                if (a.level === 'hard') newLevel = 'moderate';
                else if (a.level === 'moderate') newLevel = 'easy';
                else newLevel = 'easy';
                
                asteroids.push({
                  x: a.x, y: a.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  radius: a.radius / 1.5,
                  level: newLevel
                });
              }
            }
            
            asteroids.splice(ai, 1);
            
            if (a.level === 'hard') score += 30;
            else if (a.level === 'moderate') score += 20;
            else score += 10;
            
            updateHUD();
            break;
          }
        }

        if (!bulletHit) {
          for (let bossIdx = bosses.length - 1; bossIdx >= 0; bossIdx--) {
            const boss = bosses[bossIdx];
            if (dist(b.x, b.y, boss.x, boss.y) < boss.radius) {
              bulletHit = true;
              boss.hp--;
              
              if (boss.hp <= 0) {
                bosses.splice(bossIdx, 1);
                score += 100 * wave;
                updateHUD();
              }
              break;
            }
          }
        }

        if (bulletHit) {
          bullets.splice(bi, 1);
        }
      }

      let playerHit = false;
      asteroids.forEach(a => {
        if (!playerHit && dist(ship.x, ship.y, a.x, a.y) < ship.radius + a.radius) {
          playerHit = true;
        }
      });

      bosses.forEach(boss => {
        if (!playerHit && dist(ship.x, ship.y, boss.x, boss.y) < ship.radius + boss.radius) {
          playerHit = true;
        }
      });

      if (playerHit) {
        takeDamage();
      }
    }

    function render() {
      if (!ctx) return;
      
      ctx.drawImage(bgCanvas, 0, 0);
      drawPlayer(ctx, ship.x, ship.y, ship.angle);

      bullets.forEach(b => {
        drawBullet(ctx, b.x, b.y);
      });

      asteroids.forEach(a => {
        drawAsteroid(ctx, a.x, a.y, a.radius, a.level);
      });

      bosses.forEach(boss => {
        drawBoss(ctx, boss.x, boss.y, boss.radius, boss.hp, boss.maxHp);
      });
    }

    function gameLoop() {
      update();
      render();
      requestAnimationFrame(gameLoop);
    }

    updateHUD();
    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      gameInitialized.current = false;
    };
  }, []);

  return (
    <div className="game-container w-full h-full relative">
      <div id="hud" className="absolute top-4 left-4 text-arcade-primary font-mono text-lg z-10">
        <div className="mb-1">Score: <span id="score">0</span></div>
        <div className="mb-1">Wave: <span id="wave">1</span></div>
        <div>Health: <span id="health">3</span></div>
      </div>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full bg-black"
        tabIndex={0}
      />
    </div>
  );
};

export default AsteroidZunaGame;
