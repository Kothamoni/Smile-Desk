document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("patientForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const ageInput = document.getElementById("age").value.trim();
    const gender = document.getElementById("gender").value;
    const address = document.getElementById("address").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!name || !gender || !phone) {
      Swal.fire("Missing Fields", "Please fill Name, Gender, and Phone.", "warning");
      return;
    }

    const ageValue = Number(ageInput);
    if ( ageValue <= 0) {
      Swal.fire("Invalid Age", "Please enter a valid positive number for age.", "warning");
      return;
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      Swal.fire("Invalid Phone", "Enter a valid phone number (10-15 digits).", "warning");
      return;
    }

    const formData = { name, gender, address, phone };
    if (!isNaN(ageValue) && ageValue > 0) formData.age = ageValue;

    try {
      const response = await fetch("http://localhost:5000/patients/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const patientId = data.patient.patientId;
        localStorage.setItem("patientId", patientId);

        Swal.fire({
          icon: "success",
          title: "Patient Registered!",
          html: `Patient ID: <b>${patientId}</b><br>Redirecting...`,
          showConfirmButton: false,
          timer: 2500,
        });

        setTimeout(() => {
          window.location.href = "treatment.html";
        }, 2500);
      } else {
        Swal.fire("Error", data.error || "Something went wrong!", "error");
      }

    } catch (err) {
      Swal.fire("Error", "Server not responding!", "error");
      console.error(err);
    }
  });
});
