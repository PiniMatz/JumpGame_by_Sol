class GamePhysics {
    constructor() {
        this.player = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            w: 30,
            h: 46,
            grounded: false,
            jumpsLeft: 2,
            maxJumps: 2,
            charType: 'gamer_boy', // או 'hawaii_girl'
            facing: 'right',
            isSlamming: false,
            // משתנים לאפקט עיוות השחקן (Squash and Stretch)
            scaleX: 1,
            scaleY: 1
        };
        this.level = null;
        this.screenShake = 0;
    }

    initPlayer(startX, startY, charType) {
        this.player.x = startX;
        this.player.y = startY;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.grounded = false;
        this.player.jumpsLeft = 2;
        this.player.charType = charType;
        this.player.isSlamming = false;
        this.player.scaleX = 1;
        this.player.scaleY = 1;
        
        // יתרון מיוחד לפי דמות
        if (charType === 'gamer_boy') {
            this.player.maxJumps = 2; // קפיצה כפולה רגילה
        } else {
            this.player.maxJumps = 2; // קפיצה כפולה מרחפת
        }
    }

    setLevel(level) {
        this.level = level;
        
        // אתחול מצבים ספציפיים לפלטפורמות
        for (const plat of this.level.platforms) {
            plat.currentY = plat.y;
            plat.currentH = plat.h;
            plat.squishY = 1; // 1 = לא מכווץ
            plat.wobbleAngle = 0;
            plat.wobbleAmp = 0;
            
            if (plat.type === 'soda_can') {
                plat.crushStage = 0; // 0 = שלם, 1 = חצי מעוך, 2 = שטוח לחלוטין
                plat.originalH = plat.h;
                plat.originalY = plat.y;
            }
            
            if (plat.type === 'bubble_wrap') {
                plat.bubbles = [];
                const count = plat.bubblesCount || 6;
                const bubbleW = plat.w / count;
                for (let i = 0; i < count; i++) {
                    plat.bubbles.push({
                        x: plat.x + i * bubbleW + bubbleW / 2,
                        popped: false
                    });
                }
            }
        }
    }

    // קריאת כקלט של המקשים ועדכון מהירות
    updatePlayerInput(keys) {
        const p = this.player;
        
        // הגדרות פיזיקליות של מהירות
        const accel = p.charType === 'gamer_boy' ? 0.75 : 0.6; // גיימר מהיר יותר בריצה
        const maxSpeed = p.charType === 'gamer_boy' ? 7 : 5.5;
        const friction = 0.82;
        
        // תנועה ימינה ושמאלה
        if (keys.ArrowRight) {
            p.vx += accel;
            p.facing = 'right';
            if (p.vx > maxSpeed) p.vx = maxSpeed;
        } else if (keys.ArrowLeft) {
            p.vx -= accel;
            p.facing = 'left';
            if (p.vx < -maxSpeed) p.vx = -maxSpeed;
        } else {
            p.vx *= friction;
            if (Math.abs(p.vx) < 0.1) p.vx = 0;
        }

        // שובל חלקיקים תנועה
        if (Math.abs(p.vx) > 1 && p.grounded && Math.random() < 0.3) {
            if (p.charType === 'gamer_boy') {
                particles.spawnGamerTrail(p.x + p.w / 2, p.y + p.h - 5);
            } else {
                particles.spawnHawaiiTrail(p.x + p.w / 2, p.y + p.h - 5);
            }
        }
    }

    // הפעלת קפיצה
    jump() {
        const p = this.player;
        if (p.jumpsLeft > 0) {
            // האם זו קפיצה ראשונה או שנייה?
            const isDouble = p.jumpsLeft < p.maxJumps;
            
            p.grounded = false;
            p.isSlamming = false;
            p.vy = p.charType === 'hawaii_girl' && isDouble ? -7.8 : -9.5; // הוואי קופצת מעט נמוך יותר אבל יש לה קפיצה כפולה מרחפת
            
            p.jumpsLeft--;

            // ויזואלי - מתיחה אנכית של השחקן בקפיצה
            p.scaleX = 0.75;
            p.scaleY = 1.3;

            if (isDouble) {
                audio.playDoubleJump();
                // אפקט אבק בועה סביב קפיצה כפולה
                particles.spawnDust(p.x + p.w / 2, p.y + p.h, '#e0aaff');
            } else {
                audio.playJump();
                particles.spawnDust(p.x + p.w / 2, p.y + p.h, '#ffffff');
            }
        }
    }

    // הפעלת מכה חזקה כלפי מטה (Slam)
    slamDown() {
        const p = this.player;
        if (!p.grounded && !p.isSlamming) {
            p.vy = 16; // מהירות ירידה חדה כלפי מטה
            p.vx *= 0.3; // כמעט ללא תנועה אופקית בזמן סלאם
            p.isSlamming = true;
            // רסיסים קטנים באוויר
            particles.spawnDust(p.x + p.w / 2, p.y + p.h / 2, '#38bdf8');
        }
    }

    // עדכון המיקום והחלת פיזיקה
    update(keys) {
        const p = this.player;
        const g = this.level ? this.level.gravity : 0.45;
        
        // רעידת מסך דועכת
        if (this.screenShake > 0) {
            this.screenShake *= 0.9;
            if (this.screenShake < 0.1) this.screenShake = 0;
        }

        // החלת תנועה וכבידה
        this.updatePlayerInput(keys);
        
        // החלת כוח כבידה
        // לבת הוואי יש כבידה מופחתת קלות באוויר בקפיצה הכפולה (אפקט ריחוף)
        let appliedGravity = g;
        if (p.charType === 'hawaii_girl' && !p.grounded && p.vy < 3 && p.jumpsLeft === 0 && keys.ArrowUp) {
            appliedGravity = g * 0.55; // כבידה חלשה בהחזקת כפתור הקפיצה
            if (Math.random() < 0.2) {
                particles.spawnHawaiiTrail(p.x + p.w / 2, p.y + p.h); // תוספת חלקיקים
            }
        }
        
        p.vy += appliedGravity;
        if (p.vy > 18) p.vy = 18; // הגבלת מהירות נפילה מרבית

        // עדכון מיקומים זמני
        p.x += p.vx;
        p.y += p.vy;

        // החזרת אפקט Squash & Stretch של השחקן חזרה ל-1
        p.scaleX += (1 - p.scaleX) * 0.15;
        p.scaleY += (1 - p.scaleY) * 0.15;

        // בדיקת גבולות מפה בסיסיים
        if (p.x < 0) {
            p.x = 0;
            p.vx = 0;
        }
        if (p.x + p.w > this.level.width) {
            p.x = this.level.width - p.w;
            p.vx = 0;
        }

        // בדיקה אם נפל לתהום (מוות)
        if (p.y > this.level.height + 100) {
            this.handleDeath();
            return;
        }

        // טיפול בהתנגשויות עם פלטפורמות
        p.grounded = false;
        if (this.level) {
            this.handlePlatformCollisions();
            this.updatePlatformAnimations();
        }
    }

    // זיהוי התנגשות AABB מול פלטפורמות
    handlePlatformCollisions() {
        const p = this.player;

        for (const plat of this.level.platforms) {
            // חישוב גובה נוכחי מופחת (בעקבות מעיכה)
            const platH = plat.type === 'soda_can' ? plat.currentH : plat.h * plat.squishY;
            const platY = plat.type === 'soda_can' ? plat.currentY : plat.y + (plat.h - platH);

            // בדיקת חפיפה (AABB)
            if (p.x + p.w > plat.x && 
                p.x < plat.x + plat.w && 
                p.y + p.h > platY && 
                p.y < platY + platH) {
                
                // בדיקת כיוון התנגשות: האם השחקן נופל מלמעלה על הפלטפורמה?
                // נוסחה: המיקום הקודם של הרגליים של השחקן היה מעל לראש הפלטפורמה
                const prevPlayerBottom = p.y + p.h - p.vy;
                const prevPlatTop = platY - (plat.type === 'soda_can' ? 0 : 0); // הערכת מיקום עליון קודם

                if (p.vy > 0 && prevPlayerBottom <= platY + 12) {
                    // נחיתה מוצלחת על פלטפורמה
                    p.y = platY - p.h;
                    p.vy = 0;
                    p.grounded = true;
                    p.jumpsLeft = p.maxJumps;

                    // מתיחת השחקן לרוחב כשהוא נוחת (Squash)
                    const squashMultiplier = p.isSlamming ? 1.5 : 1.25;
                    p.scaleX = squashMultiplier;
                    p.scaleY = 2 - squashMultiplier;

                    // הפעלת התגובה הייחודית של סוג הפלטפורמה
                    this.triggerPlatformReaction(plat);
                    break; // התנגשות אחת מספיקה לריצה הנוכחית
                } else {
                    // התנגשות מהצדדים או מלמטה
                    // התנגשות מלמטה (דחיפה למטה)
                    if (p.vy < 0 && p.y - p.vy >= platY + platH - 8) {
                        p.y = platY + platH;
                        p.vy = 0;
                    } 
                    // התנגשות מהצדדים
                    else {
                        if (p.vx > 0 && p.x + p.w - p.vx <= plat.x + 8) {
                            p.x = plat.x - p.w;
                            p.vx = 0;
                        } else if (p.vx < 0 && p.x - p.vx >= plat.x + plat.w - 8) {
                            p.x = plat.x + plat.w;
                            p.vx = 0;
                        }
                    }
                }
            }
        }
    }

    // הפעלת התגובה הפיזיקלית והקולית הייחודית לכל פלטפורמה
    triggerPlatformReaction(plat) {
        const p = this.player;
        const isSlam = p.isSlamming;
        
        // הגברת רעש וזעזוע במקרה של Slam
        this.screenShake = isSlam ? 15 : 4;
        
        switch (plat.type) {
            case 'stress_ball':
                // כדור לחץ: כיווץ עמוק והקפצה גבוהה במיוחד
                plat.squishY = isSlam ? 0.35 : 0.5;
                p.vy = isSlam ? -15.5 : -12.5; // קפיצה כפולה בגובה
                p.grounded = false; // להמשיך באוויר
                
                audio.playSquish();
                particles.spawnSquishExplosion(p.x + p.w / 2, plat.y + 10, plat.label ? '#ec4899' : '#8b5cf6');
                break;
                
            case 'jelly':
                // ג'לי: התחלת רטט (Wobble) והקפצה
                plat.wobbleAmp = isSlam ? 32 : 20;
                plat.wobbleAngle = 0;
                p.vy = isSlam ? -13.5 : -10.8;
                p.grounded = false;
                
                audio.playBoing();
                particles.spawnSquishExplosion(p.x + p.w / 2, plat.y + 10, '#d946ef');
                break;
                
            case 'soda_can':
                // פחית שתייה / בקבוק פלסטיק: מעיכה בשלבים
                if (plat.crushStage < 2) {
                    const prevStage = plat.crushStage;
                    // Slam מועך הכל מיד
                    plat.crushStage = isSlam ? 2 : plat.crushStage + 1;
                    
                    audio.playCrunch();
                    particles.spawnCrunchExplosion(p.x + p.w / 2, plat.y + 20, plat.label === 'בקבוק מים' ? '#38bdf8' : '#e2e8f0');
                    
                    // החלת המידות החדשות של הפחית
                    if (plat.crushStage === 1) {
                        plat.currentH = plat.originalH * 0.6;
                        plat.currentY = plat.originalY + (plat.originalH - plat.currentH);
                        p.vy = -3.5; // קפיצה קטנה מספקת
                        p.grounded = false;
                    } else if (plat.crushStage === 2) {
                        plat.currentH = plat.originalH * 0.25;
                        plat.currentY = plat.originalY + (plat.originalH - plat.currentH);
                        p.vy = -2.5;
                        p.grounded = false;
                    }
                    
                    // עדכון מיקום השחקן מיד לפחית המעוכה
                    p.y = plat.currentY - p.h;
                } else {
                    // הפחית כבר שטוחה לגמרי - מתנהגת כפלטפורמה רגילה
                    particles.spawnDust(p.x + p.w / 2, plat.currentY, '#94a3b8');
                }
                break;
                
            case 'bubble_wrap':
                // פצפצים: זיהוי באיזו בועה דרכנו ופקיעתה
                const bubbleWidth = plat.w / plat.bubbles.length;
                const playerCenterX = p.x + p.w / 2;
                const relativeX = playerCenterX - plat.x;
                const bubbleIdx = Math.floor(relativeX / bubbleWidth);

                if (bubbleIdx >= 0 && bubbleIdx < plat.bubbles.length) {
                    const bubble = plat.bubbles[bubbleIdx];
                    if (!bubble.popped) {
                        bubble.popped = true;
                        
                        audio.playPop();
                        particles.spawnPopExplosion(bubble.x, plat.y + 10);
                        
                        // קפיצת דחיפה קלה (נחמד לריצה קפיצית על פצפצים)
                        p.vy = isSlam ? -6.5 : -5.2;
                        p.grounded = false;
                    } else {
                        // הבועה כבר פקועה
                        particles.spawnDust(p.x + p.w / 2, plat.y, '#e2e8f0');
                    }
                }
                break;
                
            case 'normal':
            default:
                // פלטפורמה רגילה: רעש נחיתה קטן
                particles.spawnDust(p.x + p.w / 2, plat.y, '#cbd5e1');
                break;
        }

        // ביטול מצב slam לאחר נחיתה
        p.isSlamming = false;
    }

    // עדכון ודעיכה של האנימציות הפיזיקליות של הפלטפורמות בכל פריים
    updatePlatformAnimations() {
        if (!this.level) return;

        for (const plat of this.level.platforms) {
            // כדורי לחץ חוזרים לגודלם המקורי
            if (plat.type === 'stress_ball') {
                plat.squishY += (1 - plat.squishY) * 0.1;
            }
            
            // ג'לי מתנדנד לפי סינוס דועך
            if (plat.type === 'jelly') {
                if (plat.wobbleAmp > 0.1) {
                    plat.wobbleAngle += 0.25; // מהירות הרטיטה
                    plat.wobbleAmp *= 0.92;   // דעיכת הרטיטה
                } else {
                    plat.wobbleAmp = 0;
                    plat.wobbleAngle = 0;
                }
            }
        }
    }

    // מוות ונפילה
    handleDeath() {
        audio.playDeath();
        this.screenShake = 18;
        
        // יצירת פיצוץ חלקיקים גדול בצבע של הדמות
        const charColor = this.player.charType === 'gamer_boy' ? '#39ff14' : '#ff007f';
        particles.spawnCrunchExplosion(this.player.x + this.player.w / 2, this.level.height - 10, charColor);

        // איפוס מיקום שחקן לתחילת המפה
        this.initPlayer(this.level.startX, this.level.startY, this.player.charType);
        
        // הגברת מונה פסילות ב-HUD (באמצעות אירוע מותאם אישית)
        window.dispatchEvent(new CustomEvent('player-death'));
    }
}

// ייצוא מופע יחיד של הפיזיקה
const physics = new GamePhysics();
window.physics = physics;
