/**
 * textos-impressos.js — as frases do PAPEL, nas 8 linguas, num lugar so.
 * =====================================================================
 *
 * Quem le este arquivo: o panfleto.html (a folha A4 de parede) e o
 * display.html (o cartao de 10x15 cm de mesa).
 *
 * POR QUE ELE EXISTE. Em 11/09 o Erez pediu as explicacoes tambem no cartao de
 * mesa, e a saida obvia era copiar as frases do panfleto para la. Seriam DUAS
 * copias das mesmas palavras em 8 linguas — e o dia em que alguem corrigisse
 * uma so, a folha da parede e o cartao da mesa passariam a dizer coisas
 * diferentes na mesma sinagoga, sem nada acusar. E o defeito que este projeto
 * mais pagou caro, com outro nome: duas contas para a mesma pergunta.
 *
 * As frases sao as MESMAS de antes, movidas de dentro do panfleto.html sem
 * uma letra mudada. O gerar-panfleto.mjs prova isso a cada rodada: ele confere
 * os 5 itens da lista, a instrucao do icone e o QR lido de dentro do PDF.
 *
 * Regra 6 das inviolaveis vale aqui como em todo lugar: tudo o que aparece
 * existe nas 8 (pt, en, es, fr, it, de, ru, he).
 *
 * 11/09 — o passo 1 dizia "para o codigo AO LADO", e era verdade quando o QR
 * ficava num canto da folha. Ele virou o centro em 10/09 e ninguem corrigiu a
 * frase; o cartao de mesa, que poe o codigo em cima, tornou o erro obvio.
 * Agora diz "acima", que e verdade nos dois.
 */
window.TEXTOS_IMPRESSOS = {
  pt:{dir:'ltr',sub:'Um app para ensinar a falar o Kadish palavra por palavra, com a voz do rabino.',
      hComo:'Como usar',
      passos:['Aponte a câmera do telefone para o código acima.','Escolha a sua tradição e o tipo de Kadish. O áudio começa no ▶.','Acompanhe: a palavra que está soando fica acesa no texto.'],
      hOque:'O que o app faz',
      oque:['Áudio do rabino sincronizado palavra por palavra.','Hebraico, transliteração e tradução, em 8 línguas.','Modo Treino, que pausa em cada verso para você repetir.','Dedicar o Kadish a alguém, e lembrete do yahrzeit.','Botão de mudo, para acompanhar o texto em silêncio.'],
      icone_ios:'abra o endereço no <b>Safari</b>. Toque em Compartilhar, role a lista para baixo e toque em “Adicionar à Tela de Início”.',icone_android:'abra no <b>Chrome</b>. O navegador oferece “Instalar” — um toque.',
      qr:'Aponte a câmera. Funciona no iPhone e no Android, sem instalar nada.',
      nota:'O Kadish exige minyan de dez homens adultos e é recitado de pé. Deve ser recitado normalmente numa sinagoga durante o período de luto.',
      rab_sub:'Para a sinagoga — quem está de luto e não lê hebraico acompanha o Kadish palavra por palavra, no nussach da casa.',
      rab_hOito:'Os oito Kadishim', rab_yatom:'Kadish do Enlutado', rab_derabanan:'Kadish dos Sábios',
      rodape:'Gratuito · sem cadastro · sem anúncios'},
  en:{dir:'ltr',sub:'An app to teach you to say the Kaddish word by word, with the rabbi’s voice.',
      hComo:'How to use it',
      passos:['Point your phone’s camera at the code above.','Choose your tradition and the kind of Kaddish. The audio starts on ▶.','Follow along: the word being said lights up in the text.'],
      hOque:'What the app does',
      oque:['The rabbi’s recording synchronised word by word.','Hebrew, transliteration and translation, in 8 languages.','Practice Mode, which pauses at every verse so you can repeat it.','Dedicate the Kaddish to someone, and a yahrzeit reminder.','A mute button, to follow the text in silence.'],
      icone_ios:'open the address in <b>Safari</b>. Tap Share, scroll the list down and tap “Add to Home Screen”.',icone_android:'open it in <b>Chrome</b>. The browser offers “Install” — one tap.',
      qr:'Point your camera. Works on iPhone and Android, nothing to install.',
      nota:'The Kaddish requires a minyan of ten adult men and is recited standing. It should normally be recited in a synagogue during the period of mourning.',
      rab_sub:'For the synagogue — a mourner who cannot read Hebrew follows the Kaddish word by word, in your own nusach.',
      rab_hOito:'The eight Kaddishim', rab_yatom:'Mourner’s Kaddish', rab_derabanan:'Rabbis’ Kaddish',
      rodape:'Free · no sign-up · no advertising'},
  es:{dir:'ltr',sub:'Una app para enseñar a decir el Kadish palabra por palabra, con la voz del rabino.',
      hComo:'Cómo usarla',
      passos:['Apunte la cámara del teléfono al código de arriba.','Elija su tradición y el tipo de Kadish. El audio empieza en ▶.','Siga la lectura: la palabra que suena se enciende en el texto.'],
      hOque:'Qué hace la app',
      oque:['Audio del rabino sincronizado palabra por palabra.','Hebreo, transliteración y traducción, en 8 idiomas.','Modo Práctica, que hace una pausa en cada versículo para repetir.','Dedicar el Kadish a alguien, y recordatorio del yahrzeit.','Botón de silencio, para seguir el texto sin sonido.'],
      icone_ios:'abra la dirección en <b>Safari</b>. Toque Compartir, deslice la lista hacia abajo y toque “Añadir a pantalla de inicio”.',icone_android:'ábralo en <b>Chrome</b>. El navegador ofrece “Instalar” — un toque.',
      qr:'Apunte la cámara. Funciona en iPhone y Android, sin instalar nada.',
      nota:'El Kadish exige minián de diez hombres adultos y se recita de pie. Debe recitarse normalmente en una sinagoga durante el período de duelo.',
      rab_sub:'Para la sinagoga — quien está de duelo y no lee hebreo sigue el Kadish palabra por palabra, en el nusaj de la casa.',
      rab_hOito:'Los ocho Kadishim', rab_yatom:'Kadish del Enlutado', rab_derabanan:'Kadish de los Sabios',
      rodape:'Gratis · sin registro · sin publicidad'},
  fr:{dir:'ltr',sub:'Une application pour apprendre à dire le Kaddish mot à mot, avec la voix du rabbin.',
      hComo:'Comment l’utiliser',
      passos:['Dirigez l’appareil photo du téléphone vers le code ci-dessus.','Choisissez votre tradition et le type de Kaddish. L’audio démarre sur ▶.','Suivez : le mot prononcé s’allume dans le texte.'],
      hOque:'Ce que fait l’application',
      oque:['L’enregistrement du rabbin synchronisé mot à mot.','Hébreu, translittération et traduction, en 8 langues.','Mode Entraînement, qui marque une pause à chaque verset.','Dédier le Kaddish à quelqu’un, et un rappel du yahrzeit.','Un bouton muet, pour suivre le texte en silence.'],
      icone_ios:'ouvrez l’adresse dans <b>Safari</b>. Touchez Partager, faites défiler la liste vers le bas et touchez « Sur l’écran d’accueil ».',icone_android:'ouvrez-le dans <b>Chrome</b>. Le navigateur propose « Installer » — une touche.',
      qr:'Dirigez la caméra. Fonctionne sur iPhone et Android, rien à installer.',
      nota:'Le Kaddish exige un minyan de dix hommes adultes et se récite debout. Il doit normalement être récité dans une synagogue pendant la période de deuil.',
      rab_sub:'Pour la synagogue — l’endeuillé qui ne lit pas l’hébreu suit le Kaddish mot à mot, dans le noussa’h de la maison.',
      rab_hOito:'Les huit Kaddishim', rab_yatom:'Kaddish de l’Endeuillé', rab_derabanan:'Kaddish des Sages',
      rodape:'Gratuit · sans inscription · sans publicité'},
  it:{dir:'ltr',sub:'Un’app per imparare a dire il Kaddish parola per parola, con la voce del rabbino.',
      hComo:'Come si usa',
      passos:['Inquadri con la fotocamera il codice qui sopra.','Scelga la sua tradizione e il tipo di Kaddish. L’audio parte con ▶.','Segua: la parola pronunciata si illumina nel testo.'],
      hOque:'Che cosa fa l’app',
      oque:['La registrazione del rabbino sincronizzata parola per parola.','Ebraico, traslitterazione e traduzione, in 8 lingue.','Modalità Allenamento, che si ferma a ogni versetto.','Dedicare il Kaddish a qualcuno, e il promemoria dello yahrzeit.','Pulsante muto, per seguire il testo in silenzio.'],
      icone_ios:'apra l’indirizzo in <b>Safari</b>. Tocchi Condividi, scorra l’elenco verso il basso e tocchi “Aggiungi a Home”.',icone_android:'lo apra in <b>Chrome</b>. Il browser propone “Installa” — un tocco.',
      qr:'Inquadri con la fotocamera. Funziona su iPhone e Android, senza installare nulla.',
      nota:'Il Kaddish richiede un minyan di dieci uomini adulti e si recita in piedi. Deve essere recitato normalmente in sinagoga durante il periodo di lutto.',
      rab_sub:'Per la sinagoga — chi è in lutto e non legge l’ebraico segue il Kaddish parola per parola, nel nusach della casa.',
      rab_hOito:'Gli otto Kaddishim', rab_yatom:'Kaddish dei Dolenti', rab_derabanan:'Kaddish dei Maestri',
      rodape:'Gratuita · senza registrazione · senza pubblicità'},
  de:{dir:'ltr',sub:'Eine App, um das Kaddisch Wort für Wort sprechen zu lernen, mit der Stimme des Rabbiners.',
      hComo:'So benutzt man sie',
      passos:['Richten Sie die Kamera des Telefons auf den Code oben.','Wählen Sie Ihren Ritus und die Art des Kaddisch. Der Ton startet mit ▶.','Folgen Sie mit: das gesprochene Wort leuchtet im Text auf.'],
      hOque:'Was die App tut',
      oque:['Die Aufnahme des Rabbiners, Wort für Wort synchronisiert.','Hebräisch, Umschrift und Übersetzung, in 8 Sprachen.','Übungsmodus, der bei jedem Vers anhält.','Das Kaddisch jemandem widmen, mit Jahrzeit-Erinnerung.','Stummschalt-Taste, um dem Text in Stille zu folgen.'],
      icone_ios:'die Adresse in <b>Safari</b> öffnen. Auf Teilen tippen, die Liste nach unten scrollen und „Zum Home-Bildschirm“ tippen.',icone_android:'in <b>Chrome</b> öffnen. Der Browser bietet „Installieren“ an — ein Tippen.',
      qr:'Kamera darauf richten. Funktioniert auf iPhone und Android, ohne Installation.',
      nota:'Das Kaddisch verlangt einen Minjan von zehn erwachsenen Männern und wird im Stehen gesprochen. Es soll in der Regel während der Trauerzeit in einer Synagoge gesprochen werden.',
      rab_sub:'Für die Synagoge — wer trauert und kein Hebräisch liest, folgt dem Kaddisch Wort für Wort, im Ritus des Hauses.',
      rab_hOito:'Die acht Kaddischim', rab_yatom:'Trauerkaddisch', rab_derabanan:'Kaddisch der Gelehrten',
      rodape:'Kostenlos · ohne Anmeldung · ohne Werbung'},
  ru:{dir:'ltr',sub:'Приложение, чтобы научиться произносить кадиш слово за словом, с голосом раввина.',
      hComo:'Как пользоваться',
      passos:['Наведите камеру телефона на код выше.','Выберите свою традицию и вид кадиша. Звук начинается по ▶.','Следите: произносимое слово подсвечивается в тексте.'],
      hOque:'Что умеет приложение',
      oque:['Запись раввина, синхронизированная слово за словом.','Иврит, транслитерация и перевод, на 8 языках.','Режим обучения — пауза после каждого стиха.','Посвятить кадиш человеку и напоминание о йорцайте.','Кнопка отключения звука, чтобы следить за текстом в тишине.'],
      icone_ios:'откройте адрес в <b>Safari</b>. Нажмите «Поделиться», прокрутите список вниз и нажмите «На экран «Домой»».',icone_android:'откройте в <b>Chrome</b>. Браузер предложит «Установить» — одно нажатие.',
      qr:'Наведите камеру. Работает на iPhone и Android, ничего устанавливать не нужно.',
      nota:'Кадиш требует миньяна из десяти взрослых мужчин и читается стоя. Обычно его следует читать в синагоге в течение траурного периода.',
      rab_sub:'Для синагоги — скорбящий, не читающий на иврите, следует за кадишем слово за словом, в нусахе общины.',
      rab_hOito:'Восемь кадишей', rab_yatom:'Кадиш сироты', rab_derabanan:'Кадиш мудрецов',
      rodape:'Бесплатно · без регистрации · без рекламы'},
  he:{dir:'rtl',sub:'אפליקציה ללמוד לומר את הקדיש מילה במילה, בקולו של הרב.',
      hComo:'איך משתמשים',
      passos:['כוונו את מצלמת הטלפון אל הקוד שלמעלה.','בחרו את הנוסח ואת סוג הקדיש. השמע מתחיל ב- ▶.','עקבו: המילה הנאמרת נדלקת בטקסט.'],
      hOque:'מה האפליקציה עושה',
      oque:['הקלטת הרב מסונכרנת מילה במילה.','עברית, תעתיק ותרגום, בשמונה שפות.','מצב אימון, שעוצר בכל פסוק כדי לחזור עליו.','להקדיש את הקדיש לאדם, ותזכורת ליארצייט.','כפתור השתקה, כדי לעקוב אחר הטקסט בשקט.'],
      icone_ios:'פתחו את הכתובת ב<b>ספארי</b>. הקישו על שיתוף, גללו את הרשימה למטה והקישו על “הוסף למסך הבית”.',icone_android:'פתחו ב<b>כרום</b>. הדפדפן מציע “התקנה” — הקשה אחת.',
      qr:'כוונו את המצלמה. עובד באייפון ובאנדרואיד, בלי להתקין דבר.',
      nota:'הקדיש טעון מניין של עשרה גברים בוגרים והוא נאמר בעמידה. רגילים לאומרו בבית הכנסת במשך תקופת האבלות.',
      rab_sub:'לבית הכנסת — האבל שאינו קורא עברית עוקב אחר הקדיש מילה במילה, לפי נוסח בית הכנסת.',
      rab_hOito:'שמונת הקדישים', rab_yatom:'קדיש יתום', rab_derabanan:'קדיש דרבנן',
      rodape:'חינם · ללא הרשמה · ללא פרסומות'},
};
