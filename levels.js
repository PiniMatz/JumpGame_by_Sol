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
            accent: "#10b981",      // ירוק זוהר
            platformBase: "#7c3aed",
            skylineColor: "rgba(139, 92, 246, 0.15)"
        },
        platforms: [
            // פלטפורמת התחלה
            { x: 0, y: 450, w: 250, h: 150, type: "normal" },
            
            // ספוג ראשון
            { x: 350, y: 430, w: 100, h: 60, type: "sponge" },
            
            // פלטפורמה רגילה באוויר
            { x: 550, y: 320, w: 180, h: 30, type: "normal" },
            
            // כרית רכה
            { x: 800, y: 400, w: 120, h: 50, type: "pillow" },
            
            // פלטפורמות קטנות לפארקור דינמי
            { x: 1050, y: 280, w: 80, h: 30, type: "normal" },
            { x: 1250, y: 220, w: 80, h: 30, type: "normal" },
            
            // ספוג נוסף באוויר
            { x: 1420, y: 350, w: 90, h: 60, type: "sponge" },
            
            // פלטפורמה רגילה ארוכה
            { x: 1600, y: 430, w: 300, h: 170, type: "normal" },
            
            // פצפצים בגן
            { x: 1980, y: 390, w: 200, h: 40, type: "bubble_wrap", bubblesCount: 6 },
            
            // כרית גבוהה
            { x: 2280, y: 320, w: 110, h: 50, type: "pillow" },
            
            // שילוב ספוג וקפיצה כפולה
            { x: 2500, y: 450, w: 100, h: 60, type: "sponge" },
            { x: 2720, y: 300, w: 100, h: 300, type: "normal" },
            
            // פלטפורמת סיום ופורטל
            { x: 2950, y: 420, w: 250, h: 180, type: "normal" }
        ]
    },
    {
        // עולם 2
        name: "סמטת החפצים (World 2)",
        worldId: 2,
        width: 3400,
        height: 600,
        startX: 100,
        startY: 400,
        portalX: 3250,
        portalY: 250,
        gravity: 0.48,
        theme: {
            bgGradStart: "#ffedd5", // כתום שקיעה בהיר
            bgGradEnd: "#fee2e2",   // ורוד שקיעה בהיר
            accent: "#f97316",      // כתום
            platformBase: "#0284c7",
            skylineColor: "rgba(251, 146, 60, 0.2)"
        },
        platforms: [
            // התחלה
            { x: 0, y: 480, w: 220, h: 120, type: "normal" },
            
            // פחית ראשונה למעיכה
            { x: 300, y: 440, w: 80, h: 100, type: "soda_can" },
            
            // פלטפורמת רחוב
            { x: 450, y: 380, w: 150, h: 30, type: "normal" },
            
            // שפופרת משחת שיניים
            { x: 680, y: 340, w: 90, h: 80, type: "toothpaste" },
            
            // פחיות בשורה שצריך לרוץ ולמעוך ברצף
            { x: 850, y: 420, w: 70, h: 90, type: "soda_can" },
            { x: 970, y: 400, w: 70, h: 90, type: "soda_can" },
            { x: 1090, y: 380, w: 70, h: 90, type: "soda_can" },
            
            // חתול ג'ינג'י ישן
            { x: 1250, y: 320, w: 140, h: 70, type: "cat" },
            
            // פלטפורמה תלויה גבוהה
            { x: 1500, y: 220, w: 200, h: 30, type: "normal" },
            
            // שפופרת נוספת
            { x: 1800, y: 340, w: 90, h: 80, type: "toothpaste" },
            
            // פלטפורמה רגילה
            { x: 1950, y: 420, w: 250, h: 180, type: "normal" },
            
            // חתול ישן ברחוב
            { x: 2300, y: 430, w: 120, h: 70, type: "cat" },
            
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
        name: "עמק החיות (World 3)",
        worldId: 3,
        width: 3600,
        height: 600,
        startX: 100,
        startY: 400,
        portalX: 3450,
        portalY: 220,
        gravity: 0.42,
        theme: {
            bgGradStart: "#fef9c3", // צהוב בוקר זהוב בהיר
            bgGradEnd: "#e0f2fe",   // תכלת פסטל רך
            accent: "#22c55e",      // ירוק צפרדע
            platformBase: "#db2777",
            skylineColor: "rgba(234, 179, 8, 0.25)"
        },
        platforms: [
            // התחלה
            { x: 0, y: 450, w: 250, h: 150, type: "normal" },
            
            // שטיח פצפצים
            { x: 320, y: 420, w: 280, h: 45, type: "bubble_wrap", bubblesCount: 9 },
            
            // צפרדע ירוקה
            { x: 670, y: 380, w: 100, h: 70, type: "frog" },
            
            // פלטפורמת בלוקי משחק
            { x: 820, y: 280, w: 160, h: 30, type: "normal" },
            
            // עוד פצפצים קטנים
            { x: 1050, y: 320, w: 150, h: 40, type: "bubble_wrap", bubblesCount: 5 },
            
            // חתול ג'ינג'י wobbly
            { x: 1280, y: 380, w: 130, h: 70, type: "cat" },
            
            // פארקור אווירי מהיר
            { x: 1500, y: 250, w: 80, h: 30, type: "normal" },
            { x: 1650, y: 180, w: 80, h: 30, type: "normal" },
            { x: 1800, y: 220, w: 120, h: 40, type: "bubble_wrap", bubblesCount: 4 },
            
            // צפרדע קפיצית
            { x: 2000, y: 390, w: 100, h: 70, type: "frog" },
            // חתול נוסף
            { x: 2150, y: 380, w: 120, h: 70, type: "cat" },
            
            // קטע פצפצים ארוך
            { x: 2350, y: 320, w: 300, h: 45, type: "bubble_wrap", bubblesCount: 10 },
            
            // צפרדע גדולה במיוחד
            { x: 2750, y: 400, w: 110, h: 80, type: "frog" },
            
            // פארקור לקראת הפורטל
            { x: 2980, y: 250, w: 120, h: 30, type: "normal" },
            { x: 3180, y: 320, w: 100, h: 70, type: "frog" },
            
            // סיום
            { x: 3350, y: 350, w: 300, h: 250, type: "normal" }
        ]
    },
    {
        // עולם 4
        name: "משרד הקליקים (World 4)",
        worldId: 4,
        width: 3500,
        height: 600,
        startX: 100,
        startY: 400,
        portalX: 3350,
        portalY: 280,
        gravity: 0.46,
        theme: {
            bgGradStart: "#e0f2fe", // תכלת עדין
            bgGradEnd: "#f1f5f9",   // אפור משרד בהיר ויוקרתי
            accent: "#3b82f6",      // כחול מקלדת
            platformBase: "#475569",
            skylineColor: "rgba(148, 163, 184, 0.2)"
        },
        platforms: [
            // התחלה
            { x: 0, y: 460, w: 220, h: 140, type: "normal" },
            
            // מקשי מקלדת מכניים clickers
            { x: 300, y: 420, w: 70, h: 60, type: "keyboard_key", keyChar: "ESC" },
            { x: 420, y: 390, w: 70, h: 60, type: "keyboard_key", keyChar: "TAB" },
            { x: 540, y: 360, w: 70, h: 60, type: "keyboard_key", keyChar: "SHIFT" },
            
            // פלטפורמת שולחן כתיבה
            { x: 680, y: 300, w: 180, h: 30, type: "normal" },
            
            // שפופרת דבק/משחה
            { x: 920, y: 260, w: 90, h: 80, type: "toothpaste" },
            
            // ספוג ניקוי משרדי
            { x: 1080, y: 320, w: 100, h: 60, type: "sponge" },
            
            // מקשים בשורה
            { x: 1250, y: 380, w: 70, h: 60, type: "keyboard_key", keyChar: "A" },
            { x: 1350, y: 380, w: 70, h: 60, type: "keyboard_key", keyChar: "S" },
            { x: 1450, y: 380, w: 70, h: 60, type: "keyboard_key", keyChar: "D" },
            
            // פלטפורמת מסך מחשב
            { x: 1600, y: 280, w: 200, h: 30, type: "normal" },
            
            // מקש רווח גדול קפיצי
            { x: 1880, y: 340, w: 150, h: 60, type: "keyboard_key", keyChar: "SPACE" },
            
            // ספוג ניקוי
            { x: 2100, y: 300, w: 100, h: 60, type: "sponge" },
            
            // פלטפורמה רגילה
            { x: 2280, y: 400, w: 220, h: 200, type: "normal" },
            
            // מקש אנטר
            { x: 2580, y: 360, w: 80, h: 60, type: "keyboard_key", keyChar: "ENTER" },
            
            // שפופרת משחה
            { x: 2720, y: 300, w: 90, h: 80, type: "toothpaste" },
            
            // פצפצים משרדיים
            { x: 2880, y: 260, w: 180, h: 40, type: "bubble_wrap", bubblesCount: 5 },
            
            // סיום
            { x: 3120, y: 380, w: 280, h: 220, type: "normal" }
        ]
    },
    {
        // עולם 5
        name: "מטבח החטיפים (World 5)",
        worldId: 5,
        width: 3500,
        height: 600,
        startX: 100,
        startY: 400,
        portalX: 3350,
        portalY: 250,
        gravity: 0.44,
        theme: {
            bgGradStart: "#ffedd5", // כתום פסטל רך
            bgGradEnd: "#fff7ed",   // שמנת בהיר
            accent: "#f43f5e",      // ורוד פירות יער
            platformBase: "#ea580c",
            skylineColor: "rgba(249, 115, 22, 0.15)"
        },
        platforms: [
            // התחלה
            { x: 0, y: 470, w: 220, h: 130, type: "normal" },
            
            // דונאט ורוד מתוק
            { x: 280, y: 430, w: 100, h: 60, type: "donut" },
            
            // המבורגר כבד
            { x: 440, y: 380, w: 110, h: 70, type: "hamburger" },
            
            // פלטפורמת שיש במטבח
            { x: 620, y: 300, w: 180, h: 30, type: "normal" },
            
            // פחיות קולה מוגזות
            { x: 860, y: 380, w: 70, h: 100, type: "soda_can" },
            { x: 970, y: 350, w: 70, h: 100, type: "soda_can" },
            
            // דונאטס בשורה
            { x: 1100, y: 280, w: 90, h: 60, type: "donut" },
            { x: 1250, y: 220, w: 90, h: 60, type: "donut" },
            
            // פלטפורמת עץ לחיתוך
            { x: 1400, y: 320, w: 200, h: 30, type: "normal" },
            
            // המבורגר כפול
            { x: 1680, y: 280, w: 110, h: 70, type: "hamburger" },
            
            // ספוג כלים צהוב
            { x: 1850, y: 340, w: 100, h: 60, type: "sponge" },
            
            // פחית
            { x: 2020, y: 400, w: 70, h: 100, type: "soda_can" },
            
            // פלטפורמת שיש
            { x: 2160, y: 420, w: 250, h: 180, type: "normal" },
            
            // דונאט
            { x: 2480, y: 380, w: 100, h: 60, type: "donut" },
            
            // המבורגר
            { x: 2650, y: 330, w: 110, h: 70, type: "hamburger" },
            
            // פצפצים של חטיפים
            { x: 2820, y: 280, w: 200, h: 40, type: "bubble_wrap", bubblesCount: 6 },
            
            // סיום
            { x: 3100, y: 380, w: 300, h: 220, type: "normal" }
        ]
    },
    {
        // עולם 6
        name: "חלום הפיג'מה (World 6)",
        worldId: 6,
        width: 3400,
        height: 600,
        startX: 100,
        startY: 400,
        portalX: 3250,
        portalY: 260,
        gravity: 0.40, // כבידה נמוכה!
        theme: {
            bgGradStart: "#f3e8ff", // לבנדר בהיר מאוד
            bgGradEnd: "#faf5ff",   // סגול-לבן רך
            accent: "#c084fc",      // סגול בהיר זוהר
            platformBase: "#7c3aed",
            skylineColor: "rgba(168, 85, 247, 0.15)"
        },
        platforms: [
            // התחלה
            { x: 0, y: 460, w: 220, h: 140, type: "normal" },
            
            // כרית fluffy רכה
            { x: 280, y: 410, w: 120, h: 50, type: "pillow" },
            
            // חתול ישן וחולם
            { x: 460, y: 360, w: 130, h: 70, type: "cat" },
            
            // פלטפורמה רגילה
            { x: 650, y: 280, w: 160, h: 30, type: "normal" },
            
            // כריות בשורה
            { x: 880, y: 320, w: 110, h: 50, type: "pillow" },
            { x: 1040, y: 270, w: 110, h: 50, type: "pillow" },
            
            // פצפצים רכים כעננים
            { x: 1200, y: 340, w: 220, h: 40, type: "bubble_wrap", bubblesCount: 7 },
            
            // חתול
            { x: 1480, y: 390, w: 130, h: 70, type: "cat" },
            
            // פלטפורמה גבוהה
            { x: 1680, y: 240, w: 180, h: 30, type: "normal" },
            
            // כריות ורודות
            { x: 1920, y: 320, w: 120, h: 50, type: "pillow" },
            { x: 2100, y: 380, w: 120, h: 50, type: "pillow" },
            
            // פלטפורמה רגילה
            { x: 2280, y: 450, w: 220, h: 150, type: "normal" },
            
            // חתול ישן גדול
            { x: 2560, y: 400, w: 140, h: 70, type: "cat" },
            
            // כרית קפיצית
            { x: 2760, y: 320, w: 120, h: 50, type: "pillow" },
            
            // סיום
            { x: 3000, y: 380, w: 300, h: 220, type: "normal" }
        ]
    },
    {
        // עולם 7
        name: "מפרץ הצפרדעים (World 7)",
        worldId: 7,
        width: 3500,
        height: 600,
        startX: 100,
        startY: 400,
        portalX: 3300,
        portalY: 220,
        gravity: 0.43,
        theme: {
            bgGradStart: "#a7f3d0", // ירוק מנטה בהיר ומרענן
            bgGradEnd: "#ecfdf5",   // ירוק מים רך
            accent: "#059669",      // ירוק בקבוק
            platformBase: "#047857",
            skylineColor: "rgba(5, 150, 105, 0.15)"
        },
        platforms: [
            // התחלה
            { x: 0, y: 460, w: 220, h: 140, type: "normal" },
            
            // צפרדעים קפיציות
            { x: 280, y: 420, w: 100, h: 70, type: "frog" },
            
            // ספוג ניקוי ירוק
            { x: 440, y: 380, w: 100, h: 60, type: "sponge" },
            
            // פלטפורמה סלעית
            { x: 600, y: 300, w: 180, h: 30, type: "normal" },
            
            // שפופרת משחת שיניים מנטה
            { x: 840, y: 360, w: 90, h: 80, type: "toothpaste" },
            
            // צפרדעים בשורה
            { x: 990, y: 320, w: 100, h: 70, type: "frog" },
            { x: 1120, y: 280, w: 100, h: 70, type: "frog" },
            
            // פצפצים רטובים
            { x: 1280, y: 340, w: 200, h: 40, type: "bubble_wrap", bubblesCount: 6 },
            
            // חתול שחובב מים
            { x: 1540, y: 380, w: 120, h: 70, type: "cat" },
            
            // פלטפורמה
            { x: 1720, y: 280, w: 180, h: 30, type: "normal" },
            
            // ספוג גדול
            { x: 1960, y: 340, w: 110, h: 60, type: "sponge" },
            
            // צפרדע
            { x: 2130, y: 390, w: 100, h: 70, type: "frog" },
            
            // פלטפורמה רגילה
            { x: 2300, y: 440, w: 220, h: 160, type: "normal" },
            
            // שפופרת משחת שיניים
            { x: 2580, y: 380, w: 90, h: 80, type: "toothpaste" },
            
            // צפרדע קפיצית מאוד
            { x: 2750, y: 300, w: 100, h: 70, type: "frog" },
            
            // סיום
            { x: 3050, y: 360, w: 300, h: 240, type: "normal" }
        ]
    },
    {
        // עולם 8
        name: "פורטל הניצחון (World 8)",
        worldId: 8,
        width: 3800,
        height: 600,
        startX: 100,
        startY: 400,
        portalX: 3650,
        portalY: 200,
        gravity: 0.45,
        theme: {
            bgGradStart: "#fde047", // צהוב זהב זוהר
            bgGradEnd: "#f472b6",   // ורוד ניאון בהיר
            accent: "#7c3aed",      // סגול עמוק
            platformBase: "#db2777",
            skylineColor: "rgba(219, 39, 119, 0.2)"
        },
        platforms: [
            // התחלה
            { x: 0, y: 450, w: 250, h: 150, type: "normal" },
            
            // 1. ספוג וקליק
            { x: 320, y: 410, w: 90, h: 60, type: "sponge" },
            { x: 460, y: 360, w: 70, h: 60, type: "keyboard_key", keyChar: "W" },
            
            // 2. צפרדע ופחית
            { x: 580, y: 320, w: 100, h: 70, type: "frog" },
            { x: 730, y: 280, w: 75, h: 100, type: "soda_can" },
            
            // 3. פלטפורמה רגילה
            { x: 880, y: 260, w: 160, h: 30, type: "normal" },
            
            // 4. חתול ודונאט
            { x: 1080, y: 330, w: 130, h: 70, type: "cat" },
            { x: 1260, y: 280, w: 90, h: 60, type: "donut" },
            
            // 5. המבורגר ופצפצים
            { x: 1400, y: 350, w: 110, h: 70, type: "hamburger" },
            { x: 1580, y: 300, w: 180, h: 40, type: "bubble_wrap", bubblesCount: 5 },
            
            // 6. כרית ושפופרת
            { x: 1820, y: 250, w: 110, h: 50, type: "pillow" },
            { x: 1980, y: 210, w: 90, h: 80, type: "toothpaste" },
            
            // 7. פלטפורמת אמצע
            { x: 2130, y: 320, w: 200, h: 30, type: "normal" },
            
            // 8. מקש רווח ומקש אנטר
            { x: 2380, y: 360, w: 140, h: 60, type: "keyboard_key", keyChar: "SPACE" },
            { x: 2580, y: 320, w: 80, h: 60, type: "keyboard_key", keyChar: "ENTER" },
            
            // 9. צפרדע
            { x: 2720, y: 260, w: 100, h: 70, type: "frog" },
            
            // 10. פלטפורמה
            { x: 2880, y: 400, w: 200, h: 200, type: "normal" },
            
            // 11. שילוב מעיכה ויללה
            { x: 3130, y: 340, w: 120, h: 70, type: "cat" },
            { x: 3300, y: 270, w: 110, h: 50, type: "pillow" },
            { x: 3460, y: 220, w: 100, h: 70, type: "frog" },
            
            // סיום סופי ומפואר!
            { x: 3600, y: 300, w: 250, h: 300, type: "normal" }
        ]
    }
];

window.GAME_LEVELS = GAME_LEVELS;
