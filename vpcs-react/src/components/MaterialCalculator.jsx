import React, { useState } from "react";
import "./MaterialCalculator.css";

const MaterialCalculator = () => {
  const [vendor, setVendor] = useState("select");
  const [material, setMaterial] = useState("select"); // Changed from mode to material
  const [weight, setWeight] = useState("");
  const [copySuccess, setCopySuccess] = useState(false); // ADD THIS LINE

  const GST = 0.18;
  const TCS = 0.01;

  const formatNumber = (num) => Number(num).toFixed(2);
  // Code to copy the values from the summary to clipboard
  const handleCopySummary = async () => {
    const summaryText = `${selectedLabels.toHetero}: ${formatNumber(genetiqueToHetero)}\n${selectedLabels.toVendor}: ${formatNumber(vpcsToGenetique)}`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = summaryText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const vendorLabels = {
    genetique: {
      toHetero: "Genetique to Hetero",
      toVendor: "VPCS to Genetique Pro",
    },
    godavari: {
      toHetero: "Godavari to Hetero",
      toVendor: "VPCS to Godavari",
    },
    balaji: {
      toHetero: "Balaji to Hetero",
      toVendor: "VPCS to Balaji",
    },
  };

  const selectedLabels = vendorLabels[vendor] || {
    toHetero: "Vendor to Hetero",
    toVendor: "VPCS to Vendor",
  };

  const vendorDisplayNames = {
    genetique: "Genetique Pro",
    godavari: "Godavari Fine Chem",
    balaji: "Sri Balaji Industries",
  };

  const currentVendorName = vendorDisplayNames[vendor] || "Vendor";

  const calculateValues = (vendor, material, weight) => {
    let heteroRate = 0;
    let customsTax = 0;
    let pcbCharges = 0;
    let APEMCL = 0;
    if (vendor === "genetique") {
      if (material === "etp") {
        heteroRate = 18.0;
        customsTax = heteroRate * 0.11;
        pcbCharges = 2.0;
        APEMCL = 0.07;
      } else if (material === "stripper") {
        heteroRate = 4.0;
        customsTax = 0.0;
        pcbCharges = 1.0;
        APEMCL = 0.07;
      }
    } else if (vendor === "godavari") {
      if (material === "etp") {
        heteroRate = 18.0;
        customsTax = heteroRate * 0.11;
        pcbCharges = 2.0;
        APEMCL = 0;
      } else if (material === "stripper") {
        heteroRate = 4.0;
        customsTax = 0.0;
        if (heteroRate < 15.0) {
          pcbCharges = 1.5;
        } else {
          pcbCharges = 2.0;
        }
        APEMCL = 0;
      }
    } else if (vendor === "balaji") {
      if (material === "etp") {
        heteroRate = 18.0;
        customsTax = heteroRate * 0.11;
        pcbCharges = 2.0;
        APEMCL = 0;
      } else if (material === "stripper") {
        heteroRate = 4.0;
        customsTax = 0.0;
        pcbCharges = 1.5;
        APEMCL = 0;
      }
    }

    const materialCost = heteroRate + customsTax;
    const materialPriceHetero = materialCost * weight;
    const gstHetero = materialPriceHetero * GST;
    const materialPriceGst = materialPriceHetero + gstHetero;
    const tcs = materialPriceGst * TCS;
    const genetiqueToHetero = materialPriceGst + tcs;

    const genetiqueMaterialCost = heteroRate + customsTax + pcbCharges + APEMCL;
    const materialPriceGenetique = genetiqueMaterialCost * weight;
    const gstGenetique = materialPriceGenetique * GST;
    const vpcsToGenetique = materialPriceGenetique + gstGenetique;

    return {
      heteroRate,
      customsTax,
      pcbCharges,
      materialCost,
      materialPriceHetero,
      gstHetero,
      materialPriceGst,
      tcs,
      genetiqueToHetero,
      genetiqueMaterialCost,
      materialPriceGenetique,
      gstGenetique,
      vpcsToGenetique,
      apemclCharges: APEMCL,
    };
  };

  const {
    heteroRate,
    customsTax,
    pcbCharges,
    materialCost,
    materialPriceHetero,
    gstHetero,
    materialPriceGst,
    tcs,
    genetiqueToHetero,
    genetiqueMaterialCost,
    materialPriceGenetique,
    gstGenetique,
    vpcsToGenetique,
    apemclCharges,
  } = calculateValues(vendor, material, weight);

  const resultItems = [
    { label: "Material Weight", value: formatNumber(weight || 0), comment: "Total weight of the material." },
    { label: "Hetero material Rate", value: formatNumber(heteroRate), comment: "Rate per unit for Hetero material." },
    { label: "Customs Tax", value: formatNumber(customsTax), comment: "Vendor-specific customs tax." },
    { label: "Material cost", value: formatNumber(materialCost), comment: "Hetero rate + Customs tax." },
    { label: "Material Price @Hetero", value: formatNumber(materialPriceHetero), comment: "Material cost * Weight." },
    { label: "GST", value: formatNumber(gstHetero), comment: "18% of Material Price @ Hetero." },
    { label: "Material price + GST", value: formatNumber(materialPriceGst), comment: "Sum of Material Price @ Hetero and GST." },
    { label: "TCS", value: formatNumber(tcs), comment: "1% of (Material price + GST)." },
    { label: selectedLabels.toHetero, value: formatNumber(genetiqueToHetero), comment: "Material price + GST + TCS.", highlight: true },
    { label: "PCB Charges", value: formatNumber(pcbCharges), comment: "Vendor-specific PCB Charges." },
    { label: "APEMCL charges", value: formatNumber(apemclCharges), comment: "Fixed APEMCL charge." },
    { label: `${currentVendorName} material cost`, value: formatNumber(genetiqueMaterialCost), comment: `Hetero rate + Customs tax + PCB + APEMCL.` },
    { label: `Material Price @ ${currentVendorName}`, value: formatNumber(materialPriceGenetique), comment: `${currentVendorName} material cost * Weight.` },
    { label: `GST @ ${currentVendorName}`, value: formatNumber(gstGenetique), comment: `18% of Material Price @ ${currentVendorName}.` },
    { label: selectedLabels.toVendor, value: formatNumber(vpcsToGenetique), comment: `Material price @ ${currentVendorName} + GST.`, highlight: true },
  ];

  return (
    <div className="calculator-container">
      <h1 className="calculator-title">Material Price Calculator</h1>

      <div className="input-section">
        <div className="input-group">
          <label>Vendor:</label>
          <select
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
          >
            <option value="select">Select Vendor</option>
            <option value="genetique">Genetique Pro</option>
            <option value="godavari">Godavari Fine Chem</option>
            <option value="balaji">Sri Balaji Industries</option>
          </select>
        </div>

        <div className="input-group">
          <label>Material:</label>
          <select
            value={material}  // Changed from mode to material.
            onChange={(e) => setMaterial(e.target.value)}  // Changed from setMode to setMaterial
          >
            <option value="select">Select Material</option>
            <option value="etp">ETP</option>
            <option value="stripper">Stripper</option>
          </select>
        </div>

        <div className="input-group weight-input-group">
          <label>Weight:</label>
          <div className="weight-input-wrapper">
            <input
              type="number"
              value={weight || ""}
              min="0"
              step="1"
              placeholder="Enter weight"
              onChange={(e) => {
                let value = e.target.value;
                value = value.toString().replace(/\D/g, '');
                if (value.length > 5) {
                  value = value.slice(0, 5);
                }
                setWeight(value === "" ? "" : parseFloat(value) || 0);
              }}
              maxLength={5}
            />
          </div>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-header">
          <h2>Summary</h2>
          <button
            className="copy-button"
            onClick={handleCopySummary}
            title="Copy summary to clipboard"
          >
            {copySuccess ? '✓' : '📋'}
          </button>
        </div>
        <div className="summary-item">
          <span className="label">{vendor === "select" ? "Vendor to Hetero" : `${currentVendorName} to Hetero`}:</span>
          <span className="value">₹ {formatNumber(genetiqueToHetero)}</span>
        </div>
        <div className="summary-item">
          <span className="label">{vendor === "select" ? "VPCS to Vendor" : `VPCS to ${currentVendorName}`}:</span>
          <span className="value">₹ {formatNumber(vpcsToGenetique)}</span>
        </div>
      </div>

      <div className="results-cards">
        {resultItems.map((item, index) => (
          <div className={`result-card ${item.highlight ? "highlight" : ""}`} key={`${item.label}-${index}`}>
            <div className="card-label">{item.label}</div>
            <div className="card-value">{item.value}</div>
            <div className="card-comment">{item.comment}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialCalculator;