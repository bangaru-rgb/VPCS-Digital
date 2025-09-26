import React, { useState } from "react";
import "./MaterialCalculator.css";

const MaterialCalculator = () => {
  const [vendor, setVendor] = useState("select");
  const [material, setMaterial] = useState("select");
  const [weight, setWeight] = useState("");

  const GST = 0.18;
  const TCS = 0.01;

  const formatNumber = (num) => Number(num).toFixed(2);

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
      toHetero: "Balaji Industries to Hetero",
      toVendor: "VPCS to Balaji Industries",
    },
  };

  // MOVED THIS SECTION ABOVE calculateValues
  const selectedLabels = vendorLabels[vendor] || {
    toHetero: "Vendor to Hetero",
    toVendor: "VPCS to Vendor",
  };

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

  return (
    <div className="calculator-container">
      <h1 className="calculator-title">Material Cost Calculation</h1>

      <div className="input-section">
        <div className="input-group">
          <label htmlFor="vendor">Vendor</label>
          <select
            id="vendor"
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
          <label htmlFor="material">Material</label>
          <select
            id="material"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          >
            <option value="select">Select Material</option>
            <option value="etp">ETP</option>
            <option value="stripper">Stripper</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="weight">Total Weight</label>
          <input
            id="weight"
            type="number"
            value={weight}
            min="0"
            step="1"
            placeholder="Enter weight"
            onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="summary-card">
        <h2>Summary</h2>
        <div className="summary-item">
          <span className="label">{selectedLabels.toHetero}:</span>
          <span className="value">₹ {formatNumber(genetiqueToHetero)}</span>
        </div>
        <div className="summary-item">
          <span className="label">{selectedLabels.toVendor}:</span>
          <span className="value">₹ {formatNumber(vpcsToGenetique)}</span>
        </div>
      </div>

      <div className="results-cards">
        {[
          { label: "Material Weight", value: formatNumber(weight), comment: "Total weight of the material." },
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
          { label: "Genetique material cost", value: formatNumber(genetiqueMaterialCost), comment: "Hetero rate + Customs tax + PCB + APEMCL." },
          { label: "Material Price @ Genetique", value: formatNumber(materialPriceGenetique), comment: "Genetique material cost * Weight." },
          { label: "GST @ Genetique", value: formatNumber(gstGenetique), comment: "18% of Material Price @ Genetique." },
          { label: selectedLabels.toVendor, value: formatNumber(vpcsToGenetique), comment: "Material price @ Genetique + GST.", highlight: true },
        ].map((item, index) => (
          <div className={`result-card ${item.highlight ? "highlight" : ""}`} key={index}>
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