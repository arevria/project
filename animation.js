document.addEventListener("DOMContentLoaded", () => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const panelWrap = document.querySelector(".feature-panel-wrap");
    const tabList = document.querySelector(".features");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (tabs.length && panelWrap && tabList) {
        let scrollTimer;
        let scrollFrame;
        let shouldScrollToPanel = false;

        const scrollToElement = (element, alignToTop) => {
            if (scrollFrame) {
                window.cancelAnimationFrame(scrollFrame);
                scrollFrame = null;
            }

            const rect = element.getBoundingClientRect();
            const currentY = window.scrollY;
            const stickyOffset = element === panelWrap
                ? tabList.getBoundingClientRect().height
                : 24;
            let targetY = currentY;

            if (alignToTop) {
                targetY += rect.top - 24;
            } else if (rect.height > window.innerHeight - 48) {
                targetY += rect.top - stickyOffset;
            } else if (rect.bottom > window.innerHeight) {
                targetY += rect.bottom - window.innerHeight + 20;
            } else if (rect.top < 0) {
                targetY += rect.top - 20;
            }

            const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
            targetY = Math.max(0, Math.min(targetY, maxScrollY));

            if (prefersReducedMotion || Math.abs(targetY - currentY) < 1) {
                window.scrollTo(0, targetY);
                return;
            }

            const duration = 1200;
            const startTime = performance.now();
            const distance = targetY - currentY;

            const animateScroll = timestamp => {
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const easedProgress = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                window.scrollTo(0, currentY + distance * easedProgress);

                if (progress < 1) {
                    scrollFrame = window.requestAnimationFrame(animateScroll);
                } else {
                    scrollFrame = null;
                }
            };

            scrollFrame = window.requestAnimationFrame(animateScroll);
        };

        const closeTabs = tab => {
            panelWrap.style.height = `${panelWrap.getBoundingClientRect().height}px`;
            tabs.forEach(candidate => {
                candidate.setAttribute("aria-selected", "false");
                candidate.tabIndex = candidate === tab ? 0 : -1;

                const panel = document.getElementById(candidate.getAttribute("aria-controls"));
                if (panel) {
                    panel.hidden = true;
                }
            });

            panelWrap.classList.remove("is-open");
            shouldScrollToPanel = false;
            window.clearTimeout(scrollTimer);
            window.requestAnimationFrame(() => {
                panelWrap.style.height = "0px";
            });
            scrollToElement(tabList, true);
        };

        const selectTab = (tab, moveFocus) => {
            const isOpen = panelWrap.classList.contains("is-open");
            if (isOpen) {
                panelWrap.style.height = `${panelWrap.getBoundingClientRect().height}px`;
            }

            tabs.forEach(candidate => {
                const isSelected = candidate === tab;
                candidate.setAttribute("aria-selected", String(isSelected));
                candidate.tabIndex = isSelected ? 0 : -1;

                const panel = document.getElementById(candidate.getAttribute("aria-controls"));
                if (panel) {
                    panel.hidden = !isSelected;
                }
            });

            panelWrap.classList.add("is-open");
            shouldScrollToPanel = true;
            window.clearTimeout(scrollTimer);
            if (prefersReducedMotion) {
                panelWrap.style.height = "auto";
                scrollToElement(panelWrap, false);
                shouldScrollToPanel = false;
            } else {
                window.requestAnimationFrame(() => {
                    panelWrap.style.height = `${panelWrap.scrollHeight}px`;
                });
                scrollTimer = window.setTimeout(() => {
                    if (shouldScrollToPanel) {
                        scrollToElement(panelWrap, false);
                        shouldScrollToPanel = false;
                    }
                }, 500);
            }

            if (moveFocus) {
                tab.focus();
            }
        };

        panelWrap.addEventListener("transitionend", event => {
            if (event.propertyName === "height") {
                if (panelWrap.classList.contains("is-open")) {
                    panelWrap.style.height = "auto";
                    if (shouldScrollToPanel) {
                        window.clearTimeout(scrollTimer);
                        scrollToElement(panelWrap, false);
                        shouldScrollToPanel = false;
                    }
                } else {
                    panelWrap.style.height = "";
                }
            }
        });

        tabs.forEach((tab, index) => {
            tab.addEventListener("click", () => {
                if (tab.getAttribute("aria-selected") === "true") {
                    closeTabs(tab);
                } else {
                    selectTab(tab, false);
                }
            });
            tab.addEventListener("keydown", event => {
                let nextIndex;
                if (event.key === "ArrowRight") {
                    nextIndex = (index + 1) % tabs.length;
                } else if (event.key === "ArrowLeft") {
                    nextIndex = (index - 1 + tabs.length) % tabs.length;
                } else if (event.key === "Home") {
                    nextIndex = 0;
                } else if (event.key === "End") {
                    nextIndex = tabs.length - 1;
                } else {
                    return;
                }

                event.preventDefault();
                selectTab(tabs[nextIndex], true);
            });
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slideshow .slide"));

    if (slides.length < 2) {
        return;
    }

    const fadeDuration = 1200;
    const displayDuration = 6000;
    let currentSlide = null;
    let timer;

    const availableSlides = () => slides.filter(
        slide => slide.dataset.failed !== "true" && slide.complete && slide.naturalWidth > 0
    );

    const start = () => {
        const available = availableSlides();
        if (available.length === 0) {
            timer = window.setTimeout(start, 250);
            return;
        }

        currentSlide = slides.find(
            slide => slide.classList.contains("active") && available.includes(slide)
        ) || available[0];
        currentSlide.classList.add("active");
        currentSlide.style.zIndex = "1";
        timer = window.setTimeout(advance, displayDuration);
    };

    function advance() {
        const available = availableSlides();
        if (available.length < 2 || !currentSlide) {
            timer = window.setTimeout(advance, 1000);
            return;
        }

        const currentIndex = available.indexOf(currentSlide);
        const nextSlide = available[(currentIndex + 1) % available.length];
        nextSlide.style.zIndex = "2";
        nextSlide.classList.add("active");

        timer = window.setTimeout(() => {
            currentSlide.classList.remove("active");
            currentSlide.style.zIndex = "";
            nextSlide.style.zIndex = "1";
            currentSlide = nextSlide;
            timer = window.setTimeout(advance, displayDuration);
        }, fadeDuration);
    }

    slides.forEach(slide => {
        slide.addEventListener("error", () => {
            slide.dataset.failed = "true";
            slide.classList.remove("active");
            if (slide === currentSlide) {
                window.clearTimeout(timer);
                currentSlide = null;
                start();
            }
        });
    });

    start();
});
