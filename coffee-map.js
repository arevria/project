document.addEventListener("DOMContentLoaded", () => {
    const map = document.querySelector(".philippine-coffee-map");
    if (!map) {
        return;
    }

    const markers = Array.from(map.querySelectorAll(".coffee-map-marker"));
    const details = Array.from(map.querySelectorAll("[data-region-detail]"));
    const emptyState = map.querySelector("#coffee-map-empty");
    const detailsPanel = map.querySelector(".coffee-map-details");

    if (markers.length === 0 || details.length === 0 || !emptyState || !detailsPanel) {
        console.error("The Philippine coffee map markup is incomplete.");
        return;
    }

    let hoveredMarker = null;
    let focusedMarker = null;
    let pinnedMarker = null;
    let displayedMarker = null;
    let detailsHovered = false;
    let resetTimer;

    const showRegion = marker => {
        const detail = details.find(item => item.dataset.regionDetail === marker.dataset.region);
        if (!detail) {
            console.error(`No coffee-map details found for region "${marker.dataset.region}".`);
            return;
        }

        displayedMarker = marker;
        markers.forEach(item => {
            item.classList.toggle("is-active", item === marker);
            item.setAttribute("aria-pressed", String(item === pinnedMarker));
        });

        details.forEach(item => {
            item.hidden = item !== detail;
        });
        emptyState.hidden = true;
    };

    const showEmptyState = () => {
        displayedMarker = null;
        markers.forEach(marker => {
            marker.classList.remove("is-active");
            marker.setAttribute("aria-pressed", "false");
        });
        details.forEach(detail => {
            detail.hidden = true;
        });
        emptyState.hidden = false;
    };

    const render = () => {
        const marker = hoveredMarker
            || focusedMarker
            || (detailsHovered && displayedMarker)
            || pinnedMarker;

        if (marker) {
            showRegion(marker);
        } else {
            showEmptyState();
        }
    };

    const scheduleRender = () => {
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(render, 180);
    };

    markers.forEach(marker => {
        marker.addEventListener("mouseenter", () => {
            window.clearTimeout(resetTimer);
            hoveredMarker = marker;
            render();
        });
        marker.addEventListener("mouseleave", () => {
            if (hoveredMarker === marker) {
                hoveredMarker = null;
            }
            scheduleRender();
        });
        marker.addEventListener("focus", () => {
            focusedMarker = marker;
            render();
        });
        marker.addEventListener("blur", () => {
            if (focusedMarker === marker) {
                focusedMarker = null;
            }
            scheduleRender();
        });
        marker.addEventListener("click", () => {
            if (pinnedMarker === marker) {
                pinnedMarker = null;
                if (hoveredMarker === marker) {
                    hoveredMarker = null;
                }
                if (focusedMarker === marker) {
                    focusedMarker = null;
                }
                showEmptyState();
                return;
            }

            pinnedMarker = marker;
            render();
        });
    });

    detailsPanel.addEventListener("mouseenter", () => {
        window.clearTimeout(resetTimer);
        detailsHovered = true;
    });
    detailsPanel.addEventListener("mouseleave", () => {
        detailsHovered = false;
        scheduleRender();
    });
});
