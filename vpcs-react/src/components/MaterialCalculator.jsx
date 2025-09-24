import React, { useState } from "react";

const MaterialCalculator = () => {
  const [vendor, setVendor] = useState("select");
  const [mode, setMode] = useState("select");
  const [weight, setWeight] = useState("");

  const GST = 0.18;
  const TCS = 0.01;
 // const APEMCL = 0.07;

  const formatNumber = (num) => Number(num).toFixed(2);

  // ⬇️ move calculateValues BEFORE return
  const calculateValues = (vendor, mode, weight) => {
    let heteroRate = 0;
    let customsTax = 0;
    let pcbCharges = 0;
    let APEMCL = 0;
    if (vendor === "genetique") {
      if (mode === "etp") {
        heteroRate = 18.0;
        customsTax = heteroRate * 0.11;
        pcbCharges = 2.0;
        APEMCL = 0.07;
      } else if (mode === "stripper") {
        heteroRate = 4.0;
        customsTax = 0.0;
        pcbCharges = 1.0;
        APEMCL = 0.07;
      }
    } else if (vendor === "godavari") {
      if (mode === "etp") {
        heteroRate = 18.0;
        customsTax = heteroRate * 0.11;
        pcbCharges = 2.0;
        APEMCL = 0;
      } else if (mode === "stripper") {
        heteroRate = 4.0;
        customsTax = 0.0;
        pcbCharges = 1.5;
         APEMCL = 0;
      }
    } else if (vendor === "balaji") {
      if (mode === "etp") {
        heteroRate = 18.0;
        customsTax = heteroRate * 0.11;
        pcbCharges = 2.0;
      } else if (mode === "stripper") {
        heteroRate = 4.0;
        customsTax = 0.0;
        pcbCharges = 1.5;
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
  } = calculateValues(vendor, mode, weight);

  // ✅ only ONE return
  return (
    <div className="container">
      <h1>Material Cost Calculation</h1>

      <div className="input-section">
        <label>Vendor:</label>
        <select
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          style={{ width: "100%", padding: "8px", fontSize: "1rem" }}
        >
          <option value="select">Select Vendor</option>
          <option value="genetique">Genetique Pro</option>
          <option value="godavari">Godavari Fine Chem</option>
          <option value="balaji">Sri Balaji Industries</option>
        </select>

        <label>Material:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{ width: "100%", padding: "8px", fontSize: "1rem" }}
        >
          <option value="select">Select Material</option>
          <option value="etp">ETP</option>
          <option value="stripper">Stripper</option>
        </select>

        <label>Weight:</label>
        <input
          type="number"
          value={weight}
          min="0"
          step="1"
          placeholder="Enter material weight"
          onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "1rem",
            textAlign: "left",
          }}
        />
      </div>

      {/* Results table continues here... */}
    </div>
  );
};

export default MaterialCalculator;
