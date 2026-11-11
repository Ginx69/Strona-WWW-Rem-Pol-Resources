# Rem-Pol Resources — makieta strony głównej

React 19 + Vite 6 + Tailwind CSS 4. Wymagany Node.js 22+ oraz npm.

## Uruchomienie

```sh
npm ci
npm run dev
```

Otwórz adres pokazany przez Vite (domyślnie port 5173) w lokalnej przeglądarce.

```sh
npm run build
npm run preview
```

## Edycja

Przycisk **Edit Mode** otwiera panel. Przeciągaj sekcje, klikaj ich nazwy lub tekst na stronie. Panel pozwala ustawiać widoczność, wysokości, odstępy, treści, media, kolory i wielkości. Podgląd desktop/tablet/mobile zmienia szerokość makiety. Cofanie i ponawianie obejmuje ustawienia projektu.

Zmiany zapisują się w localStorage bieżącej przeglądarki. W zakładce Projekt można zapisać i importować JSON oraz pobrać ZIP zawierający źródła i settings.json. Po uruchomieniu wyeksportowanego projektu zaimportuj settings.json. Duże media mogą przekroczyć pojemność localStorage: eksport JSON zachowuje bieżące media również wtedy, gdy zapis lokalny się nie udał. Wideo: MP4/WebM, autoplay muted loop, poster jako zastępstwo. Limit wgrywanego pliku: 40 MB; dla większego filmu użyj URL.

## Materiały i zakres

Logo jest pokazane w rozmowie, ale jego oryginalny plik nie jest dostępny w checkoutcie; nie zostało odrysowane ani wygenerowane. Film nie został dostarczony. Wgraj logo w Styl, film w Hero. Tekst w nagłówku jest neutralnym miejscem na oryginalny znak, nie rekonstrukcją logo. Lokalne wizualizacje przemysłowe są wygenerowane przez AI wyłącznie na potrzeby makiety. Nie przedstawiają pracowników, stoczni ani realizacji firmy. Można je zastąpić własnymi zdjęciami w panelu. Dane kontaktowe i liczby pozostawiono do uzupełnienia.

EN/NO/PL to demonstracja wyboru języka; tłumaczenia nie są wdrożone. Projects i treść rekrutacyjna pokazują komunikaty makiety. Nie utworzono podstron, backendu, CMS ani formularza zbierającego dane.

## Środowisko chmurowe

Korzystaj z istniejącego checkoutu /workspace/Strona-WWW-Rem-Pol-Resources. Zadania są izolowane; nie twórz dodatkowego worktree bez wyraźnej prośby. Instalacja: npm ci. Start: npm run dev -- --host 0.0.0.0. Weryfikacja: npm run build oraz testy przeglądarki. Proces Vite trzeba ponownie uruchomić w nowym zadaniu.

## Weryfikacja

`npm run build` sprawdza kompilację. `npm test` obejmuje testy migracji poprzednich ustawień, działania suwaków na desktop/mobile oraz testy przeglądarkowe: edytor i eksport, widok mobilny i rekrutację oraz wgrany film i błędny import. Testy automatycznie uruchamiają Vite, jeśli nie działa. W tym środowisku używają /usr/bin/chromium; na innym komputerze wykonaj najpierw `npx playwright install chromium` lub ustaw PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.

W panelu sekcji są też przyciski strzałek do zmiany kolejności bez przeciągania. Aby przekazać projekt agencji, użyj Edit Mode → Projekt → Eksportuj projekt ZIP.

## Wzór wizualny

Układ strony głównej dostosowano do przesłanej referencji: białe menu, hero ze stocznią, pasek wartości, cztery zwarte karty usług, sekcja firmy z ukośnym czerwonym podziałem i fiordem oraz sekcja rekrutacyjna ze zdjęciem zespołu. Font Inter jest dołączony lokalnie, bez połączenia z Google Fonts. Liczby z referencji pozostają pustymi polami, ponieważ nie są potwierdzonymi danymi firmy.

Starsze ustawienia w localStorage oraz starsze pliki JSON są migrowane: pola niezmienione przez użytkownika przyjmują nowy wygląd, a własne treści, media, kolory, kolejność i widoczność są zachowane.

## Strona w pojedynczym pliku HTML

`npm run build:standalone` tworzy `artifacts/rempol-interactive.html`. Ten plik zawiera aplikację, zdjęcia i czcionki; można go pobrać i otworzyć w zwykłej przeglądarce bez instalowania Node ani uruchamiania serwera. Edit Mode, import/eksport ustawień i eksport źródeł ZIP pozostają dostępne. Zapis ustawień korzysta z localStorage danej przeglądarki — eksport JSON pozwala przenieść projekt do innej przeglądarki.

Wersja HTML jest dodatkowym sposobem otwierania tej samej makiety. Standardowy projekt React/Vite nadal uruchamia się przez `npm run dev`.

## Publikacja w GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` buduje i publikuje makietę po zmianie gałęzi `main`. Można go również uruchomić ręcznie w zakładce Actions jako **Deploy homepage to GitHub Pages**. Adres opublikowanej strony jest wynikiem kroku **Publish website** oraz wdrożenia środowiska `github-pages`.

Przed pierwszym wdrożeniem GitHub Pages musi być włączone dla tego repozytorium ze źródłem **GitHub Actions** (Settings → Pages → Build and deployment → Source). Można to ustawić w panelu lub przez autoryzowane API GitHub z uprawnieniami do zarządzania Pages. Sam standardowy `GITHUB_TOKEN` workflow nie wystarcza do pierwszego włączenia Pages; dlatego workflow nie próbuje obchodzić tego ustawienia ani nie wymaga własnego tokenu w sekretach repozytorium.

Workflow korzysta z Node.js 22, `npm ci` i polecenia `npm run build -- --base "${{ steps.pages.outputs.base_path }}/"`. Dla tego repozytorium ścieżką jest `/Strona-WWW-Rem-Pol-Resources/`. Lokalne sprawdzenie takiego buildu:

```sh
npm run build -- --base=/Strona-WWW-Rem-Pol-Resources/
npm run preview
```

Otwórz ścieżkę `/Strona-WWW-Rem-Pol-Resources/` na serwerze preview. Zdjęcia, czcionki i eksport ZIP muszą działać również pod tym prefiksem. Konfiguracja workflow jest przygotowaniem publikacji; dopiero udane wdrożenie i sprawdzenie adresu potwierdzają, że strona jest dostępna publicznie.
