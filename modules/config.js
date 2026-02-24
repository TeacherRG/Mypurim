// ===== CONFIG =====

const SECTIONS = [
    { id: 'home',           type: 'home'                                   },
    { id: 'intro'                                                          },
    { id: 'dvar_malchut',    type: 'group'                                },
    { id: 'section_a',       group: 'dvar_malchut'                        },
    { id: 'section_b',       group: 'dvar_malchut'                        },
    { id: 'section_c',       group: 'dvar_malchut'                        },
    { id: 'halacha',         type: 'halacha'                              },
    { id: 'megilla_read',    type: 'group'                                },
    { id: 'esther_scroll',   type: 'pdf',      group: 'megilla_read'     },
    { id: 'maharash_scroll', type: 'maharash', group: 'megilla_read'     },
    { id: 'tzedaka',         type: 'donate'                               },
    { id: 'games',           type: 'group'                                },
    { id: 'dreidel',         type: 'game',     group: 'games'            },
    { id: 'hangman',         type: 'hangman',  group: 'games'            },
    { id: 'spiral',          type: 'spiral',   group: 'games'            },
    { id: 'alcohol',         type: 'alcohol',  group: 'games'            },
    { id: 'shum',            type: 'shum',     group: 'games'            }
];

// ===== STATE =====

function detectBrowserLang() {
    var langs = (navigator.languages && navigator.languages.length)
        ? Array.from(navigator.languages)
        : [navigator.language || 'ru'];
    for (var i = 0; i < langs.length; i++) {
        var l = langs[i].toLowerCase();
        if (l.startsWith('uk')) return 'uk';
        if (l.startsWith('de')) return 'de';
        if (l.startsWith('he') || l.startsWith('iw')) return 'he';
        if (l.startsWith('ru')) return 'ru';
    }
    return 'ru';
}

let currentId = null;
let langMode = localStorage.getItem('langMode') || detectBrowserLang();
let state = { completedSections: [] };
let collapsedGroups = new Set(['dvar_malchut', 'megilla_read', 'games']);
var _spiralToken = null;

// ===== DOM REFS =====

const sidebarMenu   = document.getElementById('sidebar-menu');
const contentArea   = document.getElementById('content');
const langSelect    = document.getElementById('lang-select');
const navToggle     = document.getElementById('nav-toggle');
const navPopup      = document.getElementById('nav-popup');
const navOverlay    = document.getElementById('nav-overlay');
const navClose      = document.getElementById('nav-close');
