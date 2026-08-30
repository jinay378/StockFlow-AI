import html2pdf from "html2pdf.js";

export const exportDashboardPDF = async (
  element: HTMLElement,
  period: string
) => {
  const options = {
    margin: 10,
    filename: `StockFlow_Dashboard_${period}_${
      new Date().toISOString().split("T")[0]
    }.pdf`,
    image: {
      type: "jpeg" as const,
      quality: 1,
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait" as const,
    },
    pagebreak: {
      mode: ["avoid-all", "css", "legacy"],
    },
  };

  await html2pdf()
    .set(options)
    .from(element)
    .save();
};