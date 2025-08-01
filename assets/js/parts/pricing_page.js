const pricingPage = () => {
  const studentCountRange = document.querySelector(".student-count-range");
  const studentCountInput = document.querySelector(".student-count-input");
  const studentCountRangeIndicator = document.querySelector(".student-count-range-indicator");
  const featureCards = document.querySelectorAll(".feature-card");
  const featureNavItems = document.querySelectorAll(".features-nav-item");

  function setupStudentCountControls() {
    const max = +studentCountRange.max;
    const min = +studentCountRange.min;
    const defaultValue = studentCountRange.value;

    const handleStudentCountChange = (newValue) => {
      // Ensure value is within min and max bounds
      if (newValue < min && newValue !== "") {
        newValue = min;
      } else if (newValue > max) {
        newValue = max;
      }

      // Update both controls
      studentCountRange.value = studentCountInput.value = studentCountRangeIndicator.textContent = newValue;

      // Indicator fallback for empty value
      if (newValue === "") {
        studentCountRangeIndicator.textContent = "-";
        studentCountRange.value = 0;
      }

      // Set css variable for the indicator position and the range background linear gradient
      const percentageValue = ((studentCountRange.value / (max - min)) * 100).toFixed(2);
      document.documentElement.style.setProperty("--student-count-percentage", `${percentageValue}%`);

      // Update pricing calculations
      updatePricingDisplay();
    };

    handleStudentCountChange(defaultValue);

    studentCountRange.addEventListener("input", (e) => handleStudentCountChange(e.target.value));
    studentCountInput.addEventListener("input", (e) => handleStudentCountChange(e.target.value));
  }

  function setupModuleControls() {
    const optionalModules = document.querySelectorAll('input[type="checkbox"][data-cost]:not([disabled])');

    optionalModules.forEach((module) => {
      module.addEventListener("change", updatePricingDisplay);
    });

    updatePricingDisplay();
  }

  function calculatePricing() {
    const selectedModules = document.querySelectorAll('input[type="checkbox"][data-cost]:checked');
    const studentCount = parseInt(studentCountRange.value);

    let pricePerStudentNet = 0;
    selectedModules.forEach((module) => {
      pricePerStudentNet += getModuleCost(module);
    });

    const VAT_RATE = 0.23;
    const pricePerStudentGross = pricePerStudentNet * (1 + VAT_RATE);

    const monthlyCostNet = pricePerStudentNet * studentCount;
    const monthlyCostGross = pricePerStudentGross * studentCount;

    return {
      studentCount,
      pricePerStudentNet,
      monthlyCostNet,
      monthlyCostGross,
    };
  }

  function updatePricingDisplay() {
    const pricing = calculatePricing();

    // Update display elements
    document.getElementById("student-count-display").textContent = pricing.studentCount.toString();
    document.getElementById("price-per-student").textContent = formatPrice(pricing.pricePerStudentNet);
    document.getElementById("monthly-cost-net").textContent = formatPrice(pricing.monthlyCostNet);
    document.getElementById("monthly-cost-gross").textContent = formatPrice(pricing.monthlyCostGross);
  }

  function updateActiveStates(activeId) {
    featureNavItems.forEach((item) => {
      const isActive = getTargetId(item) === activeId;
      item.classList.toggle("active", isActive);
    });

    featureCards.forEach((card) => {
      const isActive = card.id === activeId;
      card.classList.toggle("active", isActive);
    });
  }

  function setupScrollSpy() {
    // Track which cards are currently in viewport
    const visibleCards = new Set();

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        console.log("entries", entries);
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleCards.add(entry.target.id);
          } else {
            visibleCards.delete(entry.target.id);
          }
        });

        // Find the topmost visible card to make it active
        if (visibleCards.size > 0) {
          let topMostCard = null;
          let topMostPosition = Infinity;

          visibleCards.forEach((cardId) => {
            const card = document.getElementById(cardId);
            const rect = card.getBoundingClientRect();

            // Choose the card that is closest to the top of the viewport
            // or already past the top but still visible
            if (rect.top < topMostPosition) {
              topMostPosition = rect.top;
              topMostCard = cardId;
            }
          });

          if (topMostCard) {
            updateActiveStates(topMostCard);
          }
        }
      },
      {
        // Trigger when card starts entering viewport from bottom or top
        threshold: [0, 0.1],
        // Add larger margin to trigger earlier when card starts leaving viewport
        rootMargin: "-200px 0px -200px 0px",
      }
    );

    // Observe all feature cards
    featureCards.forEach((card) => {
      observer.observe(card);
    });
  }

  function setupPricingSummaryButton() {
    const pricingSummaryBtn = document.querySelector(".pricing-summary-btn");

    if (pricingSummaryBtn) {
      pricingSummaryBtn.addEventListener("click", showPricingSummary);
    }
  }

  function showPricingSummary() {
    const pricing = calculatePricing();
    const selectedModules = document.querySelectorAll('input[type="checkbox"][data-cost]:checked');

    const selectedModulesList = Array.from(selectedModules).map((module) => {
      const label = document.querySelector(`label[for="${module.id}"]`);
      const moduleName = label ? label.textContent : module.id;
      const cost = getModuleCost(module);

      return {
        name: moduleName,
        cost: cost,
        costFormatted: formatPrice(cost),
      };
    });

    const summary = `
=== PODSUMOWANIE CENNIKA ===

Liczba słuchaczy: ${pricing.studentCount}

Wybrane moduły:
${selectedModulesList.map((module) => `• ${module.name} - ${module.costFormatted} za słuchacza`).join("\n")}

Miesięczna cena za słuchacza (netto): ${formatPrice(pricing.pricePerStudentNet)}
Miesięczny koszt netto: ${formatPrice(pricing.monthlyCostNet)}
Miesięczny koszt brutto: ${formatPrice(pricing.monthlyCostGross)}
    `;

    console.log(summary);
    alert(summary);
  }

  // Handle feature navigation clicks
  featureNavItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      const targetId = getTargetId(e.target);
      updateActiveStates(targetId);
    });
  });

  setupScrollSpy();
  setupStudentCountControls();
  setupModuleControls();
  setupPricingSummaryButton();
};

function getModuleCost(module) {
  return parseFloat(module.getAttribute("data-cost")) || 0;
}

function formatPrice(price) {
  return `${price.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} zł`;
}

function getTargetId(item) {
  return item.href.split("#")[1];
}

export { pricingPage };
