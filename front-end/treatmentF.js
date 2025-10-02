document.addEventListener("DOMContentLoaded", async () => {
    const patientId = localStorage.getItem("patientId");
    const patientInfoCard = document.getElementById("patientInfoCard");

    if (!patientId) {
        Swal.fire("No Patient Selected", "Please register/select a patient first.", "warning");
        return;
    }

    // ------------------ Helpers ------------------
    function updateCheckboxes(dataArray, className) {
        if (!Array.isArray(dataArray)) return;
        document.querySelectorAll(`.${className}`).forEach(cb => {
            if (dataArray.includes(cb.value)) cb.checked = true;
        });
    }

    function createNoteRow(noteData = { note: '', teethInvolved: [], date: '' }) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td class="border p-2"><input type="text" class="w-full border p-1 rounded" placeholder="Enter note..." value="${noteData.note}"></td>
            <td class="border p-2">
                <div class="flex flex-wrap gap-2">
                    ${[...Array(8).keys()].map(i => `<label><input type="checkbox" value="${i + 1}" ${noteData.teethInvolved.includes(String(i + 1)) ? 'checked' : ''}><span>${i + 1}</span></label>`).join('')}
                    ${["A", "B", "C", "D", "E"].map(l => `<label><input type="checkbox" value="${l}" ${noteData.teethInvolved.includes(l) ? 'checked' : ''}><span>${l}</span></label>`).join('')}
                </div>
            </td>
            <td class="border p-2"><input type="date" class="border p-1 rounded w-full" value="${noteData.date ? new Date(noteData.date).toISOString().split('T')[0] : ''}"></td>
            <td class="border p-2 text-center"><button type="button" class="bg-red-500 text-white px-2 py-1 rounded deleteRow">Delete</button></td>
        `;
        return newRow;
    }

    function createDrugRow(drugData = { medicineName: '', dosage: '', duration: '3days', instructions: '' }) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td class="border p-2"><input type="text" class="w-full border p-1 rounded medName" value="${drugData.medicineName}"></td>
            <td class="border p-2"><input type="text" class="w-full border p-1 rounded dosage" value="${drugData.dosage}"></td>
            <td class="border p-2">
                <select class="duration-select w-full border p-1 rounded">
                    <option value="3days" ${drugData.duration === '3days' ? 'selected' : ''}>3 Days</option>
                    <option value="5days" ${drugData.duration === '5days' ? 'selected' : ''}>5 Days</option>
                    <option value="7days" ${drugData.duration === '7days' ? 'selected' : ''}>7 Days</option>
                </select>
            </td>
            <td class="border p-2"><input type="text" class="w-full border p-1 rounded instructions" value="${drugData.instructions}"></td>
            <td class="border p-2 text-center"><button type="button" class="bg-red-500 text-white px-2 py-1 rounded deleteDrug">Delete</button></td>
        `;
        return newRow;
    }

    async function renderOptions(containerId, endpoint, checkboxClass) {
        const container = document.getElementById(containerId);
        const innerDiv = container.querySelector('div');
        try {
            const response = await fetch(`http://localhost:5000/options/${endpoint}`);
            if (!response.ok) throw new Error('Failed to load options');
            const options = await response.json();
            innerDiv.innerHTML = options.map(opt => `
                <label class="flex items-center gap-2">
                    <input type="checkbox" class="${checkboxClass}" value="${opt.value}">
                    <span>${opt.value}</span>
                </label>
            `).join('');
        } catch (err) {
            innerDiv.innerHTML = `<p class="text-red-500">Failed to load options</p>`;
            console.error(err);
        }
    }

    // ------------------ Load Options ------------------
    await renderOptions("ccConditions", "cc", "cc-checkbox");
    await renderOptions("hoConditions", "ho", "ho-checkbox");
    await renderOptions("ssConditions", "ss", "ss-checkbox");
    await renderOptions("dxConditions", "dx", "dx-checkbox");
    await renderOptions("tpConditions", "tp", "tp-checkbox");
    await renderOptions("investigationsOptions", "io", "io-checkbox");

    setupTreatmentCheckboxes("cc-checkbox");
    setupTreatmentCheckboxes("ho-checkbox");
    setupTreatmentCheckboxes("ss-checkbox");
    setupTreatmentCheckboxes("dx-checkbox");
    setupTreatmentCheckboxes("tp-checkbox");

    // ------------------ Fetch Patient Info ------------------
    try {
        const response = await fetch(`http://localhost:5000/patients/id/${patientId}`);
        if (!response.ok) {
            Swal.fire("Error", "Patient not found!", "error");
            return;
        }
        const data = await response.json();

        patientInfoCard.classList.remove("hidden");
        document.getElementById("patientIdDisplay").textContent = data.patientId || "---";
        document.getElementById("patientNameDisplay").textContent = data.name || "---";
        document.getElementById("patientAgeDisplay").textContent = data.age || "---";
        document.getElementById("patientGenderDisplay").textContent = data.gender || "---";

        updateCheckboxes(data.cc, 'cc-checkbox');
        updateCheckboxes(data.ho, 'ho-checkbox');
        updateCheckboxes(data.ss, 'ss-checkbox');
        updateCheckboxes(data.dx, 'dx-checkbox');
        updateCheckboxes(data.tp, 'tp-checkbox');
        updateCheckboxes(data.io, 'io-checkbox');

        const notesBody = document.getElementById("notesBody");
        notesBody.innerHTML = '';
        if (data.treatmentNotes) data.treatmentNotes.forEach(note => notesBody.appendChild(createNoteRow(note)));

        const drugBody = document.querySelector("#drugTable tbody");
        drugBody.innerHTML = '';
        if (data.drugHistory) data.drugHistory.forEach(drug => drugBody.appendChild(createDrugRow(drug)));
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Server not responding!", "error");
    }

    function addTreatmentNote(treatmentName) {
        const notesBody = document.getElementById("notesBody");
        const exists = Array.from(notesBody.querySelectorAll("tr input[type='text']")).some(input => input.value === treatmentName);
        if (exists) return;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="border p-2"><input type="text" class="w-full border p-1 rounded" value="${treatmentName}" readonly></td>
            <td class="border p-2">
                <div class="flex flex-col gap-1">
                    <div class="flex flex-wrap gap-2">
                        <strong class="w-full text-sm">Lower Jaw:</strong>
                        ${[...Array(8).keys()].map(i => `<label><input type="checkbox" value="${i + 1}"><span>${i + 1}</span></label>`).join('')}
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <strong class="w-full text-sm">Upper Jaw:</strong>
                        ${[...Array(8).keys()].map(i => `<label><input type="checkbox" value="${i + 9}"><span>${i + 1}</span></label>`).join('')}
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <strong class="w-full text-sm">Letters:</strong>
                        ${["A", "B", "C", "D", "E"].map(l => `<label><input type="checkbox" value="${l}"><span>${l}</span></label>`).join('')}
                    </div>
                </div>
            </td>
            <td class="border p-2"><input type="date" class="border p-1 rounded w-full" value="${new Date().toISOString().split('T')[0]}"></td>
            <td class="border p-2 text-center"><button type="button" class="bg-red-500 text-white px-2 py-1 rounded deleteRow">Delete</button></td>
        `;
        notesBody.appendChild(row);
    }

    function setupTreatmentCheckboxes(className) {
        document.querySelectorAll(`.${className}`).forEach(cb => {
            cb.addEventListener("change", (e) => {
                if (e.target.checked) addTreatmentNote(cb.value);
                else {
                    const notesBody = document.getElementById("notesBody");
                    Array.from(notesBody.querySelectorAll("tr")).forEach(row => {
                        if (row.querySelector("input[type='text']").value === cb.value) row.remove();
                    });
                }
            });
        });
    }

    // ------------------ Event Listeners ------------------
    const notesBody = document.getElementById("notesBody");
    document.getElementById("addRow").addEventListener("click", () => notesBody.appendChild(createNoteRow()));
    notesBody.addEventListener("click", e => { if (e.target.classList.contains('deleteRow')) e.target.closest('tr').remove(); });

    const drugBody = document.querySelector("#drugTable tbody");
    document.getElementById("addDrugRow").addEventListener("click", () => drugBody.appendChild(createDrugRow()));
    drugBody.addEventListener("click", e => { if (e.target.classList.contains('deleteDrug')) e.target.closest('tr').remove(); });

    // ------------------ Reports Upload ------------------
    const reportContainer = document.getElementById("reportContainer");
    const reportUpload = document.getElementById("reportUpload");
    const addReportBtn = document.getElementById("addReportBtn");

    addReportBtn.addEventListener("click", () => {
        const files = Array.from(reportUpload.files);
        if (files.length === 0) {
            Swal.fire("No File Selected", "Please select file(s) first.", "warning");
            return;
        }

        files.forEach(file => {
            const div = document.createElement("div");
            div.className = "report-card flex justify-between items-center bg-gray-100 p-3 rounded shadow-sm";

            const span = document.createElement("span");
            span.textContent = `${file.name} - ${new Date().toLocaleDateString()}`;

            const btn = document.createElement("button");
            btn.className = "bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition";
            btn.textContent = "X";
            btn.addEventListener("click", () => div.remove());

            div.appendChild(span);
            div.appendChild(btn);
            reportContainer.appendChild(div);
        });

        reportUpload.value = "";
    });

    // ------------------ Save & Generate PDF ------------------
    document.getElementById("savePrintBtn").addEventListener("click", () => {
        const getCheckedValues = (className) => Array.from(document.querySelectorAll(`.${className}:checked`)).map(cb => cb.value).join(", ");

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();

        // HEADER
        doc.setFillColor(173, 216, 230);
        doc.rect(0, 0, pageWidth, 100, 'F');
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Umme Habiba", 20, 15);
        doc.setFont("helvetica", "normal");
        doc.text("BSc-Dental", 20, 27);
        doc.text("University of Dhaka, DU Reg No:4668", 20, 39);
        doc.text("MPH,Bangladesh University of Health  Science(BUHS)", 20, 51);
         doc.text("Former TA at BUHS", 20, 63);

         
const logoBase64="data:image/png;base64,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";
const logoWidth = 70;
const logoHeight = 35;
const logoX = (pageWidth - logoWidth) / 2 + 35;
const logoY = (100-logoHeight)/2 +10;

// Add image
// Add the logo instead
const logoPath = "http://localhost:5000/images/logo.png"; // URL served by Express
doc.addImage(logoPath, "PNG", (pageWidth - 100) / 2, 60, 100, 50);


        const rightX = pageWidth - 120;
        doc.setFont("helvetica", "bold");
        doc.text("Dr. Abantika Mondal", rightX, 15);
        doc.setFont("helvetica", "normal");
        doc.text("BDS (Dental Surgeon)", rightX, 27);
        doc.text("University of Dhaka", rightX, 39);
        doc.text("BMDC Reg No:15043", rightX, 51);

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
       
        
//doc.text("Smile Dental Care", pageWidth / 2, yPosition + logoHeight + 10, { align: "center" });
//doc.text("Smile Dental Care", pageWidth / 2, 80, { align: "center" });
        


        doc.setLineWidth(1);
        doc.line(20, 110, pageWidth - 20, 110);

        // PATIENT INFO
        const pidText = document.getElementById("patientIdDisplay").textContent;
        const pname = document.getElementById("patientNameDisplay").textContent;
        const page = document.getElementById("patientAgeDisplay").textContent;
        const pgender = document.getElementById("patientGenderDisplay").textContent;
        const date = new Date().toLocaleDateString();

        const infoY = 135;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Name: ${pname}`, 20, infoY);
        doc.text(`Age: ${page}`, 160, infoY);
        doc.text(`Sex: ${pgender}`, 220, infoY);
        doc.text(`Patient ID: ${pidText}`, 300, infoY);       //overl of sex
        doc.text(`Date: ${date}`, 450, infoY);
        doc.setLineWidth(0.5);
        doc.line(20, infoY + 6, pageWidth - 20, infoY + 6);

        // LEFT COLUMN
        const splitX = 230;
        doc.setDrawColor(150);
        doc.setLineWidth(0.5);
        doc.line(splitX, infoY + 10, splitX, 750);

        const leftColX = 20;
        const leftColY = infoY + 20;
        const leftColWidth = splitX - 30;
        const leftColHeight = 580;
        const sectionHeight = leftColHeight / 5;
const sections = [
    { label: "C/C:", values: getCheckedValues('cc-checkbox') },
    { label: "S/S:", values: getCheckedValues('ss-checkbox') },
    { label: "Investigations:", values: getCheckedValues('io-checkbox') },
    { label: "Dx:", values: getCheckedValues('dx-checkbox') },
   { label: "Treatment Plan:", values: getTreatmentNotes().join("; ") } 
];
// Collect treatment notes (with teeth selections)
function getTreatmentNotes() {
    const rows = document.querySelectorAll("#notesBody tr");
    return Array.from(rows).map(row => {
        const treatmentName = row.querySelector("td input[type='text']").value || "";

        // Lower jaw
        const lower = Array.from(row.querySelectorAll("td input[type='checkbox']:nth-child(n)")) // selector for lower jaw checkboxes
            .filter(cb => cb.checked && parseInt(cb.value) >= 1 && parseInt(cb.value) <= 8)
            .map(cb => cb.value);

        // Upper jaw
        const upper = Array.from(row.querySelectorAll("td input[type='checkbox']"))
            .filter(cb => cb.checked && parseInt(cb.value) >= 9 && parseInt(cb.value) <= 16)
            .map(cb => (parseInt(cb.value) - 8).toString()); // convert 9-16 to 1-8 for display

        // Letters
        const letters = Array.from(row.querySelectorAll("td input[type='checkbox']"))
            .filter(cb => cb.checked && isNaN(cb.value))
            .map(cb => cb.value);

        

        let teethText = "";
        if (lower.length) teethText += `Lower Jaw: ${lower.join(", ")}`;
        if (upper.length) teethText += teethText ? ` | Upper Jaw: ${upper.join(", ")}` : `Upper Jaw: ${upper.join(", ")}`;
        if (letters.length) teethText += teethText ? ` | Letters: ${letters.join(", ")}` : `Letters: ${letters.join(", ")}`;

        return `${treatmentName}${teethText ? " (" + teethText + ")" : ""}`;
    }).filter(note => note.trim() !== "");
}


sections.forEach((sec, i) => {
    const y = leftColY + i * sectionHeight;
    doc.rect(leftColX, y, leftColWidth, sectionHeight);
    doc.setFont("helvetica", "bold");
    doc.text(sec.label, leftColX + 5, y + 15);
    doc.setFont("helvetica", "normal");

    if(sec.values) {
        const wrappedText = doc.splitTextToSize(sec.values, leftColWidth - 10);
        doc.text(wrappedText, leftColX + 5, y + 30); // only once, no duplication
    }
});


        // DRUG TABLE
        const drugs = Array.from(document.querySelectorAll("#drugTable tbody tr"))
            .map(row => [
                row.querySelector(".medName")?.value || "",
                row.querySelector(".dosage")?.value || "",
                row.querySelector(".duration-select")?.value || "",
                row.querySelector(".instructions")?.value || ""
            ])
            .filter(row => row.some(cell => cell.trim() !== ""));

        const tableStartY = 160;
        if (drugs.length > 0) {
            doc.autoTable({
                startY: tableStartY,
                head: [['Medicine', 'Dosage', 'Duration', 'Instructions']],
                body: drugs,
                theme: 'grid',
                margin: { left: splitX + 10 },
                tableWidth: pageWidth - (splitX + 30),
                headStyles: { fillColor: [173, 216, 230] },
            });
        }

        // NEXT VISIT
        const nextVisitDate = document.getElementById("nextVisitDate").value;
        const nextVisitTime = document.getElementById("nextVisitTime").value;
        const nextVisitNo = document.getElementById("nextVisitNo").value;
        const nextVisitRef = document.getElementById("nextVisitRef").value;

        const nextY = (doc.lastAutoTable?.finalY || tableStartY) + 25;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Next Visit:", splitX + 10, nextY);
        doc.setFont("helvetica", "normal");
        const baseRightX = splitX + 10;
        const colSpacing = 90;
        doc.text(`Date: ${nextVisitDate}`, baseRightX, nextY + 12);
        doc.text(`Time: ${nextVisitTime}`, baseRightX + colSpacing, nextY + 12);
        doc.text(`Visit #: ${nextVisitNo}`, baseRightX + 2 * colSpacing, nextY + 12);
        doc.text(`Ref By: ${nextVisitRef}`, baseRightX + 3 * colSpacing, nextY + 12);

        // FOOTER
        const footerHeight = 70;
        const footerY = 780;
        const footerRightX = pageWidth - 200;
        doc.setFillColor(173, 216, 230);
        doc.rect(0, footerY - 10, pageWidth, footerHeight, 'F');
        doc.setLineWidth(0.5);
        doc.setDrawColor(0);
        doc.line(20, footerY, pageWidth - 20, footerY);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Smile Dental Care\n56/3/A, West Panthapath, Dhaka-1205", 20, footerY + 15);
        doc.setFont("helvetica", "bold");
        doc.text("Contact:", footerRightX, footerY + 10);
        doc.setFont("helvetica", "normal");
        doc.text("+8801672583513 (Call)", footerRightX, footerY + 22);
        doc.text("WhatsApp: +8801926837653", footerRightX, footerY + 34);
        doc.setFont("helvetica", "bold");
        doc.text("Visiting Hours:", footerRightX, footerY + 46);
        doc.setFont("helvetica", "normal");
        doc.text("10am-1pm & 4pm-9pm (Friday on Call)", footerRightX, footerY + 58);

        // SAVE PDF
        const patientID = document.getElementById("patientIdDisplay").textContent;
        doc.save(`${patientID}_Prescription.pdf`);
        setTimeout(() => {
            window.location.href = "PaymentnContract.html";
        }, 500);
    });
   

});
