class AudioSynth {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.noiseBuffer = null;
    }

    // אתחול ה-AudioContext לאחר אינטראקציה ראשונה של המשתמש (דרישת אבטחה של הדפדפנים)
    init() {
        if (this.ctx) return;
        
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
            
            // יצירת חוצץ רעש לבן מראש לשימוש חוזר
            const bufferSize = this.ctx.sampleRate * 2;
            this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = this.noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        } catch (e) {
            console.error("Web Audio API is not supported in this browser", e);
        }
    }

    // הפעלת מחולל הרעש הלבן
    playNoise(duration, filterType, filterFreq, filterQ = 1) {
        if (!this.ctx || this.isMuted) return null;

        const source = this.ctx.createBufferSource();
        source.buffer = this.noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);
        filter.Q.setValueAtTime(filterQ, this.ctx.currentTime);

        const gainNode = this.ctx.createGain();
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        return { source, filter, gainNode };
    }

    // סאונד מעיכה רטוב וגומי (Stress Ball)
    playSquish() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        
        // 1. רעש דחיסה רך (Low-pass noise sweep)
        const noise = this.playNoise(0.25, 'lowpass', 1000, 2);
        if (noise) {
            noise.gainNode.gain.setValueAtTime(0.001, now);
            noise.gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
            noise.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            noise.filter.frequency.setValueAtTime(1000, now);
            noise.filter.frequency.exponentialRampToValueAtTime(150, now + 0.2);

            noise.source.start(now);
            noise.source.stop(now + 0.25);
        }

        // 2. צפצוף/חריקת גומי קטנה (Sine sweep up)
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.15);
        
        oscGain.gain.setValueAtTime(0.001, now);
        oscGain.gain.linearRampToValueAtTime(0.08, now + 0.04);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        
        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.18);
    }

    // סאונד פקיעה חד ומהיר (Bubble Wrap)
    playPop() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const duration = 0.06;

        // 1. פופ קולי בתדר גבוה
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + duration);

        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + duration);

        // 2. רעש פיצוץ קטנטן בתדר גבוה
        const noise = this.playNoise(duration, 'bandpass', 2800, 3);
        if (noise) {
            noise.gainNode.gain.setValueAtTime(0.15, now);
            noise.gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

            noise.source.start(now);
            noise.source.stop(now + duration);
        }
    }

    // סאונד קראנץ' מתכתי/פלסטיקי מרובה קליקים (Soda Can)
    playCrunch() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const totalDuration = 0.35;
        
        // יצירת סדרה של רעשי פיצוח קטנים עם מרווחים אקראיים כדי לדמות קריסה
        const clicksCount = 7;
        for (let i = 0; i < clicksCount; i++) {
            const clickTime = now + (i * 0.04) + (Math.random() * 0.02);
            const clickDur = 0.03 + (Math.random() * 0.03);
            const clickFreq = 1500 + (Math.random() * 2500);

            const noise = this.playNoise(clickDur, 'highpass', clickFreq, 1);
            if (noise) {
                // כל קליק חזק בהתחלה ודועך מהר מאוד
                noise.gainNode.gain.setValueAtTime(0.12, clickTime);
                noise.gainNode.gain.exponentialRampToValueAtTime(0.001, clickTime + clickDur);
                
                noise.source.start(clickTime);
                noise.source.stop(clickTime + clickDur);
            }
        }

        // צליל מכה מתכתי עמום בבסיס
        const baseOsc = this.ctx.createOscillator();
        const baseGain = this.ctx.createGain();
        baseOsc.type = 'triangle';
        baseOsc.frequency.setValueAtTime(180, now);
        baseOsc.frequency.linearRampToValueAtTime(60, now + 0.15);

        baseGain.gain.setValueAtTime(0.2, now);
        baseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        baseOsc.connect(baseGain);
        baseGain.connect(this.ctx.destination);

        baseOsc.start(now);
        baseOsc.stop(now + 0.2);
    }

    // סאונד בוינג/חריקה של קוביית ג'לי (Jelly Block)
    playBoing() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const duration = 0.45;

        // גל משולש נותן אופי רך ומצויר
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = 'triangle';
        
        // עליית תדר מהירה ליצירת אפקט "בוינג"
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.2);
        osc.frequency.linearRampToValueAtTime(150, now + duration);

        // אפקט ויברטו (רטיטה) לג'לי באמצעות רשת אפנון (LFO)
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(18, now); // תדירות הרטיטה
        lfoGain.gain.setValueAtTime(15, now); // עוצמת הרטיטה בתדר
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.35, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        lfo.start(now);
        osc.start(now);
        
        lfo.stop(now + duration);
        osc.stop(now + duration);
    }

    // סאונד מעבר פורטל / ניצחון (Portal bells)
    playPortal() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        
        // יצירת ארפג'ו עולה של פעמונים מספקים (Pentatonic major scale)
        const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C4, D4, E4, G4, A4, C5
        notes.forEach((freq, index) => {
            const noteTime = now + (index * 0.08);
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            // תערובת של גל סינוס וסיינרייז
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteTime);
            
            // דעיכה ארוכה לפעמונים
            gainNode.gain.setValueAtTime(0.12, noteTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.8);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start(noteTime);
            osc.stop(noteTime + 0.8);
        });
    }

    // סאונד קפיצה רגילה
    playJump() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const duration = 0.12;

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + duration);

        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
    }

    // סאונד קפיצה כפולה (מהיר וגבוה יותר)
    playDoubleJump() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const duration = 0.12;

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + duration);

        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
    }

    // סאונד התרסקות / מוות
    playDeath() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        
        // רעש נפילה עמום
        const noise = this.playNoise(0.4, 'lowpass', 300, 1);
        if (noise) {
            noise.gainNode.gain.setValueAtTime(0.25, now);
            noise.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            noise.source.start(now);
            noise.source.stop(now + 0.4);
        }

        // תדר גל משולש יורד
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.3);

        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    // סאונד מכה חזקה למטה (Slam)
    playSlam() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        
        const noise = this.playNoise(0.2, 'bandpass', 400, 2);
        if (noise) {
            noise.gainNode.gain.setValueAtTime(0.3, now);
            noise.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            noise.source.start(now);
            noise.source.stop(now + 0.2);
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    // צליל לחיצת מקלדת מכנית (Keyboard click)
    playKeyboardClick() {
        this.init();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        
        // 1. קליק סינוס קצר בתדר גבוה
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1700, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.035);
        gainNode.gain.setValueAtTime(0.18, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);

        // 2. רעש פיצוח מהיר מאוד (Highpass noise transient)
        const noise = this.playNoise(0.03, 'highpass', 4500, 1.5);
        if (noise) {
            noise.gainNode.gain.setValueAtTime(0.18, now);
            noise.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            noise.source.start(now);
            noise.source.stop(now + 0.03);
        }
    }

    // צליל יללת חתול חמודה (Meow)
    playMeow() {
        this.init();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const duration = 0.35;
        
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = 'triangle';
        
        // Meow frequency sweep
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.linearRampToValueAtTime(620, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(400, now + duration);
        
        // Bandpass filter to create nasal vocal "mew" sound
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100, now);
        filter.frequency.linearRampToValueAtTime(1900, now + 0.12);
        filter.frequency.exponentialRampToValueAtTime(1000, now + duration);
        filter.Q.setValueAtTime(2, now);
        
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.16, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + duration);
    }

    // צליל קרקור צפרדע (Frog croak)
    playFrogCroak() {
        this.init();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const duration = 0.28;
        
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(115, now);
        osc.frequency.linearRampToValueAtTime(95, now + duration);
        
        // Bandpass filter with a modulation LFO to give it the "ribbit" texture
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(550, now);
        filter.Q.setValueAtTime(5, now);
        
        const modulator = this.ctx.createOscillator();
        modulator.frequency.setValueAtTime(48, now); // 48Hz buzz modulation
        
        const modGain = this.ctx.createGain();
        modGain.gain.setValueAtTime(120, now); // Modulate filter frequency
        
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.24, now + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        modulator.connect(modGain);
        modGain.connect(filter.frequency);
        
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        osc.start(now);
        modulator.start(now);
        osc.stop(now + duration);
        modulator.stop(now + duration);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }
}

// ייצוא מופע יחיד של מנוע השמע
const audio = new AudioSynth();
window.audio = audio;
