const GAME_LEVELS = [
    {
        // עולם 1
        name: "גני המעיכות (World 1)",
        worldId: 1,
        width: 3200,
        height: 600,
        startX: 100,
        startY: 400,
        portalX: 3050,
        portalY: 350,
        gravity: 0.45,
        theme: {
            bgGradStart: "#bae6fd", // תכלת שמיים בהיר
            bgGradEnd: "#f0f9ff",   // לבן/תכלת רך
            accent: "#ec4899",
            platformBase: "#7c3aed",
            skylineColor: "rgba(139, 92, 246, 0.15)"
        },
        platforms: [
            // פלטפורמת התחלה
            { x: 0, y: 450, w: 250, h: 150, type: "normal", label: "נקודת התחלה" },
            
            // כדור לחץ ראשון (קפיצי ומעיך)
            { x: 350, y: 430, w: 100, h: 70, type: "stress_ball", label: "כדור לחץ ורוד" },
            
            // פלטפורמה רגילה באוויר
            { x: 550, y: 320, w: 180, h: 30, type: "normal" },
            
            // קוביית ג'לי גדולה (רוטטת)
            { x: 800, y: 400, w: 120, h: 80, type: "jelly", label: "קוביית ג'לי סגולה" },
            
            // פלטפורמות קטנות לפארקור דינמי
            { x: 1050, y: 280, w: 80, h: 30, type: "normal" },
            { x: 1250, y: 220, w: 80, h: 30, type: "normal" },
            
            // כדור לחץ באוויר
            { x: 1420, y: 350, w: 90, h: 60, type: "stress_ball", label: "מיני כדור לחץ" },
            
            // פלטפורמה רגילה ארוכה
            { x: 1600, y: 430, w: 300, h: 170, type: "normal" },
            
            // פצפצים בגן (טעימה לשלב הבא)
            { x: 1980, y: 390, w: 200, h: 40, type: "bubble_wrap", bubblesCount: 6, label: "פצפצים" },
            
            // ג'לי גבוה
            { x: 2280, y: 320, w: 110, h: 70, type: "jelly" },
            
            // שילוב כדור לחץ וקפיצה כפולה
            { x: 2500, y: 450, w: 100, h: 70, type: "stress_ball" },
            { x: 2720, y: 300, w: 100, h: 300, type: "normal" },
            
            // פלטפורמת סיום ופורטל
            { x: 2950, y: 420, w: 250, h: 180, type: "normal" }
        ]
    },
    {
        // עולם 2
        name: "סמטת הפחיות הזוהרת (World 2)",
        worldId: 2,
        width: 3400,
        height: 600,
        startX: 100,
        startY: 400,
        portalX: 3250,
        portalY: 250,
        gravity: 0.48, // כבידה מעט חזקה יותר
        theme: {
            bgGradStart: "#ffedd5", // כתום שקיעה בהיר
            bgGradEnd: "#fee2e2",   // ורוד שקיעה בהיר
            accent: "#0ea5e9",
            platformBase: "#0284c7",
            skylineColor: "rgba(251, 146, 60, 0.2)"
        },
        platforms: [
            // התחלה
            { x: 0, y: 480, w: 220, h: 120, type: "normal" },
            
            // פחית ראשונה למעיכה
            { x: 300, y: 440, w: 80, h: 100, type: "soda_can", label: "פחית קולה" },
            
            // פלטפורמת רחוב
            { x: 450, y: 380, w: 150, h: 30, type: "normal" },
            
            // בקבוק פלסטיק (נמעך)
            { x: 680, y: 340, w: 70, h: 120, type: "soda_can", label: "בקבוק מים" },
            
            // פחיות בשורה שצריך לרוץ ולמעוך ברצף
            { x: 850, y: 420, w: 70, h: 90, type: "soda_can" },
            { x: 970, y: 400, w: 70, h: 90, type: "soda_can" },
            { x: 1090, y: 380, w: 70, h: 90, type: "soda_can" },
            
            // קרטון זרוק רוטט (משתמש בפיזיקת ג'לי מעוצבת כקרטון)
            { x: 1250, y: 320, w: 140, h: 80, type: "jelly", label: "ארגז קרטון" },
            
            // פלטפורמה תלויה גבוהה
            { x: 1500, y: 220, w: 200, h: 30, type: "normal" },
            
            // פחית מוגבהת במיוחד
            { x: 1800, y: 340, w: 70, h: 110, type: "soda_can" },
            
            // פלטפורמה רגילה
            { x: 1950, y: 420, w: 250, h: 180, type: "normal" },
            
            // כדור לחץ ברחוב (כדור גומי מלוכלך)
            { x: 2300, y: 430, w: 100, h: 70, type: "stress_ball", label: "כדור גומי" },
            
            // פארקור פחיות ופצפצים מהיר
            { x: 2500, y: 350, w: 160, h: 40, type: "bubble_wrap", bubblesCount: 5 },
            { x: 2750, y: 280, w: 70, h: 100, type: "soda_can" },
            { x: 2900, y: 200, w: 120, h: 30, type: "normal" },
            
            // סיום
            { x: 3150, y: 350, w: 250, h: 250, type: "normal" }
        ]
    },
    {
        // עולם 3
        name: "ארץ הצעצועים (World 3)",
        worldId: 3,
        width: 3600,
        height: 600,
        startX: 100,
        startY: 400,
        portalX: 3450,
        portalY: 220,
        gravity: 0.42, // כבידה מעט נמוכה יותר (עולם צעצועים קפיצי)
        theme: {
            bgGradStart: "#fef9c3", // צהוב בוקר זהוב בהיר
            bgGradEnd: "#e0f2fe",   // תכלת פסטל רך
            accent: "#d97706",
            platformBase: "#db2777",
            skylineColor: "rgba(234, 179, 8, 0.25)"
        },
        platforms: [
            // התחלה
            { x: 0, y: 450, w: 250, h: 150, type: "normal" },
            
            // יריעת פצפצים רחבה במיוחד לפוצץ ברגל
            { x: 320, y: 420, w: 280, h: 45, type: "bubble_wrap", bubblesCount: 9, label: "שטיח פצפצים" },
            
            // ברווז אמבטיה מצפצף קפיצי (stress ball)
            { x: 670, y: 380, w: 90, h: 80, type: "stress_ball", label: "ברווז גומי" },
            
            // פלטפורמת בלוקי משחק
            { x: 820, y: 280, w: 160, h: 30, type: "normal" },
            
            // עוד פצפצים קטנים
            { x: 1050, y: 320, w: 150, h: 40, type: "bubble_wrap", bubblesCount: 5 },
            
            // ג'לי צעצועים צהוב
            { x: 1280, y: 380, w: 120, h: 90, type: "jelly", label: "ג'לי צעצוע" },
            
            // פארקור אווירי מהיר
            { x: 1500, y: 250, w: 80, h: 30, type: "normal" },
            { x: 1650, y: 180, w: 80, h: 30, type: "normal" },
            { x: 1800, y: 220, w: 120, h: 40, type: "bubble_wrap", bubblesCount: 4 },
            
            // קומבו פחית קוקה קולה וברווז צעצוע
            { x: 2000, y: 390, w: 80, h: 120, type: "soda_can" },
            { x: 2150, y: 380, w: 90, h: 80, type: "stress_ball" },
            
            // קטע פצפצים ארוך
            { x: 2350, y: 320, w: 300, h: 45, type: "bubble_wrap", bubblesCount: 10 },
            
            // ג'לי צעצועים ענק
            { x: 2750, y: 400, w: 150, h: 100, type: "jelly" },
            
            // קפיצות קיר ופארקור קשיח לקראת הפורטל
            { x: 2980, y: 250, w: 120, h: 30, type: "normal" },
            { x: 3180, y: 320, w: 90, h: 80, type: "stress_ball" },
            
            // סיום המשחק
            { x: 3350, y: 350, w: 300, h: 250, type: "normal" }
        ]
    }
];

window.GAME_LEVELS = GAME_LEVELS;
