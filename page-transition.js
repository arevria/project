(() => {
    const transitionPages = new Set(["about.html", "why-coffee.html"]);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isLeaving = false;

    document.addEventListener("click", event => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const link = event.target.closest("a[href]");
        if (
            !link ||
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            link.hasAttribute("download") ||
            (link.target && link.target !== "_self") ||
            reducedMotion.matches
        ) {
            return;
        }

        const destination = new URL(link.href, window.location.href);
        const currentDirectory = window.location.pathname.slice(
            0,
            window.location.pathname.lastIndexOf("/") + 1
        );
        const destinationPage = destination.pathname.slice(
            destination.pathname.lastIndexOf("/") + 1
        ).toLowerCase();

        if (
            destination.protocol !== window.location.protocol ||
            !destination.pathname.startsWith(currentDirectory) ||
            !transitionPages.has(destinationPage) ||
            destination.pathname === window.location.pathname
        ) {
            return;
        }

        event.preventDefault();
        if (isLeaving) {
            return;
        }

        isLeaving = true;
        document.body.classList.add("page-transition-leaving");
        window.setTimeout(() => window.location.assign(destination.href), 180);
    });
})();
