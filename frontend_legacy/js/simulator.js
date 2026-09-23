function initSimulator() {
    const btnDry = document.getElementById("preset-dry");
    const btnModerate = document.getElementById("preset-moderate");
    const btnHeavy = document.getElementById("preset-heavy");
    const btnCloudburst = document.getElementById("preset-cloudburst");
    const btnApply = document.getElementById("btn-apply-sim");

    const sliderRain = document.getElementById("sim-rain");
    const sliderRiver = document.getElementById("sim-river");
    const sliderRise = document.getElementById("sim-rise");
    const sliderSoil = document.getElementById("sim-soil");

    const valRain = document.getElementById("val-sim-rain");
    const valRiver = document.getElementById("val-sim-river");
    const valRise = document.getElementById("val-sim-rise");
    const valSoil = document.getElementById("val-sim-soil");

    function updateSliderLabels() {
        if (sliderRain && valRain) valRain.innerText = `${sliderRain.value} mm`;
        if (sliderRiver && valRiver) valRiver.innerText = `${sliderRiver.value} m`;
        if (sliderRise && valRise) valRise.innerText = `${sliderRise.value > 0 ? '+' : ''}${sliderRise.value} m/h`;
        if (sliderSoil && valSoil) valSoil.innerText = `${sliderSoil.value}%`;
    }

    [sliderRain, sliderRiver, sliderRise, sliderSoil].forEach(s => {
        if (s) s.addEventListener("input", updateSliderLabels);
    });

    function setPreset(rain, river, rise, soil, presetName) {
        if (sliderRain) sliderRain.value = rain;
        if (sliderRiver) sliderRiver.value = river;
        if (sliderRise) sliderRise.value = rise;
        if (sliderSoil) sliderSoil.value = soil;
        updateSliderLabels();

        document.querySelectorAll(".btn-preset").forEach(b => b.classList.remove("active"));
        const activeBtn = document.getElementById(`preset-${presetName}`);
        if (activeBtn) activeBtn.classList.add("active");
    }

    if (btnDry) btnDry.addEventListener("click", () => setPreset(0, 1.2, -0.05, 25, "dry"));
    if (btnModerate) btnModerate.addEventListener("click", () => setPreset(18, 2.3, 0.15, 62, "moderate"));
    if (btnHeavy) btnHeavy.addEventListener("click", () => setPreset(54, 3.6, 0.45, 84, "heavy"));
    if (btnCloudburst) btnCloudburst.addEventListener("click", () => setPreset(88, 4.8, 0.85, 95, "cloudburst"));

    if (btnApply) {
        btnApply.addEventListener("click", async () => {
            if (!currentVillageId) return;

            btnApply.disabled = true;
            btnApply.innerText = "Applying Scenario to AI Model...";

            const payload = {
                village_id: currentVillageId,
                scenario: "custom",
                custom_rainfall_1h: parseFloat(sliderRain.value),
                custom_river_level_m: parseFloat(sliderRiver.value),
                custom_river_rise_rate: parseFloat(sliderRise.value),
                custom_soil_moisture: parseFloat(sliderSoil.value)
            };

            try {
                const resp = await fetch("/api/iot/simulate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const resData = await resp.json();
                
                // Show brief success alert
                btnApply.innerText = "Scenario Applied! Refreshing...";
                
                // Re-fetch flood prediction
                await loadVillagePrediction(currentVillageId);
                
                // Switch to Monitor Tab to view the new risk
                switchTab("monitor");
            } catch (err) {
                console.error("Simulation error:", err);
                alert("Failed to apply simulation: " + err.message);
            } finally {
                btnApply.disabled = false;
                btnApply.innerText = "Apply Scenario to Model";
            }
        });
    }

    updateSliderLabels();
}
