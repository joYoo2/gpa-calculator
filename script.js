
// JavaScript code remains the same as in your original version
const gradeToGPA = {
    "A+": 4.3, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "D-": 0.7,
    "F": 0.0
};
const years = ["freshman", "sophomore", "junior", "senior"];

function createYearSection(year) {
    const container = document.getElementById("year-sections");
    const div = document.createElement("div");
    div.className = "year-box";
    div.style.paddingBottom = "6px";
    div.style.marginBottom = "8px";
    const capitalizedYear = year.charAt(0).toUpperCase() + year.slice(1);
    div.innerHTML = `
        <h2 class="year-header">${capitalizedYear}</h2>
        <table id="${year}" class="year-table">
            <tr>
                <th>Course (optional)</th>
                <th>Grade</th>
                <th>Credits</th>
                <th style="min-width: 70px;">Type</th>
                <th style="width: 12px;"></th>
            </tr>
        </table>
        <button onclick="addClassRow('${year}')">+ Add Class</button>
    `;
    container.appendChild(div);
    addClassRow(year);
}

function addClassRow(year) {
    const table = document.getElementById(year);
    const row = document.createElement("tr");
    row.innerHTML = createRowHTML();
    table.appendChild(row);
}

function createRowHTML(course = "", grade = "", credits = "", type = "cp") {
    return `
        <tr>
            <td><input type="text" value="${course}" /></td>
            <td>
                <select class="grade">
                    ${["", "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"].map(opt =>
                        `<option value="${opt}" ${opt === grade ? "selected" : ""}>${opt}</option>`).join("")}
                </select>
            </td>
            <td><input type="number" class="credits" value="${credits}" min="0" step="0.5" /></td>
            <td>
                <select class="type">
                    ${["cp", "honors", "ap"].map(opt =>
                        `<option value="${opt}" ${opt === type ? "selected" : ""}>${opt}</option>`).join("")}
                </select>
            </td>
            <td><button onclick="this.closest('tr').remove()" style="padding:2px 5px; font-size:12px;">✕</button></td>
        </tr>
    `;
}

document.getElementById("calculate").addEventListener("click", function () {
    let totalPoints = 0;
    let totalCredits = 0;
    const summaryLines = [];

    years.forEach(year => {
        let yearPoints = 0;
        let yearCredits = 0;
        const table = document.getElementById(year);
        const rows = table.querySelectorAll("tr");
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const grade = row.querySelector(".grade")?.value;
            const credit = parseFloat(row.querySelector(".credits")?.value);
            const type = row.querySelector(".type")?.value;

            if (grade && !isNaN(credit)) {
                let gpa = gradeToGPA[grade];
                if (type === "honors") gpa += 0.3;
                if (type === "ap") gpa += 0.5;
                yearPoints += gpa * credit;
                yearCredits += credit;
            }
        }

        if (yearCredits > 0) {
            const yearGPA = (yearPoints / yearCredits).toFixed(4);
            summaryLines.push(`<strong>${year.charAt(0).toUpperCase() + year.slice(1)}:</strong> GPA = ${yearGPA}, Credits = ${yearCredits}`);
            totalPoints += yearPoints;
            totalCredits += yearCredits;
        }
    });

    const finalGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(4) : "N/A";
    document.getElementById("result").textContent = `GPA: ${finalGPA}`;
    document.getElementById("summary").innerHTML = summaryLines.join("<br>");
});

function exportData() {
    const lines = [];
    years.forEach(year => {
        const table = document.getElementById(year);
        const rows = table.querySelectorAll("tr");
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const course = row.querySelector("input[type='text']")?.value || "";
            const grade = row.querySelector(".grade")?.value || "";
            const credits = row.querySelector(".credits")?.value || "";
            const type = row.querySelector(".type")?.value || "";
            lines.push(`${year}|${course}|${grade}|${credits}|${type}`);
        }
    });

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "gpa_data.txt";
    link.click();
}

function importData() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const lines = e.target.result.split("\n");
        years.forEach(year => {
            const table = document.getElementById(year);
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
        });
        lines.forEach(line => {
            const [year, course, grade, credits, type] = line.trim().split("|");
            if (!years.includes(year)) return;
            const table = document.getElementById(year);
            const row = document.createElement("tr");
            row.innerHTML = createRowHTML(course, grade, credits, type);
            table.appendChild(row);
        });
    };
    reader.readAsText(file);
}

years.forEach(createYearSection);

function calculateFinalGrade() {
    const isAP = document.getElementById("isAP").checked;
    const isSemester = document.getElementById("isSemester").checked;

    const inputs = document.querySelectorAll("#grade-inputs select");
    const weights = [];
    let grades = [];

    inputs.forEach(input => {
        const val = input.value.trim();
        if (val && gradeToGPA[val]) {
            grades.push(gradeToGPA[val]);
        } else {
            grades.push(NaN);
        }
    });

    if (grades.some(isNaN)) {
        document.getElementById("final-grade-result").textContent = "Please enter valid letter grades.";
        return;
    }

    if (isAP && isSemester) {
        weights.push(0.5, 0.5);
    } else if (isAP && !isSemester) {
        weights.push(0.25, 0.25, 0.25, 0.25);
    } else if (!isAP && isSemester) {
        weights.push(0.45, 0.45, 0.10);
    } else {
        weights.push(0.225, 0.225, 0.225, 0.225, 0.10);
    }

    const weightedSum = grades.reduce((acc, val, i) => acc + val * weights[i], 0);
    const rounded = Math.round(weightedSum * 100) / 100;

    // find closest matching GPA value
    let closest = null;
    let minDiff = Infinity;
    for (const [letter, gpa] of Object.entries(gradeToGPA)) {
        const diff = Math.abs(gpa - rounded);
        if (diff < minDiff || (diff === minDiff && gpa > gradeToGPA[closest])) {
            minDiff = diff;
            closest = letter;
        }
    }

    document.getElementById("final-grade-result").textContent = `Final Letter Grade: ${closest}`;
}

document.getElementById("isAP").addEventListener("change", generateFinalGradeInputs);
document.getElementById("isSemester").addEventListener("change", generateFinalGradeInputs);

function generateFinalGradeInputs() {
    const container = document.getElementById("grade-inputs");
    const previousValues = Array.from(container.querySelectorAll("select")).map(select => select.value);
    container.innerHTML = "";
    const isAP = document.getElementById("isAP").checked;
    const isSemester = document.getElementById("isSemester").checked;
    let labels = [];

    if (isAP && isSemester) {
        labels = ["Half 1", "Half 2"];
    } else if (isAP) {
        labels = ["MP1", "MP2", "MP3", "MP4"];
    } else if (isSemester) {
        labels = ["Half 1", "Half 2", "Final"];
    } else {
        labels = ["MP1", "MP2", "MP3", "MP4", "Final"];
    }

    labels.forEach((label, index) => {
        const div = document.createElement("div");
        const value = previousValues[index] || "";
        div.innerHTML = `<div style="display: flex; align-items: center; min-width: 180px; gap: 5px;"><label style="white-space: nowrap; width: 80px;">${label}:</label><select style="flex: 1;">
            <option value=""></option>
            ${["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"].map(opt => `<option value="${opt}" ${opt === value ? 'selected' : ''}>${opt}</option>`).join("")}
        </select></div>`;
        container.appendChild(div);
    });
}

generateFinalGradeInputs();
