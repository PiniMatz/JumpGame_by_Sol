class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // הגדרת רזולוציה קבועה לפיה נצייר (16:9)
        this.canvas.width = 1024;
        this.canvas.height = 576;

        this.gameState = 'MENU'; // 'MENU', 'PLAYING', 'LEVEL_COMPLETE', 'GAME_WIN'
        this.currentLevelIdx = 0;
        this.selectedChar = 'gamer_boy'; // ברירת מחדל
        this.deaths = 0;
        this.totalDeaths = 0;

        // מקלדת
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false
        };

        // מצלמה
        this.cameraX = 0;

        // מחזור הנפשה לדמות
        this.walkCycle = 0;

        // פורטל
        this.portalRotation = 0;

        // עננים מונפשים ברקע הבהיר
        this.clouds = Array.from({length: 6}, (_, i) => ({
            x: Math.random() * 1200 - 100,
            y: 30 + Math.random() * 110,
            size: 20 + Math.random() * 20,
            speed: 0.05 + Math.random() * 0.1
        }));

        this.initDOM();
    }

    // קישור רכיבי UI
    initDOM() {
        const startScreen = document.getElementById('start-screen');
        const levelEndScreen = document.getElementById('level-end-screen');
        const gameWinScreen = document.getElementById('game-win-screen');
        const hud = document.getElementById('game-hud');
        
        const cardGamer = document.getElementById('card-gamer_boy');
        const cardHawaii = document.getElementById('card-hawaii_girl');

        // בחירת דמויות
        cardGamer.addEventListener('click', () => {
            this.selectedChar = 'gamer_boy';
            cardGamer.classList.add('active');
            cardHawaii.classList.remove('active');
            audio.playPop(); // צליל משוב לבחירה
        });

        cardHawaii.addEventListener('click', () => {
            this.selectedChar = 'hawaii_girl';
            cardHawaii.classList.add('active');
            cardGamer.classList.remove('active');
            audio.playPop();
        });

        // כפתור התחלה
        document.getElementById('btn-start-game').addEventListener('click', () => {
            audio.init(); // הפעלת השמע
            this.gameState = 'PLAYING';
            startScreen.classList.add('hidden');
            hud.classList.remove('hidden');
            this.loadLevel(0);
        });

        // כפתור מעבר שלב
        document.getElementById('btn-next-level').addEventListener('click', () => {
            levelEndScreen.classList.add('hidden');
            const nextIdx = this.currentLevelIdx + 1;
            if (nextIdx < GAME_LEVELS.length) {
                this.loadLevel(nextIdx);
                this.gameState = 'PLAYING';
            } else {
                // ניצחון סופי במשחק!
                this.gameState = 'GAME_WIN';
                document.getElementById('total-stat-deaths').textContent = this.totalDeaths;
                gameWinScreen.classList.remove('hidden');
            }
        });

        // כפתור התחלה מחדש (סיום משחק)
        document.getElementById('btn-restart-all').addEventListener('click', () => {
            gameWinScreen.classList.add('hidden');
            this.totalDeaths = 0;
            this.deaths = 0;
            this.loadLevel(0);
            this.gameState = 'PLAYING';
        });

        // כפתור השתק
        const btnMute = document.getElementById('btn-mute');
        btnMute.addEventListener('click', () => {
            const isMuted = audio.toggleMute();
            btnMute.textContent = isMuted ? "🔇" : "🔊";
        });

        // כפתור איפוס ידני של השלב
        document.getElementById('btn-reset').addEventListener('click', () => {
            this.loadLevel(this.currentLevelIdx);
        });

        // כפתור חזרה לתפריט ראשי (Home)
        document.getElementById('btn-home').addEventListener('click', () => {
            this.gameState = 'MENU';
            document.getElementById('game-hud').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
            // איפוס מפתחות לחוצים
            this.keys.ArrowLeft = false;
            this.keys.ArrowRight = false;
            this.keys.ArrowUp = false;
            this.keys.ArrowDown = false;
        });

        // האזנה לאירוע מוות מפיזיקה
        window.addEventListener('player-death', () => {
            this.deaths++;
            this.totalDeaths++;
            document.getElementById('hud-deaths-count').textContent = this.deaths;
        });

        // האזנה למקלדת
        window.addEventListener('keydown', (e) => {
            if (this.gameState !== 'PLAYING') return;

            if (e.key === 'ArrowLeft') this.keys.ArrowLeft = true;
            if (e.key === 'ArrowRight') this.keys.ArrowRight = true;
            
            if (e.key === 'ArrowUp' || e.key === ' ') {
                e.preventDefault();
                // קפיצה רק בלחיצה בודדת (Keydown)
                if (!this.keys.ArrowUp) {
                    physics.jump();
                    this.keys.ArrowUp = true;
                }
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                physics.slamDown();
                this.keys.ArrowDown = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') this.keys.ArrowLeft = false;
            if (e.key === 'ArrowRight') this.keys.ArrowRight = false;
            if (e.key === 'ArrowUp' || e.key === ' ') this.keys.ArrowUp = false;
            if (e.key === 'ArrowDown') this.keys.ArrowDown = false;
        });

        // התחלת לולאת הציור הראשית
        this.run();
    }

    // טעינת שלב
    loadLevel(index) {
        this.currentLevelIdx = index;
        this.deaths = 0;
        document.getElementById('hud-deaths-count').textContent = 0;
        
        const lvl = GAME_LEVELS[index];
        physics.setLevel(lvl);
        physics.initPlayer(lvl.startX, lvl.startY, this.selectedChar);
        
        particles.clear();
        this.cameraX = 0;

        // עדכון HUD
        document.getElementById('hud-world-name').textContent = lvl.name;
        document.getElementById('hud-progress-bar').style.width = '0%';
    }

    // ריצה
    run() {
        const loop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    // עדכון לוגיקה בכל פריים
    update() {
        if (this.gameState !== 'PLAYING') {
            // אנימציות רקע בתפריטים ועננים
            this.portalRotation += 0.01;
            this.updateClouds();
            return;
        }

        // עדכון עננים
        this.updateClouds();

        // 1. עדכון פיזיקת שחקן
        physics.update(this.keys);

        // 2. עדכון מצלמה
        const p = physics.player;
        const lvl = physics.level;
        
        // המצלמה שואפת למרכז את השחקן
        const targetCamX = p.x - this.canvas.width / 2 + p.w / 2;
        this.cameraX += (targetCamX - this.cameraX) * 0.1;
        
        // הגבלת מצלמה לגבולות השלב
        if (this.cameraX < 0) this.cameraX = 0;
        if (this.cameraX > lvl.width - this.canvas.width) this.cameraX = lvl.width - this.canvas.width;

        // 3. עדכון מד התקדמות ב-HUD
        const progress = Math.min(100, Math.max(0, (p.x / lvl.width) * 100));
        document.getElementById('hud-progress-bar').style.width = `${progress}%`;

        // 4. עדכון מנוע חלקיקים
        particles.update(0.05); // כוח כבידה קל לחלקיקים שייפלו מטה

        // 5. עדכון סחרור פורטל
        this.portalRotation += 0.05;

        // 6. ייצור חלקיקי פורטל
        particles.spawnPortalVortex(lvl.portalX - this.cameraX, lvl.portalY, lvl.theme.accent);

        // 7. בדיקת מעבר דרך הפורטל (סיום שלב)
        const portalRadius = 35;
        const distToPortal = Math.hypot(p.x + p.w/2 - lvl.portalX, p.y + p.h/2 - lvl.portalY);
        if (distToPortal < portalRadius + 15) {
            this.handleLevelComplete();
        }

        // 8. עדכון מחזור הריצה לדמויות
        if (Math.abs(p.vx) > 0.5 && p.grounded) {
            this.walkCycle += 0.22;
        } else {
            this.walkCycle = 0;
        }
    }

    // פונקציית עזר לעדכון תנועת העננים
    updateClouds() {
        for (const cloud of this.clouds) {
            cloud.x += cloud.speed;
            if (cloud.x > this.canvas.width + 100) {
                cloud.x = -100;
                cloud.y = 30 + Math.random() * 110;
            }
        }
    }

    // מעבר לשלב הבא / סיום עולם
    handleLevelComplete() {
        this.gameState = 'LEVEL_COMPLETE';
        audio.playPortal();
        
        const lvl = physics.level;
        document.getElementById('stat-deaths').textContent = this.deaths;
        
        // התאמת כותרות לפי שלב
        const endTitle = document.getElementById('end-title');
        const endMsg = document.getElementById('end-message');
        const btnNext = document.getElementById('btn-next-level');

        if (this.currentLevelIdx + 1 < GAME_LEVELS.length) {
            endTitle.textContent = "העולם הושלם! 🌟";
            endMsg.textContent = `עברת את ${lvl.name} בהצלחה!`;
            btnNext.textContent = "לעולם הבא ➡️";
        } else {
            endTitle.textContent = "עברת את כל העולמות! 🏆";
            endMsg.textContent = "מדהים! הפארקור המעיך הושלם כולו.";
            btnNext.textContent = "צפה בתוצאות 🏅";
        }

        document.getElementById('level-end-screen').classList.remove('hidden');
    }

    // ציור כל האלמנטים לקנבס
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState !== 'PLAYING') return;
        
        if (!physics.level) return;

        // החלת רעידת מסך
        this.ctx.save();
        if (physics.screenShake > 0.5) {
            const dx = (Math.random() - 0.5) * physics.screenShake;
            const dy = (Math.random() - 0.5) * physics.screenShake;
            this.ctx.translate(dx, dy);
        }

        // 1. ציור רקע גרדיאנט
        const lvl = physics.level;
        const bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGrad.addColorStop(0, lvl.theme.bgGradStart);
        bgGrad.addColorStop(1, lvl.theme.bgGradEnd);
        this.ctx.fillStyle = bgGrad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. ציור קווי מתאר עיר/גבעות ברקע (עומק)
        this.drawBackgroundScenery();

        // 3. ציור הפלטפורמות
        this.drawPlatforms();

        // 4. ציור פורטל הסיום
        this.drawPortal();

        // 5. ציור השחקן
        this.drawPlayer();

        // 6. ציור החלקיקים
        particles.draw(this.ctx);

        this.ctx.restore();
    }

    // ציור נוף רקע פראלאקס פשוט אך יוקרתי
    drawBackgroundScenery() {
        const theme = physics.level.theme;
        this.ctx.fillStyle = theme.skylineColor;

        // הרים או מבנים קטנים ברקע שנעים לאט
        const scrollFactor = 0.2;
        const offset = -this.cameraX * scrollFactor;

        this.ctx.beginPath();
        this.ctx.moveTo(offset, this.canvas.height);
        
        // נשתמש בנקודות קבועות לציור גבעות ברקע
        for (let i = 0; i <= 20; i++) {
            const x = offset + i * 250;
            // גל גבעה
            const y = this.canvas.height - 180 + Math.sin(i * 0.9) * 40;
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.lineTo(offset + 20 * 250, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fill();

        // ציור עננים מונפשים ברקע הבהיר
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (const cloud of this.clouds) {
            this.ctx.beginPath();
            const cx = cloud.x;
            const cy = cloud.y;
            const r = cloud.size;
            this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
            this.ctx.arc(cx - r * 0.6, cy + r * 0.2, r * 0.7, 0, Math.PI * 2);
            this.ctx.arc(cx + r * 0.6, cy + r * 0.2, r * 0.7, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    // ציור הפלטפורמות לפי סוגן
    drawPlatforms() {
        const lvl = physics.level;
        
        for (const plat of lvl.platforms) {
            // בדיקה אם הפלטפורמה מחוץ למסך (כדי לא לצייר לחינם)
            if (plat.x + plat.w < this.cameraX || plat.x > this.cameraX + this.canvas.width) {
                continue;
            }

            const rx = plat.x - this.cameraX; // מיקום יחסי למצלמה

            this.ctx.save();
            
            if (plat.type === 'normal') {
                // פלטפורמה רגילה: מראה וקטורי מודרני, פינות מעוגלות וגרדיאנט
                const grad = this.ctx.createLinearGradient(rx, plat.y, rx, plat.y + plat.h);
                grad.addColorStop(0, '#4c1d95');
                grad.addColorStop(1, '#1e1b4b');
                this.ctx.fillStyle = grad;
                this.ctx.strokeStyle = lvl.theme.accent;
                this.ctx.lineWidth = 2;
                
                this.drawRoundedRect(rx, plat.y, plat.w, plat.h, 8, true, true);
                
                // קו עליון זוהר
                this.ctx.strokeStyle = '#a78bfa';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(rx + 4, plat.y + 1);
                this.ctx.lineTo(rx + plat.w - 4, plat.y + 1);
                this.ctx.stroke();
            } 
            else if (plat.type === 'stress_ball') {
                // כדור לחץ: אליפסה מעיכה ומתרחבת בהתאם ל-squishY
                const squish = plat.squishY;
                const currentH = plat.h * squish;
                const currentW = plat.w * (1 + (1 - squish) * 0.7); // גדל לרוחב ככל שנמעך
                const deltaW = currentW - plat.w;
                
                const grad = this.ctx.createRadialGradient(
                    rx + plat.w/2, plat.y + currentH/2 - 10, 5, 
                    rx + plat.w/2, plat.y + currentH/2, currentW/2
                );
                // סטרס בול ורוד או סגול
                grad.addColorStop(0, '#f472b6');
                grad.addColorStop(0.5, '#ec4899');
                grad.addColorStop(1, '#be185d');
                
                this.ctx.fillStyle = grad;
                this.ctx.beginPath();
                // ציור אליפסה מהמרכז התחתון כדי שהרצפה תישאר במקום
                this.ctx.ellipse(
                    rx + plat.w/2, 
                    plat.y + plat.h - currentH/2, 
                    currentW/2, 
                    currentH/2, 
                    0, 0, Math.PI * 2
                );
                this.ctx.fill();
                
                // קו זוהר מעודן וטקסטורה של כדור
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            } 
            else if (plat.type === 'jelly') {
                // קוביית ג'לי: גבול עליון רוטט בגל סינוס מונפש
                const grad = this.ctx.createLinearGradient(rx, plat.y, rx, plat.y + plat.h);
                grad.addColorStop(0, 'rgba(217, 70, 239, 0.85)'); // סגול ג'לי שקוף למחצה
                grad.addColorStop(1, 'rgba(134, 25, 143, 0.95)');
                
                this.ctx.fillStyle = grad;
                this.ctx.strokeStyle = '#f472b6';
                this.ctx.lineWidth = 3;
                
                // ציור גל רוטט בבסיס העליון
                this.ctx.beginPath();
                this.ctx.moveTo(rx, plat.y + plat.h);
                
                // ציור דופן עליונה רוטטת
                const steps = 12;
                for (let i = 0; i <= steps; i++) {
                    const px = rx + (i / steps) * plat.w;
                    // גל סינוס המושפע מזווית הרטט ועוצמת הרטט
                    const wobble = Math.sin((i / steps) * Math.PI * 2 + plat.wobbleAngle) * plat.wobbleAmp;
                    const py = plat.y + wobble;
                    this.ctx.lineTo(px, py);
                }
                
                this.ctx.lineTo(rx + plat.w, plat.y + plat.h);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
            } 
            else if (plat.type === 'soda_can') {
                // פחית שתייה / בקבוק פלסטיק
                const py = plat.currentY;
                const ph = plat.currentH;
                const pw = plat.w;
                
                const grad = this.ctx.createLinearGradient(rx, py, rx + pw, py);
                if (plat.label === 'בקבוק מים') {
                    // בקבוק מים כחול
                    grad.addColorStop(0, '#bae6fd');
                    grad.addColorStop(0.3, '#38bdf8');
                    grad.addColorStop(0.7, '#0284c7');
                    grad.addColorStop(1, '#0c4a6e');
                } else {
                    // פחית קולה אדומה
                    grad.addColorStop(0, '#fca5a5');
                    grad.addColorStop(0.3, '#ef4444');
                    grad.addColorStop(0.7, '#b91c1c');
                    grad.addColorStop(1, '#7f1d1d');
                }
                
                this.ctx.fillStyle = grad;
                this.ctx.strokeStyle = '#e2e8f0';
                this.ctx.lineWidth = 1.5;
                
                if (plat.crushStage === 0) {
                    // פחית/בקבוק רגיל (גליל יפה)
                    this.drawRoundedRect(rx, py, pw, ph, 10, true, true);
                    // פסים של עיצוב מותג
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(rx, py + ph*0.4, pw, ph*0.15);
                } 
                else if (plat.crushStage === 1) {
                    // חצי מעוך (קווים שבורים)
                    this.ctx.beginPath();
                    this.ctx.moveTo(rx, py);
                    this.ctx.lineTo(rx + pw, py);
                    this.ctx.lineTo(rx + pw - 6, py + ph*0.35);
                    this.ctx.lineTo(rx + pw, py + ph*0.5);
                    this.ctx.lineTo(rx + pw - 4, py + ph*0.7);
                    this.ctx.lineTo(rx + pw, py + ph);
                    this.ctx.lineTo(rx, py + ph);
                    this.ctx.lineTo(rx + 4, py + ph*0.7);
                    this.ctx.lineTo(rx, py + ph*0.5);
                    this.ctx.lineTo(rx + 6, py + ph*0.35);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();
                } 
                else {
                    // מעוך לחלוטין (שטוח ומעוות לגמרי)
                    this.ctx.beginPath();
                    this.ctx.moveTo(rx - 8, py);
                    this.ctx.lineTo(rx + pw + 8, py);
                    this.ctx.lineTo(rx + pw + 4, py + ph);
                    this.ctx.lineTo(rx - 4, py + ph);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();
                }
                
                // ציור פקק/טבעת פתיחה
                if (plat.crushStage < 2) {
                    this.ctx.fillStyle = '#94a3b8';
                    this.ctx.fillRect(rx + pw/2 - 8, py - 4, 16, 4);
                }
            } 
            else if (plat.type === 'bubble_wrap') {
                // פצפצים: משטח פלסטיק ועליו בועות תלת-ממדיות
                this.ctx.fillStyle = 'rgba(186, 230, 253, 0.25)'; // תכלת פלסטיקי שקוף
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                this.ctx.lineWidth = 1;
                this.drawRoundedRect(rx, plat.y, plat.w, plat.h, 6, true, true);
                
                // ציור הבועות בנפרד
                for (const bubble of plat.bubbles) {
                    const bx = bubble.x - this.cameraX;
                    const by = plat.y + plat.h / 2;
                    const radius = 9;

                    if (!bubble.popped) {
                        // בועה שלמה (גרדיאנט רדיאלי עם ברק לבן)
                        const bubGrad = this.ctx.createRadialGradient(
                            bx - 3, by - 3, 1, 
                            bx, by, radius
                        );
                        bubGrad.addColorStop(0, '#ffffff');
                        bubGrad.addColorStop(0.3, '#bae6fd');
                        bubGrad.addColorStop(1, '#0284c7');
                        
                        this.ctx.fillStyle = bubGrad;
                        this.ctx.beginPath();
                        this.ctx.arc(bx, by, radius, 0, Math.PI * 2);
                        this.ctx.fill();
                    } else {
                        // בועה מפוצצת
                        this.ctx.strokeStyle = 'rgba(2, 132, 199, 0.3)';
                        this.ctx.lineWidth = 1.5;
                        this.ctx.beginPath();
                        this.ctx.arc(bx, by, radius - 2, 0, Math.PI * 2);
                        this.ctx.stroke();
                        
                        // קווים קטנים המראים פיצוץ שקט
                        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                        this.ctx.beginPath();
                        this.ctx.arc(bx, by, radius - 4, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }
            }

            // כתיבת טקסט מעל לפלטפורמה (לדוגמה: כדור לחץ) - בצבע כהה קריא
            if (plat.label && plat.type !== 'normal') {
                this.ctx.fillStyle = 'rgba(15, 23, 42, 0.6)'; // צבע אפור כהה שקוף מעט
                this.ctx.font = 'bold 11px Rubik';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(plat.label, rx + plat.w/2, plat.y - 12);
            }

            this.ctx.restore();
        }
    }

    // ציור פורטל סיום
    drawPortal() {
        const lvl = physics.level;
        const rx = lvl.portalX - this.cameraX;
        const ry = lvl.portalY;
        const size = 35;

        this.ctx.save();
        
        // ציור זוהר מאחורי הפורטל
        const glowGrad = this.ctx.createRadialGradient(rx, ry, 5, rx, ry, size * 1.8);
        glowGrad.addColorStop(0, lvl.theme.accent);
        glowGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.3)');
        glowGrad.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = glowGrad;
        this.ctx.beginPath();
        this.ctx.arc(rx, ry, size * 1.8, 0, Math.PI * 2);
        this.ctx.fill();

        // ספירלת פורטל
        this.ctx.translate(rx, ry);
        this.ctx.rotate(this.portalRotation);
        
        const rings = 4;
        this.ctx.lineWidth = 3;
        for (let i = 0; i < rings; i++) {
            const rad = size * ((rings - i) / rings);
            this.ctx.strokeStyle = i % 2 === 0 ? '#ffffff' : lvl.theme.accent;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = lvl.theme.accent;
            
            this.ctx.beginPath();
            // ספירלה באמצעות עקומת בזייה
            this.ctx.arc(0, 0, rad, 0, Math.PI * 1.5);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    // ציור השחקן ב-Canvas בצורה וקטורית עשירה
    drawPlayer() {
        const p = physics.player;
        const rx = p.x - this.cameraX;
        const ry = p.y;
        
        this.ctx.save();
        
        // ביצוע הזזה וסקיילינג ממרכז בסיס הרגליים של השחקן (למעיכה נכונה)
        this.ctx.translate(rx + p.w / 2, ry + p.h);
        this.ctx.scale(p.scaleX, p.scaleY);
        
        // יצירת מחזור ריקוד קטן לדמות
        const isMoving = Math.abs(p.vx) > 0.5 && p.grounded;
        const wiggle = isMoving ? Math.sin(this.walkCycle) * 0.1 : 0;
        
        // ציור דמויות
        if (p.charType === 'gamer_boy') {
            this.drawGamerBoy(p, wiggle);
        } else {
            this.drawHawaiiGirl(p, wiggle);
        }

        this.ctx.restore();
    }

    // ציור דמות: Gamer Boy
    drawGamerBoy(p, wiggle) {
        const h = p.h;
        const w = p.w;
        const now = Date.now();

        // 1. רגליים (בלוק רובלוקסי)
        const legW = 9;
        const legH = 12;
        const leftLegY = wiggle > 0 ? -2 : 0;
        const rightLegY = wiggle < 0 ? -2 : 0;
        
        this.ctx.fillStyle = '#111'; // נעליים/מכנסיים
        this.ctx.strokeStyle = '#39ff14';
        this.ctx.lineWidth = 1;
        // רגל שמאל
        this.ctx.fillRect(-w/2 + 2, -legH + leftLegY, legW, legH);
        this.ctx.strokeRect(-w/2 + 2, -legH + leftLegY, legW, legH);
        // רגל ימין
        this.ctx.fillRect(w/2 - 2 - legW, -legH + rightLegY, legW, legH);
        this.ctx.strokeRect(w/2 - 2 - legW, -legH + rightLegY, legW, legH);

        // 2. גוף (קפוצ'ון)
        this.ctx.fillStyle = '#222';
        this.ctx.strokeStyle = '#39ff14';
        this.ctx.lineWidth = 1.5;
        this.drawRoundedRect(-w/2, -h + 12, w, 24, 4, true, true);
        
        // הדפס זוהר על הקפוצ'ון
        this.ctx.fillStyle = '#39ff14';
        this.ctx.beginPath();
        this.ctx.arc(0, -h + 24, 4, 0, Math.PI * 2);
        this.ctx.fill();

        // 3. ידיים
        const armW = 7;
        const armH = 20;
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.strokeStyle = '#39ff14';
        // יד שמאל
        this.ctx.save();
        this.ctx.translate(-w/2 - 2, -h + 14);
        if (wiggle !== 0) this.ctx.rotate(-wiggle * 2);
        this.ctx.fillRect(-armW, 0, armW, armH);
        this.ctx.strokeRect(-armW, 0, armW, armH);
        this.ctx.restore();
        // יד ימין
        this.ctx.save();
        this.ctx.translate(w/2 + 2, -h + 14);
        if (wiggle !== 0) this.ctx.rotate(wiggle * 2);
        this.ctx.fillRect(0, 0, armW, armH);
        this.ctx.strokeRect(0, 0, armW, armH);
        this.ctx.restore();

        // 4. ראש
        this.ctx.fillStyle = '#ffd1a9'; // צבע עור
        this.ctx.fillRect(-9, -h - 1, 18, 14);

        // שיער (בלוק)
        this.ctx.fillStyle = '#4a2c11';
        this.ctx.fillRect(-10, -h - 5, 20, 5);

        // אוזניות גיימינג זוהרות ירוק
        const headphonesGlow = Math.sin(now * 0.01) * 0.2 + 0.8;
        this.ctx.strokeStyle = `rgba(57, 255, 20, ${headphonesGlow})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, -h + 6, 12, Math.PI, 0); // קשת מעל הראש
        this.ctx.stroke();
        // כריות אוזניות
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(-13, -h + 2, 4, 8);
        this.ctx.fillRect(9, -h + 2, 4, 8);
        // צידיי אוזניות מוארים
        this.ctx.fillStyle = '#39ff14';
        this.ctx.fillRect(-14, -h + 4, 2, 4);
        this.ctx.fillRect(12, -h + 4, 2, 4);

        // משקפי שמש/פיקסלים שחורים
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(-8, -h + 2, 16, 4);
        // קו זוהר למשקפיים
        this.ctx.fillStyle = '#39ff14';
        this.ctx.fillRect(-8, -h + 5, 4, 1);
        this.ctx.fillRect(4, -h + 5, 4, 1);
    }

    // ציור דמות: Hawaii Girl
    drawHawaiiGirl(p, wiggle) {
        const h = p.h;
        const w = p.w;
        const now = Date.now();

        // גלשן על הגב (זווית מאחורי השחקן)
        this.ctx.save();
        this.ctx.rotate(0.2);
        const surfGrad = this.ctx.createLinearGradient(-15, -h, 0, -10);
        surfGrad.addColorStop(0, '#00f2fe');
        surfGrad.addColorStop(1, '#4facfe');
        this.ctx.fillStyle = surfGrad;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.drawRoundedRect(-16, -h - 2, 12, 38, 6, true, true);
        this.ctx.restore();

        // 1. רגליים (שזופות)
        const legW = 9;
        const legH = 12;
        const leftLegY = wiggle > 0 ? -2 : 0;
        const rightLegY = wiggle < 0 ? -2 : 0;
        
        this.ctx.fillStyle = '#d2a075'; // רגליים שזופות
        this.ctx.fillRect(-w/2 + 2, -legH + leftLegY, legW, legH);
        this.ctx.fillRect(w/2 - 2 - legW, -legH + rightLegY, legW, legH);

        // 2. חצאית קש (ירוק/צהוב)
        this.ctx.fillStyle = '#eab308'; // חצאית
        this.ctx.fillRect(-w/2, -legH - 2, w, 6);
        // ציציות החצאית
        this.ctx.fillStyle = '#a16207';
        for (let i = 0; i < 5; i++) {
            this.ctx.fillRect(-w/2 + (i*6) + 1, -legH + 3, 2, 4);
        }

        // 3. גוף (חולצת הוואי ורודה)
        const bodyH = 18;
        const bodyY = -h + 12;
        const bodyGrad = this.ctx.createLinearGradient(-w/2, bodyY, w/2, bodyY + bodyH);
        bodyGrad.addColorStop(0, '#ff007f');
        bodyGrad.addColorStop(1, '#f472b6');
        this.ctx.fillStyle = bodyGrad;
        this.drawRoundedRect(-w/2, bodyY, w, bodyH, 3, true, false);
        
        // עיטור של פרח על החולצה
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(0, bodyY + bodyH/2, 2.5, 0, Math.PI*2);
        this.ctx.fill();

        // 4. ידיים
        const armW = 7;
        const armH = 16;
        this.ctx.fillStyle = '#d2a075';
        // יד שמאל
        this.ctx.save();
        this.ctx.translate(-w/2 - 2, -h + 14);
        if (wiggle !== 0) this.ctx.rotate(-wiggle * 1.5);
        this.ctx.fillRect(-armW, 0, armW, armH);
        this.ctx.restore();
        // יד ימין
        this.ctx.save();
        this.ctx.translate(w/2 + 2, -h + 14);
        if (wiggle !== 0) this.ctx.rotate(wiggle * 1.5);
        this.ctx.fillRect(0, 0, armW, armH);
        this.ctx.restore();

        // 5. ראש ושיער
        // שיער שחור ארוך מאחורי הראש
        this.ctx.fillStyle = '#1e1b4b';
        this.ctx.fillRect(-11, -h - 2, 22, 22);

        // פנים
        this.ctx.fillStyle = '#d2a075';
        this.ctx.fillRect(-9, -h - 1, 18, 13);

        // כתר פרחים (הוואי)
        const colors = ['#f43f5e', '#f472b6', '#eab308', '#22c55e', '#3b82f6'];
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const flowerX = -10 + i * 5;
            this.ctx.fillStyle = colors[(Math.floor(now / 300) + i) % colors.length];
            this.ctx.beginPath();
            this.ctx.arc(flowerX, -h - 2, 3.5, 0, Math.PI * 2);
            this.ctx.fill();
            // פנים הפרח בצהוב/לבן
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(flowerX, -h - 2, 1.2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // עיניים חמודות
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(-5, -h + 3, 2, 2);
        this.ctx.fillRect(3, -h + 3, 2, 2);
        
        // סומק ורוד בלחיים
        this.ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
        this.ctx.fillRect(-7, -h + 6, 3, 2);
        this.ctx.fillRect(4, -h + 6, 3, 2);
    }

    // פונקציית עזר לציור מלבן עם פינות מעוגלות
    drawRoundedRect(x, y, width, height, radius, fill, stroke) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height - radius);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        if (fill) this.ctx.fill();
        if (stroke) this.ctx.stroke();
    }
}

// אתחול המופע הראשי
window.addEventListener('load', () => {
    const game = new Game();
    window.game = game;
});
