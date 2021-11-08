// Create calendar object
const calendar = ics();

// Add events to calendar
calendar.addEvent("Test subject", "Test description", "Test location", "8/11/2021 17:00", "8/11/2021 18:00");
calendar.addEvent("Test subject 2", "Test description 2", "Test location 2", "8/11/2021 19:00", "8/11/2021 20:00");

// Create export button
const exportButton = document.createElement("button");

exportButton.innerHTML = "Export to calendar";
exportButton.onclick = () => calendar.download('test-event', '.ics');

// Style export button
exportButton.style.background = "transparent";
exportButton.style.border = "1px solid #b6bec4";
exportButton.style.borderRadius = "2px";
exportButton.style.padding = "7.5px";
exportButton.style.fontSize = "14px";
exportButton.style.fontWeight = "600";
exportButton.style.fontWeight = "600";
exportButton.style.lineHeight = "16px";

// Add export button on mutation
let observer = new MutationObserver(() =>
{
    const parentNode = document.querySelector(".userTimetable_timetableFilters");

    if (parentNode != null)
    {
        parentNode.appendChild(exportButton);
        observer.disconnect();
        setTimeout(() => observer.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false }), 100);
    }
})

// Start observer
observer.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false });