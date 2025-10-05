import React, { useState } from "react";
import "./MaterialCalculator.css";
import formatCurrency from "../lib/INDcurrencyFormat";
//import formatDate from '../lib/DD-MMM-YY-DateFromat';

const MaterialCalculator = () => {
  const [vendor, setVendor] = useState("select");
  const [material, setMaterial] = useState("select");
  const [weight, setWeight] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const GST = 0.18;
  const TCS = 0.01;

  // Helper function for non-currency number formatting
  const formatNumber = (num) => Number(num).toFixed(2);

  // Code to copy the values from the summary to clipboard
  const handleCopySummary = async () => {
    // Capitalize the material name
    const materialName = material === "select" ? "Material" : material.charAt(0).toUpperCase() + material.slice(1);
    
    // Create the summary text with material, weight, and the existing values
    const summaryText = `${materialName} weight: ${weight || 0} kg\n${selectedLabels.toHetero}: ${formatCurrency(genetiqueToHetero)}\n${selectedLabels.toVendor}: ${formatCurrency(vpcsToGenetique)}`;

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
      toVendor: "VPCS to Genetique",
    },
    godavari: {
      toHetero: "Godavari to Hetero",
      toVendor: "VPCS to Godavari",
    },
    balaji: {
      toHetero: "Sri Balaji to Hetero",
      toVendor: "VPCS to Sri Balaji",
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
    { label: "Material Weight", value: weight || 0, comment: "Total weight of the material.", isCurrency: false },
    { label: "Hetero material Rate", value: heteroRate, comment: "Rate per unit for Hetero material.", isCurrency: true },
    { label: "Customs Tax", value: customsTax, comment: "Vendor-specific customs tax.", isCurrency: true },
    { label: "Material cost", value: materialCost, comment: "Hetero rate + Customs tax.", isCurrency: true },
    { label: "Material Price @Hetero", value: materialPriceHetero, comment: "Material cost * Weight.", isCurrency: true },
    { label: "GST", value: gstHetero, comment: "18% of Material Price @ Hetero.", isCurrency: true },
    { label: "Material price + GST", value: materialPriceGst, comment: "Sum of Material Price @ Hetero and GST.", isCurrency: true },
    { label: "TCS", value: tcs, comment: "1% of (Material price + GST).", isCurrency: true },
    { label: selectedLabels.toHetero, value: genetiqueToHetero, comment: "Material price + GST + TCS.", highlight: true, isCurrency: true },
    { label: "PCB Charges", value: pcbCharges, comment: "Vendor-specific PCB Charges.", isCurrency: true },
    { label: "APEMCL charges", value: apemclCharges, comment: "Fixed APEMCL charge.", isCurrency: true },
    { label: `${currentVendorName} material cost`, value: genetiqueMaterialCost, comment: `Hetero rate + Customs tax + PCB + APEMCL.`, isCurrency: true },
    { label: `Material Price @ ${currentVendorName}`, value: materialPriceGenetique, comment: `${currentVendorName} material cost * Weight.`, isCurrency: true },
    { label: `GST @ ${currentVendorName}`, value: gstGenetique, comment: `18% of Material Price @ ${currentVendorName}.`, isCurrency: true },
    { label: selectedLabels.toVendor, value: vpcsToGenetique, comment: `Material price @ ${currentVendorName} + GST.`, highlight: true, isCurrency: true },
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
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
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
          <span className="label">{selectedLabels.toHetero}:</span>
          <span className="value">{formatCurrency(genetiqueToHetero)}</span>
        </div>
        <div className="summary-item">
          <span className="label">{selectedLabels.toVendor}:</span>
          <span className="value">{formatCurrency(vpcsToGenetique)}</span>
        </div>
      </div>

      <div className="results-cards">
        {resultItems.map((item, index) => (
          <div className={`result-card ${item.highlight ? "highlight" : ""}`} key={`${item.label}-${index}`}>
            <div className="card-label">{item.label}</div>
            <div className="card-value">
              {item.isCurrency ? formatCurrency(item.value) : formatNumber(item.value)}
            </div>
            <div className="card-comment">{item.comment}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialCalculator;