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
 * 14/09 — a frase do alto mudou, e a ideia e dele: a de antes DESCREVIA o app
 * ("um app para ensinar a falar o Kadish"), e a nova responde a pergunta de
 * quem esta parado na frente do cartaz — "isto e para mim?". Ele escreveu
 * "para quem nao le ou sabe hebraico"; depois de "nao" o certo e "nem", e das
 * seis redacoes que levei a tela dele ele escolheu a que fala COM a pessoa em
 * vez de descrever o produto. O que trava quem nao le hebraico nao e falta de
 * informacao, e vergonha, e a frase tira esse peso na primeira palavra.
 * O HEBRAICO nao e a traducao literal, de proposito — ver o comentario no
 * script que a escreveu, e a nota que ficou para ele decidir.
 *
 * 11/09 — o passo 1 dizia "para o codigo AO LADO", e era verdade quando o QR
 * ficava num canto da folha. Ele virou o centro em 10/09 e ninguem corrigiu a
 * frase; o cartao de mesa, que poe o codigo em cima, tornou o erro obvio.
 * Agora diz "acima", que e verdade nos dois.
 */
window.TEXTOS_IMPRESSOS = {
  pt:{dir:'ltr',sub:'Você não precisa saber hebraico para dizer o Kadish. Este app ensina, palavra por palavra.',
      hComo:'Como usar',
      passos:['Aponte a câmera do telefone para o código acima.','Se quiser, ponha o app na tela do telefone, seguindo as instruções acima.','Escolha a sua tradição e o tipo de Kadish. O áudio começa no ▶.','Acompanhe: a palavra que está soando fica acesa no texto.','Escolha ocultar ou destacar o hebraico, a transliteração ou a tradução.','Use o Modo Treino para aprender verso a verso, repetindo quantas vezes quiser.','Dedique o Kadish a alguém e crie lembretes do Yahrzeit — o aniversário do falecimento, quando também se diz o Kadish.','Ative o botão de mudo para acompanhar o texto em silêncio.'],
      hOque:'O que o app faz',
      oque:['Áudio do rabino sincronizado palavra por palavra.','Hebraico, transliteração e tradução, em 8 línguas.','Modo Treino, que pausa em cada verso para você repetir.','Dedicar o Kadish a alguém, e lembrete do yahrzeit.','Botão de mudo, para acompanhar o texto em silêncio.'],
      icone_ios:'abra o endereço no <b>Safari</b>. Toque em Compartilhar, role a lista para baixo e toque em “Adicionar à Tela de Início”.',icone_android:'abra no <b>Chrome</b>. O navegador oferece “Instalar” — um toque.',
      qr:'Aponte a câmera. Funciona no iPhone e no Android, sem instalar nada.',
      nota:'O Kadish exige minyan (dez homens adultos rezando juntos) e é recitado de pé. Deve ser recitado normalmente numa sinagoga durante o período de luto.',
      rab_sub:'Para a sinagoga — quem está de luto e não lê hebraico acompanha o Kadish palavra por palavra, no nussach da casa.',
      rab_hOito:'Os oito Kadishim', rab_yatom:'Kadish do Enlutado', rab_derabanan:'Kadish dos Sábios',
      rodape:'Gratuito · sem cadastro · sem anúncios'},
  en:{dir:'ltr',sub:'You don’t need to know Hebrew to say the Kaddish. This app teaches you, word by word.',
      hComo:'How to use it',
      passos:['Point your phone’s camera at the code above.','If you wish, add the app to your phone’s home screen, following the instructions above.','Choose your tradition and the kind of Kaddish. The audio starts on ▶.','Follow along: the word being said lights up in the text.','Choose to hide or highlight the Hebrew, the transliteration or the translation.','Use Practice Mode to learn verse by verse, repeating as often as you like.','Dedicate the Kaddish to someone and set yahrzeit reminders — the anniversary of the death, when the Kaddish is said again.','Turn on mute to follow the text in silence.'],
      hOque:'What the app does',
      oque:['The rabbi’s recording synchronised word by word.','Hebrew, transliteration and translation, in 8 languages.','Practice Mode, which pauses at every verse so you can repeat it.','Dedicate the Kaddish to someone, and a yahrzeit reminder.','A mute button, to follow the text in silence.'],
      icone_ios:'open the address in <b>Safari</b>. Tap Share, scroll the list down and tap “Add to Home Screen”.',icone_android:'open it in <b>Chrome</b>. The browser offers “Install” — one tap.',
      qr:'Point your camera. Works on iPhone and Android, nothing to install.',
      nota:'The Kaddish requires a minyan (ten adult men praying together) and is recited standing. It should normally be recited in a synagogue during the period of mourning.',
      rab_sub:'For the synagogue — a mourner who cannot read Hebrew follows the Kaddish word by word, in your own nusach.',
      rab_hOito:'The eight Kaddishim', rab_yatom:'Mourner’s Kaddish', rab_derabanan:'Rabbis’ Kaddish',
      rodape:'Free · no sign-up · no advertising'},
  es:{dir:'ltr',sub:'No hace falta saber hebreo para decir el Kadish. Esta app enseña, palabra por palabra.',
      hComo:'Cómo usarla',
      passos:['Apunte la cámara del teléfono al código de arriba.','Si lo desea, ponga la app en la pantalla del teléfono, siguiendo las instrucciones de arriba.','Elija su tradición y el tipo de Kadish. El audio empieza en ▶.','Siga la lectura: la palabra que suena se enciende en el texto.','Elija ocultar o destacar el hebreo, la transliteración o la traducción.','Use el Modo Práctica para aprender versículo a versículo, repitiendo cuantas veces quiera.','Dedique el Kadish a alguien y cree recordatorios del yahrzeit — el aniversario del fallecimiento, cuando se dice el Kadish otra vez.','Active el silencio para seguir el texto sin sonido.'],
      hOque:'Qué hace la app',
      oque:['Audio del rabino sincronizado palabra por palabra.','Hebreo, transliteración y traducción, en 8 idiomas.','Modo Práctica, que hace una pausa en cada versículo para repetir.','Dedicar el Kadish a alguien, y recordatorio del yahrzeit.','Botón de silencio, para seguir el texto sin sonido.'],
      icone_ios:'abra la dirección en <b>Safari</b>. Toque Compartir, deslice la lista hacia abajo y toque “Añadir a pantalla de inicio”.',icone_android:'ábralo en <b>Chrome</b>. El navegador ofrece “Instalar” — un toque.',
      qr:'Apunte la cámara. Funciona en iPhone y Android, sin instalar nada.',
      nota:'El Kadish exige un minián (diez hombres adultos rezando juntos) y se recita de pie. Debe recitarse normalmente en una sinagoga durante el período de duelo.',
      rab_sub:'Para la sinagoga — quien está de duelo y no lee hebreo sigue el Kadish palabra por palabra, en el nusaj de la casa.',
      rab_hOito:'Los ocho Kadishim', rab_yatom:'Kadish del Enlutado', rab_derabanan:'Kadish de los Sabios',
      rodape:'Gratis · sin registro · sin publicidad'},
  fr:{dir:'ltr',sub:'Pas besoin de savoir l’hébreu pour dire le Kaddish. Cette application l’apprend, mot à mot.',
      hComo:'Comment l’utiliser',
      passos:['Dirigez l’appareil photo du téléphone vers le code ci-dessus.','Si vous le souhaitez, mettez l’application sur l’écran d’accueil, en suivant les instructions ci-dessus.','Choisissez votre tradition et le type de Kaddish. L’audio démarre sur ▶.','Suivez : le mot prononcé s’allume dans le texte.','Choisissez de masquer ou de mettre en valeur l’hébreu, la translittération ou la traduction.','Utilisez le Mode Entraînement pour apprendre verset par verset, en répétant autant de fois que vous voulez.','Dédiez le Kaddish à quelqu’un et créez des rappels du yahrzeit — l’anniversaire du décès, où l’on dit à nouveau le Kaddish.','Activez le mode muet pour suivre le texte en silence.'],
      hOque:'Ce que fait l’application',
      oque:['L’enregistrement du rabbin synchronisé mot à mot.','Hébreu, translittération et traduction, en 8 langues.','Mode Entraînement, qui marque une pause à chaque verset.','Dédier le Kaddish à quelqu’un, et un rappel du yahrzeit.','Un bouton muet, pour suivre le texte en silence.'],
      icone_ios:'ouvrez l’adresse dans <b>Safari</b>. Touchez Partager, faites défiler la liste vers le bas et touchez « Sur l’écran d’accueil ».',icone_android:'ouvrez-le dans <b>Chrome</b>. Le navigateur propose « Installer » — une touche.',
      qr:'Dirigez la caméra. Fonctionne sur iPhone et Android, rien à installer.',
      nota:'Le Kaddish exige un minyan (dix hommes adultes priant ensemble) et se récite debout. Il doit normalement être récité dans une synagogue pendant la période de deuil.',
      rab_sub:'Pour la synagogue — l’endeuillé qui ne lit pas l’hébreu suit le Kaddish mot à mot, dans le noussa’h de la maison.',
      rab_hOito:'Les huit Kaddishim', rab_yatom:'Kaddish de l’Endeuillé', rab_derabanan:'Kaddish des Sages',
      rodape:'Gratuit · sans inscription · sans publicité'},
  it:{dir:'ltr',sub:'Non serve sapere l’ebraico per dire il Kaddish. Questa app insegna, parola per parola.',
      hComo:'Come si usa',
      passos:['Inquadri con la fotocamera il codice qui sopra.','Se vuole, metta l’app sulla schermata del telefono, seguendo le istruzioni qui sopra.','Scelga la sua tradizione e il tipo di Kaddish. L’audio parte con ▶.','Segua: la parola pronunciata si illumina nel testo.','Scelga se nascondere o mettere in risalto l’ebraico, la traslitterazione o la traduzione.','Usi la Modalità Allenamento per imparare versetto per versetto, ripetendo quante volte vuole.','Dedichi il Kaddish a qualcuno e crei promemoria dello yahrzeit — l’anniversario della morte, quando si dice di nuovo il Kaddish.','Attivi il muto per seguire il testo in silenzio.'],
      hOque:'Che cosa fa l’app',
      oque:['La registrazione del rabbino sincronizzata parola per parola.','Ebraico, traslitterazione e traduzione, in 8 lingue.','Modalità Allenamento, che si ferma a ogni versetto.','Dedicare il Kaddish a qualcuno, e il promemoria dello yahrzeit.','Pulsante muto, per seguire il testo in silenzio.'],
      icone_ios:'apra l’indirizzo in <b>Safari</b>. Tocchi Condividi, scorra l’elenco verso il basso e tocchi “Aggiungi a Home”.',icone_android:'lo apra in <b>Chrome</b>. Il browser propone “Installa” — un tocco.',
      qr:'Inquadri con la fotocamera. Funziona su iPhone e Android, senza installare nulla.',
      nota:'Il Kaddish richiede un minyan (dieci uomini adulti che pregano insieme) e si recita in piedi. Deve essere recitato normalmente in sinagoga durante il periodo di lutto.',
      rab_sub:'Per la sinagoga — chi è in lutto e non legge l’ebraico segue il Kaddish parola per parola, nel nusach della casa.',
      rab_hOito:'Gli otto Kaddishim', rab_yatom:'Kaddish dei Dolenti', rab_derabanan:'Kaddish dei Maestri',
      rodape:'Gratuita · senza registrazione · senza pubblicità'},
  de:{dir:'ltr',sub:'Man muss kein Hebräisch können, um das Kaddisch zu sprechen. Diese App lehrt es, Wort für Wort.',
      hComo:'So benutzt man sie',
      passos:['Richten Sie die Kamera des Telefons auf den Code oben.','Wenn Sie möchten, legen Sie die App auf den Startbildschirm, nach der Anleitung oben.','Wählen Sie Ihren Ritus und die Art des Kaddisch. Der Ton startet mit ▶.','Folgen Sie mit: das gesprochene Wort leuchtet im Text auf.','Wählen Sie, ob Hebräisch, Umschrift oder Übersetzung ausgeblendet oder hervorgehoben wird.','Nutzen Sie den Übungsmodus, um Vers für Vers zu lernen, so oft wiederholt wie Sie wollen.','Widmen Sie das Kaddisch jemandem und richten Sie Jahrzeit-Erinnerungen ein — den Todestag, an dem das Kaddisch wieder gesprochen wird.','Schalten Sie stumm, um dem Text in Stille zu folgen.'],
      hOque:'Was die App tut',
      oque:['Die Aufnahme des Rabbiners, Wort für Wort synchronisiert.','Hebräisch, Umschrift und Übersetzung, in 8 Sprachen.','Übungsmodus, der bei jedem Vers anhält.','Das Kaddisch jemandem widmen, mit Jahrzeit-Erinnerung.','Stummschalt-Taste, um dem Text in Stille zu folgen.'],
      icone_ios:'die Adresse in <b>Safari</b> öffnen. Auf Teilen tippen, die Liste nach unten scrollen und „Zum Home-Bildschirm“ tippen.',icone_android:'in <b>Chrome</b> öffnen. Der Browser bietet „Installieren“ an — ein Tippen.',
      qr:'Kamera darauf richten. Funktioniert auf iPhone und Android, ohne Installation.',
      nota:'Das Kaddisch verlangt einen Minjan (zehn erwachsene Männer, die gemeinsam beten) und wird im Stehen gesprochen. Es soll in der Regel während der Trauerzeit in einer Synagoge gesprochen werden.',
      rab_sub:'Für die Synagoge — wer trauert und kein Hebräisch liest, folgt dem Kaddisch Wort für Wort, im Ritus des Hauses.',
      rab_hOito:'Die acht Kaddischim', rab_yatom:'Trauerkaddisch', rab_derabanan:'Kaddisch der Gelehrten',
      rodape:'Kostenlos · ohne Anmeldung · ohne Werbung'},
  ru:{dir:'ltr',sub:'Чтобы произнести кадиш, не нужно знать иврит. Это приложение учит слово за словом.',
      hComo:'Как пользоваться',
      passos:['Наведите камеру телефона на код выше.','При желании поместите приложение на экран телефона, следуя указаниям выше.','Выберите свою традицию и вид кадиша. Звук начинается по ▶.','Следите: произносимое слово подсвечивается в тексте.','Выберите, скрыть или выделить иврит, транслитерацию или перевод.','Используйте режим обучения, чтобы учить стих за стихом, повторяя сколько нужно.','Посвятите кадиш человеку и создайте напоминания о йорцайте — годовщине смерти, когда кадиш читают снова.','Включите беззвучный режим, чтобы следить за текстом в тишине.'],
      hOque:'Что умеет приложение',
      oque:['Запись раввина, синхронизированная слово за словом.','Иврит, транслитерация и перевод, на 8 языках.','Режим обучения — пауза после каждого стиха.','Посвятить кадиш человеку и напоминание о йорцайте.','Кнопка отключения звука, чтобы следить за текстом в тишине.'],
      icone_ios:'откройте адрес в <b>Safari</b>. Нажмите «Поделиться», прокрутите список вниз и нажмите «На экран «Домой»».',icone_android:'откройте в <b>Chrome</b>. Браузер предложит «Установить» — одно нажатие.',
      qr:'Наведите камеру. Работает на iPhone и Android, ничего устанавливать не нужно.',
      nota:'Кадиш требует миньяна (десять взрослых мужчин, молящихся вместе) и читается стоя. Обычно его следует читать в синагоге в течение траурного периода.',
      rab_sub:'Для синагоги — скорбящий, не читающий на иврите, следует за кадишем слово за словом, в нусахе общины.',
      rab_hOito:'Восемь кадишей', rab_yatom:'Кадиш сироты', rab_derabanan:'Кадиш мудрецов',
      rodape:'Бесплатно · без регистрации · без рекламы'},
  he:{dir:'rtl',sub:'אין צורך לדעת לקרוא כדי לומר קדיש. האפליקציה מלמדת מילה במילה.',
      hComo:'איך משתמשים',
      passos:['כוונו את מצלמת הטלפון אל הקוד שלמעלה.','אם תרצו, הוסיפו את האפליקציה למסך הבית, לפי ההוראות שלמעלה.','בחרו את הנוסח ואת סוג הקדיש. השמע מתחיל ב- ▶.','עקבו: המילה הנאמרת נדלקת בטקסט.','בחרו להסתיר או להדגיש את העברית, התעתיק או התרגום.','השתמשו במצב אימון כדי ללמוד פסוק אחר פסוק, בחזרות כרצונכם.','הקדישו את הקדיש לאדם וקבעו תזכורות ליארצייט — יום השנה לפטירה, שבו אומרים קדיש שוב.','הפעילו השתקה כדי לעקוב אחר הטקסט בשקט.'],
      hOque:'מה האפליקציה עושה',
      oque:['הקלטת הרב מסונכרנת מילה במילה.','עברית, תעתיק ותרגום, בשמונה שפות.','מצב אימון, שעוצר בכל פסוק כדי לחזור עליו.','להקדיש את הקדיש לאדם, ותזכורת ליארצייט.','כפתור השתקה, כדי לעקוב אחר הטקסט בשקט.'],
      icone_ios:'פתחו את הכתובת ב<b>ספארי</b>. הקישו על שיתוף, גללו את הרשימה למטה והקישו על “הוסף למסך הבית”.',icone_android:'פתחו ב<b>כרום</b>. הדפדפן מציע “התקנה” — הקשה אחת.',
      qr:'כוונו את המצלמה. עובד באייפון ובאנדרואיד, בלי להתקין דבר.',
      nota:'הקדיש טעון מניין (עשרה גברים בוגרים המתפללים יחד) והוא נאמר בעמידה. רגילים לאומרו בבית הכנסת במשך תקופת האבלות.',
      rab_sub:'לבית הכנסת — האבל שאינו קורא עברית עוקב אחר הקדיש מילה במילה, לפי נוסח בית הכנסת.',
      rab_hOito:'שמונת הקדישים', rab_yatom:'קדיש יתום', rab_derabanan:'קדיש דרבנן',
      rodape:'חינם · ללא הרשמה · ללא פרסומות'},
};
