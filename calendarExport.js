// Add custom stylesheet
const stylesheet = document.createElement("style");
stylesheet.innerHTML = `
#bettervisma-export
{
    background: transparent;
    border: 1px solid #b6bec4;
    border-radius: 2px;
    padding: 7.5px;
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;
}
`;

document.head.appendChild(stylesheet);

// Create export button
const exportButton = document.createElement("button");

exportButton.innerHTML = "Eksporter til kalender";
exportButton.id = "bettervisma-export"
exportButton.onclick = exportCalendar;

// Add export button on mutation
let observer = new MutationObserver(() =>
{
    const node = document.querySelector(".userTimetable_timetableFilters");

    if (node != null)
    {
        node.appendChild(exportButton);
        observer.disconnect();
        setTimeout(() => observer.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false }), 100);
    }
})

// Start observer
observer.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false });

// Function for exporting the calendar
function exportCalendar()
{
    // Create calendar object
    const calendar = ics();

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

    // Get items in timetable
    let day = -1;
    let lastOffset = 0;
    document.querySelectorAll(".Timetable-TimetableItem").forEach(e =>
    {
        // Get data from timetable item
        const startTime = e.querySelector(".Timetable-TimetableItem-hours").innerHTML.substr(-14, 5);
        const endTime = e.querySelector(".Timetable-TimetableItem-hours").innerHTML.substr(-6, 5);
        const subject = e.querySelector(".Timetable-TimetableItem-subject-name").innerHTML;
        const location = e.querySelector(".Timetable-TimetableItem-location").innerHTML.substr(-5, 4).trim();

        // Parse hours and minutes
        const startHours = parseInt(startTime.substr(0, 2));
        const startMinutes = parseInt(startTime.substr(3, 2));

        const endHours = parseInt(endTime.substr(0, 2));
        const endMinutes = parseInt(endTime.substr(3, 2));

        // Increment day when needed
        const currentOffset = e.getBoundingClientRect().left;
        if (currentOffset > lastOffset) day++;
        lastOffset = currentOffset;

        // Create Date objects for start and end
        const startDate = new Date(Date.parse(dates[day]));
        const endDate = new Date(Date.parse(dates[day]));

        startDate.setHours(startHours, startMinutes);
        endDate.setHours(endHours, endMinutes);

        // Add events to calendar
        calendar.addEvent(subject, "", `Rom ${location}`, startDate, endDate);
    });

    // Download the calendar file in .ics format
    calendar.download('visma', '.ics');
}