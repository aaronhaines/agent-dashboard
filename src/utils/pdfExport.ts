import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Styles specifically for PDF generation to avoid interfering with regular styles
const PDF_STYLES = `
  /* Base styles */
  .dashboard-content-pdf {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    padding: 1rem;
    background: rgb(17, 24, 39);
    width: 100%;
    min-height: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }
  
  .dashboard-content-pdf .module-card {
    background: rgb(31, 41, 55);
    border: 1px solid rgb(55, 65, 81);
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* Force all text colors to use RGB */
  .dashboard-content-pdf * {
    color: rgb(255, 255, 255) !important;
  }

  /* Background colors */
  .dashboard-content-pdf .bg-gray-600 { background-color: rgb(75, 85, 99) !important; }
  .dashboard-content-pdf .bg-gray-700 { background-color: rgb(55, 65, 81) !important; }
  .dashboard-content-pdf .bg-gray-800 { background-color: rgb(31, 41, 55) !important; }
  .dashboard-content-pdf .bg-gray-900 { background-color: rgb(17, 24, 39) !important; }
  .dashboard-content-pdf .bg-blue-500 { background-color: rgb(59, 130, 246) !important; }
  .dashboard-content-pdf .bg-blue-600 { background-color: rgb(37, 99, 235) !important; }
  .dashboard-content-pdf .bg-indigo-500 { background-color: rgb(99, 102, 241) !important; }
  .dashboard-content-pdf .bg-indigo-600 { background-color: rgb(79, 70, 229) !important; }
  
  /* Text colors */
  .dashboard-content-pdf .text-white { color: rgb(255, 255, 255) !important; }
  .dashboard-content-pdf .text-gray-100 { color: rgb(243, 244, 246) !important; }
  .dashboard-content-pdf .text-gray-200 { color: rgb(229, 231, 235) !important; }
  .dashboard-content-pdf .text-gray-300 { color: rgb(209, 213, 219) !important; }
  .dashboard-content-pdf .text-gray-400 { color: rgb(156, 163, 175) !important; }
  .dashboard-content-pdf .text-blue-300 { color: rgb(147, 197, 253) !important; }
  .dashboard-content-pdf .text-green-300 { color: rgb(134, 239, 172) !important; }
  .dashboard-content-pdf .text-red-300 { color: rgb(252, 165, 165) !important; }
  .dashboard-content-pdf .text-yellow-300 { color: rgb(253, 224, 71) !important; }
  .dashboard-content-pdf .text-purple-300 { color: rgb(216, 180, 254) !important; }
  .dashboard-content-pdf .text-orange-300 { color: rgb(253, 186, 116) !important; }
  
  /* Border colors */
  .dashboard-content-pdf .border-gray-600 { border-color: rgb(75, 85, 99) !important; }
  .dashboard-content-pdf .border-gray-700 { border-color: rgb(55, 65, 81) !important; }
  .dashboard-content-pdf .border-gray-800 { border-color: rgb(31, 41, 55) !important; }
`;

// Default colors to use when encountering unsupported color formats
const DEFAULT_COLORS = {
  text: "rgb(255, 255, 255)",
  background: "rgb(31, 41, 55)",
  border: "rgb(55, 65, 81)",
};

// Function to process all elements and convert modern color formats
function preprocessColors(element: HTMLElement) {
  const elements = element.getElementsByTagName("*");

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLElement;
    const computedStyle = window.getComputedStyle(el);

    // Check for and convert any modern color formats
    const colorProps = [
      "color",
      "background-color",
      "border-color",
      "fill",
      "stroke",
    ];

    colorProps.forEach((prop) => {
      const value = computedStyle.getPropertyValue(prop);
      if (value.includes("oklab") || value.includes("oklch")) {
        switch (prop) {
          case "color":
            el.style.setProperty(prop, DEFAULT_COLORS.text, "important");
            break;
          case "background-color":
            el.style.setProperty(prop, DEFAULT_COLORS.background, "important");
            break;
          case "border-color":
            el.style.setProperty(prop, DEFAULT_COLORS.border, "important");
            break;
          case "fill":
          case "stroke":
            el.style.setProperty(prop, DEFAULT_COLORS.text, "important");
            break;
        }
      }
    });

    // Handle Tailwind classes that might use modern colors
    // Convert className to string, handling both string and DOMTokenList cases
    const classNames =
      typeof el.className === "string"
        ? el.className
        : (el.className as SVGAnimatedString)?.baseVal || "";

    if (classNames) {
      if (classNames.includes("bg-"))
        el.style.backgroundColor = DEFAULT_COLORS.background;
      if (classNames.includes("text-")) el.style.color = DEFAULT_COLORS.text;
      if (classNames.includes("border-"))
        el.style.borderColor = DEFAULT_COLORS.border;
    }
  }
}

export const exportDashboardToPdf = async (filename?: string) => {
  try {
    const dashboard = document.querySelector(".dashboard-content");
    if (!dashboard) {
      throw new Error("Dashboard element not found");
    }

    // Get the actual dimensions of the dashboard content
    const dashboardRect = dashboard.getBoundingClientRect();
    const contentWidth = Math.max(dashboardRect.width, dashboard.scrollWidth);
    const contentHeight = Math.max(
      dashboardRect.height,
      dashboard.scrollHeight
    );

    // Create a clone of the dashboard for PDF export
    const clone = dashboard.cloneNode(true) as HTMLElement;
    clone.className = "dashboard-content-pdf";
    clone.style.width = `${contentWidth}px`;
    clone.style.minHeight = `${contentHeight}px`;

    // Create and append temporary elements
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.width = `${contentWidth}px`;
    tempContainer.style.minHeight = `${contentHeight}px`;
    tempContainer.style.backgroundColor = "rgb(17, 24, 39)"; // bg-gray-900
    tempContainer.appendChild(clone);

    // Add PDF styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = PDF_STYLES;
    document.head.appendChild(styleSheet);
    document.body.appendChild(tempContainer);

    // Preprocess colors before html2canvas runs
    preprocessColors(clone);

    // Force all charts and SVGs to use compatible colors
    const charts = clone.querySelectorAll("canvas, svg");
    charts.forEach((chart) => {
      const element = chart as HTMLElement;
      element.style.backgroundColor = DEFAULT_COLORS.background;
      element.style.color = DEFAULT_COLORS.text;
    });

    // Wait for any charts or images to load
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate PDF
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: contentWidth,
      height: contentHeight,
      backgroundColor: "#111827", // bg-gray-900
      onclone: (clonedDoc) => {
        // Additional preprocessing for the cloned document
        const clonedElement = clonedDoc.querySelector(
          ".dashboard-content-pdf"
        ) as HTMLElement;
        if (clonedElement) {
          preprocessColors(clonedElement);
        }
      },
    });

    // Calculate PDF dimensions to maintain aspect ratio
    const aspectRatio = canvas.width / canvas.height;
    const pdfWidth = Math.min(canvas.width / 2, 1200); // Max width of 1200px
    const pdfHeight = pdfWidth / aspectRatio;

    const pdf = new jsPDF({
      orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
      unit: "px",
      format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      pdfWidth,
      pdfHeight
    );

    // Save the PDF
    pdf.save(
      filename || `dashboard-${new Date().toISOString().split("T")[0]}.pdf`
    );

    // Cleanup
    document.body.removeChild(tempContainer);
    document.head.removeChild(styleSheet);
  } catch (error) {
    console.error("Error exporting PDF:", error);
    throw error;
  }
};
