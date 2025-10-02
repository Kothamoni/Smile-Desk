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

    // Setup checkboxes for auto treatment note
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
                if (e.target.checked) {
                    addTreatmentNote(cb.value);
                } else {
                    const notesBody = document.getElementById("notesBody");
                    Array.from(notesBody.querySelectorAll("tr")).forEach(row => {
                        if (row.querySelector("input[type='text']").value === cb.value) {
                            row.remove();
                        }
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
        const textMaxWidth = 120;

        const getCheckedValues = (className) => {
            return Array.from(document.querySelectorAll(`.${className}:checked`))
                .map(cb => cb.value).join(", ");
        };

        const formatTeeth = (teethString) => {
            if (!teethString) return '';
            const teethArray = teethString.split(',').map(t => t.trim());
            const upper = [], lower = [], letters = [];

            teethArray.forEach(t => {
                const num = parseInt(t);
                if (!isNaN(num)) {
                    if (num >= 9 && num <= 16) upper.push(num - 8);
                    else if (num >= 1 && num <= 8) lower.push(num);
                } else if (t.match(/[A-E]/i)) letters.push(t);
            });

            let result = [];
            if (upper.length > 0) result.push(`Upper: ${upper.join(', ')}`);
            if (lower.length > 0) result.push(`Lower: ${lower.join(', ')}`);
            if (letters.length > 0) result.push(`Letters: ${letters.join(', ')}`);
            return result.join(' | ');
        };

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();

        // HEADER background + info
        doc.setFillColor(173, 216, 230);
        doc.rect(0, 0, pageWidth, 100, 'F');

        let headerY = 15;
        doc.setFontSize(10);
        doc.setTextColor(0);

        doc.setFont("helvetica", "bold");
        doc.text("Umme Habiba", 20, headerY);
        doc.setFont("helvetica", "normal");
        doc.text("BSc-Dental", 20, headerY + 12);
        doc.text("University of Dhaka, DU Reg No:4668", 20, headerY + 24);
        doc.text("MPH, Bangladesh University of Health & Science (BUHS)", 20, headerY + 36);
        doc.text("Former TA at BUHS", 20, headerY + 48);

        const rightX = pageWidth - 160;   /////right side of abantika
        doc.setFont("helvetica", "bold");
        doc.text("Dr. Abantika Mondal", rightX, headerY);
        doc.setFont("helvetica", "normal");
        doc.text("BDS (Dental Surgeon)", rightX, headerY + 12);
        doc.text("University of Dhaka", rightX, headerY + 24);
        doc.text("BMDC Reg No:15043", rightX, headerY + 36);

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Smile Dental Care", pageWidth / 2, 80, { align: "center" });

        doc.setDrawColor(0);
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
        doc.text(`Sex: ${pgender}`, 260, infoY);
        doc.text(`Patient ID: ${pidText}`, 300, infoY); //spacing for patient id
        doc.text(`Date: ${date}`, 450, infoY);

        doc.setLineWidth(0.5);
        doc.line(20, infoY + 6, pageWidth - 20, infoY + 6);

        // LEFT column
        let leftY = infoY + 25;
        const leftX = 20;
        const colMaxWidth = 200;
        const sectionSpacing = 25;

        function addLeftSection(label, values) {
            doc.setFont("helvetica", "bold");
            doc.text(label, leftX, leftY);
            doc.setFont("helvetica", "normal");
            doc.text(values, leftX + 50, leftY, { maxWidth: colMaxWidth });
            leftY += sectionSpacing;
        }

        addLeftSection("C/C:", getCheckedValues('cc-checkbox'));
        addLeftSection("S/S:", getCheckedValues('ss-checkbox'));
        addLeftSection("Investigations:", getCheckedValues('io-checkbox'));
        addLeftSection("Dx:", getCheckedValues('dx-checkbox'));

        const notes = Array.from(document.querySelectorAll("#notesBody tr"))
            .map(row => {
                const note = row.querySelector('input[type="text"]')?.value || "";
                const teeth = row.querySelectorAll('input[type="checkbox"]:checked');
                const teethString = Array.from(teeth).map(cb => cb.value).join(",");
                return { note, teeth: teethString };
            })
            .filter(row => row.note.trim() !== "");

        if (notes.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.text("Treatment Plan:", leftX, leftY);
            leftY += 15;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            notes.forEach(n => {
                const formattedTeeth = formatTeeth(n.teeth);
                doc.text(`• ${n.note}`, leftX, leftY, { maxWidth: colMaxWidth });
                leftY += 12;
                if (formattedTeeth) {
                    doc.setFont("helvetica", "italic");
                    doc.text(`   (${formattedTeeth})`, leftX + 10, leftY, { maxWidth: colMaxWidth - 20 });
                    doc.setFont("helvetica", "normal");
                    leftY += 12;
                }
            });
        }

        // Separation line
        const splitX = 230;
        doc.setDrawColor(150);
        doc.setLineWidth(0.5);
        doc.line(splitX, infoY + 10, splitX, 750);

        // DRUG table
        const drugs = Array.from(document.querySelectorAll("#drugTable tbody tr"))
            .map(row => {
                const med = row.querySelector(".medName")?.value || "";
                const dose = row.querySelector(".dosage")?.value || "";
                const dur = row.querySelector(".duration-select")?.value || "";
                const ins = row.querySelector(".instructions")?.value || "";
                return [med, dose, dur, ins];
            })
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

        // NEXT visit
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
