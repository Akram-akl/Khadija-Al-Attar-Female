// =====================================================
// Instance Configuration File - خديجه العطاء - الحلقات النسائيه
// =====================================================

const APP_CONFIG = {
    // 1. App Identity
    appName: "خديجه العطاء - الحلقات النسائيه",
    appDescription: "منصة التحفيظ والمتابعه القرآنية",

    // 2. Theme Configuration - الوان ورديه نسائيه
    themeColors: {
        50: '#fdf2f8',
        100: '#fce7f3',
        200: '#fbcfe8',
        300: '#f9a8d4',
        400: '#f472b6',
        500: '#ec4899',
        600: '#db2777',
        700: '#be185d',
        800: '#9d174d',
        900: '#831843',
        950: '#500724',
    },
    headerColor: '#831843',
    showDemoHints: false,

    // 3. Supabase Configuration
    supabaseUrl: 'https://ovxhspzsudxybobicvkb.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92eGhzcHpzdWR4eWJvYmljdmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNDgzODAsImV4cCI6MjEwMzkyNDM4MH0.PuZZ-3Ys4drQF3Fs2S3yaE58AtBBS1TvCBii6wuI5tM',

    // 4. Levels (الحلقات النسائية)
    levels: {
        'safaa': {
            name: 'حلقة الأستاذة صفاء',
            emoji: '<i data-lucide="flower" class="w-6 h-6 inline-block text-pink-500"></i>'
        },
        'marwa': {
            name: 'حلقة الأستاذة مروة',
            emoji: '<i data-lucide="flower-2" class="w-6 h-6 inline-block text-pink-500"></i>'
        },
        'salwa': {
            name: 'حلقة الأستاذة سلوى',
            emoji: '<i data-lucide="star" class="w-6 h-6 inline-block text-pink-500"></i>'
        },
        'amal': {
            name: 'حلقة الأستاذة أمل',
            emoji: '<i data-lucide="sun" class="w-6 h-6 inline-block text-pink-500"></i>'
        },
        'abeer': {
            name: 'حلقة الأستاذة عبير العلومي',
            emoji: '<i data-lucide="book-open" class="w-6 h-6 inline-block text-blue-500"></i>',
            isAdult: true
        },
        'hadeel': {
            name: 'حلقة الأستاذة هديل بن محفوظ',
            emoji: '<i data-lucide="moon" class="w-6 h-6 inline-block text-pink-500"></i>'
        },
        'mona': {
            name: 'حلقة الأستاذة منى مبارك',
            emoji: '<i data-lucide="heart" class="w-6 h-6 inline-block text-pink-500"></i>'
        }
    }
};

// =======================================================
// 1. PINK THEME CSS OVERRIDE
// Converts ALL hardcoded emerald/green Tailwind classes to pink.
// =======================================================
(function () {
    function injectTheme() {
        if (document.getElementById('pink-theme-override')) return;
        var css = [
            '.bg-mesh-gradient{background:radial-gradient(circle at 20% 30%,#f472b6 0%,transparent 50%),radial-gradient(circle at 80% 70%,#db2777 0%,transparent 50%)!important}',
            '.bg-emerald-950{background-color:#500724!important}',
            '.bg-emerald-900{background-color:#831843!important}',
            '.bg-emerald-800{background-color:#9d174d!important}',
            '.bg-emerald-700{background-color:#be185d!important}',
            '.bg-emerald-600{background-color:#db2777!important}',
            '.bg-emerald-500{background-color:#ec4899!important}',
            '.bg-emerald-100{background-color:#fce7f3!important}',
            '.bg-emerald-50{background-color:#fdf2f8!important}',
            '.bg-green-600{background-color:#db2777!important}',
            '.bg-green-700{background-color:#be185d!important}',
            '.text-emerald-950{color:#500724!important}',
            '.text-emerald-900{color:#831843!important}',
            '.text-emerald-800{color:#9d174d!important}',
            '.text-emerald-700{color:#be185d!important}',
            '.text-emerald-600{color:#db2777!important}',
            '.text-emerald-500{color:#ec4899!important}',
            '.text-emerald-400{color:#f472b6!important}',
            '.text-emerald-300{color:#f9a8d4!important}',
            '.text-emerald-200{color:#fbcfe8!important}',
            '.border-emerald-500{border-color:#ec4899!important}',
            '.border-emerald-400{border-color:#f472b6!important}',
            '.border-emerald-300{border-color:#f9a8d4!important}',
            '.border-emerald-200{border-color:#fbcfe8!important}',
            '.border-emerald-100{border-color:#fce7f3!important}',
            '.from-emerald-950{--tw-gradient-from:#500724!important}',
            '.from-emerald-900{--tw-gradient-from:#831843!important}',
            '.from-emerald-700{--tw-gradient-from:#be185d!important}',
            '.from-emerald-600{--tw-gradient-from:#db2777!important}',
            '.from-emerald-500{--tw-gradient-from:#ec4899!important}',
            '.via-emerald-900{--tw-gradient-via:#831843!important}',
            '.to-emerald-950{--tw-gradient-to:#500724!important}',
            '.to-emerald-900{--tw-gradient-to:#831843!important}',
            '.to-emerald-700{--tw-gradient-to:#be185d!important}',
            '.to-emerald-600{--tw-gradient-to:#db2777!important}',
            '.to-emerald-500{--tw-gradient-to:#ec4899!important}',
            '.hover\\:bg-emerald-700:hover{background-color:#be185d!important}',
            '.hover\\:bg-emerald-600:hover{background-color:#db2777!important}',
            '.hover\\:bg-emerald-50:hover{background-color:#fdf2f8!important}',
            '.hover\\:border-emerald-500:hover{border-color:#ec4899!important}',
            '.hover\\:text-emerald-600:hover{color:#db2777!important}',
            '.hover\\:bg-green-700:hover{background-color:#be185d!important}',
            '.focus\\:border-emerald-500:focus{border-color:#ec4899!important}',
            '.dark .bg-pattern{background-color:#111827!important}',
            '.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(219,39,119,0.2)!important}',
        ].join('');
        var s = document.createElement('style');
        s.id = 'pink-theme-override';
        s.innerHTML = css;
        (document.head || document.documentElement).appendChild(s);
    }

    if (document.head || document.documentElement) {
        injectTheme();
    } else {
        window.addEventListener('DOMContentLoaded', injectTheme);
    }
})();

