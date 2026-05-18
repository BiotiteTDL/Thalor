(function(){
  const LIST_KEY='thalor.personaggi.registry.v2';
  const SHEET_PREFIX='thalor.sheet.';
  const SHEET_SUFFIX='.v5';
  const CONTENT_RESTORE_VERSION='2026-05-14-ripristino-descrizioni-eventi';
  const REGISTRY_SLUG='__personaggi__';
  const DEFAULTS=[
    {
        "type": "pg",
        "slug": "abraxas",
        "name": "Abraxas",
        "desc": "Ex schiavo dell’Underdark, legato a Belzebù e al Signore delle Mosche da un patto nato nella disperazione.",
        "img": "assets/img/Abraxas.jpeg",
        "href": "personaggi/dettaglio.html?id=abraxas",
        "sheet": "personaggi/scheda.html?character=abraxas",
        "tag": "Personaggio giocante",
        "longHtml": "<p>Nato nelle profondità dell’Underdark, <a class=\"lore-link\" href=\"abraxas.html\">Abraxas</a> non conobbe mai altro che schiavitù.</p>\n<p>I suoi primi ricordi appartengono alle fucine sotterranee della casata drow di Talión, un giovane rampollo nobiliare il cui prestigio si fondava sul traffico di monete false destinate al mondo di superficie. Insieme a schiavi duergar e svirfneblin, Abraxas trascorse l’infanzia rinchiuso in ambienti soffocanti, costretto a lavorare metalli incandescenti e incidere falsi dobloni sotto la costante sorveglianza dei drow.</p>\n<p>Ogni errore veniva punito. Ogni successo ignorato.</p>\n<p>Talión trovava piacere nell’umiliazione dei propri schiavi, e per Abraxas il concetto stesso di “vita” finì presto per confondersi con dolore, paura e sopravvivenza.</p>\n<p>Fu in quelle gallerie che iniziò a sentire pronunciare, quasi con disgusto, parole riguardo la propria natura tiefling. Gli altri schiavi gli dicevano che provenisse dall’Inferno. Ma per lui, l’unico inferno reale era quello in cui vivevano ogni giorno.</p>\n<p>La monotonia della prigionia si spezzò quando uno strano individuo giunse alle fucine per acquistare un grande quantitativo di monete d’argento da Talión. L’uomo mostrò immediatamente un insolito interesse per Abraxas, osservandolo come se vedesse qualcosa che gli altri ignoravano.</p>\n<p>Fu allora che gli propose un patto.</p>\n<p>Se avesse ucciso Talión, avrebbe ottenuto la libertà. Avrebbe lasciato l’Underdark. Avrebbe finalmente visto il mondo di sopra.</p>\n<p>La firma del patto avvenne attraverso un pugnale avvelenato.</p>\n<p>Quella stessa notte, Abraxas lo affondò nella gola del suo padrone.</p>\n<p>Per la prima volta nella propria vita provò qualcosa che somigliava al piacere.</p>\n<p>Ma la libertà non arrivò.</p>\n<p>I drow lo catturarono quasi immediatamente. Venne frustato fino al limite della morte e rinchiuso in una cella in attesa della tortura pubblica che lo avrebbe atteso il giorno seguente.</p>\n<p>Fu lì, nel silenzio interrotto soltanto dalle urla dei condannati, che Abraxas comprese di essere stato tradito. O almeno così credeva.</p>\n<p>Nel cuore della notte, una mosca entrò nella sua cella. Un piccolo essere insignificante, intrappolato poco dopo nella tela di un ragno.</p>\n<p>Abraxas aveva visto quella scena centinaia di volte nelle profondità dell’Underdark. Ma questa volta accadde qualcosa di diverso.</p>\n<p>La mosca si liberò. Balzò sul ragno. E lo uccise.</p>\n<p>Subito dopo, la creatura mutò forma. Davanti a lui comparve lo stesso uomo incontrato alle fucine.</p>\n<p>L’individuo pronunciò parole che Abraxas non comprese mai davvero, ma il significato gli rimase impresso nella mente: “Un servo dei diavoli non tradisce mai la propria parola.”</p>\n<p>Un istante dopo si ritrovò nel mondo di superficie.</p>\n<p>Lo sconosciuto si rivelò essere un druido devoto al <a class=\"lore-link\" href=\"../archivio/info-utili.html\">Signore delle Mosche</a>, incaricato di diffondere il culto di <a class=\"lore-link\" href=\"../archivio/info-utili.html\">Belzebù</a> in quelle terre.</p>\n<p>Da allora sono trascorsi due anni.</p>\n<p>Abraxas continua a servirlo, aiutandolo a costruire lentamente un culto che fatica ancora a trovare seguaci. Eppure, nonostante tutto ciò che ha vissuto, continua a credere nelle promesse del futuro.</p>\n<p>Molti troverebbero assurdo che qualcuno come lui possa pregare una figura come Belzebù. Ma Abraxas non ha mai conosciuto misericordia.</p>\n<p>E quando il mondo ti mostra soltanto crudeltà, perfino i diavoli possono sembrare una via possibile.</p>",
        "eventsHtml": "<p>Durante la veglia di <a class=\"lore-link\" href=\"../personaggi/varek.html\">Varek Thorm</a>, Abraxas entrò a <a class=\"lore-link\" href=\"../luoghi/valkren/index.html\">Villa Thorm</a> mostrando alle guardie solo una parte delle proprie lame. Quando il Libro Mastro venne trafugato, fu tra i primi a lanciarsi all’inseguimento del ladro sui tetti dell’Insenno.</p>\n<p>Dopo la cappella abbandonata, mentre il resto del gruppo tornava alla villa, Abraxas si separò dagli altri per compiere un piccolo rito alle mosche. Quella stessa notte tornò alla veglia e lanciò una bottiglia incendiaria contro la bara di Varek, incendiando il falso cadavere e ferendo gravemente <a class=\"lore-link\" href=\"../personaggi/lyria.html\">Lyria Thorm</a>.</p>\n<p>Il giorno seguente tentò di piegare Lyria con parole crudeli durante il funerale, ma la ragazza non cedette. Più tardi, paradossalmente, fu proprio lui a trattare con lei per ottenere una nave verso <a class=\"lore-link\" href=\"../luoghi/portogrigio.html\">Portogrigio</a>. Prima della partenza sacrificò l’alchimista del villaggio in un rito osceno dedicato a Belzebù.</p>\n<p>Durante il viaggio in mare combatté i pirati mezzidrow e torturò il loro capitano, ricavandone informazioni sul Disco runico. A Portogrigio seguì i <a class=\"lore-link\" href=\"../luoghi/portogrigio.html\">Becchini della Pioggia</a> fino all’Accademia. Nella terza sessione incontrò <a class=\"lore-link\" href=\"../personaggi/abdul.html\">Abdul Alhazred</a>, ottenendo una piccola mosca metallica che si fissò alla sua gola in cambio di un frammento della sua saggezza.</p>",
        "longDesc": "",
        "events": ""
    },
    {
        "type": "pg",
        "slug": "irven",
        "name": "Irven Till, Blightborn",
        "desc": "Uomo nato tra piaga e guarigione, diviso tra la malattia che distrugge e la fede che salva.",
        "img": "assets/img/Irven_Till_Blightborn.jpeg",
        "href": "personaggi/dettaglio.html?id=irven",
        "sheet": "personaggi/scheda.html?character=irven",
        "tag": "Personaggio giocante",
        "longHtml": "<p><a class=\"lore-link\" href=\"irven.html\">Irven Till</a> venne al mondo durante una notte di pioggia acida, mentre il vento trascinava tra le case l’odore ferroso della febbre e della decomposizione.</p>\n<p>Sua madre morì nel momento stesso in cui lui respirò per la prima volta.</p>\n<p>Le levatrici raccontarono che il neonato non pianse mai. Aprì semplicemente gli occhi e rimase immobile a fissare il soffitto, come se stesse osservando qualcosa invisibile a chiunque altro.</p>\n<p>Di suo padre non si seppe mai nulla. Alcuni sostenevano che la madre fosse stata visitata da un pellegrino senza volto. Altri sussurravano che avesse pregato troppo a lungo una divinità dimenticata… e che quella preghiera avesse risposto.</p>\n<p>Il villaggio gli diede un nome. Mai davvero un posto.</p>\n<p>Crescere significò imparare a sopravvivere.</p>\n<p>Fin dall’infanzia, Irven portò sul proprio corpo i segni della malattia: pustole, bubboni e cicatrici che sembravano appartenere a un uomo consumato dalla peste più che a un bambino.</p>\n<p>Eppure lui non si ammalava mai. Niente febbre. Niente infezioni. Nessuna debolezza.</p>\n<p>Chi viveva accanto a lui, invece, spesso finiva per deperire lentamente.</p>\n<p>All’inizio erano soltanto coincidenze. Una tosse persistente. Volti sempre più pallidi. Corpi che si indebolivano col passare delle settimane.</p>\n<p>Poi le coincidenze iniziarono ad accumularsi.</p>\n<p>Con il tempo, tra le case del villaggio iniziò a diffondersi un soprannome pronunciato soltanto sottovoce: <strong>Blightborn</strong>, il Nato dalla Piaga.</p>\n<p>Irven non comprendeva ciò che stava accadendo. E soprattutto non voleva comprenderlo. Ma la malattia sembrava seguirlo ovunque come un’ombra fedele.</p>\n<p>La prima volta che sentì la voce fu durante un sogno che non gli apparteneva.</p>\n<p>Una figura avvolta da veli di muffa e luce gli parlò senza avere una bocca.</p>\n<p>“Non sei una piaga. Sei il confine tra ciò che marcisce… e ciò che sopravvive.”</p>\n<p>Al risveglio trovò le proprie mani tremanti. Non per paura. Per potere.</p>\n<p>Da quel giorno qualcosa cambiò. Quando pregava — o semplicemente desiderava abbastanza intensamente che qualcuno sopravvivesse — la malattia sembrava ritirarsi.</p>\n<p>E quando desiderava che qualcuno soffrisse… la malattia ascoltava anche quello.</p>\n<p>Irven non seppe mai quale entità lo avesse scelto. Forse una divinità che vedeva nella decomposizione parte del ciclo naturale. Forse qualcosa di molto più antico. O forse una forza capace di osservare la vita soltanto attraverso il decadimento.</p>\n<p>Il villaggio smise definitivamente di ignorare ciò che era durante un’epidemia che colpì la regione.</p>\n<p>Irven riuscì a guarire diversi bambini con un semplice tocco. Il giorno seguente, però, i loro genitori iniziarono ad ammalarsi.</p>\n<p>Nessuno lo accusò apertamente. Nessuno osò condannarlo.</p>\n<p>Fu semplicemente allontanato. Con quella gentilezza fredda e crudele che si riserva alle cose che fanno paura, ma che nessuno vuole affrontare davvero.</p>\n<p>Irven lasciò il villaggio senza voltarsi. Non aveva mai avuto una casa lì.</p>\n<p>Ora vaga tra città decadenti, villaggi isolati e terre consumate dalla malattia, portando con sé un dono che non comprende fino in fondo.</p>\n<p>Alcuni lo cercano come guaritore. Altri lo evitano come un presagio di sventura.</p>\n<p>Lui stesso non sa ancora quale delle due cose sia davvero.</p>\n<p>Ma una certezza continua a tormentarlo: la voce che lo ha scelto non ha ancora finito con lui.</p>\n<p>Ogni notte, nei sogni, continua a mostrargli luoghi in cui la vita marcisce e la morte si rifiuta di chiudere gli occhi. E ogni volta gli sussurra la stessa richiesta.</p>\n<p>“Riequilibra.”</p>\n<p>Irven Till non è un eroe. Non è un mostro.</p>\n<p>È un uomo nato tra due forze che raramente riescono a convivere: la malattia che distrugge… e la fede che salva.</p>\n<p>E ogni passo che compie lo avvicina lentamente al momento in cui dovrà decidere quale delle due definirà davvero ciò che è diventato.</p>",
        "eventsHtml": "<p>Irven arrivò alla veglia di Varek Thorm nascosto sotto il mantello e dietro la propria maschera, suscitando immediatamente disgusto e timore tra gli ospiti. La sua presenza venne tollerata più per prudenza che per reale accettazione.</p>\n<p>Dopo gli eventi della cappella e del mausoleo, trascorse la notte nella casa di Arolf, dove il gruppo tentò inutilmente di trattare piaghe, bubboni e ferite che non sembravano appartenere a una malattia comune. Ogni rimedio fallì: al mattino, il suo corpo era identico al giorno prima.</p>\n<p>Nella stessa notte fu tormentato da sogni e visioni legati alla piaga, alla trasformazione e al destino delle anime. Durante il viaggio verso Portogrigio affrontò i pirati mezzidrow insieme agli altri e raggiunse poi l’Accademia di Medicina.</p>\n<p>Nella tenda impossibile di <a class=\"lore-link\" href=\"../personaggi/abdul.html\">Abdul Alhazred</a>, Irven consegnò la propria moneta sacra. Quando gli venne restituita, il simbolo di Loviatar era scomparso: da un lato compariva un volto alieno e tentacolare, mentre sull’altro rimaneva il simbolo di Talona.</p>",
        "longDesc": "",
        "events": ""
    },
    {
        "type": "pg",
        "slug": "ralph",
        "name": "Ralph Mengele",
        "desc": "Studioso del sangue curativo, devoto di Loviatar , cieco e capace di percepire il sangue come un cosmo vivente.",
        "img": "assets/img/Ralph.jpeg",
        "href": "personaggi/dettaglio.html?id=ralph",
        "sheet": "personaggi/scheda.html?character=ralph",
        "tag": "Personaggio giocante",
        "longHtml": "<p>La nascita di <a class=\"lore-link\" href=\"ralph.html\">Ralph Mengele</a> fu segnata da una crudeltà silenziosa.</p>\n<p>Uno dei suoi occhi possedeva un colore diverso dall’altro, e nei primi mesi di vita comparvero i segni di uno strabismo accompagnato da un glaucoma destinato a consumargli lentamente la vista.</p>\n<p>Difetti che, nel piccolo villaggio di <a class=\"lore-link\" href=\"../luoghi.html\">Valkren</a>, bastarono a trasformarlo in qualcosa di estraneo.</p>\n<p>L’infanzia di Ralph fu solitaria. Ma quel vuoto venne presto riempito da un’ossessione: la medicina.</p>\n<p>A soli sette anni era già conosciuto nel villaggio con un soprannome inquietante: “Sacco di Sangue”.</p>\n<p>Tornava spesso dai boschi trascinando un enorme sacco colmo di animali morti o creature mutilate, che portava nello scantinato della casa di famiglia per condurre esperimenti che nessuno ebbe mai il coraggio di osservare davvero.</p>\n<p>Durante l’adolescenza partecipò attivamente alla vita militare del villaggio grazie alla propria prestanza fisica, prima di trasferirsi a <a class=\"lore-link\" href=\"../luoghi.html\">Portogrigio</a> per proseguire gli studi medici.</p>\n<p>Li concluse brillantemente.</p>\n<p>A venticinque anni era già considerato uno dei giovani studiosi più promettenti dell’Istituto di Biologia Ereditaria.</p>\n<p>Fu proprio lì che attirò l’attenzione del direttore: <a class=\"lore-link\" href=\"otmar.html\">Otmar Van Verschuer</a>.</p>\n<p>Otmar vedeva in Ralph qualcosa che gli altri preferivano ignorare. Non soltanto talento. Ma fame.</p>\n<p>Negli anni trascorsi a Portogrigio si verificarono numerosi casi di sparizioni mai risolte. Nessuno riuscì mai a dimostrare il coinvolgimento di Ralph, ma le voci sul suo conto continuarono a crescere insieme alla sua reputazione.</p>\n<p>Fu Otmar a introdurlo segretamente ai rituali di <a class=\"lore-link\" href=\"../archivio/info-utili.html\">Loviatar</a>.</p>\n<p>Attraverso il culto della Signora del Dolore, Ralph iniziò a comprendere la sofferenza non come limite… ma come strumento.</p>\n<p>Fu allora che il direttore gli mostrò il proprio vero laboratorio.</p>\n<p>Uno scantinato nascosto sotto la città. Pareti colme di fiale. Campioni di sangue. Corpi sospesi. Esperimenti proibiti.</p>\n<p>Secondo Ralph, il sangue rappresentava il vero medium della vita. Non semplice fluido. Ma memoria. Essenza. Potere.</p>\n<p>Era convinto che, manipolandolo correttamente, si sarebbero potute guarire deformità, malattie ereditarie e persino liberare capacità latenti presenti in ogni essere vivente.</p>\n<p>Grazie alla protezione di Otmar, Ralph poté approfondire i propri studi con sempre meno limiti morali.</p>\n<p>Nei sotterranei dell’Istituto iniziò a diffondersi un nuovo appellativo: l’Angelo della Morte.</p>\n<p>Ralph parlava ai pazienti con gentilezza. Li rassicurava. Li aiutava a sentirsi al sicuro. E poi li torturava, li mutilava o li uccideva osservando con lucidità il momento esatto in cui la speranza abbandonava i loro occhi.</p>\n<p>Ogni mattina, durante i rituali di autoflagellazione, ripeteva lo stesso mantra: “Le gentilezze sono le migliori compagne delle sofferenze…”</p>\n<p>Col tempo, tuttavia, le sue ricerche smisero di produrre risultati concreti. La vista continuava a peggiorare. La frustrazione aumentava. E la follia iniziò lentamente a consumarlo.</p>\n<p>Otmar fu costretto ad allontanarlo temporaneamente da Portogrigio, inviandolo in viaggio con il pretesto di una spedizione di ricerca.</p>\n<p>Per anni Ralph vagò di città in città alla ricerca di nuove cavie, nuovi tipi di sangue e nuove anomalie biologiche. Tutto inutilmente.</p>\n<p>Alla soglia dei trentatré anni era ormai vicino al collasso mentale.</p>\n<p>Quando le spie del culto informarono Otmar che Ralph stava per togliersi la vita, il direttore lo raggiunse immediatamente nel vecchio laboratorio sotto la casa dei suoi genitori a Valkren.</p>\n<p>Ciò che trovò ricordava più un macello rituale che uno studio medico.</p>\n<p>Cadaveri. Sangue rappreso. Fiale infrante. Carne in decomposizione.</p>\n<p>E al centro della stanza… il corpo senza vita di Ralph galleggiava immerso in un lago cremisi formato dal sangue delle sue stesse vittime.</p>\n<p>Prima di riportarlo in vita tramite un rituale di resurrezione, Otmar gli strappò gli occhi dalle orbite. Forse per studio. Forse come pegno. Forse per semplice curiosità.</p>\n<p>Quando Ralph si risvegliò, comprese immediatamente che il buio non era temporaneo.</p>\n<p>Eppure, immerso in quella massa di sangue, percepì qualcosa di nuovo. Gli echi. Le presenze. La vita contenuta nel sangue stesso.</p>\n<p>Fu in quell’istante che comprese una verità terrificante: trent’anni di ricerca non erano stati vani.</p>\n<p>Attraverso la morte, il suo legame con il sangue si era finalmente completato.</p>\n<p>Vicino alla porta del laboratorio trovò una benda metallica ricoperta di spuntoni. Un dono lasciato da Otmar.</p>\n<p>Quando se la conficcò nelle orbite vuote, qualcosa dentro di lui cambiò ancora una volta.</p>\n<p>Non vedeva più nel modo degli uomini. Ma percepiva il sangue. Ovunque.</p>\n<p>E mentre lasciava il laboratorio, soltanto un pensiero occupava la sua mente: se Loviatar aveva preteso i suoi occhi come pegno… allora un giorno avrebbe scoperto il motivo.</p>",
        "eventsHtml": "<p>Ralph partecipò alla veglia di Varek Thorm come figura già nota a Valkren, abbastanza conosciuta da essere lasciata entrare senza troppe domande. Dopo il furto del Libro Mastro, seguì il gruppo fino alla cappella abbandonata e poi nel mausoleo dei Thorm.</p>\n<p>Durante la notte nella casa di Arolf ascoltò i discorsi sulla superiorità della non morte, ma non cedette a quella visione. Il suo rapporto con la carne, il dolore e il sangue seguiva una strada diversa. Quella notte pregò Loviatar attraverso l’autoflagellazione, e i colpi furono abbastanza forti da riecheggiare nella casa.</p>\n<p>A Portogrigio guidò il gruppo verso l’Accademia di Medicina, un luogo che conosceva fin troppo bene. La discesa nelle stanze degradate dell’istituto riaccese il suo desiderio di vendetta verso Otmar, anche se il direttore non si fece trovare.</p>\n<p>Nei sotterranei affrontò gli orrori del laboratorio segreto, i Becchini non morti e gli innestati della sala di vivisezione. Più tardi, nella tenda di <a class=\"lore-link\" href=\"abdul.html\">Abdul</a>, ottenne ciò che desiderava: i suoi veri occhi, purificati da ogni malattia e imperfezione. In cambio cedette la benda metallica che lo aveva accompagnato fino a quel momento.</p>",
        "longDesc": "",
        "events": ""
    },
    {
        "type": "pg",
        "slug": "arolf",
        "name": "Arolf Thelir",
        "desc": "Medico, artista e necromante. Cerca nella non morte una bellezza che il mondo vivente non vuole vedere.",
        "img": "assets/img/arolf.jpeg",
        "href": "personaggi/dettaglio.html?id=arolf",
        "sheet": "personaggi/scheda.html?character=arolf",
        "tag": "Personaggio giocante",
        "longHtml": "<p><a class=\"lore-link\" href=\"arolf.html\">Arolf Thelir</a> nacque nell’Insenatura di <a class=\"lore-link\" href=\"../luoghi.html\">Valkren</a>, in una casa dove la morte non era mai considerata qualcosa da temere.</p>\n<p>Suo padre era il medico più rinomato del villaggio. Un uomo rispettato, capace di trovare rimedi dove altri vedevano soltanto disperazione. Curava malati, ricuciva ferite, studiava nuovi trattamenti e dedicava ogni istante della propria vita alla medicina.</p>\n<p>Di sua madre, invece, Arolf non conservò alcun ricordo. Morì poco dopo la sua nascita.</p>\n<p>Il padre parlava raramente di lei, ma quando accadeva lo faceva sempre con una malinconia quasi dolce. Diceva che fosse una donna gentile. Che cucinasse meglio di chiunque altro. E che avrebbe voluto vedere il figlio crescere.</p>\n<p>Fin da bambino, Arolf venne educato alla medicina con estrema disciplina.</p>\n<p>“Non dimenticare mai i dettagli,” gli ripeteva il padre. “Perché spesso sono gli unici a contenere davvero la risposta.”</p>\n<p>E Arolf imparava in fretta.</p>\n<p>Era portato per l’anatomia, per la chirurgia, per l’osservazione del corpo umano e delle sue fragilità. Ma, nonostante il talento, sentiva che qualcosa dentro di lui cercava altro.</p>\n<p>Lo trovò nell’arte.</p>\n<p>Durante gli anni trascorsi all’accademia iniziò a disegnare ossessivamente tutto ciò che vedeva: volti, paesaggi, corpi, dettagli anatomici e creature immaginate.</p>\n<p>Disegnare divenne presto la sua vera ossessione.</p>\n<p>Il padre non approvava del tutto quella passione, ma tollerava il compromesso fintanto che il figlio continuava a perfezionare anche gli studi medici.</p>\n<p>Nel retro del laboratorio di famiglia esisteva una stanza che affascinava Arolf più di qualunque altra: la sala mortuaria.</p>\n<p>Lì venivano preparati i corpi per la sepoltura o utilizzati per studi anatomici quando nessuno ne reclamava i resti.</p>\n<p>Per Arolf, la morte non appariva orribile. Al contrario.</p>\n<p>Ne percepiva una bellezza silenziosa. Una perfezione immobile.</p>\n<p>Spesso rimaneva ore a osservare i cadaveri. A studiarne le forme. A disegnarli.</p>\n<p>Nel tempo iniziò a vedere nella morte qualcosa che gli altri sembravano incapaci di comprendere.</p>\n<p>Quando venne a conoscenza di una prestigiosa accademia artistica a <a class=\"lore-link\" href=\"../luoghi.html\">Portogrigio</a>, decise di tentare l’ammissione.</p>\n<p>Fallì. Una volta. Poi ancora. E ancora.</p>\n<p>Gli insegnanti giudicavano le sue opere disturbanti, prive di prospettiva o semplicemente incomprensibili.</p>\n<p>“Questo non rappresenta la realtà.” “Questo non ha senso.” “Perché dipingere cadaveri?”</p>\n<p>Fu dopo il terzo rifiuto, all’età di ventisette anni, che qualcosa dentro di lui cambiò definitivamente.</p>\n<p>Arolf iniziò a convincersi che il problema non fosse la sua arte. Era il mondo a non essere pronto per comprenderla.</p>\n<p>Poco tempo dopo suo padre morì, lasciandogli il laboratorio e la professione.</p>\n<p>Arolf continuò a lavorare come medico con grande competenza, ma ormai viveva con una convinzione sempre più radicata: la morte non rappresentava la fine dell’esistenza. Era un’evoluzione.</p>\n<p>Mentre gli anni passavano iniziò a studiare la magia in segreto, fino a imbattersi nella necromanzia.</p>\n<p>Più approfondava quella disciplina, più ne rimaneva affascinato.</p>\n<p>La non morte gli appariva come la forma perfetta dell’esistenza: immortale, resistente, libera dalle debolezze della carne viva.</p>\n<p>Per Arolf non si trattava di corruzione. Ma di miglioramento.</p>\n<p>Comprese allora quale sarebbe stato il proprio obiettivo finale: diventare un lich.</p>\n<p>Non per sete di distruzione. Non per dominio. Ma per elevarsi oltre i limiti dell’umanità e mostrare al mondo la vera bellezza della non morte.</p>\n<p>Per approfondire i propri studi iniziò a viaggiare verso le terre del nord, dove le energie necromantiche erano più forti e antiche rovine continuavano a emergere dalla palude e dalla pietra.</p>\n<p>Fu durante una di quelle spedizioni che trovò una tomba dimenticata dal tempo.</p>\n<p>Dopo aver evitato diversi scheletri guardiani, raggiunse una grande porta di pietra ricoperta di simboli incomprensibili.</p>\n<p>Non seppe mai davvero come riuscì ad aprirla. Forse istinto. Forse destino.</p>\n<p>All’interno della camera trovò soltanto due cose: una vecchia falce ancora affilata… e una piccola creatura non morta di natura indefinibile.</p>\n<p>Arolf decise di portarla con sé.</p>\n<p>All’inizio voleva soltanto studiarla. Comprenderla. Analizzarla.</p>\n<p>Ma col tempo iniziò ad affezionarsi a quella creatura silenziosa che ormai viveva nascosta nel laboratorio di famiglia e lo accompagnava durante gli studi.</p>\n<p>Fu proprio grazie a lei che Arolf riprese a disegnare.</p>\n<p>Il primo nuovo ritratto che realizzò dopo anni raffigurava proprio quel piccolo essere immortale.</p>\n<p>Da allora continua a lavorare e studiare nell’ombra, convinto che il mondo, prima o poi, sarà costretto ad accettare la verità che lui ha già compreso.</p>\n<p>La non morte non è una maledizione. È il passo successivo.</p>",
        "eventsHtml": "<p>Arolf arrivò alla veglia di Varek Thorm insieme a Igor, che lo seguiva a gattoni come una creatura malata. Nessuna guardia osò fermarlo: ad Arolf veniva ancora riconosciuto il ruolo di medico di Valkren, per quanto inquietante fosse la sua compagnia.</p>\n<p>Dopo l’attentato incendiario di Abraxas, fu chiamato nel cuore della notte a Villa Thorm per prestare soccorso a Lyria. Il giorno seguente, nel Mausoleo dei Thorm, fu lui a comprendere l’uso delle pietre d’onice recuperate nella cappella.</p>\n<p>Quando il rituale sembrò incompleto, Arolf si sfilò il guanto e toccò il simbolo inciso nel pavimento con la mano consumata dalla non morte. Il suo Tocco Scabbroso completò l’enigma, aprendo la porta segreta che custodiva la lettera di Varek.</p>\n<p>Prima della partenza verso Portogrigio scrisse una lettera di raccomandazione per mandare Abraxas da Lyria. Durante la notte parlò a Ralph e Irven della non morte come evoluzione naturale dell’esistenza, tentando di convincerli della superiorità dei non morti sui vivi.</p>",
        "longDesc": "",
        "events": ""
    },
    {
        "type": "pg",
        "slug": "igor",
        "name": "Igor",
        "desc": "Vittima della Crucimigrazione , creatura senza nome rimasta intrappolata tra memoria, fame e assenza di vita.",
        "img": "assets/img/Igor.jpeg",
        "href": "personaggi/dettaglio.html?id=igor",
        "sheet": "personaggi/scheda.html?character=igor",
        "tag": "Personaggio giocante",
        "longHtml": "<p><a class=\"lore-link\" href=\"igor.html\">Igor</a> non ricorda il proprio vero nome.</p>\n<p>L’ultima volta che lo sentì pronunciare appartiene ormai a un ricordo frammentato, lontano, deformato dal tempo e dalla follia.</p>\n<p>Ricorda soltanto le urla.</p>\n<p>Quelle di suo padre, mentre le sue mani gli strappavano la carne dal volto.</p>\n<p>Quelle di sua madre, disperata, mentre tentava di fermarlo.</p>\n<p>All’epoca Igor non comprendeva davvero ciò che stava facendo. Voleva soltanto che suo padre diventasse come lui.</p>\n<p>Voleva che restasse. Per sempre.</p>\n<p>Fu sua madre a fermarlo.</p>\n<p>Attraverso un incantesimo riuscì a immobilizzarlo e a rinchiuderlo in una grotta isolata, lontano dagli uomini e dal mondo.</p>\n<p>Non ebbe mai la forza di ucciderlo.</p>\n<p>Troppo grande era l’amore che provava per il figlio. Troppo terribile l’idea di perderlo del tutto.</p>\n<p>Igor ricorda ancora ciò che lo trasformò.</p>\n<p>Un rituale.</p>\n<p>Un procedimento antico e innaturale che gli portò via ogni cosa.</p>\n<p>Il dolore arrivò per primo. Poi il sangue. L’agonia. Il respiro sempre più debole. La lenta consapevolezza della morte imminente.</p>\n<p>E infine… il cambiamento.</p>\n<p>Poco alla volta smise di sentire la sofferenza. La fame. La stanchezza. Il sonno.</p>\n<p>Ma insieme al dolore svanirono anche tutte le cose che rendevano la vita degna di essere vissuta.</p>\n<p>I sapori persero significato. Gli odori svanirono. La felicità divenne qualcosa di distante, quasi incomprensibile.</p>\n<p>Nella solitudine della grotta trascorse anni osservando il mondo esterno.</p>\n<p>La natura. Gli alberi. La pioggia. Gli animali.</p>\n<p>Una parte di lui sperava che quel contatto con la vita potesse restituirgli qualcosa di ciò che aveva perduto.</p>\n<p>Ma non accadde mai.</p>\n<p>Col tempo comprese una verità sempre più difficile da ignorare: forse non esisteva alcun ritorno.</p>\n<p>Forse quella grotta sarebbe diventata la sua tomba eterna.</p>\n<p>Eppure, nonostante tutto, Igor continuò a esistere.</p>\n<p>In silenzio. In attesa.</p>\n<p>Come qualcosa che il mondo aveva dimenticato… ma che non era mai davvero morto.</p>",
        "eventsHtml": "<p>Igor comparve alla veglia accanto ad Arolf, muovendosi a gattoni sul marmo bagnato come una creatura difficile da classificare. Gli ospiti lo evitarono, alcuni fecero segni di protezione, ma la sua presenza venne tollerata perché legata al medico del villaggio.</p>\n<p>Seguì il gruppo negli eventi della cappella, del mausoleo e del viaggio verso Portogrigio. Nei sotterranei dell’Accademia di Medicina fu proprio Igor a individuare il passaggio nascosto nelle stanze di Otmar, permettendo al gruppo di raggiungere il laboratorio segreto.</p>\n<p>Durante la terza sessione riuscì finalmente ad aprire il Cryptex che aveva sempre custodito con sé grazie al Disco trovato sul capitano dei pirati. L’indizio inciso sul Cryptex, pronunciato ad alta voce, fece reagire il disco e rivelò la parola corretta per aprirlo.</p>\n<p>Nella tenda di <a class=\"lore-link\" href=\"abdul.html\">Abdul</a> ricevette un libro rilegato in una pelle sottile e inquietante, contrassegnato soltanto da una lettera: N. In cambio cedette un semplice libro sull’anatomia dei cani, uno scambio assurdo solo in apparenza.</p>",
        "longDesc": "",
        "events": ""
    },
    {
        "type": "png",
        "slug": "varek",
        "name": "Varek Thorm",
        "desc": "Collezionista, benefattore e burattinaio della propria scomparsa, ora nascosto tra rovine a sud di Birthomar.",
        "img": "assets/img/Varek.png",
        "href": "personaggi/dettaglio.html?id=varek",
        "sheet": "",
        "tag": "PNG · Mercante dichiarato morto",
        "longHtml": "<h2>Il Mercante Morto</h2>\n<p>Varek Thorm era conosciuto nell’<a class=\"lore-link\" href=\"../luoghi/valkren/index.html\">Insenno di Valkren</a> come un mercante ricco, influente e rispettato. Collezionista, benefattore e figura centrale dei traffici marittimi locali, aveva costruito attorno al proprio nome un’immagine di potere misurato e rispettabilità. La sua morte, annunciata con solennità, attirò alla villa personaggi provenienti da vite molto diverse.</p>\n<p>Ma Varek non era morto. Il corpo esposto durante la veglia era un sostituto, un guscio preparato per morire al suo posto. Il funerale fu una messa in scena, e la veglia una trappola sociale mascherata da lutto. Non serviva solo a far credere al mondo che Varek fosse scomparso: serviva a osservare chi sarebbe arrivato, come avrebbe reagito e quali scelte avrebbe compiuto quando nessuno sembrava guardare davvero.</p>\n<h2>La Mano dietro le Prove</h2>\n<p>Il furto del Libro Mastro, i simboli nella cappella, il <a class=\"lore-link\" href=\"../luoghi/valkren/index.html\">Mausoleo dei Thorm</a> e la lettera finale indicano tutti la stessa cosa: Varek aveva preparato un percorso. Non necessariamente lineare, non necessariamente sicuro, ma costruito per condurre gli anti-eroi verso una verità più grande.</p>\n<p>La sua lettera non aveva il tono di un uomo disperato. Sembrava piuttosto l’invito di qualcuno che aveva già misurato i destinatari e li riteneva, almeno per il momento, utili. Parlava di un luogo a sud di Birthomar, là dove le razze si incontrano, e di un’opera iniziata tra rovine dimenticate. Non spiegava tutto. Non doveva. Varek sa usare il mistero come altri usano il denaro.</p>\n<h2>La Famiglia e il Simbolo</h2>\n<p>Il simbolo personale di Varek riprende l’iconografia dei Thorm, ma vi aggiunge lo scheletro: una dichiarazione silenziosa di ciò che realmente lo ossessiona. Non commercio, non prestigio, non eredità familiare. Trasformazione. Persistenza. La possibilità che la morte non sia una fine, ma una materia da plasmare.</p>\n<p>Il suo rapporto con <a class=\"lore-link\" href=\"lyria.html\">Lyria</a> resta ambiguo. Da un lato le ha lasciato un ruolo pubblico, potere e strumenti per muoversi negli affari. Dall’altro, l’ha abbandonata in una messa in scena che l’ha esposta al fuoco, alla paura e alla verità incompleta della famiglia. Se Varek prova rimorso, lo nasconde bene. Se invece tutto faceva parte del disegno, allora la figlia stessa potrebbe essere stata un elemento calcolato.</p>\n<p>A oggi Varek si trova da qualche parte a sud di Birthomar. Sta costruendo qualcosa. I personaggi lo sanno. Ma non sanno ancora quanto lontano sia disposto ad arrivare, né da quanto tempo li stia osservando.</p>",
        "eventsHtml": "<p>Varek Thorm aprì la campagna con la propria morte apparente. Il corpo esposto alla veglia era un sostituto, un guscio preparato per rendere credibile una scomparsa orchestrata con attenzione.</p>\n<p>Il furto del Libro Mastro, la cappella abbandonata, il simbolo inciso nella pietra e il Mausoleo dei Thorm condussero il gruppo lungo un percorso che sembrava predisposto per metterli alla prova. Al termine dell’enigma del mausoleo, gli anti-eroi trovarono una lettera firmata proprio da Varek.</p>\n<p>La lettera rivelò che il mercante era vivo e che li attendeva più a sud, nei pressi delle rovine oltre Birthomar. Da quel momento, Varek non è più soltanto il “mercante morto”, ma la presenza invisibile dietro molte delle prove incontrate dal gruppo.</p>",
        "longDesc": "",
        "events": ""
    },
    {
        "type": "png",
        "slug": "lyria",
        "name": "Lyria Thorm",
        "desc": "Figlia di Varek Thorm, sopravvissuta al fuoco della veglia e trasformata da una ferita che non sembra più soltanto carne.",
        "img": "assets/img/lyria.png",
        "href": "personaggi/dettaglio.html?id=lyria",
        "sheet": "",
        "tag": "PNG · Erede dei Thorm",
        "longHtml": "<h2>La Figlia del Mercante</h2>\n<p>Lyria Thorm è la figlia di <a class=\"lore-link\" href=\"varek.html\">Varek Thorm</a>, cresciuta all’ombra di una famiglia mercantile abbastanza ricca da trasformare una villa sul mare in un simbolo di potere. Prima degli eventi della campagna appariva come una giovane erede educata, controllata e profondamente legata all’immagine pubblica del padre. Non era una guerriera, né una studiosa di arti proibite: era la voce composta della casa Thorm, il volto che accoglieva ospiti, debitori e alleati.</p>\n<p>Fu lei ad accogliere gli anti-eroi durante la veglia funebre nella <a class=\"lore-link\" href=\"../luoghi/valkren/index.html\">Villa Thorm</a>, senza sapere che quella notte avrebbe spezzato per sempre la persona che era stata fino ad allora. In mezzo a nobili, mercanti e figure di lutto, Lyria tentò di mantenere il controllo della cerimonia. Ma il furto del Libro Mastro, l’inseguimento, i simboli ritrovati e il caos nella villa iniziarono a incrinare quella facciata di normalità.</p>\n<h2>Il Fuoco</h2>\n<p>La vera frattura arrivò nella notte, quando <a class=\"lore-link\" href=\"abraxas.html\">Abraxas</a> tornò nei pressi della villa e lanciò una bottiglia incendiaria contro la bara di Varek. Le fiamme investirono il falso cadavere e colpirono anche Lyria, ustionandole il lato sinistro del volto e il braccio. Da quel momento, la ragazza cessò di essere soltanto l’erede addolorata di un mercante morto.</p>\n<p>Quando riapparve, parte della carne rovinata era stata sostituita da sottili venature e placche dorate. Non un semplice ornamento. Non una guarigione naturale. Qualcosa era cresciuto sopra il danno, coprendo le bruciature con una bellezza fredda, quasi innaturale. Nessuno sa davvero chi abbia compiuto quell’intervento, né quanto Lyria stessa ne comprenda il significato.</p>\n<h2>Dopo le Lacrime</h2>\n<p>Il giorno seguente, durante il funerale ufficiale, Abraxas tentò di spezzarla con parole crudeli. Le ricordò l’inferno, la dannazione e il destino del padre. Lyria non cedette. Non pianse. Non arretrò. Quel momento segnò forse il primo vero cambiamento: il dolore non la rese fragile, ma più dura.</p>\n<p>Quando Abraxas tornò da lei per chiedere una nave verso <a class=\"lore-link\" href=\"../luoghi/portogrigio.html\">Portogrigio</a>, molti avrebbero scommesso sul rifiuto, o su una condanna. Invece Lyria lo ascoltò. Trattò. Ragionò come una Thorm. “Il tempo dei pianti è finito. Ora si pensa agli affari.” Con quelle parole concesse al gruppo una nave, dimostrando che la ragazza bruciata nella villa non era più la stessa che aveva accolto gli ospiti alla veglia.</p>\n<p>Oggi Lyria è una figura sospesa tra vittima, erede e possibile pedina di qualcosa di più grande. Il suo legame con Varek, la trasformazione dorata del suo corpo e la freddezza con cui sta imparando a muoversi negli affari la rendono uno dei volti più ambigui della famiglia Thorm.</p>",
        "eventsHtml": "<p>Lyria accolse gli ospiti alla veglia funebre di Varek Thorm, cercando di mantenere ordine e compostezza mentre nella villa si radunavano figure sempre più difficili da ignorare. Dopo il ritrovamento dei simboli nella cappella, rivelò al gruppo di aver già visto quel marchio nella cripta di famiglia.</p>\n<p>Durante la notte venne travolta dall’attentato di Abraxas: le fiamme dirette alla bara colpirono anche lei, lasciandole ustioni profonde sul lato sinistro del volto e del braccio. Il dolore non la spezzò. Al funerale del giorno seguente rimase ferma, anche davanti alle provocazioni crudeli del tiefling.</p>\n<p>Quando Abraxas tornò da lei per chiedere una nave, Lyria scelse di trattare. Concesse al gruppo il passaggio verso Portogrigio e pronunciò parole che segnarono il suo cambiamento: il tempo dei pianti era finito, ora si pensava agli affari.</p>",
        "longDesc": "",
        "events": ""
    },
    {
        "type": "png",
        "slug": "otmar",
        "name": "Otmar Van Verschuer",
        "desc": "Medico, ricercatore e architetto degli innesti necrotici nascosti sotto Portogrigio.",
        "img": "assets/img/Foto_Otmar.png",
        "href": "personaggi/dettaglio.html?id=otmar",
        "sheet": "",
        "tag": "PNG · Direttore dell’Accademia",
        "longHtml": "<h2>Il Direttore dell’Istituto</h2>\n<p>Otmar Van Verschuer fu, per anni, uno dei nomi più rispettati dell’<a class=\"lore-link\" href=\"../luoghi/portogrigio/accademia-medicina.html\">Accademia di Medicina di Portogrigio</a>. Direttore, medico, ricercatore e studioso delle malattie ereditarie, veniva associato ai progressi della chirurgia, alle cure delle deformità congenite e all’idea che la scienza potesse correggere ciò che la natura aveva lasciato incompleto.</p>\n<p>Nelle sale superiori dell’Accademia il suo nome significava prestigio. Nei sotterranei, significava altro. Sotto le fondamenta dell’istituto Otmar conduceva ricerche proibite sugli innesti necrotici, sulla sostituzione dei tessuti vivi e sulla possibilità di trattenere ciò che abbandona il corpo al momento della morte. I pazienti che scendevano nei reparti più degradati credevano di essere curati. In realtà diventavano materiale, campioni, tentativi.</p>\n<h2>Ralph Mengele</h2>\n<p>Otmar fu il mentore di <a class=\"lore-link\" href=\"ralph.html\">Ralph Mengele</a>. Vide in lui non solo un medico brillante, ma un individuo già spezzato nel modo giusto: ossessionato dal sangue, dalla percezione, dal dolore e dal superamento dei limiti della carne. Lo introdusse ai rituali di Loviatar e gli permise di accedere a studi che nessuna istituzione avrebbe mai autorizzato apertamente.</p>\n<p>Il rapporto tra i due non fu mai davvero quello tra maestro e allievo. Otmar osservava Ralph come si osserva un esperimento promettente: con interesse, pazienza e una freddezza quasi paterna. Quando Ralph morì nel suo laboratorio di Valkren, immerso nel sangue e nella disperazione, Otmar non lo lasciò andare. Lo riportò in vita. Prima, però, gli strappò gli occhi. Non come punizione, ma come parte di una visione più ampia.</p>\n<h2>I Sotterranei</h2>\n<p>Durante la terza sessione, il gruppo scoprì le stanze nascoste di Otmar sotto l’Accademia. Magazzini pieni di organi conservati, laboratori di vivisezione, soggetti catalogati, non morti innestati e Becchini della Pioggia assoldati per proteggere il luogo. Otmar non era presente, ma ogni stanza parlava di lui. Ogni tavolo, ogni barattolo, ogni corpo incompleto indicava una mente incapace di distinguere il progresso dall’abominio.</p>\n<p>Gli <a class=\"lore-link\" href=\"../archivio.html#documenti\">appunti ritrovati</a> nei sotterranei collegano il suo nome a quello di <a class=\"lore-link\" href=\"varek.html\">Varek Thorm</a> e a qualcosa definito soltanto come “La Forma Finale”. Non è ancora chiaro se Otmar lavori per Varek, con Varek, o se entrambi stiano tentando di raggiungere la stessa soglia da direzioni diverse.</p>\n<p>Di Otmar resta soprattutto un’assenza: la sensazione che abbia abbandonato il laboratorio non perché sconfitto, ma perché aveva già ottenuto ciò che gli serviva. Finché i suoi appunti continuano a circolare e i suoi esperimenti continuano a respirare, il direttore dell’Accademia non è davvero scomparso.</p>",
        "eventsHtml": "<p>Otmar non si fece trovare quando il gruppo raggiunse le sue stanze nell’Accademia di Medicina, ma la sua assenza parlava quanto la sua presenza. I reparti degradati, i pazienti inconsapevoli e i corridoi impregnati di formalina rivelavano il volto nascosto della sua ricerca.</p>\n<p>Il passaggio segreto individuato da Igor condusse al vero laboratorio: un complesso sotterraneo pieno di organi conservati, tessuti in soluzione, corpi incompleti e Becchini della Pioggia ormai trasformati in strumenti di protezione.</p>\n<p>Nella sala di vivisezione il gruppo affrontò non morti innestati e un esperimento potenziato. Gli appunti recuperati dopo lo scontro collegano Otmar a studi sulla persistenza della carne, sugli innesti necrotici e alla sua collaborazione con trame ancora più ampie.</p>",
        "longDesc": "",
        "events": ""
    },
    {
        "type": "png",
        "slug": "abdul",
        "name": "Abdul Alhazred",
        "desc": "Un uomo sorridente apparso oltre una tenda impossibile, dove ogni dono ha un prezzo e ogni prezzo arriva in ritardo.",
        "img": "assets/img/abdul_alhazred.png",
        "href": "personaggi/dettaglio.html?id=abdul",
        "sheet": "",
        "tag": "Mercante planare",
        "longHtml": "<h2>Il Mercante della Tenda</h2>\n<p>Abdul Alhazred apparve quando la realtà decise di piegarsi nel modo meno rassicurante possibile. Dopo gli orrori dell’<a class=\"lore-link\" href=\"../luoghi/portogrigio/accademia-medicina.html\">Accademia di Medicina</a>, mentre gli anti-eroi cercavano riposo in una taverna di <a class=\"lore-link\" href=\"../luoghi/portogrigio.html\">Portogrigio</a>, la porta della loro stanza smise di essere una porta. Al suo posto comparve una tenda. Oltre quella soglia non c’era più la notte, ma un deserto accecante, caldo e impossibile.</p>\n<p>Ad attenderli vi era un uomo elegante, sorridente, carico di ori, stoffe scure e piccoli oggetti dal valore indefinibile. Parlava con la sicurezza di chi non sta incontrando degli sconosciuti, ma clienti attesi da tempo. Ogni gesto era misurato, ogni parola sembrava pesata prima ancora che venisse pronunciata. Abdul non sembrava stupito da nulla: né dall’aspetto di Igor, né dalla cecità di Ralph, né dalla natura corrotta di Irven, né dall’odore infernale che accompagnava Abraxas.</p>\n<p>Non si presentò come un nemico. Non minacciò. Non pretese. Offrì. Ed è proprio questo a renderlo più inquietante. Con Abdul ogni scambio sembrava semplice, quasi conveniente, ma nessuno dei presenti ebbe davvero la certezza di aver compreso il prezzo pagato.</p>\n<h2>Gli Scambi</h2>\n<p><a class=\"lore-link\" href=\"ralph.html\">Ralph Mengele</a> ottenne ciò che desiderava più di ogni altra cosa: i suoi veri occhi, purificati da ogni malattia e imperfezione. In cambio cedette la benda metallica che fino a quel momento gli aveva concesso una forma di vista cieca. Uno scambio troppo perfetto per non nascondere un secondo significato.</p>\n<p><a class=\"lore-link\" href=\"igor.html\">Igor</a> ricevette un libro rilegato in una pelle sottile e disturbante. Sulla copertina compariva soltanto una lettera: N. In cambio consegnò un semplice volume sull’anatomia dei cani. Abdul accettò come se quell’oggetto, apparentemente banale, avesse un valore che solo lui poteva vedere.</p>\n<p><a class=\"lore-link\" href=\"abraxas.html\">Abraxas</a> ricevette una piccola mosca metallica, raffinata come un gioiello e viva come un parassita. Poco dopo, l’oggetto si mosse e si fissò alla sua gola. Il prezzo fu un frammento della sua saggezza: una perdita minima in apparenza, ma forse sufficiente a lasciare una porta aperta.</p>\n<p><a class=\"lore-link\" href=\"irven.html\">Irven Till</a> consegnò la propria moneta sacra. Quando Abdul gliela restituì, il simbolo di Loviatar non c’era più. Al suo posto compariva un volto alieno, tentacolare e antico. Sul retro rimaneva il simbolo di Talona. Da quel momento, la moneta non sembrò più appartenere a una sola fede, ma a qualcosa di più vasto e meno comprensibile.</p>\n<h2>Un Nome da Non Fidare</h2>\n<p>Solo dopo la scomparsa della tenda, quando la stanza tornò a essere una stanza e la notte riprese il proprio posto, il gruppo comprese il peso del nome che aveva appena incontrato. Abdul Alhazred. L’Arabo Pazzo. Un mercante planare, forse. Un emissario, forse. O forse soltanto una delle tante maschere indossate da qualcosa che commercia non in oggetti, ma in possibilità.</p>\n<p>Di lui resta una certezza: non concede mai davvero un dono. Ogni cosa che passa dalle sue mani porta con sé una conseguenza. Alcune si manifestano subito. Altre aspettano il momento giusto.</p>",
        "eventsHtml": "<p>Abdul apparve nella terza sessione, quando la porta della stanza in taverna smise di essere una porta e divenne una tenda aperta su un deserto impossibile. Lì attendeva gli anti-eroi come se li conoscesse già.</p>\n<p>Offrì scambi a ciascuno di loro: a Ralph restituì i suoi occhi, a Igor consegnò un libro segnato dalla lettera N, ad Abraxas diede una mosca metallica e a Irven restituì una moneta sacra alterata da un simbolo alieno.</p>\n<p>Ogni dono ebbe un prezzo apparentemente piccolo, ma nessuno dei presenti poté davvero sapere quale conseguenza avrebbe prodotto nel tempo. Il nome Abdul Alhazred rimase come un avvertimento: i mercanti planari non andrebbero mai considerati affidabili.</p>",
        "longDesc": "",
        "events": ""
    }
];
  let state={items:null,editing:false,master:false,deleted:[]};
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function internalHref(href){const raw=String(href||'').trim();if(!raw)return '#';if(/^(javascript:|data:|vbscript:|https?:|mailto:|tel:|\/\/)/i.test(raw))return '#';return raw.replace(/["'<>\s]/g,'');}
  function richText(v){return esc(v).replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g,(_,label,href)=>`<a class="lore-link" href="${esc(internalHref(href))}">${esc(label)}</a>`);}
  function slugify(s){return String(s||'personaggio').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,42)||('personaggio-'+Date.now());}
  function ensureRole(item){if(!item)return ''; if(!item.slug)item.slug=slugify(item.name); item.roleSlug=item.slug; item.permissionRole=item.slug; return item.slug;}
  function rootImageSrc(src){
    const raw=String(src||'').trim();
    if(!raw)return 'assets/img/Thalor16k.jpg';
    if(/^data:image\//i.test(raw)||/^https?:\/\//i.test(raw)||/^\/\//.test(raw))return raw;
    return raw.replace(/^\.\//,'').replace(/^\.\.\//,'');
  }
  function detailImageSrc(src){
    const raw=String(src||'').trim();
    if(!raw)return '../assets/img/Thalor16k.jpg';
    if(/^data:image\//i.test(raw)||/^https?:\/\//i.test(raw)||/^\/\//.test(raw))return raw;
    const cleaned=raw.replace(/^\.\//,'').replace(/^\.\.\//,'');
    return '../'+cleaned;
  }
  const NON_PERSONAGGI_SLUGS=new Set(['diario','diary','xp','tabella-exp','registro-xp','archive','archivio','archives','archivio-documenti','symbols','simboli','archive-symbols','archivio-simboli','documents','documenti','archive-documents','archyve-documents','archivio-documents','documenti-archivio','loot','info-utili','sogni-visioni','extractum-ex-tenebris','__personaggi__']);
  function isBlockedPersonaggioSlug(slug,name){
    const s=slugify(slug||name||'');
    const n=slugify(name||slug||'');
    if(!s||NON_PERSONAGGI_SLUGS.has(s)||NON_PERSONAGGI_SLUGS.has(n))return true;
    // Protezione larga: non far entrare pagine di sistema recuperate da character_sheets.
    return /(^|-)(archive|archivio|symbols|simboli|documents|documenti|diario|xp|loot)(-|$)/.test(s) || /(^|-)(archive|archivio|symbols|simboli|documents|documenti|diario|xp|loot)(-|$)/.test(n);
  }
  function isValidPersonaggioItem(item){
    if(!item||typeof item!=='object')return false;
    const slug=slugify(item.slug||item.name||'');
    if(isBlockedPersonaggioSlug(slug,item.name))return false;
    if(item.type!=='pg'&&item.type!=='png')return false;
    if(!String(item.name||'').trim())return false;
    return true;
  }
  function sanitizePersonaggiItems(items){
    const seen=new Set();
    return (Array.isArray(items)?items:[]).filter(isValidPersonaggioItem).map(raw=>{
      const item=Object.assign({},raw);
      item.slug=slugify(item.slug||item.name);
      if(seen.has(item.slug))return null;
      seen.add(item.slug);
      item.type=item.type==='png'?'png':'pg';
      item.img=rootImageSrc(item.img);
      ensureRole(item);
      return makeLinks(item);
    }).filter(Boolean);
  }
  function isCharacterSheetData(data,slug){
    if(!data||typeof data!=='object')return false;
    const meta=data.meta||{};
    const identity=data.identity||{};
    const s=slugify(slug||meta.slug||meta.permissionRole||identity.name||'');
    if(isBlockedPersonaggioSlug(s,identity.name||meta.name))return false;
    // Le pagine archivio/simboli/diario hanno strutture diverse: una vera scheda ha identity
    // e almeno uno tra blocchi numerici o narrativi della scheda personaggio.
    if(!identity||typeof identity!=='object'||!String(identity.name||'').trim())return false;
    const abilitiesOk=data.abilities&&typeof data.abilities==='object'&&('FOR' in data.abilities || 'STR' in data.abilities || 'DES' in data.abilities);
    const sheetBlocksOk=abilitiesOk || (data.combat&&typeof data.combat==='object') || Array.isArray(data.inventorySections) || Array.isArray(data.classLevels) || (data.portrait&&typeof data.portrait==='object');
    return !!sheetBlocksOk;
  }
  function itemFromOnlineSheet(row){
    const data=row&&row.data;
    const slug=slugify(row&&row.slug || data?.meta?.slug || data?.meta?.permissionRole || data?.identity?.name || '');
    if(!isCharacterSheetData(data,slug))return null;
    const meta=data.meta||{};
    const identity=data.identity||{};
    const portrait=data.portrait||{};
    const narrative=data.narrative||{};
    const type=(String(meta.subtitle||meta.type||'').toLowerCase().includes('png') || String(meta.theme||'').toLowerCase()==='necrotic')?'png':'pg';
    return makeLinks({
      type,
      slug,
      name:identity.name||slug,
      playerName:identity.player||'',
      roleSlug:slug,
      permissionRole:slug,
      desc:portrait.quote||meta.subtitle||'Personaggio salvato online.',
      img:rootImageSrc(portrait.image||'assets/img/Thalor16k.jpg'),
      longDesc:narrative.diary||'',
      events:''
    });
  }
  function mergeOnlineSheetItems(baseItems,rows){
    const map=new Map(sanitizePersonaggiItems(baseItems).map(x=>[x.slug,x]));
    (Array.isArray(rows)?rows:[]).forEach(row=>{
      const item=itemFromOnlineSheet(row);
      if(!item)return;
      const current=map.get(item.slug);
      if(current){
        map.set(item.slug,Object.assign({},current,{
          type:item.type||current.type,
          name:item.name||current.name,
          playerName:item.playerName||current.playerName||'',
          desc:item.desc||current.desc||'',
          img:item.img||current.img||'assets/img/Thalor16k.jpg',
          longDesc:item.longDesc||current.longDesc||'',
          events:current.events||''
        }));
      }else{
        map.set(item.slug,item);
      }
    });
    return Array.from(map.values());
  }
  function permissionNote(item){const role=ensureRole(item); return `Ruolo permesso scheda: ${role}`;}
  function read(){return readLocal();}
  function mergeDefaults(saved){const deleted=new Set(state.deleted||[]); const map=new Map(saved.filter(x=>x&&!deleted.has(x.slug)).map(x=>[x.slug,x])); DEFAULTS.forEach(d=>{if(deleted.has(d.slug))return; if(!map.has(d.slug)){map.set(d.slug,Object.assign({},d));}else{const current=map.get(d.slug); const merged=Object.assign({},d,current,{type:current.type||d.type}); if(state.restoreDefaultContent){merged.desc=d.desc; merged.longHtml=d.longHtml||''; merged.eventsHtml=d.eventsHtml||''; if(!current.longDesc) merged.longDesc=''; if(!current.events) merged.events='';} map.set(d.slug,merged);}}); return Array.from(map.values()).map(x=>{ensureRole(x); return x;});}
  function registryPayload(items=state.items,deleted=state.deleted){return {updatedAt:new Date().toISOString(),contentRestoreVersion:CONTENT_RESTORE_VERSION,items:sanitizePersonaggiItems(items||[]),deleted:deleted||[]};}
  function applyRegistryPayload(raw){if(raw&&Array.isArray(raw.items)){state.deleted=Array.isArray(raw.deleted)?raw.deleted:[]; state.restoreDefaultContent=raw.contentRestoreVersion!==CONTENT_RESTORE_VERSION; return mergeDefaults(sanitizePersonaggiItems(raw.items));} state.deleted=[]; state.restoreDefaultContent=false; return mergeDefaults([]);}
  function readLocal(){try{return applyRegistryPayload(JSON.parse(localStorage.getItem(LIST_KEY)||'null'));}catch(e){return applyRegistryPayload(null);}}
  async function readFresh(){
    let localItems=readLocal();
    try{
      if(window.ThalorAuth&&window.ThalorAuth.init){await window.ThalorAuth.init();}
      if(window.ThalorAuth&&window.ThalorAuth.state&&window.ThalorAuth.state.configured&&navigator.onLine!==false){
        const online=await window.ThalorAuth.loadCharacter(REGISTRY_SLUG,null,{publicRead:true});
        let items=null;
        let deleted=[];
        let restore=false;
        if(online&&Array.isArray(online.items)){
          deleted=Array.isArray(online.deleted)?online.deleted:[];
          restore=online.contentRestoreVersion!==CONTENT_RESTORE_VERSION;
          items=sanitizePersonaggiItems(online.items);
        }else{
          console.warn('Registro __personaggi__ letto ma senza items validi: provo recupero da schede online.');
          items=sanitizePersonaggiItems(localItems);
        }
        if(window.ThalorAuth.listCharacterSheets){
          try{
            const rows=await window.ThalorAuth.listCharacterSheets({publicRead:true,timeoutMs:12000});
            items=mergeOnlineSheetItems(items,rows).filter(x=>!deleted.includes(x.slug));
          }catch(recoverErr){
            console.warn('Recupero schede online non riuscito:',recoverErr);
          }
        }
        const cleanPayload={updatedAt:new Date().toISOString(),contentRestoreVersion:CONTENT_RESTORE_VERSION,items:sanitizePersonaggiItems(items),deleted};
        state.deleted=deleted;
        state.restoreDefaultContent=restore;
        try{localStorage.setItem(LIST_KEY,JSON.stringify(cleanPayload));}catch(e){}
        return applyRegistryPayload(cleanPayload);
      }
    }catch(e){console.warn('Registro personaggi online non disponibile, uso fallback locale:',e);}
    return localItems;
  }
  function isDataImage(v){return /^data:image\//i.test(String(v||''));}
  function slimRegistryForLocal(payload){
    const clone=JSON.parse(JSON.stringify(payload||{}));
    (clone.items||[]).forEach(it=>{
      // Ultima difesa anti-quota: se una vecchia immagine base64 è ancora enorme,
      // non blocchiamo il salvataggio del registro. Il dato completo viene comunque
      // mandato a Supabase sotto; in locale resta un placeholder sicuro.
      if(isDataImage(it.img) && String(it.img).length>850000){
        it.img='assets/img/Thalor16k.jpg';
        it.imgLocalNote='Immagine rimossa dalla cache locale perché troppo pesante.';
      }
    });
    return clone;
  }
  function saveRegistryCache(payload){
    try{
      localStorage.setItem(LIST_KEY,JSON.stringify(slimRegistryForLocal(payload)));
      return true;
    }catch(e){
      console.warn('Cache locale registro personaggi non aggiornata. Il salvataggio online resta prioritario:',e);
      return false;
    }
  }
  function onlineSaveAvailable(){return !!(window.ThalorAuth&&window.ThalorAuth.state&&window.ThalorAuth.state.configured&&!window.ThalorAuth.state.localMaster&&navigator.onLine!==false);}
  async function saveOnlineSheet(item, data){
    if(!item||!item.slug||!onlineSaveAvailable()) return true;
    try{
      const sheetData=data||readSheetForItem(item)||blankSheet(item);
      await window.ThalorAuth.saveCharacter(item.slug, sheetData);
      return true;
    }catch(e){
      console.error('Salvataggio scheda personaggio online non riuscito:', e);
      alert('Scheda non salvata online: '+(e.message||e)+'\n\nIl personaggio non sarà visibile correttamente sugli altri dispositivi finché la scheda non viene salvata su Supabase.');
      return false;
    }
  }
  async function save(){
    state.items=sanitizePersonaggiItems(state.items||[]);
    (state.items||[]).forEach(ensureRole);
    const payload=registryPayload();
    state.restoreDefaultContent=false;

    if(onlineSaveAvailable()){
      try{
        // Il registro personaggi è la fonte principale dell'elenco: deve essere salvato davvero online.
        await window.ThalorAuth.saveCharacter(REGISTRY_SLUG,payload);
        saveRegistryCache(payload);
        return true;
      }catch(e){
        console.error('Salvataggio registro personaggi online non riuscito:',e);
        alert('Salvataggio online del personaggio non riuscito: '+(e.message||e)+'\n\nNon considero salvato il personaggio finché Supabase non risponde correttamente.');
        return false;
      }
    }

    const localOk=saveRegistryCache(payload);
    if(!localOk){
      alert('Salvataggio locale non riuscito e Supabase non è disponibile in questo momento. Il personaggio non è stato salvato davvero.');
    }
    return localOk;
  }
  async function removePersonaggio(item){if(!item)return; const name=item.name||'questo personaggio'; if(!confirm(`Eliminare ${name} e la sua scheda?`))return; if(!confirm('Conferma definitiva: questa azione rimuove anche la scheda collegata salvata in locale.'))return; const slug=item.slug; state.items=state.items.filter(x=>x.slug!==slug); const defaultSlug=DEFAULTS.some(d=>d.slug===slug); if(defaultSlug&&!state.deleted.includes(slug))state.deleted.push(slug); try{localStorage.removeItem(sheetKey(slug));}catch(e){} if(!(await save()))return; if($('#personaggiApp')){renderList();}else{location.href='../personaggi.html';}}
  function deleteSheetOnly(item){if(!item)return; const name=item.name||item.slug||'personaggio'; if(!confirm(`Eliminare solo la scheda di ${name}? La pagina personaggio resterà nel menu.`))return; try{localStorage.removeItem(sheetKey(item.slug)); localStorage.removeItem(sheetKey(item.slug)+'.snapshots');}catch(e){} renderList();}
  async function canMaster(){try{if(window.ThalorAuth){await window.ThalorAuth.init(true); return !!(window.ThalorAuth.isMaster&&window.ThalorAuth.isMaster());}}catch(e){} return !window.ThalorAuth;}
  function sheetKey(slug){return SHEET_PREFIX+slug+SHEET_SUFFIX;}
  function blankSheet(item){return {schemaVersion:9,meta:{slug:item.slug,permissionRole:ensureRole(item),characterRole:item.slug,theme:item.type==='png'?'necrotic':'default',crest:item.type==='png'?'☽':'✦',subtitle:item.type==='png'?'PNG':'Personaggio',profileUrl:`dettaglio.html?id=${item.slug}`},identity:{name:item.name||'Nuovo personaggio',player:item.playerName||item.player||item.giocatore||(item.type==='png'?'Master':''),race:'',classLevel:'',alignment:'',deity:'',xp:0,level:1},appearance:{size:'',age:'',sex:'',height:'',weight:'',eyes:'',hair:'',skin:'',marks:''},portrait:{image:toSheetImg(item.img),alt:item.name||'',quote:item.desc||''},abilities:{FOR:{score:10,base:10,temp:0,bonuses:[]},DES:{score:10,base:10,temp:0,bonuses:[]},COS:{score:10,base:10,temp:0,bonuses:[]},INT:{score:10,base:10,temp:0,bonuses:[]},SAG:{score:10,base:10,temp:0,bonuses:[]},CAR:{score:10,base:10,temp:0,bonuses:[]}},combat:{hpMax:1,hpCurrent:1,hpTemp:0,nonlethal:0,stable:'No',speed:'',bab:0,grappleMisc:0,initiativeMisc:0,tempBonuses:[]},armorClass:{base:10},saves:{fortitude:{base:0,magic:0,misc:0,ability:'COS'},reflex:{base:0,magic:0,misc:0,ability:'DES'},will:{base:0,magic:0,misc:0,ability:'SAG'}},attacks:[],defenses:[],skills:[],feats:[],features:[],languages:[],conditions:[],spellcasting:{defaultAbility:'',casterLevel:1,srMisc:0,groups:[]},inventorySections:[{name:'Inventario',notes:'',items:[]}],money:{MP:0,MO:0,MA:0,MR:0},narrative:{diary:item.longDesc||item.desc||'',bonds:''},secrets:{playerVisible:'',dmNotes:'',loginRequired:true},classLevels:[{name:item.type==='png'?'PNG':'Classe',level:1,notes:''}],companions:[],changeLog:[]};}
  function toSheetImg(src){return detailImageSrc(src).replace(/^\.\.\/assets\/img\/Thalor16k\.jpg$/,'');}
  function readSheetForItem(item){
    try{
      const raw=localStorage.getItem(sheetKey(item.slug));
      return raw?JSON.parse(raw):null;
    }catch(e){return null;}
  }
  function ensureSheet(item,overwrite){
    ensureRole(item);
    const key=sheetKey(item.slug);
    let data=null;
    try{
      if(!overwrite && localStorage.getItem(key)){
        syncSheetRole(item);
        data=readSheetForItem(item);
        return data||blankSheet(item);
      }
      data=blankSheet(item);
      localStorage.setItem(key,JSON.stringify(data));
      return data;
    }catch(e){
      console.warn('Scheda locale non salvata: continuo con il salvataggio online.',e);
      return data||blankSheet(item);
    }
  }
  function syncSheetRole(item){try{ensureRole(item); const key=sheetKey(item.slug); const raw=localStorage.getItem(key); if(!raw)return; const data=JSON.parse(raw); data.meta=data.meta||{}; data.meta.slug=item.slug; data.meta.permissionRole=item.slug; data.meta.characterRole=item.slug; data.meta.profileUrl=`dettaglio.html?id=${item.slug}`; data.identity=data.identity||{}; data.identity.name=data.identity.name||item.name||'Nuovo personaggio'; if(item.playerName!==undefined)data.identity.player=item.playerName||''; localStorage.setItem(key,JSON.stringify(data));}catch(e){console.warn('Aggiornamento ruolo scheda non riuscito:',e);}}
  function sheetHref(item){return `personaggi/scheda.html?character=${encodeURIComponent(item.slug)}`;}
  function detailHref(item){return `personaggi/dettaglio.html?id=${encodeURIComponent(item.slug)}`;}
  function renderList(){const app=$('#personaggiApp'); if(!app)return; state.items=state.items||read(); const groups={pg:state.items.filter(i=>i.type==='pg'),png:state.items.filter(i=>i.type==='png')}; app.innerHTML=`<h2 class="section-title">Personaggi</h2><p class="section-note">Ogni scheda raccoglie immagine, descrizione e background pubblico del personaggio.</p>${groupHtml('Giocanti',groups.pg)}${groupHtml('PNG',groups.png)}`; bindList(); renderPanel();}
  function groupHtml(title,items){return `<h2 class="section-title personaggi-group-title">${esc(title)}</h2><div class="character-list personaggi-list">${items.map(cardHtml).join('')||'<article class="card empty-row">Nessun personaggio.</article>'}</div>`;}
  function cardHtml(item){const hasSheet=!!(item.sheet||localStorage.getItem(sheetKey(item.slug))); const showSheet=item.type==='pg'||state.master; return `<article class="card character-card personaggi-card ${item.slug==='abraxas'?'abraxas':''}" data-personaggio="${esc(item.slug)}"><div class="personaggi-card-main"><img alt="${esc(item.name)}" src="${esc(rootImageSrc(item.img))}" loading="lazy" decoding="async"><div class="content"><span class="tag" title="${esc(permissionNote(item))}">${item.type==='png'?'PNG':'PG'}</span><h3>${richText(item.name)}</h3><p>${richText(item.desc||'')}</p></div></div><a class="card-overlay-link personaggi-card-overlay" href="${esc(detailHref(item))}" aria-label="Apri ${esc(item.name)}"></a><div class="personaggi-card-actions">${showSheet?(hasSheet?`<a class="button mini-sheet-link" href="${esc(sheetHref(item))}">Apri scheda</a>`:`<button class="button mini-sheet-link create-png-sheet" type="button" data-create-sheet="${esc(item.slug)}">Crea scheda</button>`):''}${state.master?`<button class="button ghost-button edit-personaggio" type="button" data-edit-personaggio="${esc(item.slug)}">Modifica</button><button class="button ghost-button delete-sheet-card" type="button" data-delete-sheet="${esc(item.slug)}">Elimina scheda</button><button class="button ghost-button delete-personaggio-card" type="button" data-delete-personaggio="${esc(item.slug)}">Elimina</button>`:''}</div></article>`;}
  function bindList(){ $$('.create-png-sheet').forEach(b=>b.onclick=async()=>{const item=state.items.find(x=>x.slug===b.dataset.createSheet); if(!item)return; const sheetData=ensureSheet(item,false); if(!(await saveOnlineSheet(item,sheetData)))return; if(!(await save()))return; renderList();}); $$('.edit-personaggio').forEach(b=>b.onclick=()=>openEditor(state.items.find(x=>x.slug===b.dataset.editPersonaggio))); $$('.delete-personaggio-card').forEach(b=>b.onclick=()=>removePersonaggio(state.items.find(x=>x.slug===b.dataset.deletePersonaggio))); $$('.delete-sheet-card').forEach(b=>b.onclick=()=>deleteSheetOnly(state.items.find(x=>x.slug===b.dataset.deleteSheet)));  }
  function renderPanel(){if(!state.master)return; if($('#personaggiMasterDock'))return; const dock=document.createElement('nav'); dock.id='personaggiMasterDock'; dock.className='personaggi-master-dock places-floating-actions'; dock.innerHTML=`<button type="button" class="places-float-toggle" id="personaggiToggleEdit" aria-expanded="false">✦</button><div class="places-float-menu personaggi-master-tools"><button type="button" id="addPg">+ PG</button><button type="button" id="addPng">+ PNG</button></div>`; document.body.appendChild(dock); const toggle=$('#personaggiToggleEdit'); toggle.onclick=()=>{const open=!dock.classList.contains('open'); dock.classList.toggle('open',open); toggle.setAttribute('aria-expanded',open?'true':'false'); state.editing=open; document.body.classList.toggle('personaggi-editing',open);}; $('#addPg').onclick=()=>newItem('pg'); $('#addPng').onclick=()=>newItem('png');}
  function uniqueSlug(base){let slug=slugify(base); let n=2; while(state.items.some(i=>i.slug===slug)){slug=slugify(base)+'-'+n++;} return slug;}
  function makeLinks(item){ensureRole(item); item.href=`personaggi/dettaglio.html?id=${encodeURIComponent(item.slug)}`; item.sheet=`personaggi/scheda.html?character=${encodeURIComponent(item.slug)}`; return item;}
  function newItem(type){state.items=state.items||read(); const name=type==='pg'?'Nuovo personaggio':'Nuovo PNG'; const slug=uniqueSlug(name); const item=makeLinks({type,slug,name,playerName:'',roleSlug:slug,permissionRole:slug,desc:'Nuova descrizione breve.',img:'assets/img/Thalor16k.jpg',longDesc:'',events:''}); openEditor(item,{isNew:true});}
  function openEditor(item,opts={}){if(!item)return; let modal=document.createElement('div'); modal.className='personaggi-modal-backdrop'; modal.innerHTML=`<form class="personaggi-modal panel"><header><h2>${opts.isNew?'Nuovo personaggio':esc(item.name||'Personaggio')}</h2><button type="button" class="modal-x">×</button></header><div class="personaggi-form-grid"><label>Tipo<select name="type"><option value="pg" ${item.type==='pg'?'selected':''}>PG</option><option value="png" ${item.type==='png'?'selected':''}>PNG</option></select></label><label>Nome<input name="name" value="${esc(item.name||'')}" required></label><label>Nome giocatore<input name="playerName" value="${esc(item.playerName||item.player||item.giocatore||'')}" placeholder="Da associare alla scheda"></label><label>Slug<input name="slug" value="${esc(item.slug||'')}"></label><label>Ruolo permesso<input name="roleSlug" value="${esc(item.roleSlug||item.slug||'')}" readonly title="Questo valore segue lo slug: assegna questo character_slug nei permessi Supabase del giocatore."></label><label>Pagina descrizione<input name="href" value="${esc(item.href||'')}"></label><label class="wide">Descrizione breve<textarea name="desc">${esc(item.desc||'')}</textarea></label><label class="wide">Descrizione pagina<textarea name="longDesc">${esc(item.longDesc||htmlToEditText(item.longHtml)||'')}</textarea></label><label class="wide">Eventi in campagna<textarea name="events">${esc(item.events||htmlToEditText(item.eventsHtml)||'')}</textarea></label><label class="wide">Immagine<input type="file" name="imgFile" accept="image/*"><input name="img" value="${esc(item.img||'')}"></label></div><footer>${opts.isNew?'':`<button type="button" class="button ghost-button delete-personaggio">Elimina</button>`}<button type="button" class="button ghost-button ensure-sheet">Crea/Aggiorna scheda vuota</button><button type="submit" class="button save-button">Salva</button></footer></form>`; document.body.appendChild(modal); const form=$('form',modal); $('.modal-x',modal).onclick=()=>modal.remove(); const del=$('.delete-personaggio',modal); if(del)del.onclick=()=>{modal.remove(); removePersonaggio(item);}; $('.ensure-sheet',modal).onclick=async()=>{const old=item.slug; collectForm(form,item,old); upsertPersonaggio(item,old); makeLinks(item); const sheetData=ensureSheet(item,false); if(!(await saveOnlineSheet(item,sheetData)))return; if(!(await save()))return; if($('#personaggiApp')){renderList();} alert('Scheda personaggio creata e salvata online. Permesso da assegnare al giocatore: '+item.slug);}; $('[name="imgFile"]',form).onchange=async e=>{const file=e.target.files&&e.target.files[0]; if(!file)return; const imgInput=$('[name="img"]',form); const saveBtn=$('.save-button',form); try{ if(saveBtn)saveBtn.disabled=true; imgInput.value='Ottimizzazione immagine in corso…'; imgInput.dataset.pendingImage='1'; const optimized=await thalorOptimizeImage(file,{maxSide:1200,quality:0.74,maxBytes:650000}); imgInput.value=optimized; delete imgInput.dataset.pendingImage; }catch(err){ console.warn('Ottimizzazione immagine non riuscita:',err); alert('Non riesco a preparare questa immagine per il salvataggio. Prova a convertirla in JPG/WebP o a ridurla.'); imgInput.value=''; delete imgInput.dataset.pendingImage; }finally{ if(saveBtn)saveBtn.disabled=false; }}; form.onsubmit=async e=>{e.preventDefault(); const old=item.slug; collectForm(form,item,old); upsertPersonaggio(item,old); if(old!==item.slug){const oldData=localStorage.getItem(sheetKey(old)); if(oldData&&!localStorage.getItem(sheetKey(item.slug))){localStorage.setItem(sheetKey(item.slug),oldData); localStorage.removeItem(sheetKey(old));}} makeLinks(item); const sheetData=ensureSheet(item,false); syncSheetRole(item); if(!(await saveOnlineSheet(item,readSheetForItem(item)||sheetData)))return; if(!(await save()))return; modal.remove(); if($('#personaggiApp')){renderList();}else if($('#personaggioDetailApp')){initDetail();} };}
  function upsertPersonaggio(item,oldSlug){state.items=state.items||read(); makeLinks(item); const idx=state.items.findIndex(x=>x.slug===(oldSlug||item.slug)); if(idx>=0)state.items[idx]=Object.assign({},item); else state.items.push(Object.assign({},item)); state.deleted=(state.deleted||[]).filter(x=>x!==item.slug);}
  function collectForm(form,item,oldSlug){const fd=new FormData(form); item.type=fd.get('type')||'pg'; item.name=fd.get('name')||'Nuovo personaggio'; const desired=slugify(fd.get('slug')||item.name); item.slug=(oldSlug&&desired!==oldSlug&&state.items.some(i=>i!==item&&i.slug===desired))?uniqueSlug(desired):desired; item.playerName=fd.get('playerName')||''; ensureRole(item); makeLinks(item); item.desc=fd.get('desc')||''; item.longDesc=fd.get('longDesc')||''; item.events=fd.get('events')||''; item.longHtml=''; item.eventsHtml=''; item.img=rootImageSrc(fd.get('img')||''); return item;}
  let personaggiRefreshBusy=false;
  let personaggiLastRefresh=0;
  async function refreshPersonaggiList(force=false){
    if(!$('#personaggiApp'))return;
    const now=Date.now();
    if(personaggiRefreshBusy)return;
    if(!force && now-personaggiLastRefresh<1200)return;
    personaggiRefreshBusy=true;
    try{
      const wasMaster=state.master;
      state.master=await canMaster();
      state.items=await readFresh();
      personaggiLastRefresh=Date.now();
      if(state.restoreDefaultContent&&state.master)await save();
      renderList();
      if(wasMaster!==state.master){document.body.classList.toggle('personaggi-editing',false);}
    }catch(e){
      console.warn('Aggiornamento elenco personaggi non riuscito:',e);
    }finally{
      personaggiRefreshBusy=false;
    }
  }
  async function initList(){await refreshPersonaggiList(true);}
  function bindAutoRefresh(){
    if(window.__thalorPersonaggiAutoRefreshBound)return;
    window.__thalorPersonaggiAutoRefreshBound=true;
    window.addEventListener('focus',()=>refreshPersonaggiList(false));
    window.addEventListener('pageshow',()=>refreshPersonaggiList(true));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshPersonaggiList(false);});
    window.addEventListener('storage',e=>{if(e&&e.key===LIST_KEY)refreshPersonaggiList(true);});
  }
  function paragraphs(text){return String(text||'').split(/\n{2,}/).map(x=>x.trim()).filter(Boolean).map(p=>`<p>${richText(p)}</p>`).join('');}
  function htmlToEditText(html){const d=document.createElement('div'); d.innerHTML=String(html||''); return Array.from(d.children).map(el=>el.textContent.trim()).filter(Boolean).join('\n\n');}
  function richBlock(html,text){return html ? String(html) : paragraphs(text||'');}
  function detailImage(item){return detailImageSrc(item&&item.img);}
  function renderDetailPanel(app,item){
    const tag=item.tag || (item.type==='png'?'PNG':'Personaggio giocante');
    const sheetButton=(item.type==='pg'||state.master)?`<a class="button" href="${esc('scheda.html?character='+encodeURIComponent(item.slug))}">Accedi alla scheda</a>`:'';
    const eventsHtml=richBlock(item.eventsHtml||'', item.events||'') || '<p class="muted">Nessun evento in campagna ancora registrato.</p>';
    app.innerHTML=`<section class="hero character-hero personaggio-dedicated-hero"><span class="tag">${richText(tag)}</span><h1 class="hero-title">${richText(item.name)}</h1><p class="hero-subtitle">${richText(item.desc||'')}</p></section><p class="personaggio-detail-actions personaggio-detail-actions-top">${sheetButton}<a class="button" href="../personaggi.html">Torna ai personaggi</a></p><section class="character-layout personaggio-dedicated-layout"><aside class="panel character-portrait personaggio-dedicated-portrait ${item.slug==='abraxas'?'abraxas':''}"><img src="${esc(detailImage(item))}" alt="${esc(item.name)}" loading="lazy" decoding="async"></aside><article class="panel lore-section character-text personaggio-dedicated-text">${richBlock(item.longHtml||'', item.longDesc||item.desc||'')}</article></section><section class="panel campaign-events personaggio-dedicated-events"><h2>Eventi in campagna</h2>${eventsHtml}</section><footer>Thalor</footer>`;
  }

  async function recoverItemFromOnlineSheet(id){
    if(!id||!window.ThalorAuth||!window.ThalorAuth.loadCharacter)return null;
    try{
      const data=await window.ThalorAuth.loadCharacter(id,null,{publicRead:true,timeoutMs:12000});
      const item=itemFromOnlineSheet({slug:id,data});
      return item;
    }catch(e){
      console.warn('Recupero dettaglio da scheda online non riuscito:',e);
      return null;
    }
  }
  function recoverItemFromSheet(id){
    if(!id)return null;
    const raw=localStorage.getItem(sheetKey(id));
    if(!raw)return null;
    try{
      const data=JSON.parse(raw)||{};
      const identity=data.identity||{};
      const meta=data.meta||{};
      const item={
        type:'pg',
        slug:id,
        name:identity.name||meta.name||id,
        playerName:identity.player||'',
        roleSlug:id,
        permissionRole:id,
        desc:data.portrait?.quote||'Personaggio creato dal menu Master.',
        img:rootImageSrc(data.portrait?.image||'assets/img/Thalor16k.jpg'),
        href:`personaggi/dettaglio.html?id=${id}`,
        sheet:`personaggi/scheda.html?character=${encodeURIComponent(id)}`,
        longDesc:data.narrative?.diary||'',
        events:''
      };
      state.items=state.items||read();
      if(!state.items.some(x=>x.slug===id)){state.items.push(item); save();}
      return item;
    }catch(e){return null;}
  }
  async function initDetail(){
    const app=$('#personaggioDetailApp'); if(!app)return;
    const qs=new URLSearchParams(location.search);
    const id=qs.get('id')||qs.get('character')||qs.get('slug')||'';
    state.items=await readFresh();
    if(state.restoreDefaultContent&&state.master)await save();
    let item=state.items.find(x=>x.slug===id);
    if(!item)item=await recoverItemFromOnlineSheet(id);
    if(!item&&state.master)item=recoverItemFromSheet(id);
    if(!item&&id&&state.master){
      item=makeLinks({type:'pg',slug:id,name:String(id).replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),playerName:'',roleSlug:id,permissionRole:id,desc:'Pagina creata automaticamente dal collegamento.',img:'assets/img/Thalor16k.jpg',longDesc:'',events:''});
      state.items.push(item);
      await save();
    }
    if(!item){app.innerHTML='<section class="panel profile-text"><h1>Personaggio non trovato</h1><p>Non ho trovato una scheda pubblica online per questo personaggio. Controlla che sia stata salvata su Supabase.</p><p><a class="button" href="../personaggi.html">Torna ai Personaggi</a></p></section>';return;}
    document.title='Thalor — '+item.name;
    document.body.classList.add('npc-page','personaggio-dedicated-body');
    renderDetailPanel(app,item);
    if(state.master){renderDetailDock(item,app);}
  }
  function renderDetailDock(item,app){
    if($('#personaggiMasterDock'))return;
    const dock=document.createElement('nav');
    dock.id='personaggiMasterDock';
    dock.className='personaggi-master-dock places-floating-actions';
    dock.innerHTML=`<button type="button" class="places-float-toggle" id="personaggiDetailToggleEdit" aria-expanded="false">✦</button><div class="places-float-menu personaggi-master-tools"><button type="button" id="detailEditPersonaggio">Modifica Master</button></div>`;
    document.body.appendChild(dock);
    const toggle=$('#personaggiDetailToggleEdit');
    toggle.onclick=()=>{
      const open=!dock.classList.contains('open');
      dock.classList.toggle('open',open);
      toggle.setAttribute('aria-expanded',open?'true':'false');
      state.editing=open;
      document.body.classList.toggle('personaggi-editing',open);
    };
    $('#detailEditPersonaggio').onclick=()=>openEditor(item);
  }
  if($('#personaggiApp')){bindAutoRefresh(); initList();}
  if($('#personaggioDetailApp')) canMaster().then(m=>{state.master=m; initDetail();});
})();

async function thalorOptimizeImage(file,opts={}){
  const maxSide=opts.maxSide||1200;
  const quality=opts.quality||0.74;
  const maxBytes=opts.maxBytes||650000;
  if(!file || !file.type || !file.type.startsWith('image/')) throw new Error('File immagine non valido.');
  const readAsDataURL=f=>new Promise((res,rej)=>{const r=new FileReader();r.onerror=()=>rej(r.error||new Error('Lettura file non riuscita'));r.onload=()=>res(r.result);r.readAsDataURL(f);});
  const source=await readAsDataURL(file);
  // SVG/GIF animati: non usiamo canvas per non distruggerli; li accettiamo solo se piccoli.
  if(/image\/(svg\+xml|gif)/i.test(file.type)){
    if(String(source).length<=maxBytes) return source;
    throw new Error('Formato non comprimibile automaticamente.');
  }
  const img=await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(new Error('Immagine non leggibile'));im.src=source;});
  const scale=Math.min(1,maxSide/Math.max(img.naturalWidth||img.width,img.naturalHeight||img.height));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round((img.naturalWidth||img.width)*scale));
  canvas.height=Math.max(1,Math.round((img.naturalHeight||img.height)*scale));
  const ctx=canvas.getContext('2d',{alpha:true});
  ctx.drawImage(img,0,0,canvas.width,canvas.height);
  const mime='image/webp';
  let q=quality;
  let out=canvas.toDataURL(mime,q);
  while(out.length>maxBytes && q>0.42){
    q-=0.08;
    out=canvas.toDataURL(mime,q);
  }
  if(out.length>maxBytes){
    const small=document.createElement('canvas');
    const shrink=Math.sqrt(maxBytes/out.length)*0.92;
    small.width=Math.max(1,Math.round(canvas.width*shrink));
    small.height=Math.max(1,Math.round(canvas.height*shrink));
    small.getContext('2d',{alpha:true}).drawImage(canvas,0,0,small.width,small.height);
    out=small.toDataURL(mime,0.62);
  }
  return out;
}
