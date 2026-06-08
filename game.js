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

        // זיהוי מכשיר מגע
        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;

        this.initDOM();
        this.initTouchControls();
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

    // אתחול כפתורי מגע לניידים
    initTouchControls() {
        if (!this.isTouchDevice) return;

        // הוספת קלאס לגוף המציין שהמשתמש בנייד מגע
        document.body.classList.add('touch-device');

        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');
        const btnJump = document.getElementById('btn-jump');
        const btnSlam = document.getElementById('btn-slam');

        if (!btnLeft || !btnRight || !btnJump || !btnSlam) return;

        const bindTouch = (element, keyName, onDown) => {
            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.gameState !== 'PLAYING') return;
                this.keys[keyName] = true;
                if (onDown) onDown();
            }, { passive: false });

            element.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys[keyName] = false;
            }, { passive: false });

            element.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.keys[keyName] = false;
            }, { passive: false });
        };

        bindTouch(btnLeft, 'ArrowLeft');
        bindTouch(btnRight, 'ArrowRight');
        bindTouch(btnJump, 'ArrowUp', () => {
            physics.jump();
        });
        bindTouch(btnSlam, 'ArrowDown', () => {
            physics.slamDown();
        });
    }

    // עדכון תצוגת בקרת המגע לפי מצב המשחק והדמות שנבחרה
    updateControlsUI() {
        const mobileControls = document.getElementById('mobile-controls');
        if (!mobileControls) return;

        const shouldShow = this.isTouchDevice && this.gameState === 'PLAYING';
        if (shouldShow) {
            mobileControls.classList.remove('hidden');
        } else {
            mobileControls.classList.add('hidden');
        }

        // עדכון קלאסים של הדמות הנבחרת לצורך עיצוב כפתורי המגע
        if (this.selectedChar === 'gamer_boy') {
            document.body.classList.add('gamer-selected');
            document.body.classList.remove('hawaii-selected');
        } else {
            document.body.classList.add('hawaii-selected');
            document.body.classList.remove('gamer-selected');
        }
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
        this.updateControlsUI();
        
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
                const squish = plat.squishY;
                const currentH = plat.h * squish;
                const currentW = plat.w * (1 + (1 - squish) * 0.7);
                
                this.ctx.save();
                this.ctx.translate(rx + plat.w / 2, plat.y + plat.h); // Bottom center reference
                this.ctx.scale(currentW / plat.w, squish);

                if (plat.label && (plat.label.includes("ברווז") || plat.label.includes("duck"))) {
                    // ציור ברווז גומי צהוב אמיתי ומתוק!
                    // גוף הברווז
                    this.ctx.fillStyle = '#facc15'; // צהוב בהיר
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, -plat.h * 0.35, plat.w * 0.44, plat.h * 0.35, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // כנף
                    this.ctx.fillStyle = '#eab308'; // צהוב כהה
                    this.ctx.beginPath();
                    this.ctx.ellipse(-plat.w * 0.1, -plat.h * 0.35, plat.w * 0.18, plat.h * 0.14, -0.2, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // זנב קטנטן
                    this.ctx.fillStyle = '#facc15';
                    this.ctx.beginPath();
                    this.ctx.moveTo(-plat.w * 0.4, -plat.h * 0.45);
                    this.ctx.quadraticCurveTo(-plat.w * 0.52, -plat.h * 0.65, -plat.w * 0.48, -plat.h * 0.65);
                    this.ctx.quadraticCurveTo(-plat.w * 0.35, -plat.h * 0.5, -plat.w * 0.3, -plat.h * 0.4);
                    this.ctx.fill();
                    
                    // צוואר וראש
                    this.ctx.beginPath();
                    this.ctx.moveTo(plat.w * 0.1, -plat.h * 0.5);
                    this.ctx.quadraticCurveTo(plat.w * 0.22, -plat.h * 0.55, plat.w * 0.22, -plat.h * 0.65);
                    this.ctx.lineTo(plat.w * 0.05, -plat.h * 0.65);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                    this.ctx.beginPath();
                    this.ctx.arc(plat.w * 0.22, -plat.h * 0.68, plat.h * 0.22, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // מקור כתום בולט
                    this.ctx.fillStyle = '#f97316';
                    this.ctx.beginPath();
                    this.ctx.moveTo(plat.w * 0.42, -plat.h * 0.72);
                    this.ctx.lineTo(plat.w * 0.62, -plat.h * 0.66);
                    this.ctx.lineTo(plat.w * 0.42, -plat.h * 0.60);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                    // עין עם השתקפות
                    this.ctx.fillStyle = '#000000';
                    this.ctx.beginPath();
                    this.ctx.arc(plat.w * 0.26, -plat.h * 0.73, 3.5, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.arc(plat.w * 0.28, -plat.h * 0.75, 1.2, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    // כדור גומי / לחץ מונפש תלת-ממדי
                    const ballGrad = this.ctx.createRadialGradient(-plat.w * 0.1, -plat.h * 0.6, 5, 0, -plat.h * 0.5, plat.w / 2);
                    if (plat.label && plat.label.includes("כדור גומי")) {
                        ballGrad.addColorStop(0, '#60a5fa');
                        ballGrad.addColorStop(0.5, '#2563eb');
                        ballGrad.addColorStop(1, '#1e3a8a');
                    } else {
                        ballGrad.addColorStop(0, '#f472b6');
                        ballGrad.addColorStop(0.5, '#db2777');
                        ballGrad.addColorStop(1, '#831843');
                    }
                    
                    this.ctx.fillStyle = ballGrad;
                    this.ctx.beginPath();
                    this.ctx.arc(0, -plat.h / 2, plat.w / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // קו ברק לבן
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.arc(0, -plat.h / 2, plat.w / 2 - 4, 1.2 * Math.PI, 1.8 * Math.PI);
                    this.ctx.stroke();
                    
                    // פרצוף סמיילי חמוד שנמעך עם הכדור
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
                    this.ctx.beginPath();
                    this.ctx.arc(-plat.w * 0.13, -plat.h * 0.55, 3.2, 0, Math.PI * 2);
                    this.ctx.arc(plat.w * 0.13, -plat.h * 0.55, 3.2, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(0, -plat.h * 0.45, 8, 0.1 * Math.PI, 0.9 * Math.PI);
                    this.ctx.stroke();
                }
                this.ctx.restore();
            } 
            else if (plat.type === 'jelly') {
                if (plat.label === "ארגז קרטון") {
                    // קופסת קרטון רוטטת ומגניבה במקום ג'לי!
                    const wobble = Math.sin(plat.wobbleAngle) * plat.wobbleAmp;
                    this.ctx.save();
                    
                    this.ctx.fillStyle = '#d97706'; // חום קרטון
                    this.ctx.strokeStyle = '#78350f';
                    this.ctx.lineWidth = 3;
                    
                    // ציור גוף הקרטון (מלבן נוטה לפי זווית הרטט)
                    this.ctx.beginPath();
                    this.ctx.moveTo(rx, plat.y + plat.h);
                    this.ctx.lineTo(rx + wobble, plat.y);
                    this.ctx.lineTo(rx + plat.w + wobble, plat.y);
                    this.ctx.lineTo(rx + plat.w, plat.y + plat.h);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();
                    
                    // סרט הדבקה (מסקנטייפ) במרכז
                    this.ctx.fillStyle = 'rgba(78, 53, 15, 0.5)';
                    this.ctx.beginPath();
                    this.ctx.moveTo(rx + plat.w/2 - 8 + wobble, plat.y);
                    this.ctx.lineTo(rx + plat.w/2 + 8 + wobble, plat.y);
                    this.ctx.lineTo(rx + plat.w/2 + 8, plat.y + plat.h);
                    this.ctx.lineTo(rx + plat.w/2 - 8, plat.y + plat.h);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                    // קווי פתיחה של קרטון
                    this.ctx.strokeStyle = '#451a03';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(rx + wobble, plat.y + 12);
                    this.ctx.lineTo(rx + plat.w + wobble, plat.y + 12);
                    this.ctx.stroke();
                    
                    // לוגו שביר/כוס יין קטן על הקרטון
                    this.ctx.strokeStyle = '#78350f';
                    this.ctx.lineWidth = 1.5;
                    const stampX = rx + plat.w * 0.2 + wobble * 0.6;
                    const stampY = plat.y + plat.h * 0.4;
                    this.ctx.strokeRect(stampX, stampY, 15, 20);
                    this.ctx.beginPath();
                    this.ctx.moveTo(stampX + 3, stampY + 4);
                    this.ctx.lineTo(stampX + 12, stampY + 4);
                    this.ctx.lineTo(stampX + 12, stampY + 11);
                    this.ctx.lineTo(stampX + 7.5, stampY + 15);
                    this.ctx.lineTo(stampX + 3, stampY + 11);
                    this.ctx.closePath();
                    this.ctx.moveTo(stampX + 7.5, stampY + 15);
                    this.ctx.lineTo(stampX + 7.5, stampY + 18);
                    this.ctx.moveTo(stampX + 4, stampY + 18);
                    this.ctx.lineTo(stampX + 11, stampY + 18);
                    this.ctx.stroke();
                    
                    this.ctx.restore();
                } else {
                    // ג'לי רוטט עם פנים חמודות ודובדבן מבריק בראשו
                    const wobble = Math.sin(plat.wobbleAngle) * plat.wobbleAmp;
                    
                    const grad = this.ctx.createLinearGradient(rx, plat.y, rx, plat.y + plat.h);
                    if (plat.label && plat.label.includes("צהוב")) {
                        grad.addColorStop(0, 'rgba(253, 224, 71, 0.85)');
                        grad.addColorStop(1, 'rgba(234, 179, 8, 0.95)');
                    } else {
                        grad.addColorStop(0, 'rgba(232, 121, 249, 0.85)');
                        grad.addColorStop(1, 'rgba(192, 38, 211, 0.95)');
                    }
                    
                    this.ctx.fillStyle = grad;
                    this.ctx.strokeStyle = '#f472b6';
                    this.ctx.lineWidth = 3;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(rx + 8, plat.y + plat.h);
                    
                    const steps = 14;
                    for (let i = 0; i <= steps; i++) {
                        const ratio = i / steps;
                        const px = rx + 14 + ratio * (plat.w - 28) + wobble * Math.sin(ratio * Math.PI);
                        const surfaceWobble = Math.cos(ratio * Math.PI * 2 + plat.wobbleAngle) * (plat.wobbleAmp * 0.6);
                        const py = plat.y + surfaceWobble;
                        this.ctx.lineTo(px, py);
                    }
                    
                    this.ctx.lineTo(rx + plat.w - 8, plat.y + plat.h);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();
                    
                    // פס ברק לבן מבריק
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
                    this.ctx.lineWidth = 2.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(rx + 16 + wobble, plat.y + 8);
                    this.ctx.quadraticCurveTo(rx + 24 + wobble, plat.y + 4, rx + 40 + wobble, plat.y + 4);
                    this.ctx.stroke();
                    
                    // עיניים שעוקבות או זזות
                    const midX = rx + plat.w / 2 + wobble * 0.5;
                    const midY = plat.y + plat.h / 2;
                    
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.arc(midX - 12, midY - 4, 6, 0, Math.PI * 2);
                    this.ctx.arc(midX + 12, midY - 4, 6, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.fillStyle = '#000000';
                    this.ctx.beginPath();
                    this.ctx.arc(midX - 12, midY - 4, 2.8, 0, Math.PI * 2);
                    this.ctx.arc(midX + 12, midY - 4, 2.8, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // פה מחייך
                    this.ctx.strokeStyle = '#000000';
                    this.ctx.lineWidth = 1.8;
                    this.ctx.beginPath();
                    this.ctx.arc(midX, midY + 4, 4, 0, Math.PI);
                    this.ctx.stroke();
                    
                    // דובדבן בראשו של הג'לי
                    const cherryX = midX;
                    const cherryY = plat.y - 4;
                    this.ctx.fillStyle = '#ef4444';
                    this.ctx.beginPath();
                    this.ctx.arc(cherryX, cherryY, 6.5, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // גבעול ירוק
                    this.ctx.strokeStyle = '#15803d';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(cherryX, cherryY - 4);
                    this.ctx.quadraticCurveTo(cherryX + 8, cherryY - 14, cherryX + 4, cherryY - 18);
                    this.ctx.stroke();
                }
            } 
            else if (plat.type === 'soda_can') {
                const py = plat.currentY;
                const ph = plat.currentH;
                const pw = plat.w;
                
                this.ctx.save();
                
                if (plat.label === 'בקבוק מים') {
                    // בקבוק מים מפורט:
                    if (plat.crushStage === 0) {
                        const bottleGrad = this.ctx.createLinearGradient(rx, py, rx + pw, py);
                        bottleGrad.addColorStop(0, 'rgba(186, 230, 253, 0.75)');
                        bottleGrad.addColorStop(0.4, 'rgba(224, 242, 254, 0.85)');
                        bottleGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.75)');
                        bottleGrad.addColorStop(1, 'rgba(12, 74, 110, 0.85)');
                        
                        this.ctx.fillStyle = bottleGrad;
                        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                        this.ctx.lineWidth = 1.5;
                        
                        // צורה מפותלת של בקבוק פלסטיק
                        this.ctx.beginPath();
                        this.ctx.moveTo(rx + pw * 0.3, py);
                        this.ctx.lineTo(rx + pw * 0.7, py);
                        this.ctx.lineTo(rx + pw * 0.75, py + ph * 0.15);
                        this.ctx.lineTo(rx + pw * 0.9, py + ph * 0.28);
                        this.ctx.lineTo(rx + pw * 0.9, py + ph * 0.95);
                        this.ctx.quadraticCurveTo(rx + pw * 0.9, py + ph, rx + pw * 0.75, py + ph);
                        this.ctx.lineTo(rx + pw * 0.25, py + ph);
                        this.ctx.quadraticCurveTo(rx + pw * 0.1, py + ph, rx + pw * 0.1, py + ph * 0.95);
                        this.ctx.lineTo(rx + pw * 0.1, py + ph * 0.28);
                        this.ctx.lineTo(rx + pw * 0.25, py + ph * 0.15);
                        this.ctx.closePath();
                        this.ctx.fill();
                        this.ctx.stroke();
                        
                        // פקק כחול
                        this.ctx.fillStyle = '#0284c7';
                        this.ctx.fillRect(rx + pw * 0.3, py - 6, pw * 0.4, 6);
                        
                        // תווית נייר כחולה
                        this.ctx.fillStyle = '#0369a1';
                        this.ctx.fillRect(rx + pw * 0.1, py + ph * 0.4, pw * 0.8, ph * 0.22);
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.font = 'bold 9px sans-serif';
                        this.ctx.textAlign = 'center';
                        this.ctx.fillText("PURE", rx + pw/2, py + ph * 0.55);
                        
                        // חריצים רוחביים בבקבוק
                        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
                        this.ctx.lineWidth = 1.5;
                        for (let i = 0; i < 3; i++) {
                            const ry_line = py + ph * 0.68 + i * 8;
                            this.ctx.beginPath();
                            this.ctx.moveTo(rx + pw * 0.12, ry_line);
                            this.ctx.lineTo(rx + pw * 0.88, ry_line);
                            this.ctx.stroke();
                        }
                    } 
                    else if (plat.crushStage === 1) {
                        // בקבוק חצי מעוך
                        this.ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
                        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                        this.ctx.lineWidth = 1.5;
                        
                        this.ctx.beginPath();
                        this.ctx.moveTo(rx + pw * 0.2, py);
                        this.ctx.lineTo(rx + pw * 0.8, py);
                        this.ctx.lineTo(rx + pw - 4, py + ph * 0.3);
                        this.ctx.lineTo(rx + pw - 12, py + ph * 0.55);
                        this.ctx.lineTo(rx + pw, py + ph * 0.8);
                        this.ctx.lineTo(rx + pw - 4, py + ph);
                        this.ctx.lineTo(rx + 4, py + ph);
                        this.ctx.lineTo(rx, py + ph * 0.8);
                        this.ctx.lineTo(rx + 12, py + ph * 0.55);
                        this.ctx.lineTo(rx + 4, py + ph * 0.3);
                        this.ctx.closePath();
                        this.ctx.fill();
                        this.ctx.stroke();
                    } 
                    else {
                        // בקבוק פלסטיק מעוך לגמרי
                        this.ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
                        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                        this.ctx.lineWidth = 1;
                        this.ctx.beginPath();
                        this.ctx.ellipse(rx + pw/2, py + ph/2, pw * 0.6, ph * 0.5, 0.1, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.stroke();
                    }
                } else {
                    // פחית קולה מפורטת:
                    const grad = this.ctx.createLinearGradient(rx, py, rx + pw, py);
                    grad.addColorStop(0, '#fca5a5');
                    grad.addColorStop(0.3, '#ef4444');
                    grad.addColorStop(0.7, '#b91c1c');
                    grad.addColorStop(1, '#7f1d1d');
                    
                    if (plat.crushStage === 0) {
                        // כיסוי עליון כסוף
                        this.ctx.fillStyle = '#e2e8f0';
                        this.ctx.beginPath();
                        this.ctx.ellipse(rx + pw/2, py, pw/2, 4, 0, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        // גליל פחית אדום
                        this.ctx.fillStyle = grad;
                        this.ctx.fillRect(rx, py, pw, ph);
                        
                        // קו גלי לבן קלאסי במרכז
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.beginPath();
                        this.ctx.moveTo(rx, py + ph * 0.45);
                        this.ctx.quadraticCurveTo(rx + pw * 0.4, py + ph * 0.35, rx + pw * 0.5, py + ph * 0.5);
                        this.ctx.quadraticCurveTo(rx + pw * 0.6, py + ph * 0.65, rx + pw, py + ph * 0.5);
                        this.ctx.lineTo(rx + pw, py + ph * 0.65);
                        this.ctx.quadraticCurveTo(rx + pw * 0.6, py + ph * 0.8, rx + pw * 0.5, py + ph * 0.65);
                        this.ctx.quadraticCurveTo(rx + pw * 0.4, py + ph * 0.5, rx, py + ph * 0.6);
                        this.ctx.closePath();
                        this.ctx.fill();
                        
                        // טבעת פתיחה על המכסה
                        this.ctx.strokeStyle = '#94a3b8';
                        this.ctx.lineWidth = 1.5;
                        this.ctx.beginPath();
                        this.ctx.arc(rx + pw/2, py - 1, 3, 0, Math.PI*2);
                        this.ctx.stroke();
                        
                        // בסיס תחתון כסוף
                        this.ctx.fillStyle = '#e2e8f0';
                        this.ctx.beginPath();
                        this.ctx.ellipse(rx + pw/2, py + ph, pw/2, 3, 0, 0, Math.PI * 2);
                        this.ctx.fill();
                    } 
                    else if (plat.crushStage === 1) {
                        // פחית מעוכה גלית
                        this.ctx.fillStyle = grad;
                        this.ctx.strokeStyle = '#94a3b8';
                        this.ctx.lineWidth = 1.5;
                        
                        this.ctx.beginPath();
                        this.ctx.moveTo(rx, py);
                        this.ctx.lineTo(rx + pw, py);
                        this.ctx.lineTo(rx + pw - 8, py + ph * 0.3);
                        this.ctx.lineTo(rx + pw, py + ph * 0.5);
                        this.ctx.lineTo(rx + pw - 6, py + ph * 0.7);
                        this.ctx.lineTo(rx + pw, py + ph);
                        this.ctx.lineTo(rx, py + ph);
                        this.ctx.lineTo(rx + 6, py + ph * 0.7);
                        this.ctx.lineTo(rx, py + ph * 0.5);
                        this.ctx.lineTo(rx + 8, py + ph * 0.3);
                        this.ctx.closePath();
                        this.ctx.fill();
                        this.ctx.stroke();
                    } 
                    else {
                        // פחית מעוכה לגמרי ושטוחה
                        this.ctx.fillStyle = '#94a3b8';
                        this.ctx.beginPath();
                        this.ctx.ellipse(rx + pw/2, py + ph/2, pw * 0.55, ph * 0.5, 0, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        this.ctx.fillStyle = '#b91c1c';
                        this.ctx.beginPath();
                        this.ctx.ellipse(rx + pw/2, py + ph/2, pw * 0.35, ph * 0.35, 0.1, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }
                this.ctx.restore();
            } 
            else if (plat.type === 'bubble_wrap') {
                // פצפצים בתצוגת תלת-ממד מבריקה
                const bgGrad = this.ctx.createLinearGradient(rx, plat.y, rx, plat.y + plat.h);
                bgGrad.addColorStop(0, 'rgba(224, 242, 254, 0.25)');
                bgGrad.addColorStop(1, 'rgba(186, 230, 253, 0.45)');
                this.ctx.fillStyle = bgGrad;
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
                this.ctx.lineWidth = 1.5;
                
                this.drawRoundedRect(rx, plat.y, plat.w, plat.h, 6, true, true);
                
                for (const bubble of plat.bubbles) {
                    const bx = bubble.x - this.cameraX;
                    const by = plat.y + plat.h / 2;
                    const r = 9;
                    
                    if (!bubble.popped) {
                        // בועה שלמה מבריקה
                        const bubGrad = this.ctx.createRadialGradient(bx - 3, by - 3, 1, bx, by, r);
                        bubGrad.addColorStop(0, '#ffffff');
                        bubGrad.addColorStop(0.3, 'rgba(186, 230, 253, 0.95)');
                        bubGrad.addColorStop(0.85, 'rgba(14, 165, 233, 0.7)');
                        bubGrad.addColorStop(1, 'rgba(3, 105, 161, 0.35)');
                        
                        this.ctx.fillStyle = bubGrad;
                        this.ctx.beginPath();
                        this.ctx.arc(bx, by, r, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        // קשת השתקפות לבנה מבריקה
                        this.ctx.strokeStyle = '#ffffff';
                        this.ctx.lineWidth = 1.2;
                        this.ctx.beginPath();
                        this.ctx.arc(bx, by, r - 3, 1.2 * Math.PI, 1.8 * Math.PI);
                        this.ctx.stroke();
                    } else {
                        // בועה מפוצצת וקרועה
                        this.ctx.strokeStyle = 'rgba(2, 132, 199, 0.28)';
                        this.ctx.lineWidth = 1.5;
                        this.ctx.beginPath();
                        this.ctx.arc(bx, by, r - 1, 0, Math.PI * 2);
                        this.ctx.stroke();
                        
                        // סדקי פיצוץ קטנים בפנים
                        this.ctx.strokeStyle = 'rgba(14, 165, 233, 0.2)';
                        this.ctx.lineWidth = 1;
                        this.ctx.beginPath();
                        this.ctx.moveTo(bx - 4, by - 4);
                        this.ctx.lineTo(bx + 4, by + 4);
                        this.ctx.moveTo(bx - 4, by + 4);
                        this.ctx.lineTo(bx + 4, by - 4);
                        this.ctx.stroke();
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

    // ציור דמות: Gamer Boy מרהיב ביופיו
    drawGamerBoy(p, wiggle) {
        const h = p.h;
        const w = p.w;
        const now = Date.now();

        // 1. רגליים מפורטות עם נעלי ספורט זוהרות
        const legW = 9;
        const legH = 12;
        const leftLegY = wiggle > 0 ? -3 : 0;
        const rightLegY = wiggle < 0 ? -3 : 0;
        
        // רגל שמאל (מכנסיים שחורים עם פס ירוק)
        this.ctx.fillStyle = '#1e1b4b'; // כחול כהה
        this.ctx.fillRect(-w/2 + 2, -legH + leftLegY, legW, legH - 3);
        // נעל שמאל (ירוק ניאון ולבן)
        this.ctx.fillStyle = '#39ff14';
        this.ctx.fillRect(-w/2 + 1, -3 + leftLegY, legW + 2, 3);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(-w/2 + 3, -2 + leftLegY, 4, 1);

        // רגל ימין
        this.ctx.fillStyle = '#1e1b4b';
        this.ctx.fillRect(w/2 - 2 - legW, -legH + rightLegY, legW, legH - 3);
        this.ctx.fillStyle = '#39ff14';
        this.ctx.fillRect(w/2 - 3 - legW, -3 + rightLegY, legW + 2, 3);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(w/2 - 1 - legW, -2 + rightLegY, 4, 1);

        // 2. גוף (קפוצ'ון גיימינג מעוצב)
        const bodyY = -h + 12;
        const bodyH = 24;
        this.ctx.fillStyle = '#111827';
        this.ctx.strokeStyle = '#39ff14';
        this.ctx.lineWidth = 1.5;
        this.drawRoundedRect(-w/2, bodyY, w, bodyH, 5, true, true);
        
        // סמל ברק זוהר על החזה (פועם באטיות)
        const glowOpacity = 0.5 + Math.sin(now * 0.015) * 0.3;
        this.ctx.save();
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = '#39ff14';
        this.ctx.fillStyle = `rgba(57, 255, 20, ${glowOpacity})`;
        this.ctx.beginPath();
        this.ctx.moveTo(-2, bodyY + 6);
        this.ctx.lineTo(3, bodyY + 6);
        this.ctx.lineTo(-1, bodyY + 11);
        this.ctx.lineTo(4, bodyY + 11);
        this.ctx.lineTo(-3, bodyY + 18);
        this.ctx.lineTo(-1, bodyY + 12);
        this.ctx.lineTo(-4, bodyY + 12);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();

        // חוטי קפוצ'ון ירוקים ניאון
        this.ctx.strokeStyle = '#39ff14';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(-5, bodyY + 3);
        this.ctx.lineTo(-5, bodyY + 12);
        this.ctx.moveTo(5, bodyY + 3);
        this.ctx.lineTo(5, bodyY + 12);
        this.ctx.stroke();

        // 3. ידיים
        const armW = 7;
        const armH = 20;
        this.ctx.fillStyle = '#1f2937';
        this.ctx.strokeStyle = '#39ff14';
        this.ctx.lineWidth = 1;
        // יד שמאל
        this.ctx.save();
        this.ctx.translate(-w/2 - 1, bodyY + 2);
        if (wiggle !== 0) this.ctx.rotate(-wiggle * 2);
        this.drawRoundedRect(-armW, 0, armW, armH, 3, true, true);
        this.ctx.restore();
        // יד ימין
        this.ctx.save();
        this.ctx.translate(w/2 + 1, bodyY + 2);
        if (wiggle !== 0) this.ctx.rotate(wiggle * 2);
        this.drawRoundedRect(0, 0, armW, armH, 3, true, true);
        this.ctx.restore();

        // 4. ראש ושיער מפורטים
        this.ctx.fillStyle = '#ffd1a9'; // עור
        this.ctx.fillRect(-9, -h - 1, 18, 14);

        // שיער קוצני יפה
        this.ctx.fillStyle = '#37200c'; // חום כהה
        this.ctx.beginPath();
        this.ctx.moveTo(-11, -h);
        this.ctx.lineTo(-11, -h - 6);
        this.ctx.lineTo(-7, -h - 10);
        this.ctx.lineTo(-4, -h - 6);
        this.ctx.lineTo(-1, -h - 11);
        this.ctx.lineTo(3, -h - 7);
        this.ctx.lineTo(7, -h - 10);
        this.ctx.lineTo(11, -h - 5);
        this.ctx.lineTo(11, -h + 2);
        this.ctx.lineTo(9, -h + 2);
        this.ctx.lineTo(8, -h - 2);
        this.ctx.lineTo(-8, -h - 2);
        this.ctx.closePath();
        this.ctx.fill();

        // אוזניות גיימינג סופר יפות
        const pulse = Math.sin(now * 0.01) * 0.2 + 0.8;
        this.ctx.strokeStyle = `rgba(57, 255, 20, ${pulse})`;
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.arc(0, -h + 6, 12, Math.PI, 0); // קשת האוזניות
        this.ctx.stroke();
        
        // כריות האוזניות בעיצוב עתידני
        this.ctx.fillStyle = '#1f2937';
        this.ctx.strokeStyle = '#39ff14';
        this.ctx.lineWidth = 1;
        this.drawRoundedRect(-14, -h + 1, 5, 10, 2, true, true);
        this.drawRoundedRect(9, -h + 1, 5, 10, 2, true, true);
        // נקודות לד זוהרות
        this.ctx.fillStyle = '#39ff14';
        this.ctx.fillRect(-13, -h + 5, 2, 2);
        this.ctx.fillRect(11, -h + 5, 2, 2);

        // משקפי פיקסלים מגניבים (Visor) עם השתקפות לבנה
        this.ctx.fillStyle = '#0f172a';
        this.drawRoundedRect(-9, -h + 2, 18, 5, 1, true, false);
        this.ctx.fillStyle = '#39ff14'; // קו תחתון זוהר
        this.ctx.fillRect(-9, -h + 6, 18, 1);
        // השתקפות פיקסל לבן
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(-7, -h + 3, 2, 2);
        this.ctx.fillRect(3, -h + 3, 1, 1);
    }

    // ציור דמות: Hawaii Girl יפהפייה
    drawHawaiiGirl(p, wiggle) {
        const h = p.h;
        const w = p.w;
        const now = Date.now();

        // גלשן על הגב עם גרפיקת גלים טרופיים
        this.ctx.save();
        this.ctx.rotate(0.18 + wiggle * 0.5); // הגלשן זז קצת בתנועה
        const surfGrad = this.ctx.createLinearGradient(-16, -h, -4, -10);
        surfGrad.addColorStop(0, '#00f2fe');
        surfGrad.addColorStop(0.5, '#4facfe');
        surfGrad.addColorStop(1, '#ec4899'); // צבעים טרופיים עשירים
        this.ctx.fillStyle = surfGrad;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.5;
        this.drawRoundedRect(-16, -h - 4, 12, 40, 6, true, true);
        
        // פסים מעוצבים על הגלשן (פס שמש כתום באמצע)
        this.ctx.fillStyle = '#f97316';
        this.ctx.beginPath();
        this.ctx.ellipse(-10, -h + 16, 3, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        // 1. שיער ארוך וזורם מאחור
        this.ctx.fillStyle = '#1e1b4b';
        // שיער שמאל
        this.ctx.beginPath();
        this.ctx.ellipse(-11, -h + 18, 5, 20, 0.1 + wiggle, 0, Math.PI * 2);
        this.ctx.fill();
        // שיער ימין
        this.ctx.beginPath();
        this.ctx.ellipse(11, -h + 18, 5, 20, -0.1 + wiggle, 0, Math.PI * 2);
        this.ctx.fill();

        // 2. רגליים שזופות עם צמידי פרחים קטנים בקרסול
        const legW = 9;
        const legH = 12;
        const leftLegY = wiggle > 0 ? -3 : 0;
        const rightLegY = wiggle < 0 ? -3 : 0;
        
        this.ctx.fillStyle = '#d2a075'; // רגל שזופה
        this.ctx.fillRect(-w/2 + 2, -legH + leftLegY, legW, legH);
        this.ctx.fillRect(w/2 - 2 - legW, -legH + rightLegY, legW, legH);
        
        // צמיד פרחים ורוד בקרסול שמאל
        this.ctx.fillStyle = '#ff007f';
        this.ctx.beginPath();
        this.ctx.arc(-w/2 + 4, -2 + leftLegY, 2, 0, Math.PI*2);
        this.ctx.arc(-w/2 + 8, -2 + leftLegY, 2, 0, Math.PI*2);
        this.ctx.fill();

        // 3. חצאית קש מפורטת עם גדילים זוהרים
        this.ctx.fillStyle = '#f59e0b'; // חצאית צהובה-זהובה
        this.ctx.fillRect(-w/2 - 1, -legH - 2, w + 2, 6);
        // ציור גדילי חצאית מתנופפים
        this.ctx.strokeStyle = '#d97706';
        this.ctx.lineWidth = 1.5;
        for (let i = 0; i < 7; i++) {
            const lineX = -w/2 + (i * 5);
            const sway = wiggle * 5 * (i % 2 === 0 ? 1 : -1);
            this.ctx.beginPath();
            this.ctx.moveTo(lineX, -legH + 2);
            this.ctx.lineTo(lineX + sway, -legH + 9);
            this.ctx.stroke();
        }

        // 4. גוף (חולצת הוואי/בגד ים מפורט)
        const bodyH = 18;
        const bodyY = -h + 12;
        const bodyGrad = this.ctx.createLinearGradient(-w/2, bodyY, w/2, bodyY + bodyH);
        bodyGrad.addColorStop(0, '#ec4899');
        bodyGrad.addColorStop(1, '#f472b6');
        this.ctx.fillStyle = bodyGrad;
        this.drawRoundedRect(-w/2, bodyY, w, bodyH, 3, true, false);
        
        // הדפס פרחים לבן ויפה על בגד הים
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        for (let a = 0; a < 5; a++) {
            const ang = (a * Math.PI * 2) / 5;
            this.ctx.arc(Math.cos(ang)*2.5, bodyY + 9 + Math.sin(ang)*2.5, 1.8, 0, Math.PI*2);
        }
        this.ctx.fill();
        this.ctx.fillStyle = '#f59e0b'; // מרכז צהוב
        this.ctx.beginPath();
        this.ctx.arc(0, bodyY + 9, 1.2, 0, Math.PI*2);
        this.ctx.fill();

        // שרשרת פרחים (Lei) מסביב לצוואר
        const leiColors = ['#ff007f', '#f59e0b', '#3b82f6', '#10b981'];
        for (let i = 0; i < 4; i++) {
            this.ctx.fillStyle = leiColors[i];
            this.ctx.beginPath();
            this.ctx.arc(-8 + i * 5, bodyY + 2, 2.5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // 5. ידיים שזופות
        const armW = 7;
        const armH = 16;
        this.ctx.fillStyle = '#d2a075';
        // יד שמאל
        this.ctx.save();
        this.ctx.translate(-w/2 - 1, bodyY + 2);
        if (wiggle !== 0) this.ctx.rotate(-wiggle * 1.5);
        this.drawRoundedRect(-armW, 0, armW, armH, 2, true, false);
        this.ctx.restore();
        // יד ימין
        this.ctx.save();
        this.ctx.translate(w/2 + 1, bodyY + 2);
        if (wiggle !== 0) this.ctx.rotate(wiggle * 1.5);
        this.drawRoundedRect(0, 0, armW, armH, 2, true, false);
        this.ctx.restore();

        // 6. ראש וכתר פרחים מרהיב
        this.ctx.fillStyle = '#d2a075'; // פנים
        this.ctx.fillRect(-9, -h - 1, 18, 13);

        // שיער קדמי
        this.ctx.fillStyle = '#1e1b4b';
        this.ctx.fillRect(-10, -h - 2, 20, 4);

        // כתר פרחים צבעוני מפורט
        const crownColors = ['#f43f5e', '#ff007f', '#f59e0b', '#00f2fe', '#ffffff'];
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const flowerX = -10 + i * 5;
            
            // עלה ירוק קטן מאחור
            this.ctx.fillStyle = '#10b981';
            this.ctx.beginPath();
            this.ctx.ellipse(flowerX - 2, -h - 3, 2, 4, 0.5, 0, Math.PI * 2);
            this.ctx.fill();

            // הפרח
            this.ctx.fillStyle = crownColors[(Math.floor(now / 250) + i) % crownColors.length];
            this.ctx.beginPath();
            this.ctx.arc(flowerX, -h - 2, 3.8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // מרכז הפרח
            this.ctx.fillStyle = '#fef08a';
            this.ctx.beginPath();
            this.ctx.arc(flowerX, -h - 2, 1.2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // עיניים יפות עם ריסים עדינים
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(-4, -h + 4, 2, 0, Math.PI * 2);
        this.ctx.arc(4, -h + 4, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // ריסים
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.moveTo(-6, -h + 2);
        this.ctx.lineTo(-4, -h + 3);
        this.ctx.moveTo(6, -h + 2);
        this.ctx.lineTo(4, -h + 3);
        this.ctx.stroke();

        // נקודות אור בעיניים
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(-4.5, -h + 3.2, 0.7, 0, Math.PI * 2);
        this.ctx.arc(3.5, -h + 3.2, 0.7, 0, Math.PI * 2);
        this.ctx.fill();

        // סומק ורוד בלחיים
        this.ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
        this.ctx.beginPath();
        this.ctx.arc(-6.5, -h + 7, 2.5, 0, Math.PI * 2);
        this.ctx.arc(6.5, -h + 7, 2.5, 0, Math.PI * 2);
        this.ctx.fill();

        // חיוך עדין
        this.ctx.strokeStyle = '#475569';
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.arc(0, -h + 7, 3, 0.1 * Math.PI, 0.9 * Math.PI);
        this.ctx.stroke();
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
