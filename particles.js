class Particle {
    constructor(x, y, dx, dy, size, color, life, type = 'normal') {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.size = size;
        this.color = color;
        this.maxLife = life;
        this.life = life;
        this.type = type; // 'normal', 'flower', 'pop_ring', 'spark', 'matrix', 'star'
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.15;
    }

    update(gravity = 0) {
        this.x += this.dx;
        this.y += this.dy;
        this.dy += gravity;
        this.life--;
        this.angle += this.rotationSpeed;
    }

    draw(ctx) {
        const opacity = Math.max(0, this.life / this.maxLife);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = opacity;

        if (this.type === 'flower') {
            // ציור פרח קטן בצורת שושנה פשוטה
            ctx.fillStyle = this.color;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                ctx.rotate((Math.PI * 2) / 5);
                ctx.ellipse(0, this.size / 2, this.size / 2.5, this.size / 1.2, 0, 0, Math.PI * 2);
            }
            ctx.fill();
            
            // מרכז הפרח בצהוב
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'pop_ring') {
            // גל הדף מתרחב של פיצוץ בועה
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3 * opacity;
            ctx.beginPath();
            // גודל הטבעת גדל ככל שהחיים פוחתים
            const radius = this.size * (1.2 - opacity) * 3;
            ctx.arc(0, 0, Math.max(1, radius), 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'spark') {
            // ניצוץ ניאון זוהר (קווים מהירים)
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.size * opacity;
            ctx.beginPath();
            ctx.moveTo(-this.dx * 1.5, -this.dy * 1.5);
            ctx.lineTo(this.dx * 1.5, this.dy * 1.5);
            ctx.stroke();
        } else if (this.type === 'matrix') {
            // חלקיק קוד של גיימרים
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.font = `bold ${this.size}px monospace`;
            const digit = Math.random() > 0.5 ? "1" : "0";
            ctx.fillText(digit, -this.size / 2, this.size / 2);
        } else if (this.type === 'star') {
            // כוכבים נוצצים ליד הפורטל
            ctx.fillStyle = this.color;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(0, -this.size);
                ctx.rotate(Math.PI / 5);
                ctx.lineTo(0, -this.size / 2);
                ctx.rotate(Math.PI / 5);
            }
            ctx.closePath();
            ctx.fill();
        } else {
            // חלקיק עגול סטנדרטי (עבור מעיכות ג'לי וכדורי לחץ)
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 4;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(1, this.size), 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    update(gravity = 0) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(gravity);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }

    // הוספת חלקיק בודד
    add(x, y, dx, dy, size, color, life, type = 'normal') {
        this.particles.push(new Particle(x, y, dx, dy, size, color, life, type));
    }

    // שובל תנועה של דמות גיימר
    spawnGamerTrail(x, y) {
        // נוסיף מספר ביטים של קוד
        const dx = (Math.random() - 0.5) * 1.5;
        const dy = (Math.random() - 0.5) * 1.5 - 0.5;
        const size = 10 + Math.random() * 8;
        const color = `rgba(57, 255, 20, ${0.4 + Math.random() * 0.4})`; // ירוק ניאון
        this.add(x, y, dx, dy, size, color, 30, 'matrix');
    }

    // שובל תנועה של דמות בת הוואי
    spawnHawaiiTrail(x, y) {
        // נוסיף פרחים קטנים צבעוניים
        const dx = (Math.random() - 0.5) * 1 - 0.5;
        const dy = Math.random() * 0.8 - 0.2;
        const size = 6 + Math.random() * 6;
        const colors = ['#ff007f', '#ff5e62', '#f472b6', '#fbcfe8']; // גווני ורוד טרופי
        const color = colors[Math.floor(Math.random() * colors.length)];
        this.add(x, y, dx, dy, size, color, 40, 'flower');
    }

    // אפקט פיצוץ של פצפצים (פקיעה)
    spawnPopExplosion(x, y) {
        // 1. גל הדף מעגלי
        this.add(x, y, 0, 0, 16, '#e0f2fe', 15, 'pop_ring');

        // 2. רסיסי פלסטיק עפים לכל עבר
        const count = 12;
        for (let i = 0; i < count; i++) {
            const angle = (i * Math.PI * 2) / count + (Math.random() - 0.5) * 0.3;
            const speed = 2 + Math.random() * 3;
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed - 1; // קצת למעלה
            const size = 2 + Math.random() * 3;
            this.add(x, y, dx, dy, size, 'rgba(255, 255, 255, 0.85)', 25 + Math.random() * 15, 'normal');
        }
    }

    // אפקט מעיכה של פחית מתכת / בקבוק פלסטיק (קראנץ')
    spawnCrunchExplosion(x, y, color = '#cbd5e1') {
        const count = 16;
        // 1. גיצי ניאון עפים
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 5;
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed - 2;
            const size = 2 + Math.random() * 2;
            // שילוב של חלקיקי מתכת אפורים וגיצים ירוקים/כתומים
            const isSpark = Math.random() > 0.4;
            const sparkColor = isSpark ? (Math.random() > 0.5 ? '#39ff14' : '#ec4899') : color;
            this.add(x, y, dx, dy, size, sparkColor, 20 + Math.random() * 15, isSpark ? 'spark' : 'normal');
        }
    }

    // אפקט מעיכה של כדור לחץ / סקווש (רך וצבעוני)
    spawnSquishExplosion(x, y, color = '#ec4899') {
        const count = 14;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3;
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed - 1.5;
            const size = 4 + Math.random() * 5;
            this.add(x, y, dx, dy, size, color, 30 + Math.random() * 20, 'normal');
        }
    }

    // אפקט זוהר סביב פורטל הסיום
    spawnPortalVortex(x, y, color = '#fbbf24') {
        // נוסיף כוכב קטן שמסתחרר סביב הפורטל ונשאב פנימה
        const angle = Math.random() * Math.PI * 2;
        const radius = 35 + Math.random() * 25;
        // מיקום התחלתי על פני המעגל
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        
        // מהירות מכוונת למרכז עם סיבוב
        const speed = 0.5 + Math.random() * 0.8;
        const dx = -Math.cos(angle) * speed + Math.sin(angle) * 0.8;
        const dy = -Math.sin(angle) * speed - Math.cos(angle) * 0.8;
        const size = 3 + Math.random() * 4;

        this.add(px, py, dx, dy, size, color, 40, 'star');
    }

    // ניצוצות נחיתה / פיצוץ קטן
    spawnDust(x, y, color = '#ffffff') {
        const count = 6;
        for (let i = 0; i < count; i++) {
            const dx = (Math.random() - 0.5) * 3;
            const dy = (Math.random() - 0.5) * 1 - 0.5;
            const size = 2 + Math.random() * 2;
            this.add(x, y, dx, dy, size, color, 15 + Math.random() * 10, 'normal');
        }
    }

    clear() {
        this.particles = [];
    }
}

// ייצוא מופע יחיד של מנוע החלקיקים
const particles = new ParticleSystem();
window.particles = particles;
