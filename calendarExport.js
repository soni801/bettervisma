// Create export button
const exportButton = document.createElement("button");

exportButton.innerHTML = "Eksporter til kalender";
exportButton.onclick = exportCalendar;

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

// Function for exporting the calendar
function exportCalendar()
{
    // Store dates for current week
    const dates = (() =>
    {
        // Create result object
        const result = [];

        // Get the first date
        const firstDate = (() =>
        {
            const date = document.querySelector(".vsware-input.form-control.vs-Flatpickr.flatpickr-input.dateControl-flatpickr").value.split(".");
            return `${date[1]}/${date[0]}/${date[2]}`;
        })();

        // Create Date object
        let day = new Date(Date.parse(firstDate));

        // Add dates to result
        for (let i = 0; i < 5; i++)
        {
            result.push(day.toString());
            day.setDate(day.getDate() + 1);
        }

        return result;
    })();

    // Get events in timetable
    let day = 0;
    let lastTime = 0;
    document.querySelectorAll(".Timetable-TimetableItem").forEach(e =>
    {
        const startTime = e.querySelector(".Timetable-TimetableItem-hours").innerHTML.substr(-14, 5);
        const endTime = e.querySelector(".Timetable-TimetableItem-hours").innerHTML.substr(-6, 5);
        const subject = e.querySelector(".Timetable-TimetableItem-subject-name").innerHTML;
        const location = e.querySelector(".Timetable-TimetableItem-location").innerHTML.substr(-4, 3); // FIXME: Does not work when location is GymX

        const startHours = parseInt(startTime.substr(0, 2));
        const startMinutes = parseInt(startTime.substr(3, 2));

        const endHours = parseInt(endTime.substr(0, 2));
        const endMinutes = parseInt(endTime.substr(3, 2));

        const startDate = new Date(Date.parse(dates[day]));
        const endDate = new Date(Date.parse(dates[day]));

        startDate.setHours(startHours, startMinutes);
        endDate.setHours(endHours, endMinutes);

        // FIXME: This way of doing time calculation can fail in very rare cases, consider using left offset instead
        const currentTime = parseInt(startTime.substr(0, 2));
        if (currentTime < lastTime) day++;
        lastTime = currentTime;

        console.log(startDate, endDate, subject, `Rom ${location}`);
    });

    // Create calendar object
    const calendar = ics();

    // Add events to calendar
    for (let i = 0; i < 5; i++)
    {
        calendar.addEvent(`Day ${i + 1}`, "Description", "Location", dates[i], dates[i]);
    }

    // calendar.download('visma', '.ics');
}