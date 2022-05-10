// Runtime variables
const version = "2.2.1";

// Add BetterVisma stylesheet
const styleLink = document.createElement("link");
styleLink.setAttribute("href", browser.runtime.getURL("bettervisma.css"));
styleLink.setAttribute("rel", "stylesheet");
styleLink.id = "bettervisma-style";
document.head.appendChild(styleLink);

// Add google fonts
const googleFontsLink = document.createElement("link");
googleFontsLink.setAttribute("href", "https://fonts.googleapis.com/icon?family=Material+Icons");
googleFontsLink.setAttribute("rel", "stylesheet");
googleFontsLink.id = "bettervisma-font-link"
document.head.appendChild(googleFontsLink);

// Create export button
const exportButton = document.createElement("button");
exportButton.innerHTML = "Eksporter til kalender";
exportButton.id = "bettervisma-export"
exportButton.addEventListener("click", () => exportCalendar());

// Create help button
const helpButton = document.createElement("span");
helpButton.id = "bettervisma-help";
helpButton.innerHTML = "help_outline";
helpButton.classList.add("material-icons");
helpButton.addEventListener("click", () => helpDialog.showModal());

// Create help dialog
const helpDialog = document.createElement("dialog");
helpDialog.id = "bettervisma-help-dialog";
helpDialog.innerHTML = `
    <h1>Hvordan eksportere til kalender</h1>
    <p>Trykk på <button id="bettervisma-export" style="transform: unset">Eksporter
        til kalender</button>. Dette vil laste ned en <code>.ics</code> fil for uken du har åpen. Du kan legge denne
        filen inn direkte i din personlige kalender, eller importere den i f.eks. Google kalender.</p>
    <p><i><b>NB!</b> Eksportert timeplan blir ikke automatisk oppdatert, og blir heller ikke slettet hvis du
        importerer på nytt. Pass på å slette eksisterende kalender hvis du vil importere på nytt.</i></p>
    <button onclick="this.parentElement.close()">Lukk</button>
`;
helpDialog.querySelector("#bettervisma-export").addEventListener("click", () => exportCalendar());

// Create update dialog
const updateDialog = document.createElement("dialog");
updateDialog.id = "bettervisma-update-dialog";
updateDialog.innerHTML = `
    <h1>BetterVisma har blitt oppdatert!</h1>
    <h3>Nytt i versjon ${version}:</h3>
    <ul>
        <li>Det er nå tydeligere å se hvor lenge av dagen er igjen</li>
        <li>Hjelpemenyen er blitt utbedret</li>
        <li>Fikset en bug der enkelte elementer ikke ble vist på mindre skjermer</li>
    </ul>
    <button onclick="this.parentElement.close();localStorage['bettervisma-version'] = ${version}">Lukk</button>
`;

// Add elements to document
document.body.appendChild(helpDialog);
document.body.appendChild(updateDialog);
console.info("[BetterVisma] [INFO] Finished loading");

// Add elements on mutation
let observer = new MutationObserver(() =>
{
    const node = document.querySelector(".userTimetable_timetableFilters_left");

    if (node)
    {
        // Inject elements
        node.appendChild(exportButton);
        node.appendChild(helpButton);

        // Restart observer for page redirects
        observer.disconnect();
        setTimeout(() => observer.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false }), 100);
    }
})

// Start observer
observer.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false });

// Greet user after a timeout to avoid warning spam
setTimeout(() =>
{
    // Clear all errors posted by Visma for no reason
    console.clear();

    // Print welcome message
    console.log("%c[BetterVisma] Using BetterVisma", `
        font-size: 1.6rem;
    `);
    console.info("Version 2.0");
    console.info("%chttps://yessness.com/bettervisma", `
        color: #007aca;
    `);

    // Open update dialog if the user is on a new version
    if ((localStorage["bettervisma-version"] || 0) !== version) updateDialog.showModal();
}, 2000);

// Function for exporting the calendar
function exportCalendar()
{
    // Log progress
    console.info("[BetterVisma] [INFO] Attempting export...");

    // Create calendar object
    const calendar = ics();

    // Store dates for current week
    const dates = (() =>
    {
        // Create result object
        const result = [];

        // Initialise day to the first day of the week
        let day = (() =>
        {
            // Get and format current date from UI
            const inputDate = document.querySelector(".vsware-input.form-control.vs-Flatpickr.flatpickr-input").value.split(".");
            const formattedDate = `${inputDate[1]}/${inputDate[0]}/${inputDate[2]}`;

            // Get offset to first day of week
            const date = new Date(Date.parse(formattedDate));
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);

            // Calculate first day of week
            const firstDay = new Date(date.setDate(diff));
            console.debug("[BetterVisma] [DEBUG] Determined week start: " + firstDay);
            return firstDay;
        })();

        // Add dates to result
        for (let i = 0; i < 5; i++)
        {
            result.push(day.toString());
            day.setDate(day.getDate() + 1);
        }

        console.debug("[BetterVisma] [DEBUG] Received dates: " + result);
        return result;
    })();

    // Get items in timetable
    let day = -1;
    let lastOffset = 0;
    console.debug("[BetterVisma] [DEBUG] Saving data from timetable...");
    document.querySelectorAll(".Timetable-TimetableItem").forEach(e =>
    {
        // Get data from timetable item
        let startTime, endTime, subject, location;
        try
        {
            startTime = e.querySelector(".Timetable-TimetableItem-hours").innerHTML.substring(48, 53);
            endTime = e.querySelector(".Timetable-TimetableItem-hours").innerHTML.substring(56, 61);
            subject = e.querySelector(".Timetable-TimetableItem-subject-name").innerHTML.trim();
            location = e.querySelector(".Timetable-TimetableItem-location").innerHTML.substring(53).trim();
        }
        catch
        {
            console.warn(`[BetterVisma] [WARN] Failed to parse location for timetable item ${subject}, does it have one? Continuing without location.`);
        }

        // Parse time
        const startHours = parseInt(startTime.substring(0, 2));
        const startMinutes = parseInt(startTime.substring(3, 5));

        const endHours = parseInt(endTime.substring(0, 2));
        const endMinutes = parseInt(endTime.substring(3, 5));

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
    calendar.download('visma-export', '.ics');
    console.info("[BetterVisma] [INFO] Export successful, file downloaded");
}