// =======================================================
// 2. FEMININE TERMINOLOGY ENGINE (محرك تأنيث المصطلحات)
// =======================================================
(function () {
    function replaceArabicWord(text, word, replacement) {
        var regex = new RegExp('(?<![\\u0600-\\u06FF])' + word + '(?![\\u0600-\\u06FF])', 'gu');
        return text.replace(regex, replacement);
    }

    var phrases = [
        ['إضافة طالب جديد', 'إضافة طالبة جديدة'],
        ['تسجيل طالب جديد', 'تسجيل طالبة جديدة'],
        ['إضافة دارس جديد', 'إضافة دارسة جديدة'],
        ['تسجيل دارس جديد', 'تسجيل دارسة جديدة'],
        ['تعديل بيانات الطالب', 'تعديل بيانات الطالبة'],
        ['تعديل بيانات الدارس', 'تعديل بيانات الدارسة'],
        ['بيانات الطالب', 'بيانات الطالبة'],
        ['بيانات الدارس', 'بيانات الدارسة'],
        ['نقل الطالب', 'نقل الطالبة'],
        ['نقل الدارس', 'نقل الدارسة'],
        ['حذف الطالب', 'حذف الطالبة'],
        ['حذف الدارس', 'حذف الدارسة'],
        ['اسم الطالب', 'اسم الطالبة'],
        ['اسم الدارس', 'اسم الدارسة'],
        ['أفضل الطلاب أداءً', 'أفضل الطالبات أداءً'],
        ['أفضل المتفاعلين أداءً', 'أفضل المتفاعلات أداءً'],
        ['إضافة معلم جديد', 'إضافة معلمة جديدة'],
        ['تعديل بيانات المعلم', 'تعديل بيانات المعلمة'],
        ['حذف المعلم', 'حذف المعلمة'],
        ['اسم المعلم', 'اسم المعلمة'],
        ['إضافة المعلم', 'إضافة المعلمة'],
        ['المعلم الآخر', 'المعلمة الأخرى'],
        ['معلم الحلقة', 'معلمة الحلقة'],
        ['معلم آخر', 'معلمة أخرى'],
        ['المعلمون المسجلون', 'المعلمات المسجلات'],
        ['معلمون مسجلون', 'معلمات مسجلات'],
        ['المعلمين المسجلين', 'المعلمات المسجلات'],
        ['معلمين مسجلين', 'معلمات مسجلات'],
        ['الطلاب المسجلين', 'الطالبات المسجلات'],
        ['الطلاب المسجلون', 'الطالبات المسجلات'],
        ['طلاب مسجلين', 'طالبات مسجلات'],
        ['طلاب مسجلون', 'طالبات مسجلات'],
        ['الدارسين المسجلين', 'الدارسات المسجلات'],
        ['دارسين مسجلين', 'دارسات مسجلات'],
        ['لا يوجد طلاب مسجلين', 'لا يوجد طالبات مسجلات'],
        ['لا يوجد دارسين مسجلين', 'لا يوجد دارسات مسجلات'],
        ['لا يوجد معلمون مسجلون', 'لا يوجد معلمات مسجلات'],
        ['لا يوجد معلمين مسجلين', 'لا يوجد معلمات مسجلات'],
        ['لا يوجد طلاب', 'لا يوجد طالبات'],
        ['لا يوجد دارسين', 'لا يوجد دارسات'],
        ['لا يوجد معلمون', 'لا يوجد معلمات'],
        ['لا يوجد معلمين', 'لا يوجد معلمات'],
        ['طالب غير موجود', 'طالبة غير موجودة'],
        ['دارس غير موجود', 'دارسة غير موجودة'],
        ['طالب جديد', 'طالبة جديدة'],
        ['دارس جديد', 'دارسة جديدة'],
        ['طالب مسجل', 'طالبة مسجلة'],
        ['دارس مسجل', 'دارسة مسجلة'],
        ['دخول الطلاب', 'دخول الطالبات'],
        ['دخول الدارسين', 'دخول الدارسات'],
        ['دخول المعلم', 'دخول المعلمة'],
        ['إدارة الطلاب', 'إدارة الطالبات'],
        ['إداره الطلاب', 'إدارة الطالبات'],
        ['إدارة الدارسين', 'إدارة الدارسات'],
        ['أنا طالب', 'أنا طالبة'],
        ['أنا دارس', 'أنا دارسة'],
        ['أنا معلم', 'أنا معلمة'],
        ['وضع الطالب', 'وضع الطالبة'],
        ['وضع الدارس', 'وضع الدارسة'],
        ['وضع المعلم', 'وضع المعلمة'],
        ['طالب/طالبة', 'طالبة'],
        ['طالب أو طالبة', 'طالبة'],
        ['درجات الطلاب', 'درجات الطالبات'],
        ['تقييم الطلاب', 'تقييم الطالبات'],
        ['أداء أبنائي', 'أداء بناتي'],
        ['أداء أبنائك', 'أداء بناتك'],
        ['البحث عن أبنائي', 'البحث عن بناتي'],
        ['أبنائي', 'بناتي'],
        ['أبنائك', 'بناتك']
    ];

    var singleWords = [
        ['للطلاب', 'للطالبات'],
        ['الطلاب', 'الطالبات'],
        ['طلاب', 'طالبات'],
        ['للطالب', 'للطالبة'],
        ['الطالب', 'الطالبة'],
        ['طالب', 'طالبة'],
        ['للدارسين', 'للدارسات'],
        ['الدارسين', 'الدارسات'],
        ['دارسين', 'دارسات'],
        ['للدارس', 'للدارسة'],
        ['الدارس', 'الدارسة'],
        ['دارس', 'دارسة'],
        ['المعلمون', 'المعلمات'],
        ['معلمون', 'معلمات'],
        ['للمعلمين', 'للمعلمات'],
        ['المعلمين', 'المعلمات'],
        ['معلمين', 'معلمات'],
        ['للمعلم', 'للمعلمة'],
        ['المعلم', 'المعلمة'],
        ['معلم', 'معلمة']
    ];

    function localizeFemale(text) {
        if (typeof text !== 'string' || !text) return text;
        var res = text;

        for (var i = 0; i < phrases.length; i++) {
            res = replaceArabicWord(res, phrases[i][0], phrases[i][1]);
        }

        for (var j = 0; j < singleWords.length; j++) {
            res = replaceArabicWord(res, singleWords[j][0], singleWords[j][1]);
        }

        // تنظيف أمان نهائي لأي تكرارات
        res = res.replace(/الطالبةات/g, 'الطالبات');
        res = res.replace(/طالبةات/g, 'طالبات');
        res = res.replace(/الدارسةات/g, 'الدارسات');
        res = res.replace(/دارسةات/g, 'دارسات');
        res = res.replace(/المعلمةات/g, 'المعلمات');
        res = res.replace(/معلمةات/g, 'معلمات');

        return res;
    }
    window.localizeFemale = localizeFemale;

    // 1. دالة getLabel لتراعي نظام الطالبات ونظام الدارسات بصيغة المؤنث
    function femaleGetLabel(key) {
        var isAdult = typeof state !== 'undefined' && state && (state.currentLevel === 'ijazat');
        var labels = {
            'student': isAdult ? 'دارسة' : 'طالبة',
            'students': isAdult ? 'دارسات' : 'طالبات',
            'parent': isAdult ? 'الجوال الشخصي' : 'ولي الأمر',
            'parent_phone': isAdult ? 'رقم الجوال' : 'رقم ولي الأمر',
            'student_data': isAdult ? 'بيانات الدارسة' : 'بيانات الطالبة',
            'add_student': isAdult ? 'إضافة دارسة جديدة' : 'إضافة طالبة جديدة',
            'edit_student': isAdult ? 'تعديل بيانات الدارسة' : 'تعديل بيانات الطالبة',
            'transfer_student': isAdult ? 'نقل الدارسة' : 'نقل الطالبة',
            'leaderboard_sub': isAdult ? 'أفضل المتفاعلات أداءً' : 'أفضل الطالبات أداءً'
        };
        return labels[key] || (typeof key === 'string' ? localizeFemale(key) : key);
    }
    window.getLabel = femaleGetLabel;

    // 2. معالجة وتأنيث نصوص DOM بطريقة آمنة وسريعة بدون تعليق
    var isMutating = false;
    function replaceFemaleInRoot(root) {
        if (!root || isMutating) return;
        isMutating = true;
        try {
            var walker = document.createTreeWalker(
                root,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function (node) {
                        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                        var parent = node.parentElement;
                        if (!parent) return NodeFilter.FILTER_REJECT;
                        var tag = parent.tagName;
                        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'SVG' || tag === 'PATH') {
                            return NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );

            var nodesToChange = [];
            while (walker.nextNode()) {
                var node = walker.currentNode;
                var orig = node.nodeValue;
                var rep = localizeFemale(orig);
                if (orig !== rep) {
                    nodesToChange.push({ node: node, rep: rep });
                }
            }

            for (var i = 0; i < nodesToChange.length; i++) {
                nodesToChange[i].node.nodeValue = nodesToChange[i].rep;
            }

            if (root.querySelectorAll) {
                var inputs = root.querySelectorAll('input[placeholder], textarea[placeholder], button[title], select[title]');
                for (var j = 0; j < inputs.length; j++) {
                    var el = inputs[j];
                    if (el.hasAttribute('placeholder')) {
                        var p = el.getAttribute('placeholder');
                        var rp = localizeFemale(p);
                        if (p !== rp) el.setAttribute('placeholder', rp);
                    }
                    if (el.hasAttribute('title')) {
                        var t = el.getAttribute('title');
                        var rt = localizeFemale(t);
                        if (t !== rt) el.setAttribute('title', rt);
                    }
                }
            }
        } catch (e) {
            console.error('Localization error:', e);
        } finally {
            isMutating = false;
        }
    }

    // 3. هوك على تصدير Excel (XLSX)
    function hookXLSX() {
        if (window.XLSX && window.XLSX.utils && !window.XLSX._femaleHooked) {
            window.XLSX._femaleHooked = true;
            var origJsonToSheet = window.XLSX.utils.json_to_sheet;
            window.XLSX.utils.json_to_sheet = function (data, opts) {
                if (Array.isArray(data)) {
                    data = data.map(function (row) {
                        if (row && typeof row === 'object') {
                            var newRow = {};
                            for (var k in row) {
                                if (Object.prototype.hasOwnProperty.call(row, k)) {
                                    var newKey = localizeFemale(k);
                                    var v = row[k];
                                    var newVal = (typeof v === 'string') ? localizeFemale(v) : v;
                                    newRow[newKey] = newVal;
                                }
                            }
                            return newRow;
                        }
                        return row;
                    });
                }
                if (opts && Array.isArray(opts.header)) {
                    opts.header = opts.header.map(function (h) { return localizeFemale(h); });
                }
                return origJsonToSheet.call(this, data, opts);
            };

            var origAppend = window.XLSX.utils.book_append_sheet;
            window.XLSX.utils.book_append_sheet = function (wb, ws, name) {
                return origAppend.call(this, wb, ws, localizeFemale(name));
            };
        }
    }

    // 4. تشغيل المعالجة عند اكتمال تحميل الصفحة وربط الـ Observer بـ #app
    window.addEventListener('DOMContentLoaded', function () {
        window.getLabel = femaleGetLabel;
        replaceFemaleInRoot(document.body);

        var appEl = document.getElementById('app') || document.body;
        var observer = new MutationObserver(function (mutations) {
            if (isMutating) return;
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                if (m.addedNodes && m.addedNodes.length > 0) {
                    for (var j = 0; j < m.addedNodes.length; j++) {
                        replaceFemaleInRoot(m.addedNodes[j]);
                    }
                }
            }
        });

        observer.observe(appEl, {
            childList: true,
            subtree: true
        });

        var hookGlobals = function () {
            window.getLabel = femaleGetLabel;
            hookXLSX();

            if (typeof showToast === 'function' && !showToast._femaleHooked) {
                var origShowToast = showToast;
                window.showToast = function (msg, type) {
                    return origShowToast(localizeFemale(msg), type);
                };
                window.showToast._femaleHooked = true;
            }

            if (typeof showCustomConfirm === 'function' && !showCustomConfirm._femaleHooked) {
                var origConfirm = showCustomConfirm;
                window.showCustomConfirm = function (msg) {
                    return origConfirm(localizeFemale(msg));
                };
                window.showCustomConfirm._femaleHooked = true;
            }
        };

        hookGlobals();
        setInterval(hookGlobals, 1000);
    });
})();
