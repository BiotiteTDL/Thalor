// Fallback dati schede: permette alle schede di funzionare anche aprendo il sito in locale senza server.
window.THALOR_CHARACTER_DATA = {
  "abraxas": {
    "schemaVersion": 2,
    "meta": {
      "slug": "abraxas",
      "theme": "infernal",
      "crest": "✦",
      "profileUrl": "abraxas.html",
      "sourcePdf": "../assets/files/Abraxas.pdf",
      "status": "Scheda dinamica Step 1: formule automatiche, righe aggiungibili, salvataggio locale. Supabase sarà collegato nello step successivo.",
      "subtitle": "Ombre, catene e promesse infernali.",
      "accent": "#d14735"
    },
    "identity": {
      "name": "Abraxas",
      "player": "Carlo Bevilacqua",
      "race": "Lesser Tiefiling",
      "classLevel": "Ladro 3",
      "alignment": "NM",
      "deity": "Belzebù",
      "xp": "4075"
    },
    "portrait": {
      "image": "../assets/img/Abraxas.jpeg",
      "alt": "Abraxas",
      "quote": "Le catene non spariscono: cambiano padrone."
    },
    "appearance": {
      "size": "m",
      "age": "20",
      "sex": "M",
      "height": "1,79",
      "weight": "66",
      "eyes": "gialli",
      "hair": "cenere",
      "skin": "lillà",
      "marks": "Retaggio infernale, odore di cenere e tracce dell’Underdark."
    },
    "abilities": {
      "FOR": {
        "label": "Forza",
        "score": 10,
        "temp": 0,
        "standard": "FOR"
      },
      "DES": {
        "label": "Destrezza",
        "score": 20,
        "temp": 0,
        "standard": "DES"
      },
      "COS": {
        "label": "Costituzione",
        "score": 14,
        "temp": 0,
        "standard": "COS"
      },
      "INT": {
        "label": "Intelligenza",
        "score": 18,
        "temp": 0,
        "standard": "INT"
      },
      "SAG": {
        "label": "Saggezza",
        "score": 10,
        "temp": 0,
        "standard": "SAG"
      },
      "CAR": {
        "label": "Carisma",
        "score": 13,
        "temp": 0,
        "standard": "CAR"
      }
    },
    "combat": {
      "hpMax": 20.0,
      "hpCurrent": 20.0,
      "nonlethal": 0,
      "initiativeMisc": 0,
      "speed": "9m",
      "bab": "+2",
      "grappleMisc": 0,
      "resistances": "res 5 freddo fuoco fulmine"
    },
    "armorClass": {
      "base": 10,
      "armor": 1.0,
      "shield": 0,
      "natural": 0,
      "deflection": 0,
      "dodge": 0,
      "size": 0,
      "misc": 0,
      "touchMisc": 0,
      "flatFootedMisc": 0,
      "maxDex": ""
    },
    "saves": {
      "tempra": {
        "label": "Tempra",
        "ability": "COS",
        "base": 0,
        "magic": 0,
        "misc": 0
      },
      "riflessi": {
        "label": "Riflessi",
        "ability": "DES",
        "base": 0,
        "magic": 0,
        "misc": 0
      },
      "volonta": {
        "label": "Volontà",
        "ability": "SAG",
        "base": 0,
        "magic": 0,
        "misc": 0
      }
    },
    "attacks": [
      {
        "name": "Pugnale",
        "bonus": "+8-2",
        "damage": "1d4+0",
        "critical": "x3",
        "range": "",
        "type": "",
        "notes": "x9"
      },
      {
        "name": "Furtivo",
        "bonus": "",
        "damage": "2d6",
        "critical": "",
        "range": "",
        "type": "",
        "notes": ""
      }
    ],
    "defenses": [
      {
        "name": "Imbottita",
        "bonus": "+1",
        "type": "leggera",
        "maxDex": "+8",
        "checkPenalty": "0",
        "spellFailure": "5%",
        "weight": ""
      }
    ],
    "skills": [
      {
        "name": "Acrobazia",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 6.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Addestrare Animali",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Artigianato",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Artista della Fuga",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Ascoltare",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Cavalcare",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 6.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Cercare",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Concentrazione",
        "ability": "COS",
        "standardAbility": "COS",
        "ranks": 2.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Conoscenze Arcane",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Architettura e Ingegneria",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Dungeon",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Conoscenze Geografia",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Locali",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Conoscenze Natura",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 6.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Conoscenze Nobiltà e Regalità",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Piani",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Religioni",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 2.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Decifrare Scritture",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Diplomazia",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Disattivare Congegni",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Equilibrio",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Falsificare",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Guarire",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 6.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Intimidire",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Intrattenere",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Muoversi Silenziosamente",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 3.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Nascondersi",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Nuotare",
        "ability": "FOR",
        "standardAbility": "FOR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Osservare",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 2.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Percepire Intenzioni",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Professione",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Raccogliere Informazioni",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Rapidità di Mano",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 6.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Raggirare",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 6.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Saltare",
        "ability": "FOR",
        "standardAbility": "FOR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Sapienza Magica",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Scalare",
        "ability": "FOR",
        "standardAbility": "FOR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Scassinare Serrature",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Sopravvivenza",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 6.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Utilizzare Corde",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Utilizzare Oggetti Magici",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Valutare",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      }
    ],
    "feats": [
      {
        "name": "Arma Accurata",
        "description": "",
        "source": ""
      },
      {
        "name": "combattere con due armi*",
        "description": "",
        "source": ""
      },
      {
        "name": "Arma focalizzata: pugnale",
        "description": "",
        "source": ""
      }
    ],
    "features": [
      {
        "name": "res freddo elettricita fuoco 5",
        "description": "",
        "source": ""
      },
      {
        "name": "scurovisione 18m",
        "description": "",
        "source": ""
      },
      {
        "name": "oscurità 1 al giorno",
        "description": "",
        "source": ""
      },
      {
        "name": "attacco furtivo",
        "description": "",
        "source": ""
      },
      {
        "name": "scoprire trappole",
        "description": "",
        "source": ""
      },
      {
        "name": "eludere",
        "description": "",
        "source": ""
      },
      {
        "name": "death's ruin",
        "description": "",
        "source": ""
      }
    ],
    "languages": [
      {
        "name": "comune",
        "notes": ""
      },
      {
        "name": "infernale",
        "notes": ""
      },
      {
        "name": "elfico",
        "notes": ""
      },
      {
        "name": "sottocomune",
        "notes": ""
      },
      {
        "name": "nanico",
        "notes": ""
      },
      {
        "name": "abissale",
        "notes": ""
      }
    ],
    "spells": {
      "0": [],
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
      "6": [],
      "7": [],
      "8": [],
      "9": []
    },
    "inventory": [
      {
        "name": "guanti della mano bilanciata",
        "qty": "",
        "weight": "0",
        "notes": ""
      },
      {
        "name": "pugnali x4",
        "qty": "",
        "weight": "",
        "notes": ""
      },
      {
        "name": "corda 10m",
        "qty": "",
        "weight": "",
        "notes": ""
      },
      {
        "name": "manette",
        "qty": "",
        "weight": "",
        "notes": ""
      },
      {
        "name": "borsa conservante",
        "qty": "",
        "weight": "",
        "notes": ""
      },
      {
        "name": "arnesi da scasso",
        "qty": "",
        "weight": "",
        "notes": ""
      },
      {
        "name": "pugnale strano",
        "qty": "",
        "weight": "",
        "notes": ""
      },
      {
        "name": "corda di canapa 15m",
        "qty": "",
        "weight": "",
        "notes": ""
      },
      {
        "name": "rampino",
        "qty": "",
        "weight": "",
        "notes": ""
      },
      {
        "name": "razioni x10",
        "qty": "",
        "weight": "",
        "notes": ""
      }
    ],
    "money": {
      "MP": 0,
      "MO": 0.0,
      "MA": 0,
      "MR": 0
    },
    "narrative": {
      "summary": "Ex schiavo tiefling legato all’Underdark e al culto di Belzebù tramite il Signore delle Mosche. Nasconde ferite, patti e una feroce fame di libertà.",
      "bonds": [
        "Belzebù / Signore delle Mosche",
        "Underdark",
        "Varek Thorm e la lettera dopo il funerale"
      ],
      "visions": [
        "Anime rosse che cercano un’entità oscura capace di offrire assenza del dolore."
      ],
      "privateNotes": "Può contenere patti, segreti, debiti o scelte non ancora rivelate al gruppo."
    }
  },
  "irven": {
    "schemaVersion": 2,
    "meta": {
      "slug": "irven",
      "theme": "blight",
      "crest": "☣",
      "profileUrl": "irven.html",
      "sourcePdf": "../assets/files/Irven_Till_Blightborn.pdf",
      "status": "Scheda dinamica Step 1: formule automatiche, righe aggiungibili, salvataggio locale. Supabase sarà collegato nello step successivo.",
      "subtitle": "Piaga, guarigione e fiammelle nere.",
      "accent": "#8fa86a"
    },
    "identity": {
      "name": "Irven  Till \"Blightborn\"",
      "player": "Ettore",
      "race": "Umano",
      "classLevel": "Anima Prescelta 2",
      "alignment": "NM",
      "deity": "Talona",
      "xp": "3875"
    },
    "portrait": {
      "image": "../assets/img/Irven_Till_Blightborn.jpeg",
      "alt": "Irven Till “Blightborn”",
      "quote": "La piaga non è solo rovina. È appartenenza."
    },
    "appearance": {
      "size": "Media",
      "age": "33",
      "sex": "M",
      "height": "1.80",
      "weight": "80 kg",
      "eyes": "Azzurri",
      "hair": "Rossi",
      "skin": "Bianca",
      "marks": "Aspetto consumato dalla malattia, mantello scuro, abiti grigi e presenza febbrile."
    },
    "abilities": {
      "FOR": {
        "label": "Forza",
        "score": 14,
        "temp": 0,
        "standard": "FOR"
      },
      "DES": {
        "label": "Destrezza",
        "score": 15,
        "temp": 0,
        "standard": "DES"
      },
      "COS": {
        "label": "Costituzione",
        "score": 15,
        "temp": 0,
        "standard": "COS"
      },
      "INT": {
        "label": "Intelligenza",
        "score": 14,
        "temp": 0,
        "standard": "INT"
      },
      "SAG": {
        "label": "Saggezza",
        "score": 17,
        "temp": 0,
        "standard": "SAG"
      },
      "CAR": {
        "label": "Carisma",
        "score": 16,
        "temp": 0,
        "standard": "CAR"
      }
    },
    "combat": {
      "hpMax": 22.0,
      "hpCurrent": 22.0,
      "nonlethal": 0,
      "initiativeMisc": 0,
      "speed": "9 m / 6 m (armatura)",
      "bab": "+2",
      "grappleMisc": 0,
      "resistances": ""
    },
    "armorClass": {
      "base": 10,
      "armor": 5.0,
      "shield": 0,
      "natural": 0,
      "deflection": 0,
      "dodge": 0,
      "size": 0,
      "misc": 0,
      "touchMisc": 0,
      "flatFootedMisc": 0,
      "maxDex": ""
    },
    "saves": {
      "tempra": {
        "label": "Tempra",
        "ability": "COS",
        "base": 0,
        "magic": 0,
        "misc": 0
      },
      "riflessi": {
        "label": "Riflessi",
        "ability": "DES",
        "base": 0,
        "magic": 0,
        "misc": 0
      },
      "volonta": {
        "label": "Volontà",
        "ability": "SAG",
        "base": 0,
        "magic": 0,
        "misc": 0
      }
    },
    "attacks": [
      {
        "name": "Morning star",
        "bonus": "+4",
        "damage": "1d8+2",
        "critical": "20x2",
        "range": "",
        "type": "Contundente / Perforante",
        "notes": ""
      },
      {
        "name": "Balestra leggera",
        "bonus": "+4",
        "damage": "1d8",
        "critical": "19-20/x2",
        "range": "24 m",
        "type": "Perforante",
        "notes": ""
      }
    ],
    "defenses": [
      {
        "name": "Corazza a scaglie",
        "bonus": "+4",
        "type": "Media",
        "maxDex": "+3",
        "checkPenalty": "-4",
        "spellFailure": "25%",
        "weight": "15"
      },
      {
        "name": "Scudo leggero di metallo",
        "bonus": "+1",
        "type": "",
        "maxDex": "",
        "checkPenalty": "-1",
        "spellFailure": "5%",
        "weight": "3"
      }
    ],
    "skills": [
      {
        "name": "Acrobazia",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Addestrare Animali",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Artigianato",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Artista della Fuga",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Ascoltare",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Cavalcare",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Cercare",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Concentrazione",
        "ability": "COS",
        "standardAbility": "COS",
        "ranks": 1.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Arcane",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Architettura e Ingegneria",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Dungeon",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Geografia",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Locali",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 6.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Conoscenze Natura",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 5.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Conoscenze Nobiltà e Regalità",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Piani",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Religioni",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Decifrare Scritture",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Diplomazia",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Disattivare Congegni",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Equilibrio",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Falsificare",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 2.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Guarire",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Intimidire",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Intrattenere",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Muoversi Silenziosamente",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Nascondersi",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 6.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Nuotare",
        "ability": "FOR",
        "standardAbility": "FOR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Osservare",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Percepire Intenzioni",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Professione",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Raccogliere Informazioni",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Rapidità di Mano",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Raggirare",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Saltare",
        "ability": "FOR",
        "standardAbility": "FOR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Sapienza Magica",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Scalare",
        "ability": "FOR",
        "standardAbility": "FOR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Scassinare Serrature",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Sopravvivenza",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 4.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Utilizzare Corde",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "Sì",
        "notes": ""
      },
      {
        "name": "Utilizzare Oggetti Magici",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Valutare",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      }
    ],
    "feats": [
      {
        "name": "Incantare in Combattimento",
        "description": "",
        "source": ""
      },
      {
        "name": "Aumentare Guarigione",
        "description": "",
        "source": ""
      },
      {
        "name": "Destino eroico (razze)",
        "description": "",
        "source": ""
      }
    ],
    "features": [
      {
        "name": "Armi semplici",
        "description": "",
        "source": ""
      },
      {
        "name": "Armature leggere e medie",
        "description": "",
        "source": ""
      },
      {
        "name": "Competenza Falcione",
        "description": "",
        "source": ""
      },
      {
        "name": "Cura della fede",
        "description": "",
        "source": ""
      },
      {
        "name": "Specialista conoscenze",
        "description": "",
        "source": ""
      },
      {
        "name": "Presenza Vile",
        "description": "",
        "source": ""
      },
      {
        "name": "Favore della divinità",
        "description": "",
        "source": ""
      }
    ],
    "languages": [
      {
        "name": "Comune",
        "notes": ""
      },
      {
        "name": "Nanico",
        "notes": ""
      },
      {
        "name": "Elfico",
        "notes": ""
      },
      {
        "name": "Draconico",
        "notes": ""
      }
    ],
    "spells": {
      "0": [
        {
          "name": "Cura ferite minori (V) (S) Azione standard",
          "school": "",
          "time": "",
          "target": "",
          "description": ""
        },
        {
          "name": "Guida (V) (S) Azione standard",
          "school": "",
          "time": "",
          "target": "",
          "description": ""
        },
        {
          "name": "Infliggi ferite minori (V) (S) Azione standard",
          "school": "",
          "time": "",
          "target": "",
          "description": ""
        },
        {
          "name": "Resistenza (V) (S) (FD) Azione standard",
          "school": "",
          "time": "",
          "target": "",
          "description": ""
        },
        {
          "name": "Virtù (V) (S) (FD) Azione standard",
          "school": "",
          "time": "",
          "target": "",
          "description": ""
        },
        {
          "name": "Lettura del magico (V) (S) (F) Azione Standard",
          "school": "",
          "time": "",
          "target": "",
          "description": ""
        },
        {
          "name": "Cura ferite leggere (V) (S) [Manuale del giocatore] Azione stan",
          "school": "",
          "time": "",
          "target": "",
          "description": ""
        },
        {
          "name": "Mal di cuore (V) (S) (FD) [Libro delle fosche tenebre] Azione",
          "school": "",
          "time": "",
          "target": "",
          "description": ""
        },
        {
          "name": "Pena (V) (S) (M, 1 lacrima) [Libro delle fosche tenebre] Azione",
          "school": "",
          "time": "",
          "target": "",
          "description": ""
        },
        {
          "name": "Vigore Inferiore (V) (S) [Perfetto Sacerdote] Azione standard",
          "school": "",
          "time": "",
          "target": "",
          "description": ""
        }
      ],
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
      "6": [],
      "7": [],
      "8": [],
      "9": []
    },
    "inventory": [
      {
        "name": "Moneta (FD)",
        "qty": "",
        "weight": "",
        "notes": ""
      },
      {
        "name": "Quadrelli (100)",
        "qty": "",
        "weight": "",
        "notes": ""
      },
      {
        "name": "Borsa conservante IV (750kg)",
        "qty": "",
        "weight": "30",
        "notes": ""
      }
    ],
    "money": {
      "MP": 0,
      "MO": 0.0,
      "MA": 0,
      "MR": 0
    },
    "narrative": {
      "summary": "Anima prescelta sospesa tra guarigione e pestilenza. Vede nella malattia una forma di accettazione e nella non morte una possibile fine della fuga.",
      "bonds": [
        "Talona",
        "Loviatar come tentazione/corruzione del destino",
        "Il sogno delle fiammelle nere"
      ],
      "visions": [
        "Fiammelle bianche che diventano nere, malate come lui, senza dolore."
      ],
      "privateNotes": "Area per preghiere, contagio, guarigione e conflitti interiori."
    }
  },
  "ralph": {
    "schemaVersion": 2,
    "meta": {
      "slug": "ralph",
      "theme": "blood",
      "crest": "滴",
      "profileUrl": "ralph.html",
      "sourcePdf": "",
      "status": "Scheda dinamica Step 1: formule automatiche, righe aggiungibili, salvataggio locale. Supabase sarà collegato nello step successivo.",
      "subtitle": "Sangue, dolore e devozione a Loviatar.",
      "accent": "#b4192d"
    },
    "identity": {
      "name": "Ralph Mengele",
      "player": "Da assegnare",
      "race": "Umano",
      "classLevel": "Studioso del sangue / devoto di Loviatar",
      "alignment": "Da compilare",
      "deity": "Loviatar",
      "xp": "Da compilare"
    },
    "portrait": {
      "image": "../assets/img/Ralph.jpeg",
      "alt": "Ralph Mengele",
      "quote": "Il dolore è una misura. Il sangue è il linguaggio."
    },
    "appearance": {
      "size": "Media",
      "age": "Da compilare",
      "sex": "M",
      "height": "Da compilare",
      "weight": "Da compilare",
      "eyes": "Da compilare",
      "hair": "Da compilare",
      "skin": "Da compilare",
      "marks": "Benda metallica spinata sugli occhi, sensibilità sovrannaturale al sangue."
    },
    "abilities": {
      "FOR": {
        "label": "Forza",
        "score": 0,
        "temp": 0,
        "standard": "FOR"
      },
      "DES": {
        "label": "Destrezza",
        "score": 0,
        "temp": 0,
        "standard": "DES"
      },
      "COS": {
        "label": "Costituzione",
        "score": 0,
        "temp": 0,
        "standard": "COS"
      },
      "INT": {
        "label": "Intelligenza",
        "score": 0,
        "temp": 0,
        "standard": "INT"
      },
      "SAG": {
        "label": "Saggezza",
        "score": 0,
        "temp": 0,
        "standard": "SAG"
      },
      "CAR": {
        "label": "Carisma",
        "score": 0,
        "temp": 0,
        "standard": "CAR"
      }
    },
    "combat": {
      "hpMax": 0,
      "hpCurrent": 0,
      "nonlethal": 0,
      "initiativeMisc": 0,
      "speed": "9 m",
      "bab": "Da compilare",
      "grappleMisc": 0,
      "resistances": "Da compilare"
    },
    "armorClass": {
      "base": 10,
      "armor": 0,
      "shield": 0,
      "natural": 0,
      "deflection": 0,
      "dodge": 0,
      "size": 0,
      "misc": 0,
      "touchMisc": 0,
      "flatFootedMisc": 0,
      "maxDex": ""
    },
    "saves": {
      "tempra": {
        "label": "Tempra",
        "ability": "COS",
        "base": 0,
        "magic": 0,
        "misc": 0
      },
      "riflessi": {
        "label": "Riflessi",
        "ability": "DES",
        "base": 0,
        "magic": 0,
        "misc": 0
      },
      "volonta": {
        "label": "Volontà",
        "ability": "SAG",
        "base": 0,
        "magic": 0,
        "misc": 0
      }
    },
    "attacks": [
      {
        "name": "Arma principale",
        "bonus": "Da compilare",
        "damage": "Da compilare",
        "critical": "Da compilare",
        "range": "—",
        "type": "Da compilare",
        "notes": ""
      }
    ],
    "defenses": [
      {
        "name": "Armatura / protezione",
        "bonus": "Da compilare",
        "type": "",
        "maxDex": "",
        "checkPenalty": "",
        "spellFailure": "",
        "weight": ""
      }
    ],
    "skills": [
      {
        "name": "Acrobazia",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Addestrare Animali",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Artigianato",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Artista della Fuga",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Ascoltare",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Cavalcare",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Cercare",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Concentrazione",
        "ability": "COS",
        "standardAbility": "COS",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Arcane",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Architettura e Ingegneria",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Dungeon",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Geografia",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Locali",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Natura",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Nobiltà e Regalità",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Piani",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Religioni",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Decifrare Scritture",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Diplomazia",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Disattivare Congegni",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Equilibrio",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Falsificare",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Guarire",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Intimidire",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Intrattenere",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Muoversi Silenziosamente",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Nascondersi",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Nuotare",
        "ability": "FOR",
        "standardAbility": "FOR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Osservare",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Percepire Intenzioni",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Professione",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Raccogliere Informazioni",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Rapidità di Mano",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Raggirare",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Saltare",
        "ability": "FOR",
        "standardAbility": "FOR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Sapienza Magica",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Scalare",
        "ability": "FOR",
        "standardAbility": "FOR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Scassinare Serrature",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Sopravvivenza",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Utilizzare Corde",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Utilizzare Oggetti Magici",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Valutare",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      }
    ],
    "feats": [
      {
        "name": "Da compilare",
        "description": "",
        "source": ""
      }
    ],
    "features": [
      {
        "name": "Da compilare",
        "description": "",
        "source": ""
      }
    ],
    "languages": [
      {
        "name": "Comune",
        "notes": ""
      }
    ],
    "spells": {
      "0": [
        {
          "name": "Da compilare",
          "school": "",
          "time": "",
          "target": "",
          "description": ""
        }
      ],
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
      "6": [],
      "7": [],
      "8": [],
      "9": []
    },
    "inventory": [
      {
        "name": "Oggetto importante di trama",
        "qty": "1",
        "weight": "",
        "notes": "Da compilare"
      }
    ],
    "money": {
      "MP": 0,
      "MO": 0.0,
      "MA": 0,
      "MR": 0
    },
    "narrative": {
      "summary": "Studioso del sangue curativo e cultista di Loviatar. Cieco, percepisce il mondo attraverso il sangue e interpreta la sofferenza come perfezionamento.",
      "bonds": [
        "Loviatar",
        "Otmar e l’Accademia di Medicina",
        "Il sangue come verità nascosta"
      ],
      "visions": [
        "Fiammelle nere che diventano rosse e soffrono eternamente, interpretate come perfezionamento."
      ],
      "privateNotes": "Area libera per appunti del giocatore."
    }
  },
  "arolf": {
    "schemaVersion": 2,
    "meta": {
      "slug": "arolf",
      "theme": "necrotic",
      "crest": "☽",
      "profileUrl": "arolf.html",
      "sourcePdf": "",
      "status": "Scheda dinamica Step 1: formule automatiche, righe aggiungibili, salvataggio locale. Supabase sarà collegato nello step successivo.",
      "subtitle": "Necromanzia elegante, anatomia e bellezza della morte.",
      "accent": "#d5c27a"
    },
    "identity": {
      "name": "Arolf Thelir",
      "player": "Da assegnare",
      "race": "Umano",
      "classLevel": "Medico / artista / necromante",
      "alignment": "Da compilare",
      "deity": "Da compilare",
      "xp": "Da compilare"
    },
    "portrait": {
      "image": "../assets/img/arolf.jpeg",
      "alt": "Arolf Thelir",
      "quote": "La morte non è la fine della bellezza. È il suo materiale più onesto."
    },
    "appearance": {
      "size": "Media",
      "age": "Da compilare",
      "sex": "M",
      "height": "Da compilare",
      "weight": "Da compilare",
      "eyes": "Da compilare",
      "hair": "Da compilare",
      "skin": "Da compilare",
      "marks": "Portamento elegante, ossessione estetica per anatomia, morte e conservazione."
    },
    "abilities": {
      "FOR": {
        "label": "Forza",
        "score": 0,
        "temp": 0,
        "standard": "FOR"
      },
      "DES": {
        "label": "Destrezza",
        "score": 0,
        "temp": 0,
        "standard": "DES"
      },
      "COS": {
        "label": "Costituzione",
        "score": 0,
        "temp": 0,
        "standard": "COS"
      },
      "INT": {
        "label": "Intelligenza",
        "score": 0,
        "temp": 0,
        "standard": "INT"
      },
      "SAG": {
        "label": "Saggezza",
        "score": 0,
        "temp": 0,
        "standard": "SAG"
      },
      "CAR": {
        "label": "Carisma",
        "score": 0,
        "temp": 0,
        "standard": "CAR"
      }
    },
    "combat": {
      "hpMax": 0,
      "hpCurrent": 0,
      "nonlethal": 0,
      "initiativeMisc": 0,
      "speed": "9 m",
      "bab": "Da compilare",
      "grappleMisc": 0,
      "resistances": "Da compilare"
    },
    "armorClass": {
      "base": 10,
      "armor": 0,
      "shield": 0,
      "natural": 0,
      "deflection": 0,
      "dodge": 0,
      "size": 0,
      "misc": 0,
      "touchMisc": 0,
      "flatFootedMisc": 0,
      "maxDex": ""
    },
    "saves": {
      "tempra": {
        "label": "Tempra",
        "ability": "COS",
        "base": 0,
        "magic": 0,
        "misc": 0
      },
      "riflessi": {
        "label": "Riflessi",
        "ability": "DES",
        "base": 0,
        "magic": 0,
        "misc": 0
      },
      "volonta": {
        "label": "Volontà",
        "ability": "SAG",
        "base": 0,
        "magic": 0,
        "misc": 0
      }
    },
    "attacks": [
      {
        "name": "Arma principale",
        "bonus": "Da compilare",
        "damage": "Da compilare",
        "critical": "Da compilare",
        "range": "—",
        "type": "Da compilare",
        "notes": ""
      }
    ],
    "defenses": [
      {
        "name": "Armatura / protezione",
        "bonus": "Da compilare",
        "type": "",
        "maxDex": "",
        "checkPenalty": "",
        "spellFailure": "",
        "weight": ""
      }
    ],
    "skills": [
      {
        "name": "Acrobazia",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Addestrare Animali",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Artigianato",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Artista della Fuga",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Ascoltare",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Cavalcare",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Cercare",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Concentrazione",
        "ability": "COS",
        "standardAbility": "COS",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Arcane",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Architettura e Ingegneria",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Dungeon",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Geografia",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Locali",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Natura",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Nobiltà e Regalità",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Piani",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Religioni",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Decifrare Scritture",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Diplomazia",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Disattivare Congegni",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Equilibrio",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Falsificare",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Guarire",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Intimidire",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Intrattenere",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Muoversi Silenziosamente",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Nascondersi",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Nuotare",
        "ability": "FOR",
        "standardAbility": "FOR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Osservare",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Percepire Intenzioni",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Professione",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Raccogliere Informazioni",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Rapidità di Mano",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Raggirare",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Saltare",
        "ability": "FOR",
        "standardAbility": "FOR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Sapienza Magica",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Scalare",
        "ability": "FOR",
        "standardAbility": "FOR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Scassinare Serrature",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Sopravvivenza",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Utilizzare Corde",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Utilizzare Oggetti Magici",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Valutare",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      }
    ],
    "feats": [
      {
        "name": "Da compilare",
        "description": "",
        "source": ""
      }
    ],
    "features": [
      {
        "name": "Da compilare",
        "description": "",
        "source": ""
      }
    ],
    "languages": [
      {
        "name": "Comune",
        "notes": ""
      }
    ],
    "spells": {
      "0": [
        {
          "name": "Da compilare",
          "school": "",
          "time": "",
          "target": "",
          "description": ""
        }
      ],
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
      "6": [],
      "7": [],
      "8": [],
      "9": []
    },
    "inventory": [
      {
        "name": "Oggetto importante di trama",
        "qty": "1",
        "weight": "",
        "notes": "Da compilare"
      }
    ],
    "money": {
      "MP": 0,
      "MO": 0.0,
      "MA": 0,
      "MR": 0
    },
    "narrative": {
      "summary": "Medico, artista e necromante di Valkren. Cerca nella non morte una forma superiore di conservazione e aspira a superare i limiti della carne.",
      "bonds": [
        "Valkren",
        "Necromanzia",
        "Arte anatomica e perfezione della non morte"
      ],
      "visions": [
        "Visioni e appunti da compilare dopo le sessioni."
      ],
      "privateNotes": "Area libera per appunti del giocatore."
    }
  },
  "igor": {
    "schemaVersion": 2,
    "meta": {
      "slug": "igor",
      "theme": "crucis",
      "crest": "✚",
      "profileUrl": "igor.html",
      "sourcePdf": "",
      "status": "Scheda dinamica Step 1: formule automatiche, righe aggiungibili, salvataggio locale. Supabase sarà collegato nello step successivo.",
      "subtitle": "Crucimigrazione, catene, oro e argento.",
      "accent": "#c9b27c"
    },
    "identity": {
      "name": "Igor",
      "player": "Da assegnare",
      "race": "Da compilare",
      "classLevel": "Vittima della Crucimigrazione",
      "alignment": "Da compilare",
      "deity": "Da compilare",
      "xp": "Da compilare"
    },
    "portrait": {
      "image": "../assets/img/Igor.jpeg",
      "alt": "Igor",
      "quote": "Un corpo può sopravvivere anche quando il nome è già morto."
    },
    "appearance": {
      "size": "Media",
      "age": "Da compilare",
      "sex": "M",
      "height": "Da compilare",
      "weight": "Da compilare",
      "eyes": "Da compilare",
      "hair": "Da compilare",
      "skin": "Da compilare",
      "marks": "Segni del rituale, corpo preservato da forze innaturali, trauma visibile."
    },
    "abilities": {
      "FOR": {
        "label": "Forza",
        "score": 0,
        "temp": 0,
        "standard": "FOR"
      },
      "DES": {
        "label": "Destrezza",
        "score": 0,
        "temp": 0,
        "standard": "DES"
      },
      "COS": {
        "label": "Costituzione",
        "score": 0,
        "temp": 0,
        "standard": "COS"
      },
      "INT": {
        "label": "Intelligenza",
        "score": 0,
        "temp": 0,
        "standard": "INT"
      },
      "SAG": {
        "label": "Saggezza",
        "score": 0,
        "temp": 0,
        "standard": "SAG"
      },
      "CAR": {
        "label": "Carisma",
        "score": 0,
        "temp": 0,
        "standard": "CAR"
      }
    },
    "combat": {
      "hpMax": 0,
      "hpCurrent": 0,
      "nonlethal": 0,
      "initiativeMisc": 0,
      "speed": "9 m",
      "bab": "Da compilare",
      "grappleMisc": 0,
      "resistances": "Da compilare"
    },
    "armorClass": {
      "base": 10,
      "armor": 0,
      "shield": 0,
      "natural": 0,
      "deflection": 0,
      "dodge": 0,
      "size": 0,
      "misc": 0,
      "touchMisc": 0,
      "flatFootedMisc": 0,
      "maxDex": ""
    },
    "saves": {
      "tempra": {
        "label": "Tempra",
        "ability": "COS",
        "base": 0,
        "magic": 0,
        "misc": 0
      },
      "riflessi": {
        "label": "Riflessi",
        "ability": "DES",
        "base": 0,
        "magic": 0,
        "misc": 0
      },
      "volonta": {
        "label": "Volontà",
        "ability": "SAG",
        "base": 0,
        "magic": 0,
        "misc": 0
      }
    },
    "attacks": [
      {
        "name": "Arma principale",
        "bonus": "Da compilare",
        "damage": "Da compilare",
        "critical": "Da compilare",
        "range": "—",
        "type": "Da compilare",
        "notes": ""
      }
    ],
    "defenses": [
      {
        "name": "Armatura / protezione",
        "bonus": "Da compilare",
        "type": "",
        "maxDex": "",
        "checkPenalty": "",
        "spellFailure": "",
        "weight": ""
      }
    ],
    "skills": [
      {
        "name": "Acrobazia",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Addestrare Animali",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Artigianato",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Artista della Fuga",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Ascoltare",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Cavalcare",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Cercare",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Concentrazione",
        "ability": "COS",
        "standardAbility": "COS",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Arcane",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Architettura e Ingegneria",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Dungeon",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Geografia",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Locali",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Natura",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Nobiltà e Regalità",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Piani",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Conoscenze Religioni",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Decifrare Scritture",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Diplomazia",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Disattivare Congegni",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Equilibrio",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Falsificare",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Guarire",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Intimidire",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Intrattenere",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Muoversi Silenziosamente",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Nascondersi",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Nuotare",
        "ability": "FOR",
        "standardAbility": "FOR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Osservare",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Percepire Intenzioni",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Professione",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Raccogliere Informazioni",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Rapidità di Mano",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Raggirare",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Saltare",
        "ability": "FOR",
        "standardAbility": "FOR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Sapienza Magica",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Scalare",
        "ability": "FOR",
        "standardAbility": "FOR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Scassinare Serrature",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Sopravvivenza",
        "ability": "SAG",
        "standardAbility": "SAG",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Utilizzare Corde",
        "ability": "DES",
        "standardAbility": "DES",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Utilizzare Oggetti Magici",
        "ability": "CAR",
        "standardAbility": "CAR",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      },
      {
        "name": "Valutare",
        "ability": "INT",
        "standardAbility": "INT",
        "ranks": 0.0,
        "misc": 0,
        "armorPenalty": 0,
        "classSkill": "",
        "notes": ""
      }
    ],
    "feats": [
      {
        "name": "Da compilare",
        "description": "",
        "source": ""
      }
    ],
    "features": [
      {
        "name": "Da compilare",
        "description": "",
        "source": ""
      }
    ],
    "languages": [
      {
        "name": "Comune",
        "notes": ""
      }
    ],
    "spells": {
      "0": [
        {
          "name": "Da compilare",
          "school": "",
          "time": "",
          "target": "",
          "description": ""
        }
      ],
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
      "6": [],
      "7": [],
      "8": [],
      "9": []
    },
    "inventory": [
      {
        "name": "Oggetto importante di trama",
        "qty": "1",
        "weight": "",
        "notes": "Da compilare"
      }
    ],
    "money": {
      "MP": 0,
      "MO": 0.0,
      "MA": 0,
      "MR": 0
    },
    "narrative": {
      "summary": "Vittima della Crucimigrazione, rinchiuso in una grotta e segnato da un rito che lo ha spezzato. La sua esistenza è una ferita rituale ancora aperta.",
      "bonds": [
        "Crucimigrazione",
        "La grotta",
        "Simboli d’oro e argento",
        "Il rito che mantiene la forma"
      ],
      "visions": [
        "Ricordi spezzati, eco di catene, croce rituale e soglia oltre la vita."
      ],
      "privateNotes": "Area libera per appunti del giocatore."
    }
  }
};
